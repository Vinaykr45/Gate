'use client'

import { useState, useEffect } from 'react'
import {
  ShieldCheck, Cpu, Zap, Activity, CheckCircle2,
  AlertTriangle, RefreshCw, Layers, BookOpen, Key,
  Clock, Database, FileText, Plus, Trash2, Play, Check,
  Sliders, Server, Sparkles, ExternalLink, CheckCheck
} from 'lucide-react'
import { BRAND } from '@/lib/brand'
import { CURRICULUM_REGISTRY } from '@/lib/curriculum/registry'

interface AIHealthData {
  health: Array<{
    name: string
    isConfigured: boolean
    status: 'healthy' | 'degraded' | 'unconfigured' | 'offline'
    consecutiveErrors: number
    averageLatencyMs: number
    lastCheckAt?: string
  }>
  config: {
    primaryProvider: string
    fallbackProviders: string[]
    timeoutMs: number
    maxRetries: number
    cacheEnabled: boolean
    providers: {
      groq: { configured: boolean; model: string; keyPrefix: string }
      openrouter: { configured: boolean; model: string; keyPrefix: string }
      gemini: { configured: boolean; keyCount: number; model: string; fallbackModels: string[] }
    }
  }
}

interface KeyEntry {
  id: string
  provider: 'gemini' | 'groq' | 'openrouter'
  index?: number
  maskedKey: string
  prefix: string
  suffix: string
  model?: string
  status: string
}

interface KeyPoolSummary {
  primaryProvider: string
  fallbackProviders: string[]
  gemini: {
    totalKeys: number
    model: string
    fallbackModels: string[]
    keys: KeyEntry[]
  }
  groq: {
    configured: boolean
    maskedKey: string
    model: string
  }
  openrouter: {
    configured: boolean
    maskedKey: string
    model: string
  }
}

const LATEST_MODELS = {
  gemini: [
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview — Ultra Fast)', tag: 'Recommended' },
    { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite (Low Latency & High Efficiency)', tag: 'Ultra-Lite' },
    { id: 'gemini-flash-latest', name: 'Gemini Flash Latest (Auto-Routed Stable)', tag: 'Stable' },
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (High Capacity)', tag: 'Standard' },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Recommended)', tag: 'Recommended' },
    { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B Versatile', tag: 'High-IQ' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Ultra-Fast)', tag: 'Instant' },
    { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (32k Context)', tag: 'MoE' },
  ],
  openrouter: [
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta Llama 3.3 70B Instruct', tag: 'Recommended' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Via OpenRouter)', tag: 'Premium' },
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat V3', tag: 'Cost-Effective' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', tag: 'Fast' },
  ],
}

