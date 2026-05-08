import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const filename = formData.get('filename') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max size is 10MB.' }, { status: 400 })
    }

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: PDF, PNG, JPG, WEBP' }, { status: 400 })
    }

    const fileExt = filename.split('.').pop() || 'bin'
    const storagePath = `${user.id}/${Date.now()}-${filename}`

    const fileBuffer = await file.arrayBuffer()

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('gate-uploads')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file to storage' }, { status: 500 })
    }

    // Create an upload job record
    const { data: job, error: jobError } = await supabase
      .from('upload_jobs')
      .insert({
        user_id: user.id,
        filename: filename,
        storage_path: uploadData.path,
        status: 'pending',
      })
      .select()
      .single()

    if (jobError) {
      console.error('Job creation error:', jobError)
      return NextResponse.json({ error: 'Failed to create upload job' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      storagePath: uploadData.path,
      filename,
      fileType: file.type,
    })
  } catch (error) {
    console.error('Upload route error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
