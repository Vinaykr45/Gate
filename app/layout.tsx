import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { BRAND } from '@/lib/brand'

export const metadata: Metadata = {
  title: {
    template: BRAND.seo.titleTemplate,
    default: BRAND.seo.defaultTitle,
  },
  description: BRAND.description,
  keywords: [...BRAND.seo.keywords],
  authors: [{ name: BRAND.company }],
  openGraph: {
    title: BRAND.seo.defaultTitle,
    description: BRAND.description,
    type: 'website',
    siteName: BRAND.name,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('prepaxis-theme') || localStorage.getItem('gateflow-theme');
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