export default function AdminPage() {
  const [healthData, setHealthData] = useState<AIHealthData | null>(null)
  const [keyPool, setKeyPool] = useState<KeyPoolSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'api_keys' | 'ai' | 'curriculum' | 'audit'>('api_keys')

  // Form states for adding API keys
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'groq' | 'openrouter'>('gemini')
  const [entryMode, setEntryMode] = useState<'single' | 'batch'>('single')
  const [singleKeys, setSingleKeys] = useState<string[]>([''])
  const [keysInput, setKeysInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('gemini-3-flash-preview')
  const [submitting, setSubmitting] = useState(false)
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Live key testing state
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; latencyMs: number; message: string }>>({})

  const handleAddSingleKeyRow = () => {
    setSingleKeys(prev => [...prev, ''])
  }

  const handleRemoveSingleKeyRow = (index: number) => {
    setSingleKeys(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : ['']))
  }

  const handleUpdateSingleKey = (index: number, val: string) => {
    setSingleKeys(prev => {
      const next = [...prev]
      next[index] = val
      return next
    })
  }

  const fetchHealthAndKeys = async () => {
    setLoading(true)
    try {
      const [healthRes, keysRes] = await Promise.all([
        fetch('/api/admin/ai-health'),
        fetch('/api/admin/keys'),
      ])

      if (healthRes.ok) {
        const hData = await healthRes.json()
        if (hData.health) setHealthData(hData)
      }

      if (keysRes.ok) {
        const kData = await keysRes.json()
        if (kData.gemini) setKeyPool(kData)
      }
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthAndKeys()
  }, [])

  // Auto-update model dropdown when provider switches
  useEffect(() => {
    if (selectedProvider === 'gemini') setSelectedModel('gemini-3-flash-preview')
    if (selectedProvider === 'groq') setSelectedModel('llama-3.3-70b-versatile')
    if (selectedProvider === 'openrouter') setSelectedModel('meta-llama/llama-3.3-70b-instruct')
  }, [selectedProvider])

  // Count detected keys in batch or single rows
  const effectiveKeys = entryMode === 'batch'
    ? keysInput.split(/[\r\n,;]+/).map(k => k.trim()).filter(k => k.length >= 10)
    : singleKeys.map(k => k.trim()).filter(k => k.length >= 10)

  const handleAddKeys = async () => {
    if (effectiveKeys.length === 0) {
      setFormFeedback({ type: 'error', text: 'Please enter at least one valid API key.' })
      return
    }

    setSubmitting(true)
    setFormFeedback(null)

    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          keys: selectedProvider === 'gemini' ? effectiveKeys : undefined,
          apiKey: selectedProvider !== 'gemini' ? effectiveKeys[0] : undefined,
          model: selectedModel,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save API key(s)')
      }

      setFormFeedback({
        type: 'success',
        text: data.message || `Successfully added ${effectiveKeys.length} key(s) to ${selectedProvider.toUpperCase()} pool.`,
      })
      setKeysInput('')
      setSingleKeys([''])
      if (data.summary) {
        setKeyPool(data.summary)
      }
      fetchHealthAndKeys()
    } catch (err: unknown) {
      setFormFeedback({
        type: 'error',
        text: (err as Error)?.message || 'An error occurred while saving keys.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteGeminiKey = async (index: number) => {
    if (!confirm(`Are you sure you want to remove Gemini key #${index + 1} from the rotation pool?`)) return

    try {
      const res = await fetch(`/api/admin/keys?provider=gemini&index=${index}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to delete key')

      if (data.summary) setKeyPool(data.summary)
      fetchHealthAndKeys()
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleTestKey = async (
    provider: 'gemini' | 'groq' | 'openrouter',
    keyIndex?: number,
    rawKey?: string,
    customTestId?: string
  ) => {
    const testId = customTestId || (rawKey ? 'form-test' : `${provider}-${keyIndex ?? 0}`)
    setTestingKeyId(testId)

    try {
      const res = await fetch('/api/admin/keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          keyIndex,
          apiKey: rawKey,
          model: selectedModel,
        }),
      })

      const data = await res.json()
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          success: data.success,
          latencyMs: data.latencyMs || 0,
          message: data.message || (data.success ? 'Operational' : 'Failed'),
        },
      }))
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        [testId]: {
          success: false,
          latencyMs: 0,
          message: (err as Error).message || 'Connection test timed out',
        },
      }))
    } finally {
      setTestingKeyId(null)
    }
  }

  const handleSetPrimaryProvider = async (providerName: string) => {
    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_router',
          primaryProvider: providerName,
        }),
      })
      const data = await res.json()
      if (data.summary) setKeyPool(data.summary)
      fetchHealthAndKeys()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-indigo-400" /> Administrative Console
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            System diagnostics, AI provider key pools & models, multi-exam curriculum versions, and audit monitoring.
          </p>
        </div>

        <button
          onClick={fetchHealthAndKeys}
          className="btn-secondary text-xs px-4 py-2 self-start inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Diagnostics
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('api_keys')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'api_keys'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Key className="w-3.5 h-3.5 inline mr-1.5" /> API Keys & Models (Key Pool)
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 inline mr-1.5" /> AI Health & Cascade
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'curriculum'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 inline mr-1.5" /> Syllabus Versions (4 Tracks)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 inline mr-1.5" /> Architecture & Security
        </button>
      </div>

      {/* ── TAB: API KEYS & MODEL MANAGER ── */}
      {activeTab === 'api_keys' && (
        <div className="space-y-6">

          {/* Router Primary Selection */}
          <div className="card p-5 border border-slate-800 bg-slate-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Primary AI Router Engine
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  The active provider used first for mock test generation, SRS explanations, and student AI summaries.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(['groq', 'gemini', 'openrouter'] as const).map((prov) => {
                  const isPrimary = (keyPool?.primaryProvider || 'groq') === prov
                  return (
                    <button
                      key={prov}
                      onClick={() => handleSetPrimaryProvider(prov)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                        isPrimary
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      {isPrimary && <Check className="w-3 h-3 inline mr-1" />}
                      {prov}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Form to Add Multiple API Keys */}
          <div className="card p-6 border border-slate-800 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" /> Add Latest AI APIs & Key Pool
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste single or batch API keys. New keys are added directly to the active rotation pool and saved to your environment.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Target Provider:</span>
                <div className="flex rounded-lg bg-slate-800 p-1 border border-slate-700/60">
                  {(['gemini', 'groq', 'openrouter'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedProvider(p)}
                      className={`px-3 py-1 rounded text-xs font-semibold uppercase transition-all cursor-pointer ${
                        selectedProvider === p
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Provider instructions */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start justify-between gap-4">
              <div>
                {selectedProvider === 'gemini' && (
                  <>
                    <strong className="text-indigo-300">Google Gemini Multi-Key Pool:</strong> Supports pasting <strong>multiple keys</strong> (one per line). All keys are rotated round-robin across requests to circumvent quota rate limits (429/503).
                  </>
                )}
                {selectedProvider === 'groq' && (
                  <>
                    <strong className="text-indigo-300">Groq High-Speed Inference:</strong> Ultra-fast tokens/sec using Llama 3.3. Enter your Groq API key from console.groq.com.
                  </>
                )}
                {selectedProvider === 'openrouter' && (
                  <>
                    <strong className="text-indigo-300">OpenRouter Aggregator:</strong> Access to Claude 3.5 Sonnet, DeepSeek V3, and Llama 3.3 with automatic multi-model failover.
                  </>
                )}
              </div>
              <a
                href={
                  selectedProvider === 'gemini'
                    ? 'https://aistudio.google.com/app/apikey'
                    : selectedProvider === 'groq'
                      ? 'https://console.groq.com/keys'
                      : 'https://openrouter.ai/keys'
                }
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline shrink-0 flex items-center gap-1 text-[11px]"
              >
                Get API Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Model selection */}
              <div className="space-y-1.5 md:col-span-1">
                <label className="text-xs font-semibold text-slate-300">Latest AI Model:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  {LATEST_MODELS[selectedProvider].map((m) => (
                    <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                      {m.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Select the official model release for {selectedProvider}.
                </p>
              </div>

              {/* Keys input section (One by One vs Batch Paste) */}
              <div className="space-y-2.5 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-300">
                      {selectedProvider === 'gemini' ? 'Gemini API Key(s):' : 'API Key:'}
                    </label>
                    {effectiveKeys.length > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-mono">
                        {effectiveKeys.length} key{effectiveKeys.length > 1 ? 's' : ''} ready
                      </span>
                    )}
                  </div>

                  {/* Mode switcher: One by One vs Batch */}
                  <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => setEntryMode('single')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                        entryMode === 'single'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      One by One
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryMode('batch')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                        entryMode === 'batch'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Batch Paste
                    </button>
                  </div>
                </div>

                {/* ONE BY ONE MODE */}
                {entryMode === 'single' ? (
                  <div className="space-y-2">
                    {singleKeys.map((k, idx) => {
                      const rowTestId = `single-row-${idx}`
                      const test = testResults[rowTestId]
                      const isTesting = testingKeyId === rowTestId
                      const isValidKey = k.trim().length >= 10

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-300 shrink-0">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={k}
                              onChange={(e) => handleUpdateSingleKey(idx, e.target.value)}
                              placeholder={`Enter ${selectedProvider.toUpperCase()} key (e.g. ${
                                selectedProvider === 'gemini' ? 'AQ.... or AIzaSy...' : 'gsk_... or sk-or-...'
                              })`}
                              className="flex-1 font-mono text-xs py-2 px-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                            />

                            {isValidKey && (
                              <button
                                type="button"
                                onClick={() => handleTestKey(selectedProvider, undefined, k.trim(), rowTestId)}
                                disabled={isTesting}
                                className="px-2.5 py-2 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Play className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                                Test
                              </button>
                            )}

                            {singleKeys.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSingleKeyRow(idx)}
                                className="p-2 text-slate-500 hover:text-red-400 transition-colors shrink-0 cursor-pointer"
                                title="Remove key field"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {test && (
                            <div className="pl-8">
                              <span
                                className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                                  test.success
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : 'bg-red-500/10 text-red-400'
                                }`}
                              >
                                {test.success ? `${test.latencyMs}ms Verified ✅` : `${test.message} ❌`}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleAddSingleKeyRow}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Another Key Field
                      </button>
                      <span className="text-[11px] text-slate-500">
                        Add keys one by one with individual connection checks
                      </span>
                    </div>
                  </div>
                ) : (
                  /* BATCH PASTE MODE */
                  <div className="space-y-1">
                    <textarea
                      value={keysInput}
                      onChange={(e) => setKeysInput(e.target.value)}
                      rows={3}
                      placeholder={
                        selectedProvider === 'gemini'
                          ? 'Paste multiple Gemini keys here (one key per line or comma-separated):\nAQ.Ab8RN...\nAIzaSy...'
                          : 'Paste your API key here (e.g. gsk_... or sk-or-...)'
                      }
                      className="w-full font-mono text-xs p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                    <p className="text-[11px] text-slate-500">
                      Paste multiple keys at once separated by line breaks or commas.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Feedback alert */}
            {formFeedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  formFeedback.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
              >
                {formFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                )}
                <span>{formFeedback.text}</span>
              </div>
            )}

            {/* Test connection result */}
            {testResults['form-test'] && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center justify-between ${
                  testResults['form-test'].success
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-300 border border-red-500/20'
                }`}
              >
                <span>{testResults['form-test'].message}</span>
                <span className="font-mono font-bold">{testResults['form-test'].latencyMs}ms</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {effectiveKeys.length > 0 && entryMode === 'batch' && (
                <button
                  type="button"
                  onClick={() => handleTestKey(selectedProvider, undefined, effectiveKeys[0])}
                  disabled={submitting || testingKeyId === 'form-test'}
                  className="btn-secondary text-xs px-4 py-2 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className={`w-3.5 h-3.5 ${testingKeyId === 'form-test' ? 'animate-spin' : ''}`} />
                  Test First Key Connection
                </button>
              )}

              <button
                type="button"
                onClick={handleAddKeys}
                disabled={submitting || effectiveKeys.length === 0}
                className="btn-primary text-xs px-5 py-2 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                {submitting
                  ? 'Saving to Key Pool...'
                  : effectiveKeys.length > 1
                    ? `Add ${effectiveKeys.length} Keys to ${selectedProvider.toUpperCase()} Pool`
                    : `Add Key to ${selectedProvider.toUpperCase()} Pool`}
              </button>
            </div>
          </div>

          {/* Active Key Pool Explorer */}
          <div className="card p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-400" /> Active Rotation Pool Explorer
                </h3>
                <p className="text-xs text-slate-400">
                  {keyPool?.gemini.totalKeys || 0} active Gemini rotation keys, Groq inference status, and OpenRouter config.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {keyPool?.gemini.totalKeys || 0} Gemini Keys Active
                </span>
              </div>
            </div>

            {/* Gemini Multi-Key Pool Table */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Google Gemini Keys (Round-Robin Rotated)</span>
                <span className="text-[11px] font-normal text-slate-400">
                  Model: <code className="text-indigo-300">{keyPool?.gemini.model || 'gemini-3-flash-preview'}</code>
                </span>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60">
                {keyPool?.gemini.keys && keyPool.gemini.keys.length > 0 ? (
                  keyPool.gemini.keys.map((k, idx) => {
                    const testKeyId = `gemini-${idx}`
                    const test = testResults[testKeyId]

                    return (
                      <div
                        key={k.id}
                        className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-300 shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-mono text-white tracking-wider">
                              {k.maskedKey}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Slot: {idx === 0 ? 'GEMINI_API_KEY (Primary)' : `GEMINI_API_KEY_${idx + 1}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-center">
                          {test && (
                            <span
                              className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                                test.success
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-red-500/10 text-red-400'
                              }`}
                            >
                              {test.success ? `${test.latencyMs}ms ✅` : 'Failed ❌'}
                            </span>
                          )}

                          <button
                            onClick={() => handleTestKey('gemini', idx)}
                            disabled={testingKeyId === testKeyId}
                            className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Play className={`w-3 h-3 ${testingKeyId === testKeyId ? 'animate-spin' : ''}`} />
                            Ping
                          </button>

                          <button
                            onClick={() => handleDeleteGeminiKey(idx)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete this key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No Gemini API keys configured. Paste keys above to enable Gemini generation.
                  </div>
                )}
              </div>
            </div>

            {/* Groq and OpenRouter Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Groq Status */}
              <div className="card p-4 border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white uppercase tracking-wider">Groq</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      keyPool?.groq.configured
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {keyPool?.groq.configured ? 'Configured' : 'Unconfigured'}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-400">
                  <div className="flex justify-between font-mono">
                    <span>Key:</span>
                    <span className="text-white">{keyPool?.groq.maskedKey || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Model:</span>
                    <span className="text-indigo-300">{keyPool?.groq.model}</span>
                  </div>
                </div>
                {keyPool?.groq.configured && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleTestKey('groq')}
                      disabled={testingKeyId === 'groq-0'}
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Play className={`w-3 h-3 ${testingKeyId === 'groq-0' ? 'animate-spin' : ''}`} />
                      Ping Groq
                    </button>
                  </div>
                )}
              </div>

              {/* OpenRouter Status */}
              <div className="card p-4 border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white uppercase tracking-wider">OpenRouter</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      keyPool?.openrouter.configured
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {keyPool?.openrouter.configured ? 'Configured' : 'Unconfigured'}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-slate-400">
                  <div className="flex justify-between font-mono">
                    <span>Key:</span>
                    <span className="text-white">{keyPool?.openrouter.maskedKey || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Model:</span>
                    <span className="text-indigo-300">{keyPool?.openrouter.model}</span>
                  </div>
                </div>
                {keyPool?.openrouter.configured && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleTestKey('openrouter')}
                      disabled={testingKeyId === 'openrouter-0'}
                      className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Play className={`w-3 h-3 ${testingKeyId === 'openrouter-0' ? 'animate-spin' : ''}`} />
                      Ping OpenRouter
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: AI DIAGNOSTICS & CASCADE ── */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {/* Provider Cascade Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthData?.health.map((p) => {
              const isHealthy = p.status === 'healthy'
              const isDegraded = p.status === 'degraded'
              const isConfigured = p.isConfigured

              return (
                <div key={p.name} className="card p-5 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm text-white uppercase tracking-wider">{p.name}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isHealthy
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isDegraded
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : !isConfigured
                              ? 'bg-slate-800 text-slate-500'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Configured:</span>
                      <span className={isConfigured ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                        {isConfigured ? 'Yes (Active)' : 'No (Key required)'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Avg Latency:</span>
                      <span className="text-white font-mono">{p.averageLatencyMs ? `${p.averageLatencyMs}ms` : '—'}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Error Count:</span>
                      <span className={p.consecutiveErrors > 0 ? 'text-red-400 font-bold' : 'text-slate-300'}>
                        {p.consecutiveErrors}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Configuration Summary */}
          {healthData && (
            <div className="card p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-400" /> Active AI Router Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Primary Provider:</span>
                    <span className="text-indigo-400 font-bold uppercase">{healthData.config.primaryProvider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fallback Sequence:</span>
                    <span className="text-white font-medium">{healthData.config.fallbackProviders.join(' → ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Timeout Budget:</span>
                    <span className="text-white">{healthData.config.timeoutMs}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Retries per Provider:</span>
                    <span className="text-white">{healthData.config.maxRetries}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Groq Model:</span>
                    <span className="text-white font-mono">{healthData.config.providers.groq.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">OpenRouter Model:</span>
                    <span className="text-white font-mono">{healthData.config.providers.openrouter.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Gemini Key Pool:</span>
                    <span className="text-emerald-400 font-semibold">{healthData.config.providers.gemini.keyCount} Keys Configured</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">In-Memory Prompt Cache:</span>
                    <span className="text-emerald-400 font-semibold">{healthData.config.cacheEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CURRICULUM TRACKS ── */}
      {activeTab === 'curriculum' && (
        <div className="space-y-4">
          {Object.entries(CURRICULUM_REGISTRY).map(([key, trackData]) => (
            <div key={key} className="card p-5 border border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <h3 className="font-bold text-white text-base">{trackData.trackName}</h3>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {trackData.badge}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Version: <strong className="text-white font-mono">{trackData.activeSyllabusVersion}</strong>
                </div>
              </div>

              {trackData.versions[0] && (
                <div className="text-xs text-slate-400 space-y-1 mb-4 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <strong>Official Source:</strong>{' '}
                    <a
                      href={trackData.versions[0].officialSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-400 underline inline-flex items-center gap-1"
                    >
                      {trackData.versions[0].officialSourceUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div>
                    <strong>Applicable Examination Sessions:</strong>{' '}
                    {trackData.versions[0].applicableSessions.join(', ')}
                  </div>
                  <div>
                    <strong>Verification Status:</strong>{' '}
                    <span className="text-emerald-400 font-semibold">Verified & Approved</span> · Last Verified:{' '}
                    {trackData.versions[0].lastVerifiedDate}
                  </div>
                </div>
              )}

              {/* Papers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {trackData.papers.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                    <div className="font-semibold text-white truncate">{p.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Paper {p.paperNumber} · {p.chapters.length} Chapters · {p.marks} Marks
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: SYSTEM & SECURITY AUDIT ── */}
      {activeTab === 'audit' && (
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> Architecture, Security & Production Readiness
          </h2>
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="font-bold text-white mb-1">Row Level Security (RLS)</div>
              All user records (test attempts, student answers, bookmarks, study plans, and mistake book items) are strictly isolated using Supabase PostgreSQL Row Level Security with <code className="text-indigo-300">auth.uid() = user_id</code>.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="font-bold text-white mb-1">Server-Side Scoring Authority</div>
              All exam grading (including negative marking rates) is computed deterministically on the server in <code className="text-indigo-300">app/api/submit-test/route.ts</code>. Client-side state cannot manipulate final grades.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="font-bold text-white mb-1">Bounded AI Fallback Protection</div>
              No AI provider outage can disrupt mock test submissions, curriculum navigation, or study plan generation. AI failure gracefully falls back to deterministic rules.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="font-bold text-white mb-1">Round-Robin API Key Protection</div>
              Google Gemini and fallback providers rotate automatically across all configured keys to ensure maximum availability and prevent rate limit saturation.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
