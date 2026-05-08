import type { Metadata } from 'next'
import DashboardLayoutClient from '@/app/dashboard/layout'

export const metadata: Metadata = { title: 'Upload PYQs' }

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
