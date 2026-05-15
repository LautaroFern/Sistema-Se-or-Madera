import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from './AuthContext'
import { Button, Input } from '../../components/ui'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const { login } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida'
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    const { error } = await login(email, password)

    if (error) {
      toast.error('Error al iniciar sesión', {
        description: 'Credenciales incorrectas. Por favor, intente nuevamente.',
      })
      setLoading(false)
      return
    }

    toast.success('¡Bienvenido!')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-madera-50 dark:bg-madera-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-madera-50">
            Señor Madera
          </h1>
          <p className="text-madera-600 dark:text-madera-400 mt-2">Sistema de Gestión Interna</p>
        </div>

        <div className="bg-white dark:bg-madera-900 rounded-xl shadow-lg p-6 border border-madera-200 dark:border-madera-800">
          <h2 className="text-xl font-semibold text-black dark:text-madera-50 mb-6">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="Ingrese su email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-madera-500 hover:text-madera-700 dark:text-madera-400 dark:hover:text-madera-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              <LogIn className="w-4 h-4" />
              Ingresar
            </Button>
          </form>

          <div className="mt-6 p-4 bg-madera-50 dark:bg-madera-800 rounded-lg border border-madera-200 dark:border-madera-700">
            <h3 className="font-medium text-madera-800 dark:text-madera-200 mb-2">
              Credenciales de prueba
            </h3>
            <div className="space-y-1 text-sm text-madera-700 dark:text-madera-300">
              <p>
                <span className="font-medium">Email:</span> admin@example.com
              </p>
              <p>
                <span className="font-medium">Contraseña:</span> 123456
              </p>
              <p>
                <span className="font-medium">Rol:</span> Administrador
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}