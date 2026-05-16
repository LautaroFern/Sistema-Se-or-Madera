import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, ArrowRightLeft, Eye } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { Operacion, EstadoOperacion, OperacionProducto } from '../../types'
import { Button, Badge, LoadingSpinner, Table } from '../../components/ui'
import { CambiarEstadoModal } from '../../components/ui/CambiarEstadoModal'
import type { Column } from '../../components/ui/Table'

export function OperacionesPage() {
  const [operaciones, setOperaciones] = useState<Operacion[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedOperacion, setSelectedOperacion] = useState<Operacion | null>(null)
  const [detalleOpen, setDetalleOpen] = useState<Operacion | null>(null)
  const [productosDetalle, setProductosDetalle] = useState<OperacionProducto[]>([])

  const fetchOperaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('operacion')
        .select('*, cliente:id_cliente(nombre)')
        .order('fecha_creacion', { ascending: false })

      if (error) throw error
      setOperaciones(data || [])
    } catch (error) {
      console.error('Error al cargar operaciones:', error)
      toast.error('Error al cargar operaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOperaciones()
  }, [])

  const fetchProductosOperacion = async (operacionId: number) => {
    try {
      const { data, error } = await supabase
        .from('operacion_x_producto')
        .select('*, producto:id_producto(*)')
        .eq('id_operacion', operacionId)

      if (error) throw error
      setProductosDetalle(data || [])
    } catch (error) {
      console.error('Error al cargar productos:', error)
      setProductosDetalle([])
    }
  }

  const handleVerDetalle = async (operacion: Operacion) => {
    setDetalleOpen(operacion)
    await fetchProductosOperacion(operacion.id)
  }

  const descontarStock = async (productos: OperacionProducto[]) => {
    for (const item of productos) {
      const { data: producto, error: fetchError } = await supabase
        .from('producto')
        .select('cantidad')
        .eq('id', item.id_producto)
        .single()

      if (fetchError) throw fetchError

      const { error: updateError } = await supabase
        .from('producto')
        .update({ cantidad: producto.cantidad - item.cantidad })
        .eq('id', item.id_producto)

      if (updateError) throw updateError
    }
  }

  const handleCambiarEstado = async (nuevoEstado: EstadoOperacion) => {
    if (!selectedOperacion) return

    try {
      const { data: productos, error: prodError } = await supabase
        .from('operacion_x_producto')
        .select('*')
        .eq('id_operacion', selectedOperacion.id)

      if (prodError) throw prodError

      if (nuevoEstado === 'aprobado') {
        await descontarStock(productos || [])
      }

      const { error: updateError } = await supabase
        .from('operacion')
        .update({ estado: nuevoEstado })
        .eq('id', selectedOperacion.id)

      if (updateError) throw updateError

      if (nuevoEstado === 'aprobado') {
        toast.success('Operación aprobada - Stock descontado')
      } else {
        toast.success(`Estado cambiado a ${nuevoEstado}`)
      }

      fetchOperaciones()
      setSelectedOperacion(null)
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      toast.error('Error al cambiar el estado de la operación')
      throw error
    }
  }

  const handleRechazar = async () => {
    if (!selectedOperacion) return

    try {
      const { error: prodError } = await supabase
        .from('operacion_x_producto')
        .delete()
        .eq('id_operacion', selectedOperacion.id)

      if (prodError) throw prodError

      const { error: opError } = await supabase
        .from('operacion')
        .delete()
        .eq('id', selectedOperacion.id)

      if (opError) throw opError

      toast.success('Operación rechazada y eliminada')
      fetchOperaciones()
      setSelectedOperacion(null)
    } catch (error) {
      console.error('Error al rechazar operación:', error)
      toast.error('Error al rechazar la operación')
      throw error
    }
  }

  const columns: Column<Operacion>[] = [
    {
      key: 'nombre_operacion',
      header: 'Operación',
      searchKey: true,
    },
    {
      key: 'cliente',
      header: 'Cliente',
      searchKey: true,
      render: (op) => op.cliente?.nombre || 'Sin cliente',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (op) => <Badge estado={op.estado} />,
    },
    {
      key: 'costo',
      header: 'Costo',
      render: (op) => `$${op.costo.toLocaleString('es-AR')}`,
    },
    {
      key: 'fecha_creacion',
      header: 'Fecha',
      render: (op) => new Date(op.fecha_creacion).toLocaleDateString('es-AR'),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (op) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleVerDetalle(op)
            }}
            className="p-1.5 text-madera-600 hover:bg-madera-100 dark:text-madera-400 dark:hover:bg-madera-800 rounded-lg transition-colors"
            title="Ver detalle"
          >
            <Eye className="w-4 h-4" />
          </button>
          {op.estado !== 'finalizado' && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedOperacion(op)
                setModalOpen(true)
              }}
              className="p-1.5 text-madera-600 hover:bg-madera-100 dark:text-madera-400 dark:hover:bg-madera-800 rounded-lg transition-colors"
              title="Cambiar estado"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-black" />
        Operaciones
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-madera-900 rounded-xl border border-madera-200 dark:border-madera-800 shadow-sm p-4"
      >
        <Table
          data={operaciones}
          columns={columns}
          searchPlaceholder="Buscar operaciones..."
        />
      </motion.div>

      {selectedOperacion && (
        <CambiarEstadoModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false)
            setSelectedOperacion(null)
          }}
          onConfirm={handleCambiarEstado}
          onReject={handleRechazar}
          estadoActual={selectedOperacion.estado}
          nombreOperacion={selectedOperacion.nombre_operacion}
        />
      )}

      {detalleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setDetalleOpen(null)
              setProductosDetalle([])
            }}
          />
          <div className="relative bg-white dark:bg-madera-900 rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-madera-200 dark:border-madera-800">
              <h2 className="text-lg font-semibold text-madera-900 dark:text-madera-50">
                Detalle de Operación
              </h2>
              <button
                onClick={() => {
                  setDetalleOpen(null)
                  setProductosDetalle([])
                }}
                className="p-1 rounded-lg hover:bg-madera-100 dark:hover:bg-madera-800 transition-colors"
              >
                <span className="text-madera-500">&times;</span>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-madera-500">Nombre</p>
                <p className="font-medium text-madera-800 dark:text-madera-100">
                  {detalleOpen.nombre_operacion}
                </p>
              </div>

              <div>
                <p className="text-sm text-madera-500">Cliente</p>
                <p className="font-medium text-madera-800 dark:text-madera-100">
                  {detalleOpen.cliente?.nombre || 'Sin cliente'}
                </p>
              </div>

              <div>
                <p className="text-sm text-madera-500">Descripción</p>
                <p className="text-madera-700 dark:text-madera-300">
                  {detalleOpen.descripcion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-madera-500">Estado</p>
                  <Badge estado={detalleOpen.estado} />
                </div>
                <div>
                  <p className="text-sm text-madera-500">Costo Total</p>
                  <p className="font-medium text-madera-800 dark:text-madera-100">
                    ${detalleOpen.costo.toLocaleString('es-AR')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-madera-500 mb-2">Productos utilizados</p>
                {productosDetalle.length === 0 ? (
                  <p className="text-madera-400 text-sm">Cargando productos...</p>
                ) : (
                  <div className="space-y-2">
                    {productosDetalle.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-madera-50 dark:bg-madera-800 rounded-lg"
                      >
                        <span className="text-sm text-madera-700 dark:text-madera-300">
                          {item.producto?.nombre || `Producto #${item.id_producto}`}
                        </span>
                        <span className="text-sm font-medium text-madera-800 dark:text-madera-100">
                          x{item.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-madera-200 dark:border-madera-800">
              <Button
                variant="secondary"
                onClick={() => {
                  setDetalleOpen(null)
                  setProductosDetalle([])
                }}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}