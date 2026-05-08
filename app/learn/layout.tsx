import type { Metadata } from 'next'
import DashboardLayout from '@/app/dashboard/layout'

export const metadata: Metadata = { title: 'Learning Hub' }

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>
}
