'use client'

import React, { useState } from 'react'
import {
  Cpu, BookOpen, Layers, Award, Sparkles, CheckCircle2,
  Clock, ArrowUpRight, Zap, Brain, ShieldCheck
} from 'lucide-react'

type TrackId = 'gate_cse' | 'ca_foundation' | 'ca_intermediate' | 'ca_final'

interface TrackPreviewData {
  id: TrackId
  tabLabel: string
  trackName: string
  tag: string
  tagColor: string
  questionBadge: string
  questionText: string
  options: { key: string; text: string; correct?: boolean }[]
  aiExplanation: string
  aiModel: string
  latency: string
  memoryStrength: string
}

const PREVIEWS: Record<TrackId, TrackPreviewData> = {
  gate_cse: {
    id: 'gate_cse',
    tabLabel: 'GATE CSE',
    trackName: 'GATE Computer Science & IT',
    tag: 'Algorithms & Data Structures',
    tagColor: '#6366f1',
    questionBadge: '2-Mark MCQ · Negative Marking -0.66',
    questionText: 'Consider a min-heap with n elements. What is the worst-case time complexity of finding the maximum element in this min-heap?',
    options: [
      { key: 'A', text: 'O(1) directly at the root' },
      { key: 'B', text: 'O(log n) using binary search traversal' },
      { key: 'C', text: 'O(n) across the ⌈n/2⌉ leaf nodes', correct: true },
      { key: 'D', text: 'O(n log n) by successive deletions' },
    ],
    aiExplanation: 'In a min-heap, the root holds the minimum. The maximum element must reside in one of the leaf nodes, which occupy indices ⌊n/2⌋+1 to n. Since there are ⌈n/2⌉ leaves, an exhaustive scan takes linear time O(n).',
    aiModel: 'Groq Llama-3.3-70b (Fast Router)',
    latency: '142ms',
    memoryStrength: '98.4% Recall',
  },
  ca_foundation: {
    id: 'ca_foundation',
    tabLabel: 'CA Foundation',
    trackName: 'ICAI CA Foundation (New Scheme)',
    tag: 'Paper 1: Accounting',
    tagColor: '#10b981',
    questionBadge: 'Objective MCQ · -0.25 Marking',
    questionText: 'As per Accounting Standard (AS) 2 / Ind AS 2, how should inventories be measured in the financial statements at the reporting date?',
    options: [
      { key: 'A', text: 'At historical cost or replacement cost, whichever is higher' },
      { key: 'B', text: 'At Lower of Cost and Net Realizable Value (NRV)', correct: true },
      { key: 'C', text: 'At fair market value less selling costs' },
      { key: 'D', text: 'At standard replacement cost under FIFO' },
    ],
    aiExplanation: 'Under ICAI AS-2 & Ind AS 2, inventory valuation prudently requires measurement at the lower of historical cost and net realizable value (NRV) to prevent asset overstatement.',
    aiModel: 'Gemini 3.8 Flash (Multi-Key Pool)',
    latency: '185ms',
    memoryStrength: '96.2% Recall',
  },
  ca_intermediate: {
    id: 'ca_intermediate',
    tabLabel: 'CA Intermediate',
    trackName: 'ICAI CA Intermediate (Group I & II)',
    tag: 'Corporate & Other Laws · Sec 185',
    tagColor: '#f59e0b',
    questionBadge: 'Case Scenario · 30% MCQ Weightage',
    questionText: 'Under Section 185 of Companies Act 2013, can a company advance a loan to its Managing Director for housing as per employment terms?',
    options: [
      { key: 'A', text: 'Prohibited unconditionally under all circumstances' },
      { key: 'B', text: 'Permitted as part of conditions of service extended to all employees', correct: true },
      { key: 'C', text: 'Permitted only if approved by Regional Director (MCA)' },
      { key: 'D', text: 'Requires unanimous consent from all secured debenture holders' },
    ],
    aiExplanation: 'Sub-section (1) of Section 185 creates an exception: loans given to MD/WTD as part of the conditions of service extended to all employees, or pursuant to a scheme approved by members by special resolution, are fully permissible.',
    aiModel: 'OpenRouter Claude 3.5 Sonnet',
    latency: '310ms',
    memoryStrength: '99.1% Recall',
  },
  ca_final: {
    id: 'ca_final',
    tabLabel: 'CA Final & SPOM',
    trackName: 'ICAI CA Final (Professional Level)',
    tag: 'Financial Reporting · Ind AS 115',
    tagColor: '#8b5cf6',
    questionBadge: 'Integrated Multidisciplinary Case Simulation',
    questionText: 'Under the 5-step model of Ind AS 115 (Revenue from Contracts with Customers), when is revenue recognized for performance obligations satisfied over time?',
    options: [
      { key: 'A', text: 'Solely upon formal legal transfer of title deeds at contract completion' },
      { key: 'B', text: 'As control is transferred using input or output methods measuring progress', correct: true },
      { key: 'C', text: 'Only when cumulative payments received exceed 90% of total consideration' },
      { key: 'D', text: 'Pro-rata on straight line calendar basis irrespective of completion' },
    ],
    aiExplanation: 'Ind AS 115 mandates recognizing revenue over time by measuring progress towards complete satisfaction of the performance obligation using observable output or input methods.',
    aiModel: 'Groq DeepSeek R1 Distill',
    latency: '240ms',
    memoryStrength: '97.8% Recall',
  },
}

