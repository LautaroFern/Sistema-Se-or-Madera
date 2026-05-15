import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { Operacion } from '../../types'
import { Badge, LoadingSpinner } from '../../components/ui'

interface DashboardStats {
  presupuesto: number
  en_progreso: number
  finalizado: number
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    presupuesto: 0,
    en_progreso: 0,
    finalizado: 0,
  })
  const [ultimasOperaciones, setUltimasOperaciones] = useState<Operacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: operaciones, error } = await supabase
          .from('operacion')
          .select('*, cliente:id_cliente(nombre)')
          .order('fecha_creacion', { ascending: false })

        if (error) {
          throw error
        }

        if (operaciones) {
          const presupuesto = operaciones.filter(
            (op) => op.estado === 'presupuesto'
          ).length
          const en_progreso = operaciones.filter(
            (op) => op.estado === 'en_progreso' || op.estado === 'aprobado'
          ).length
          const finalizado = operaciones.filter(
            (op) => op.estado === 'finalizado'
          ).length

          setStats({ presupuesto, en_progreso, finalizado })
          setUltimasOperaciones(operaciones.slice(0, 5))
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  const statCards = [
    {
      title: 'Pendientes',
      value: stats.presupuesto,
      icon: Clock,
      color: 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300',
    },
    {
      title: 'En Progreso',
      value: stats.en_progreso,
      icon: AlertCircle,
      color: 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300',
    },
    {
      title: 'Finalizados',
      value: stats.finalizado,
      icon: CheckCircle,
      color: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300',
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black dark:text-madera-50">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-madera-900 rounded-xl p-6 border border-madera-200 dark:border-madera-800 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-madera-600 dark:text-madera-400">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-madera-900 dark:text-madera-50 mt-1">
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white dark:bg-madera-900 rounded-xl border border-madera-200 dark:border-madera-800 shadow-sm"
      >
        <div className="p-4 border-b border-madera-200 dark:border-madera-800">
          <h2 className="text-lg font-semibold text-madera-900 dark:text-madera-50 flex items-center gap-2">
            <FileText className="w-5 h-5 text-madera-700 dark:text-madera-300" />
            Últimas Operaciones
          </h2>
        </div>

        <div className="p-4">
          {ultimasOperaciones.length === 0 ? (
            <p className="text-center text-madera-500 py-8">
              No hay operaciones registradas
            </p>
          ) : (
            <div className="space-y-3">
              {ultimasOperaciones.map((op) => (
                <div
                  key={op.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-madera-50 dark:bg-madera-800 border border-madera-100 dark:border-madera-700"
                >
                  <div>
                    <p className="font-medium text-madera-800 dark:text-madera-100">
                      {op.nombre_operacion}
                    </p>
                    <p className="text-sm text-madera-500">
                      {op.cliente?.nombre || 'Sin cliente'} •{' '}
                      {new Date(op.fecha_creacion).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                  <Badge estado={op.estado} />
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}