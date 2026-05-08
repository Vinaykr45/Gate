import type { Metadata } from 'next'
import DashboardLayout from '@/app/dashboard/layout'

export const metadata: Metadata = { title: 'Test History — GateFlow Pro' }

export default function TestHistoryLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