export function HeroGlassPreview() {
  const [activeTrack, setActiveTrack] = useState<TrackId>('gate_cse')
  const [selectedOption, setSelectedOption] = useState<string>('C')
  const [showAiBreakdown, setShowAiBreakdown] = useState<boolean>(true)

  const current = PREVIEWS[activeTrack]

  const handleTrackChange = (id: TrackId) => {
    setActiveTrack(id)
    const correctOpt = PREVIEWS[id].options.find(o => o.correct)?.key || 'B'
    setSelectedOption(correctOpt)
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 relative z-20">
      {/* Specular Ambient Glow Behind Glass */}
      <div
        className="absolute -inset-2 rounded-3xl opacity-60 blur-2xl pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${current.tagColor}35 0%, rgba(99,102,241,0.15) 50%, transparent 80%)`,
        }}
      />

      {/* Main Frosted Glass Container */}
      <div className="relative rounded-2xl md:rounded-3xl border border-white/15 bg-slate-900/60 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300">
        
        {/* Glass Header Bar */}
        <div className="px-5 py-3.5 border-b border-white/10 bg-white/[0.03] backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          
          {/* Mac-Style Window Dots & Live Engine Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white tracking-wide">PrepAxis AI Interactive Diagnostic Console</span>
            </div>
          </div>

          {/* Active Router Pill */}
          <div className="flex items-center gap-2 text-[11px] px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono">
            <Zap className="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>Router: {current.aiModel}</span>
          </div>
        </div>

        {/* Track Selector Glass Tabs */}
        <div className="p-3 bg-black/20 border-b border-white/05 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {(Object.keys(PREVIEWS) as TrackId[]).map(tId => {
            const t = PREVIEWS[tId]
            const isActive = activeTrack === tId
            return (
              <button
                key={tId}
                onClick={() => handleTrackChange(tId)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white/15 text-white border border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-xl'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full transition-transform duration-200"
                  style={{
                    background: t.tagColor,
                    transform: isActive ? 'scale(1.3)' : 'scale(1)',
                    boxShadow: isActive ? `0 0 10px ${t.tagColor}` : 'none',
                  }}
                />
                {t.tabLabel}
              </button>
            )
          })}
        </div>

        {/* Console Workspace: Question Preview + AI Insight Sidebar */}
        <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          
          {/* Left Column: Live Question Card (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Subject Meta Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg border uppercase tracking-wider backdrop-blur-sm"
                style={{
                  background: `${current.tagColor}18`,
                  borderColor: `${current.tagColor}40`,
                  color: current.tagColor,
                }}
              >
                {current.tag}
              </span>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-300">
                {current.questionBadge}
              </span>
            </div>

            {/* Question Stem */}
            <p className="text-white text-base md:text-lg font-medium leading-relaxed font-sans">
              {current.questionText}
            </p>

            {/* Selectable Options */}
            <div className="flex flex-col gap-2 mt-1">
              {current.options.map(opt => {
                const isSelected = selectedOption === opt.key
                const isCorrect = opt.correct

                return (
                  <button
                    key={opt.key}
                    onClick={() => setSelectedOption(opt.key)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                          : 'bg-indigo-500/15 border-indigo-500/40 text-indigo-100'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-indigo-500 text-white font-black'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {opt.key}
                    </span>
                    <span className="text-sm font-medium flex-1">{opt.text}</span>
                    {isSelected && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/05">
              <span>Click an option to test real-time scoring</span>
              <button
                onClick={() => setShowAiBreakdown(!showAiBreakdown)}
                className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {showAiBreakdown ? 'Collapse AI Solution' : 'Inspect AI Solution'}
              </button>
            </div>
          </div>

          {/* Right Column: Glass AI Diagnostic & Performance HUD (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* AI Reasoning Glass Card */}
            {showAiBreakdown && (
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 backdrop-blur-xl shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      Step-by-Step AI Proof
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-300/80 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                    {current.latency}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {current.aiExplanation}
                </p>

                <div className="mt-3 pt-2.5 border-t border-indigo-500/20 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified ICAI / GATE Rubric
                  </span>
                  <span className="text-slate-400">SM-2 Spaced Interval</span>
                </div>
              </div>
            )}

            {/* Real-time Student Readiness Gauge */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Track Mastery & Target</span>
                <span className="text-xs font-bold text-emerald-400">99.4th Percentile</span>
              </div>

              {/* Progress bar with glass shimmer */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: '88%',
                    background: `linear-gradient(90deg, ${current.tagColor}, #06b6d4)`,
                  }}
                />
              </div>

              {/* Micro stats grid */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="p-2.5 rounded-xl bg-black/20 border border-white/05 text-left">
                  <div className="text-[10px] text-slate-400">Retention Index</div>
                  <div className="text-sm font-bold text-white mt-0.5">{current.memoryStrength}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-black/20 border border-white/05 text-left">
                  <div className="text-[10px] text-slate-400">Failover Engine</div>
                  <div className="text-sm font-bold text-cyan-400 mt-0.5">3-Tier Fallback</div>
                </div>
              </div>

              {/* Safe OCR & Mistake Book Tag */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 px-2 py-1 rounded-lg bg-white/[0.02]">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Deterministic syllabus coverage & verified PYQ archive</span>
              </div>
            </div>

          </div>
        </div>

        {/* Specular Edge Bottom Bar */}
        <div className="px-6 py-3 bg-white/[0.02] border-t border-white/05 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <span>Active Curriculum: <strong className="text-white">{current.trackName}</strong></span>
          </div>
          <span className="hidden sm:inline text-slate-500">Live AI Diagnostic Simulation</span>
        </div>

      </div>
    </div>
  )
}
