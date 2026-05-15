import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { LoadingSpinner } from '../../components/ui'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'empleado'
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole === 'admin' && user.rol !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}