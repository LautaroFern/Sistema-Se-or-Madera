import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClipboardList, ChevronDown, ChevronUp, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { Auditoria } from '../../types'
import { LoadingSpinner } from '../../components/ui'

export function AuditoriaPage() {
  const [registros, setRegistros] = useState<Auditoria[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [filtros, setFiltros] = useState({
    tabla: '',
    accion: '',
    fechaDesde: '',
    fechaHasta: '',
  })

  const fetchAuditoria = async () => {
    try {
      let query = supabase
        .from('auditoria')
        .select('*, usuario:id_usuario(nombre)')
        .order('fecha', { ascending: false })

      if (filtros.tabla) {
        query = query.eq('tabla_afectada', filtros.tabla)
      }
      if (filtros.accion) {
        query = query.eq('accion', filtros.accion)
      }
      if (filtros.fechaDesde) {
        query = query.gte('fecha', filtros.fechaDesde)
      }
      if (filtros.fechaHasta) {
        query = query.lte('fecha', filtros.fechaHasta + 'T23:59:59')
      }

      const { data, error } = await query

      if (error) throw error
      setRegistros(data || [])
    } catch (error) {
      console.error('Error al cargar auditoría:', error)
      toast.error('Error al cargar registros de auditoría')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditoria()
  }, [filtros])

  const formatJson = (data: Record<string, unknown> | null) => {
    if (!data) return 'Sin datos'
    return JSON.stringify(data, null, 2)
  }

  const getAccionColor = (accion: string) => {
    switch (accion) {
      case 'INSERT':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-madera-100 text-madera-800 dark:bg-madera-800 dark:text-madera-200'
    }
  }

  const tablas = [...new Set(registros.map((r) => r.tabla_afectada))]

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black dark:text-madera-50 flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-black dark:text-madera-300" />
        Auditoría
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-madera-900 rounded-xl border border-madera-200 dark:border-madera-800 shadow-sm"
      >
        <div className="p-4 border-b border-madera-200 dark:border-madera-800">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-madera-500" />
            <span className="font-medium text-madera-700 dark:text-madera-300">
              Filtros
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-madera-700 dark:text-madera-300 mb-1">
                Tabla
              </label>
              <select
                value={filtros.tabla}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, tabla: e.target.value }))
                }
                className="w-full px-3 py-2 border border-madera-300 dark:border-madera-600 rounded-lg bg-white dark:bg-madera-800 text-madera-900 dark:text-madera-100 focus:outline-none focus:ring-2 focus:ring-madera-500"
              >
                <option value="">Todas</option>
                {tablas.map((tabla) => (
                  <option key={tabla} value={tabla}>
                    {tabla}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-madera-700 dark:text-madera-300 mb-1">
                Acción
              </label>
              <select
                value={filtros.accion}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, accion: e.target.value }))
                }
                className="w-full px-3 py-2 border border-madera-300 dark:border-madera-600 rounded-lg bg-white dark:bg-madera-800 text-madera-900 dark:text-madera-100 focus:outline-none focus:ring-2 focus:ring-madera-500"
              >
                <option value="">Todas</option>
                <option value="INSERT">INSERT</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-madera-700 dark:text-madera-300 mb-1">
                Desde
              </label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, fechaDesde: e.target.value }))
                }
                className="w-full px-3 py-2 border border-madera-300 dark:border-madera-600 rounded-lg bg-white dark:bg-madera-800 text-madera-900 dark:text-madera-100 focus:outline-none focus:ring-2 focus:ring-madera-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-madera-700 dark:text-madera-300 mb-1">
                Hasta
              </label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, fechaHasta: e.target.value }))
                }
                className="w-full px-3 py-2 border border-madera-300 dark:border-madera-600 rounded-lg bg-white dark:bg-madera-800 text-madera-900 dark:text-madera-100 focus:outline-none focus:ring-2 focus:ring-madera-500"
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          {registros.length === 0 ? (
            <p className="text-center text-madera-500 py-8">
              No se encontraron registros
            </p>
          ) : (
            <div className="space-y-2">
              {registros.map((registro) => (
                <div
                  key={registro.id}
                  className="border border-madera-200 dark:border-madera-800 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedRow(
                        expandedRow === registro.id ? null : registro.id
                      )
                    }
                    className="w-full flex items-center justify-between p-4 hover:bg-madera-50 dark:hover:bg-madera-800 transition-colors"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <span className="text-sm text-madera-500">
                        {new Date(registro.fecha).toLocaleString('es-AR')}
                      </span>
                      <span className="font-medium text-madera-800 dark:text-madera-100">
                        {registro.usuario?.nombre || 'Usuario desconocido'}
                      </span>
                      <span className="text-madera-600 dark:text-madera-400">
                        {registro.tabla_afectada}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAccionColor(
                          registro.accion
                        )}`}
                      >
                        {registro.accion}
                      </span>
                      <span className="text-sm text-madera-500">
                        ID: {registro.id_registro}
                      </span>
                    </div>

                    {expandedRow === registro.id ? (
                      <ChevronUp className="w-5 h-5 text-madera-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-madera-400" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedRow === registro.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-madera-50 dark:bg-madera-800 border-t border-madera-200 dark:border-madera-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-madera-700 dark:text-madera-300 mb-2">
                                Datos Anteriores
                              </h4>
                              <pre className="p-3 bg-white dark:bg-madera-900 rounded-lg text-sm overflow-x-auto border border-madera-200 dark:border-madera-800">
                                {formatJson(registro.datos_anteriores)}
                              </pre>
                            </div>
                            <div>
                              <h4 className="font-medium text-madera-700 dark:text-madera-300 mb-2">
                                Datos Nuevos
                              </h4>
                              <pre className="p-3 bg-white dark:bg-madera-900 rounded-lg text-sm overflow-x-auto border border-madera-200 dark:border-madera-800">
                                {formatJson(registro.datos_nuevos)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}