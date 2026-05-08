import type { Metadata } from 'next'
import DashboardLayout from '@/app/dashboard/layout'

export const metadata: Metadata = { title: 'Test Results' }

export default function TestResultsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
