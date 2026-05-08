import DashboardLayoutClient from '@/app/dashboard/layout'

export default function TestSelectLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
