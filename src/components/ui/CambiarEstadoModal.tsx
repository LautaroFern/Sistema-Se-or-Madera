import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { EstadoOperacion } from '../../types'
import { Button, Badge } from '../ui'

interface CambiarEstadoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (nuevoEstado: EstadoOperacion) => Promise<void>
  onReject?: () => Promise<void>
  estadoActual: EstadoOperacion
  nombreOperacion: string
}

const transicionesValidas: Record<EstadoOperacion, EstadoOperacion[]> = {
  presupuesto: ['aprobado'],
  aprobado: ['en_progreso'],
  en_progreso: ['finalizado'],
  finalizado: [],
}

export function CambiarEstadoModal({
  isOpen,
  onClose,
  onConfirm,
  onReject,
  estadoActual,
  nombreOperacion,
}: CambiarEstadoModalProps) {
  const [loading, setLoading] = useState(false)
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoOperacion | null>(null)
  const [rechazando, setRechazando] = useState(false)

  const estadosDisponibles = transicionesValidas[estadoActual]

  const handleConfirm = async () => {
    if (rechazando && onReject) {
      setLoading(true)
      try {
        await onReject()
        onClose()
      } catch (error) {
        console.error('Error al rechazar:', error)
      } finally {
        setLoading(false)
      }
      return
    }

    if (!estadoSeleccionado) return

    setLoading(true)
    try {
      await onConfirm(estadoSeleccionado)
      onClose()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetAndClose = () => {
    setEstadoSeleccionado(null)
    setRechazando(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={resetAndClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white dark:bg-madera-900 rounded-xl shadow-xl w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between p-4 border-b border-madera-200 dark:border-madera-700">
              <h2 className="text-lg font-semibold text-madera-800 dark:text-madera-100">
                Cambiar Estado
              </h2>
              <button
                onClick={resetAndClose}
                className="p-1 rounded-lg hover:bg-madera-100 dark:hover:bg-madera-800 transition-colors"
              >
                <X className="w-5 h-5 text-madera-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-madera-500 mb-1">Operación</p>
                <p className="font-medium text-madera-800 dark:text-madera-100">
                  {nombreOperacion}
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-madera-50 dark:bg-madera-800 rounded-lg">
                <div>
                  <p className="text-xs text-madera-500 mb-1">Estado actual</p>
                  <Badge estado={estadoActual} />
                </div>
                {estadoSeleccionado && !rechazando && (
                  <>
                    <ArrowRight className="w-5 h-5 text-madera-400" />
                    <div>
                      <p className="text-xs text-madera-500 mb-1">Nuevo estado</p>
                      <Badge estado={estadoSeleccionado} />
                    </div>
                  </>
                )}
                {rechazando && (
                  <>
                    <ArrowRight className="w-5 h-5 text-madera-400" />
                    <div>
                      <p className="text-xs text-madera-500 mb-1">Resultado</p>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Rechazada
                      </span>
                    </div>
                  </>
                )}
              </div>

              {estadoActual === 'presupuesto' && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-madera-700 dark:text-madera-300">
                    Simular respuesta del cliente:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEstadoSeleccionado('aprobado')
                        setRechazando(false)
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        estadoSeleccionado === 'aprobado' && !rechazando
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'border-madera-200 dark:border-madera-700 hover:border-green-300'
                      }`}
                    >
                      <CheckCircle className="w-5 h-5" />
                      Aprobar
                    </button>
                    <button
                      onClick={() => {
                        setEstadoSeleccionado(null)
                        setRechazando(true)
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        rechazando
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          : 'border-madera-200 dark:border-madera-700 hover:border-red-300'
                      }`}
                    >
                      <XCircle className="w-5 h-5" />
                      Rechazar
                    </button>
                  </div>
                </div>
              )}

              {estadoActual !== 'presupuesto' && estadosDisponibles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-madera-700 dark:text-madera-300">
                    Avanzar a:
                  </p>
                  {estadosDisponibles.map((estado) => (
                    <button
                      key={estado}
                      onClick={() => {
                        setEstadoSeleccionado(estado)
                        setRechazando(false)
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                        estadoSeleccionado === estado
                          ? 'border-madera-500 bg-madera-50 dark:bg-madera-800'
                          : 'border-madera-200 dark:border-madera-700 hover:border-madera-300'
                      }`}
                    >
                      <Badge estado={estado} />
                      {estadoSeleccionado === estado && (
                        <CheckCircle className="w-5 h-5 text-madera-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {estadosDisponibles.length === 0 && estadoActual === 'finalizado' && (
                <p className="text-center text-madera-500 py-4">
                  Esta operación ya está finalizada.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-madera-200 dark:border-madera-700">
              <Button variant="secondary" onClick={resetAndClose}>
                Cancelar
              </Button>
              {rechazando ? (
                <Button variant="danger" loading={loading} onClick={handleConfirm}>
                  <XCircle className="w-4 h-4" />
                  Rechazar Operación
                </Button>
              ) : estadoSeleccionado ? (
                <Button loading={loading} onClick={handleConfirm}>
                  <CheckCircle className="w-4 h-4" />
                  {estadoActual === 'presupuesto' ? 'Aprobar Operación' : 'Confirmar Cambio'}
                </Button>
              ) : null}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}