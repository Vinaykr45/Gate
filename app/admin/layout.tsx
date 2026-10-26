import DashboardLayoutClient from '@/app/dashboard/layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Console & AI Diagnostics — PrepAxis AI',
  description: 'Administrative management for multi-exam curriculum, syllabus versions, and AI provider diagnostics.',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
