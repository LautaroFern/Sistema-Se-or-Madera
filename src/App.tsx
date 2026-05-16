import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import { AuthProvider } from './features/auth/AuthContext'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { Layout } from './components/layout'
import { LoginPage } from './features/auth/LoginPage'
import { PerfilPage } from './features/auth/PerfilPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { FacturacionPage } from './features/facturacion/FacturacionPage'
import { OperacionesPage } from './features/operaciones/OperacionesPage'
import { ClientesPage } from './features/clientes/ClientesPage'
import { ProductosPage } from './features/productos/ProductosPage'
import { AuditoriaPage } from './features/auditoria/AuditoriaPage'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="facturacion" element={<FacturacionPage />} />
              <Route path="operaciones" element={<OperacionesPage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="productos" element={<ProductosPage />} />
              <Route path="perfil" element={<PerfilPage />} />
              <Route
                path="auditoria"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AuditoriaPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          <Toaster position="top-right" richColors />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App