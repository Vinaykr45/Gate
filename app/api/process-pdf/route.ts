import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { extractQuestionsFromText, extractQuestionsFromImage } from '@/lib/gemini/extract'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, storagePath, fileType, filename } = await request.json()

    if (!jobId || !storagePath) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update job status to processing
    await supabase
      .from('upload_jobs')
      .update({ status: 'processing' })
      .eq('id', jobId)
      .eq('user_id', user.id)

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('gate-uploads')
      .download(storagePath)

    if (downloadError || !fileData) {
      await supabase.from('upload_jobs').update({
        status: 'error', error_message: 'Failed to download file from storage'
      }).eq('id', jobId)
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
    }

    let extractedQuestions: Awaited<ReturnType<typeof extractQuestionsFromText>> = []

    if (fileType === 'application/pdf') {
      // For PDFs: convert to text using ArrayBuffer and send to Gemini as text
      const buffer = await fileData.arrayBuffer()
      const textContent = await extractTextFromPDF(buffer)
      extractedQuestions = await extractQuestionsFromText(textContent, filename)
    } else {
      // For images: send directly to Gemini vision
      const buffer = await fileData.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      extractedQuestions = await extractQuestionsFromImage(base64, fileType, filename)
    }

    if (extractedQuestions.length === 0) {
      await supabase.from('upload_jobs').update({
        status: 'done',
        questions_found: 0,
        error_message: 'No questions could be extracted from the file'
      }).eq('id', jobId)

      return NextResponse.json({
        success: true,
        questionsFound: 0,
        message: 'No questions could be extracted. Please try a clearer image or formatted PDF.'
      })
    }

    // Insert questions into database
    const questionsToInsert = extractedQuestions.map((q) => ({
      ...q,
      created_by: user.id,
      source_file: filename,
    }))

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select('id')

    if (insertError) {
      console.error('Question insert error:', insertError)
      await supabase.from('upload_jobs').update({
        status: 'error', error_message: 'Failed to save questions to database'
      }).eq('id', jobId)
      return NextResponse.json({ error: 'Failed to save questions' }, { status: 500 })
    }

    // Update job as done
    await supabase.from('upload_jobs').update({
      status: 'done',
      questions_found: insertedQuestions?.length || 0,
    }).eq('id', jobId)

    return NextResponse.json({
      success: true,
      questionsFound: insertedQuestions?.length || 0,
      questionIds: insertedQuestions?.map((q) => q.id) || [],
    })
  } catch (error) {
    console.error('Process PDF route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Extract text from PDF buffer using pdf-parse
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  try {
    const pdfParseModule = require('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(Buffer.from(buffer));
    const text = data.text.trim();
    return text.length > 50 ? text : '[PDF had no readable text]';
  } catch (err) {
    console.error('PDF parsing error:', err);
    return '[Could not read PDF content]';
  }
}
