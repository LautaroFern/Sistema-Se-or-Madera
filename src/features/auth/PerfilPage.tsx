import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Save, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from './AuthContext'
import { Button, Input } from '../../components/ui'

export function PerfilPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (user) {
      setNombre(user.nombre)
      setEmail(user.email)
    }
  }, [user])

  const handleGuardar = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('usuario')
        .update({ nombre, mail: email })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      toast.error('Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-madera-100 dark:hover:bg-madera-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-madera-600 dark:text-madera-300" />
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-black" />
          Mi Perfil
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-madera-900 rounded-xl border border-madera-200 dark:border-madera-800 shadow-sm p-6 max-w-lg mx-auto"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-madera-200 dark:bg-madera-800 flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-madera-700 dark:text-madera-200" />
          </div>
          <p className="text-lg font-semibold text-madera-900 dark:text-madera-50">
            {user.nombre}
          </p>
          <p className="text-sm text-madera-600 dark:text-madera-400 capitalize">
            {user.rol}
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ingrese su nombre"
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingrese su email"
          />

          <Input
            label="DNI"
            value={user.id_rol ? '***' : ''}
            disabled
            className="bg-madera-50 dark:bg-madera-800 cursor-not-allowed"
          />

          <Input
            label="Rol"
            value={user.rol === 'admin' ? 'Administrador' : 'Empleado'}
            disabled
            className="bg-madera-50 dark:bg-madera-800 cursor-not-allowed"
          />

          <Button
            onClick={handleGuardar}
            loading={loading}
            className="w-full"
          >
            <Save className="w-4 h-4" />
            Guardar Cambios
          </Button>
        </div>
      </motion.div>
    </div>
  )
}