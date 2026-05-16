import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  ClipboardList,
  ArrowRightLeft,
  LogOut,
  X,
  User,
  Eye,
} from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { Button } from '../ui'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const menuItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/facturacion', icon: FileText, label: 'Facturación' },
    { to: '/operaciones', icon: ArrowRightLeft, label: 'Operaciones' },
    { to: '/clientes', icon: Users, label: 'Clientes' },
    { to: '/productos', icon: Package, label: 'Productos' },
    ...(user?.rol === 'admin'
      ? [{ to: '/auditoria', icon: ClipboardList, label: 'Auditoría' }]
      : []),
  ]

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-white dark:bg-madera-950 border-r border-madera-200 dark:border-madera-800 z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-madera-200 dark:border-madera-800">
              <h2 className="text-xl font-bold text-madera-900 dark:text-madera-50">
                Señor Madera
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-madera-100 dark:hover:bg-madera-800 transition-colors lg:hidden"
              >
                <X className="w-5 h-5 text-madera-600 dark:text-madera-300" />
              </button>
            </div>

            {user && (
              <div className="p-4 border-b border-madera-200 dark:border-madera-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-madera-200 dark:bg-madera-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-madera-700 dark:text-madera-200" />
                  </div>
                  <div>
                    <p className="font-medium text-madera-900 dark:text-madera-50">
                      {user.nombre}
                    </p>
                    <p className="text-sm text-madera-600 dark:text-madera-400 capitalize">{user.rol}</p>
                  </div>
                </div>
                <NavLink
                  to="/perfil"
                  onClick={onClose}
                  className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-madera-600 dark:text-madera-400 hover:bg-madera-100 dark:hover:bg-madera-800 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Ver Perfil
                </NavLink>
              </div>
            )}

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-madera-100 dark:bg-madera-800 text-madera-900 dark:text-madera-50 font-semibold'
                        : 'text-madera-700 dark:text-madera-300 hover:bg-madera-50 dark:hover:bg-madera-800/50 hover:text-madera-900 dark:hover:text-madera-100'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-madera-200 dark:border-madera-800">
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}