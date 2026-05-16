import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Package, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'
import { Producto } from '../../types'
import { Button, Table, LoadingSpinner } from '../../components/ui'
import { ProductoModal } from './ProductoModal'
import type { Column } from '../../components/ui/Table'

export function ProductosPage() {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'admin'
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Producto | null>(null)

  const fetchProductos = async () => {
    try {
      const { data, error } = await supabase
        .from('producto')
        .select('*')
        .order('nombre')

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error('Error al cargar productos:', error)
      toast.error('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  const handleSave = async (productoData: Omit<Producto, 'id'>) => {
    try {
      if (selectedProducto) {
        const { error } = await supabase
          .from('producto')
          .update(productoData)
          .eq('id', selectedProducto.id)

        if (error) throw error
        toast.success('Producto actualizado correctamente')
      } else {
        const { error } = await supabase.from('producto').insert(productoData)

        if (error) throw error
        toast.success('Producto creado correctamente')
      }

      fetchProductos()
      setSelectedProducto(null)
    } catch (error) {
      console.error('Error al guardar producto:', error)
      toast.error('Error al guardar producto')
      throw error
    }
  }

  const handleDelete = async (producto: Producto) => {
    try {
      const { error } = await supabase
        .from('producto')
        .delete()
        .eq('id', producto.id)

      if (error) throw error

      toast.success('Producto eliminado correctamente')
      fetchProductos()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      toast.error('Error al eliminar producto')
    }
  }

  const columns: Column<Producto>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      searchKey: true,
      render: (producto) => (
        <div className="flex items-center gap-2">
          <span>{producto.nombre}</span>
          {producto.cantidad <= producto.cantidad_minima && (
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          )}
        </div>
      ),
    },
    { key: 'categoria', header: 'Categoría', searchKey: true },
    { key: 'unidad_de_medida', header: 'Unidad' },
    {
      key: 'precio_costo',
      header: 'Precio Costo',
      render: (producto) => `$${producto.precio_costo.toLocaleString('es-AR')}`,
    },
    {
      key: 'precio_venta',
      header: 'Precio Venta',
      render: (producto) => `$${producto.precio_venta.toLocaleString('es-AR')}`,
    },
    {
      key: 'cantidad',
      header: 'Stock',
      render: (producto) => (
        <span
          className={
            producto.cantidad <= producto.cantidad_minima
              ? 'text-red-600 font-medium'
              : ''
          }
        >
          {producto.cantidad}
        </span>
      ),
    },
    { key: 'cantidad_minima', header: 'Stock Mín.' },
  ]

  if (isAdmin) {
    columns.push({
      key: 'acciones',
      header: 'Acciones',
      render: (producto) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedProducto(producto)
              setModalOpen(true)
            }}
            className="p-1.5 text-madera-600 hover:bg-madera-100 dark:text-madera-400 dark:hover:bg-madera-800 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDeleteConfirm(producto)
            }}
            className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    })
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-black" />
          Productos
        </h1>

        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedProducto(null)
              setModalOpen(true)
            }}
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </Button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-madera-900 rounded-xl border border-madera-200 dark:border-madera-800 shadow-sm p-4"
      >
        <Table
          data={productos}
          columns={columns}
          searchPlaceholder="Buscar productos..."
        />
      </motion.div>

      <ProductoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedProducto(null)
        }}
        onSave={handleSave}
        producto={selectedProducto}
      />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative bg-white dark:bg-madera-900 rounded-xl shadow-xl p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-madera-900 dark:text-madera-50 mb-2">
              Confirmar Eliminación
            </h3>
            <p className="text-madera-600 dark:text-madera-400 mb-4">
              ¿Está seguro que desea eliminar el producto{' '}
              <strong>{deleteConfirm.nombre}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}