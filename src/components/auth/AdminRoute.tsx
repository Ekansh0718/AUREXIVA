import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/** Like ProtectedRoute, but also requires profile.is_admin. RLS already
 *  blocks non-admins from writing (see 0009_admin_catalog_writes.sql) — this
 *  just keeps the internal tool's UI from being reachable by any logged-in
 *  customer in the first place. */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-xs text-secondary">Loading...</div>
  }

  if (!user || !profile?.is_admin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
