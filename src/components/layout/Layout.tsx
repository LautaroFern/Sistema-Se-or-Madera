import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-madera-50 dark:bg-madera-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-[280px]">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}