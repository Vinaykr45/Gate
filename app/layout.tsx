import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | GateFlow Pro',
    default: 'GateFlow Pro — AI-Powered GATE Exam Preparation',
  },
  description: 'Crack GATE with AI-powered mock tests, personalized analytics, and smart question extraction.',
  keywords: ['GATE exam', 'GATE preparation', 'mock test', 'GATE CSE', 'AI study', 'PYQ'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('gateflow-theme');
            if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', t);
          } catch(e) {}
        ` }} />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
