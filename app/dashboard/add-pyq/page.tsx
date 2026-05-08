'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronLeft, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'
import { GATE_SUBJECTS, TOPICS_BY_SUBJECT } from '@/lib/utils'

const DIFFICULTY_OPTIONS = [
  { val: 'easy', label: 'Easy' },
  { val: 'medium', label: 'Medium' },
  { val: 'hard', label: 'Hard' },
]

export default function AddPYQPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    subject: GATE_SUBJECTS[0] as string,
    topic: TOPICS_BY_SUBJECT[GATE_SUBJECTS[0]]?.[0] || '',
    difficulty: 'medium',
    year: new Date().getFullYear().toString(),
    type: 'MCQ',
    question_text: '',
    explanation: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A', // For MCQ
    correctMSQ: [] as string[], // For MSQ
    correctNAT: '', // For NAT
  })

  const availableTopics = TOPICS_BY_SUBJECT[formData.subject] || []

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({ ...prev, type, correctMSQ: [], correctNAT: '', correctAnswer: 'A' }))
  }

  const toggleMSQ = (opt: string) => {
    setFormData(prev => ({
      ...prev,
      correctMSQ: prev.correctMSQ.includes(opt) 
        ? prev.correctMSQ.filter(x => x !== opt) 
        : [...prev.correctMSQ, opt].sort()
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      let options: any = {}
      let correct_answer = ''

      if (formData.type === 'MCQ') {
        options = { A: formData.optionA, B: formData.optionB, C: formData.optionC, D: formData.optionD }
        correct_answer = formData.correctAnswer
      } else if (formData.type === 'MSQ') {
        options = { A: formData.optionA, B: formData.optionB, C: formData.optionC, D: formData.optionD, _type: 'MSQ' }
        correct_answer = formData.correctMSQ.join(',')
      } else if (formData.type === 'NAT') {
        options = { _type: 'NAT' }
        correct_answer = formData.correctNAT
      }

      const res = await fetch('/api/questions/manual-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_text: formData.question_text,
          options,
          correct_answer,
          subject: formData.subject,
          topic: formData.topic,
          difficulty: formData.difficulty,
          year: parseInt(formData.year) || undefined,
          explanation: formData.explanation
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save question')
      
      setSuccess(true)
      // Reset form text
      setFormData(prev => ({
        ...prev,
        question_text: '',
        explanation: '',
        optionA: '', optionB: '', optionC: '', optionD: '',
        correctNAT: '', correctMSQ: [], correctAnswer: 'A'
      }))
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'Error saving question. Check console.')
    } finally {
      setLoading(false)
    }
  }

  const [activeTab, setActiveTab] = useState<'manual' | 'bulk'>('manual')

  const [bulkJson, setBulkJson] = useState('')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkSuccess, setBulkSuccess] = useState('')

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBulkLoading(true)
    setBulkSuccess('')
    try {
      const parsed = JSON.parse(bulkJson)
      const res = await fetch('/api/questions/bulk-add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: Array.isArray(parsed) ? parsed : [parsed] })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Server error')
      
      const count = data.count || 0
      const skipped = data.skipped || 0
      
      let msg = `Successfully added ${count} questions!`
      if (skipped > 0 && count > 0) msg += ` (${skipped} skipped as duplicates)`
      if (count === 0 && skipped > 0) msg = `No questions added (${skipped} skipped as duplicates).`
      
      setBulkSuccess(msg)
      if (count > 0) setBulkJson('') // only clear if we actually added something
      setTimeout(() => setBulkSuccess(''), 6000)
    } catch (err: any) {
      alert(err.message || 'Error parsing or saving JSON')
    } finally {
      setBulkLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="w-10 h-10 rounded-full flex items-center justify-center border hover:bg-white/5 transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Add PYQ</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add questions manually or via bulk JSON</p>
        </div>
      </div>

      <div className="flex gap-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={() => setActiveTab('manual')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'manual' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'bulk' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          Bulk JSON Upload
        </button>
      </div>

      {activeTab === 'manual' ? (      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-8 border border-indigo-500/10">
        
        {/* Metadata Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Subject</label>
            <select 
              value={formData.subject} 
              onChange={e => setFormData({ ...formData, subject: e.target.value, topic: TOPICS_BY_SUBJECT[e.target.value]?.[0] || '' })}
              className="w-full p-2.5 rounded-lg border text-sm focus:ring-1 focus:ring-indigo-500"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {GATE_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Topic</label>
            <select 
              value={formData.topic} 
              onChange={e => setFormData({ ...formData, topic: e.target.value })}
              className="w-full p-2.5 rounded-lg border text-sm focus:ring-1 focus:ring-indigo-500"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Difficulty</label>
            <select 
              value={formData.difficulty} 
              onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full p-2.5 rounded-lg border text-sm focus:ring-1 focus:ring-indigo-500"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              {DIFFICULTY_OPTIONS.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>GATE Year</label>
            <input 
              type="number" 
              value={formData.year} 
              onChange={e => setFormData({ ...formData, year: e.target.value })}
              className="w-full p-2.5 rounded-lg border text-sm focus:ring-1 focus:ring-indigo-500"
              style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              required
            />
          </div>
        </div>

        {/* Question Type */}
        <div className="space-y-3">
          <label className="text-sm font-semibold block" style={{ color: 'var(--text-secondary)' }}>Question Type</label>
          <div className="flex gap-3">
            {['MCQ', 'MSQ', 'NAT'].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all border ${formData.type === t ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 ring-1 ring-indigo-500' : 'bg-transparent border-white/10 hover:border-white/20'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formData.type === 'MCQ' && "Multiple Choice: Student selects 1 correct option."}
            {formData.type === 'MSQ' && "Multiple Select: Student selects 1 or more correct options."}
            {formData.type === 'NAT' && "Numerical Answer: Student types a number (e.g. 2.45)."}
          </p>
        </div>

        {/* Question Text */}
        <div className="space-y-2">
          <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Question Text</label>
          <textarea 
            value={formData.question_text}
            onChange={e => setFormData({ ...formData, question_text: e.target.value })}
            className="w-full p-4 rounded-xl border text-sm focus:ring-1 focus:ring-indigo-500 min-h-[120px]"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            placeholder="Type the question content here..."
            required
          />
        </div>

        {/* Options & Answers */}
        <div className="space-y-4 p-5 rounded-xl border border-indigo-500/10 bg-indigo-500/5">
          <h3 className="font-bold text-indigo-400">Options & Answer</h3>
          
          {formData.type !== 'NAT' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div key={opt} className="flex items-start gap-3">
                  <div className="pt-2.5 flex items-center justify-center shrink-0">
                    {formData.type === 'MCQ' ? (
                      <input 
                        type="radio" 
                        name="correctAnswer" 
                        checked={formData.correctAnswer === opt} 
                        onChange={() => setFormData({ ...formData, correctAnswer: opt })}
                        className="w-4 h-4 cursor-pointer accent-indigo-500" 
                      />
                    ) : (
                      <input 
                        type="checkbox" 
                        checked={formData.correctMSQ.includes(opt)} 
                        onChange={() => toggleMSQ(opt)}
                        className="w-4 h-4 cursor-pointer accent-indigo-500 rounded" 
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold mb-1 opacity-70">Option {opt}</div>
                    <input 
                      type="text" 
                      value={(formData as any)[`option${opt}`]}
                      onChange={e => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                      className="w-full p-2.5 rounded-lg border text-sm"
                      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      required={formData.type !== 'NAT'}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {formData.type === 'NAT' && (
            <div className="space-y-2 max-w-sm">
              <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Correct Numerical Answer</label>
              <input 
                type="text" 
                value={formData.correctNAT}
                onChange={e => setFormData({ ...formData, correctNAT: e.target.value })}
                className="w-full p-3 rounded-lg border text-sm focus:ring-1 focus:ring-indigo-500 font-mono"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                placeholder="e.g. 1.25 or 2.0-2.5"
                required
              />
              <p className="text-xs opacity-60">You can provide a single value (e.g. "42") or a range (e.g. "41.5-42.5").</p>
            </div>
          )}
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Explanation (Optional)</label>
          <textarea 
            value={formData.explanation}
            onChange={e => setFormData({ ...formData, explanation: e.target.value })}
            className="w-full p-4 rounded-xl border text-sm focus:ring-1 focus:ring-indigo-500 min-h-[100px]"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            placeholder="Explain the solution..."
          />
        </div>

        {/* Submit */}
        <div className="pt-4 flex items-center justify-between border-t border-white/5">
          {success && (
            <div className="text-emerald-400 flex items-center gap-2 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" /> Question saved successfully!
            </div>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary px-8 py-3 ml-auto text-sm"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Add Question</>}
          </button>
        </div>

      </form>
      ) : (
        <form onSubmit={handleBulkSubmit} className="card p-6 sm:p-8 space-y-6 border border-indigo-500/10">
          <div>
            <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Bulk JSON Upload</h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Paste a JSON array of questions here. Each object must have: <code>question_text, correct_answer, subject, topic</code>.
              Optionally specify <code>type</code> ("MCQ", "MSQ", "NAT"). Default is MCQ.
            </p>
          </div>
          <textarea
            value={bulkJson}
            onChange={e => setBulkJson(e.target.value)}
            className="w-full p-4 rounded-xl border text-sm font-mono focus:ring-1 focus:ring-indigo-500 min-h-[300px]"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            placeholder={`[\n  {\n    "type": "MCQ",\n    "question_text": "...",\n    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },\n    "correct_answer": "A",\n    "subject": "Engineering Mathematics",\n    "topic": "Linear Algebra",\n    "difficulty": "medium",\n    "year": 2023\n  },\n  {\n    "type": "NAT",\n    "question_text": "Calculate the result.",\n    "correct_answer": "42",\n    "subject": "Algorithms",\n    "topic": "Hashing"\n  }\n]`}
            required
          />
          <div className="flex items-center justify-between">
            <div className="text-emerald-400 font-bold text-sm">{bulkSuccess}</div>
            <button type="submit" disabled={bulkLoading || !bulkJson.trim()} className="btn-primary px-8 py-3 text-sm">
              {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload Bulk JSON'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
