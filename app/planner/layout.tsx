import DashboardLayoutClient from '@/app/dashboard/layout'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Study Planner — PrepAxis AI',
  description: 'Deterministic study planner with daily targets, weekly milestones, and backlog recovery.',
}

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
