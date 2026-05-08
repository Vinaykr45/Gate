import DashboardLayoutClient from '@/app/dashboard/layout'

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
