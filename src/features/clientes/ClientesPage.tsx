import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, Pencil, Trash2, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'
import { Cliente } from '../../types'
import { Button, Table, LoadingSpinner } from '../../components/ui'
import { ClienteModal } from './ClienteModal'
import type { Column } from '../../components/ui/Table'

export function ClientesPage() {
  const { user } = useAuth()
  const isAdmin = user?.rol === 'admin'
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Cliente | null>(null)
  const [filtros, setFiltros] = useState({
    nombre: '',
    dni: '',
  })

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('cliente')
        .select('*')
        .order('nombre')

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error('Error al cargar clientes:', error)
      toast.error('Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) => {
      if (filtros.nombre && !cliente.nombre.toLowerCase().includes(filtros.nombre.toLowerCase())) {
        return false
      }
      if (filtros.dni && !cliente.dni.includes(filtros.dni)) {
        return false
      }
      return true
    })
  }, [clientes, filtros])

  const handleSave = async (clienteData: Omit<Cliente, 'id'>) => {
    try {
      if (selectedCliente) {
        const { error } = await supabase
          .from('cliente')
          .update(clienteData)
          .eq('id', selectedCliente.id)

        if (error) throw error
        toast.success('Cliente actualizado correctamente')
      } else {
        const { error } = await supabase.from('cliente').insert(clienteData)

        if (error) throw error
        toast.success('Cliente creado correctamente')
      }

      fetchClientes()
      setSelectedCliente(null)
    } catch (error) {
      console.error('Error al guardar cliente:', error)
      toast.error('Error al guardar cliente')
      throw error
    }
  }

  const handleDelete = async (cliente: Cliente) => {
    try {
      const { error } = await supabase
        .from('cliente')
        .delete()
        .eq('id', cliente.id)

      if (error) throw error

      toast.success('Cliente eliminado correctamente')
      fetchClientes()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error al eliminar cliente:', error)
      toast.error('Error al eliminar cliente')
    }
  }

  const columns: Column<Cliente>[] = [
    { key: 'nombre', header: 'Nombre', searchKey: true },
    { key: 'dni', header: 'DNI', searchKey: true },
    { key: 'cuit_rut', header: 'CUIT/RUT' },
    { key: 'mail', header: 'Email', searchKey: true },
    { key: 'telefono', header: 'Teléfono' },
    { key: 'direccion', header: 'Dirección' },
    { key: 'numero', header: 'Número' },
  ]

  if (isAdmin) {
    columns.push({
      key: 'acciones',
      header: 'Acciones',
      render: (cliente) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setSelectedCliente(cliente)
              setModalOpen(true)
            }}
            className="p-1.5 text-madera-600 hover:bg-madera-100 dark:text-madera-400 dark:hover:bg-madera-800 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDeleteConfirm(cliente)
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
          <Users className="w-6 h-6 text-black" />
          Clientes
        </h1>

        {isAdmin && (
          <Button
            onClick={() => {
              setSelectedCliente(null)
              setModalOpen(true)
            }}
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </Button>
        )}
      </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-madera-700 dark:text-madera-300 mb-1">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={filtros.nombre}
                onChange={(e) => setFiltros((prev) => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-3 py-2 border border-madera-300 dark:border-madera-600 rounded-lg bg-white dark:bg-madera-800 text-madera-900 dark:text-madera-100 focus:outline-none focus:ring-2 focus:ring-madera-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-madera-700 dark:text-madera-300 mb-1">
                DNI
              </label>
              <input
                type="text"
                placeholder="Buscar por DNI..."
                value={filtros.dni}
                onChange={(e) => setFiltros((prev) => ({ ...prev, dni: e.target.value }))}
                className="w-full px-3 py-2 border border-madera-300 dark:border-madera-600 rounded-lg bg-white dark:bg-madera-800 text-madera-900 dark:text-madera-100 focus:outline-none focus:ring-2 focus:ring-madera-500"
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          <Table
            data={clientesFiltrados}
            columns={columns}
            searchPlaceholder="Buscar clientes..."
          />
        </div>
      </motion.div>

      <ClienteModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedCliente(null)
        }}
        onSave={handleSave}
        cliente={selectedCliente}
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
              ¿Está seguro que desea eliminar al cliente{' '}
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