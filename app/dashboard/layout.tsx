import { AuthGuard } from '../../src/components/AuthGuard'
import { NavBar } from '../../src/components/dashboard/NavBar'
import { Sidebar } from '../../src/components/dashboard/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-zinc-900">
        <NavBar />
        <div className="flex flex-1 flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
