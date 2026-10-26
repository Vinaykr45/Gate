import DashboardLayoutClient from '@/app/dashboard/layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mistake Book & Spaced Revision — PrepAxis AI',
  description: 'SuperMemo-based spaced repetition review for incorrect questions and weak concepts.',
}

export default function RevisionLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
