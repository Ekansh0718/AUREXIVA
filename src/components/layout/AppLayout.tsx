import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/navbar/Navbar'
import { Footer } from '@/components/footer/Footer'

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
