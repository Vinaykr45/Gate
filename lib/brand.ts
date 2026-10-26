/**
 * lib/brand.ts
 *
 * Centralized Brand Configuration for PrepAxis AI.
 * Use these constants throughout the application to maintain consistent branding.
 */

export const BRAND = {
  name: 'PrepAxis AI',
  shortName: 'PrepAxis',
  tagline: 'Prepare Smarter. Practice Better. Perform Stronger.',
  description:
    'Comprehensive AI-assisted examination preparation platform for GATE CSE, CA Foundation, CA Intermediate, and CA Final.',
  company: 'PrepAxis Technologies',
  domain: 'prepaxis.ai',
  supportEmail: 'support@prepaxis.ai',
  
  // Theme & Palette
  colors: {
    primary: '#0f172a',      // Deep Academic Navy
    secondary: '#4f46e5',    // Modern Indigo
    accent: '#06b6d4',       // Cyan Accent
    success: '#10b981',      // Emerald Green
    warning: '#f59e0b',      // Amber
    danger: '#ef4444',       // Crimson Red
    background: '#090d16',   // Soft Deep Neutral
  },

  // Supported Examination Tracks
  tracks: [
    {
      id: 'gate_cse',
      name: 'GATE CSE',
      fullName: 'GATE Computer Science & Information Technology',
      level: 'National Post-Graduate Engineering',
      badge: 'Engineering',
      icon: 'Cpu',
      color: '#6366f1',
    },
    {
      id: 'ca_foundation',
      name: 'CA Foundation',
      fullName: 'Chartered Accountancy Foundation',
      level: 'ICAI Entry Level (New Scheme)',
      badge: 'Commerce & Law',
      icon: 'BookOpen',
      color: '#10b981',
    },
    {
      id: 'ca_intermediate',
      name: 'CA Intermediate',
      fullName: 'Chartered Accountancy Intermediate',
      level: 'ICAI Executive Level (New Scheme)',
      badge: 'Group I & II',
      icon: 'Layers',
      color: '#f59e0b',
    },
    {
      id: 'ca_final',
      name: 'CA Final',
      fullName: 'Chartered Accountancy Final',
      level: 'ICAI Professional Level (New Scheme)',
      badge: 'Final & SPOM',
      icon: 'Award',
      color: '#8b5cf6',
    },
  ] as const,

  seo: {
    defaultTitle: 'PrepAxis AI — Prepare Smarter. Practice Better. Perform Stronger.',
    titleTemplate: '%s | PrepAxis AI',
    keywords: [
      'PrepAxis AI',
      'GATE CSE preparation',
      'CA Foundation exam',
      'CA Intermediate New Scheme',
      'CA Final preparation',
      'ICAI exam mock tests',
      'AI tutor for GATE',
      'AI question generator',
      'GATE CS PYQ practice',
      'Adaptive mock tests',
    ],
  },
} as const

export type ExamTrackId = (typeof BRAND.tracks)[number]['id']
