import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FileText, Plus, Trash2, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../auth/AuthContext'
import { Cliente, Producto, FacturacionForm } from '../../types'
import { Button, Input, Select, LoadingSpinner } from '../../components/ui'

export function FacturacionPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [form, setForm] = useState<FacturacionForm>({
    id_cliente: null,
    nombre_operacion: '',
    descripcion: '',
    duracion: 0,
    productos: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, productosRes] = await Promise.all([
          supabase.from('cliente').select('*').order('nombre'),
          supabase.from('producto').select('*').order('nombre'),
        ])

        if (clientesRes.error) throw clientesRes.error
        if (productosRes.error) throw productosRes.error

        setClientes(clientesRes.data || [])
        setProductos(productosRes.data || [])
      } catch (error) {
        console.error('Error al cargar datos:', error)
        toast.error('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!form.id_cliente) {
      newErrors.id_cliente = 'Seleccione un cliente'
    }
    if (!form.nombre_operacion.trim()) {
      newErrors.nombre_operacion = 'El nombre es requerido'
    }
    if (!form.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    }
    if (form.duracion <= 0) {
      newErrors.duracion = 'La duración debe ser mayor a 0'
    }
    if (form.productos.length === 0) {
      newErrors.productos = 'Agregue al menos un producto'
    }

    const productosInvalidos = form.productos.filter((p) => p.cantidad <= 0)
    if (productosInvalidos.length > 0) {
      newErrors.productos_cantidad = 'Todas las cantidades deben ser mayores a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addProducto = () => {
    setForm((prev) => ({
      ...prev,
      productos: [...prev.productos, { id_producto: 0, cantidad: 1 }],
    }))
  }

  const removeProducto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index),
    }))
  }

  const updateProducto = (index: number, field: 'id_producto' | 'cantidad', value: number) => {
    setForm((prev) => ({
      ...prev,
      productos: prev.productos.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }))
  }

  const calcularTotal = () => {
    return form.productos.reduce((total, item) => {
      const producto = productos.find((p) => p.id === item.id_producto)
      return total + (producto?.precio_venta || 0) * item.cantidad
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const total = calcularTotal()

      const { data: operacion, error: opError } = await supabase
        .from('operacion')
        .insert({
          nombre_operacion: form.nombre_operacion,
          descripcion: form.descripcion,
          duracion: form.duracion,
          costo: total,
          estado: 'presupuesto',
          fecha_creacion: new Date().toISOString(),
          id_usuario: user?.id,
          id_cliente: form.id_cliente,
        })
        .select()
        .single()

      if (opError) throw opError

      const productosInsert = form.productos.map((p) => ({
        id_operacion: operacion.id,
        id_producto: p.id_producto,
        cantidad: p.cantidad,
      }))

      const { error: prodError } = await supabase
        .from('operacion_x_producto')
        .insert(productosInsert)

      if (prodError) throw prodError

      toast.success('Operación creada correctamente')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error al crear operación:', error)
      toast.error('Error al crear la operación')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const clienteOptions = clientes.map((c) => ({
    value: c.id,
    label: c.nombre,
  }))

  const productoOptions = productos
    .filter((p) => p.cantidad > 0)
    .map((p) => ({
      value: p.id,
      label: `${p.nombre} - $${p.precio_venta} (Stock: ${p.cantidad})`,
    }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-black dark:text-madera-50 flex items-center gap-2">
        <FileText className="w-6 h-6 text-black dark:text-madera-300" />
        Nueva Facturación
      </h1>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-madera-900 rounded-xl border border-madera-200 dark:border-madera-800 shadow-sm p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Cliente"
            options={clienteOptions}
            placeholder="Seleccione un cliente"
            value={form.id_cliente || ''}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                id_cliente: e.target.value ? Number(e.target.value) : null,
              }))
            }
            error={errors.id_cliente}
          />

          <Input
            label="Nombre de la Operación"
            placeholder="Ej: Mesa de roble"
            value={form.nombre_operacion}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, nombre_operacion: e.target.value }))
            }
            error={errors.nombre_operacion}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-madera-700 dark:text-madera-300">
            Descripción
          </label>
          <textarea
            placeholder="Descripción del trabajo a realizar"
            value={form.descripcion}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, descripcion: e.target.value }))
            }
            rows={3}
            className="w-full px-3 py-2 border rounded-lg transition-colors duration-200 
              bg-white dark:bg-madera-800 
              text-madera-900 dark:text-madera-100 
              placeholder-madera-400 
              border-madera-300 dark:border-madera-600 
              focus:outline-none focus:ring-2 focus:ring-madera-500 focus:border-transparent"
          />
          {errors.descripcion && (
            <p className="text-sm text-red-500">{errors.descripcion}</p>
          )}
        </div>

        <Input
          label="Duración estimada (horas)"
          type="number"
          min="1"
          placeholder="Ej: 8"
          value={form.duracion || ''}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              duracion: parseInt(e.target.value) || 0,
            }))
          }
          error={errors.duracion}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-madera-700 dark:text-madera-300">
              Productos
            </label>
            <Button type="button" variant="secondary" onClick={addProducto} size="sm">
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>

          {errors.productos && (
            <p className="text-sm text-red-500">{errors.productos}</p>
          )}
          {errors.productos_cantidad && (
            <p className="text-sm text-red-500">{errors.productos_cantidad}</p>
          )}

          {form.productos.length === 0 ? (
            <p className="text-center text-madera-500 py-4 border-2 border-dashed border-madera-200 dark:border-madera-700 rounded-lg">
              No hay productos agregados
            </p>
          ) : (
            <div className="space-y-3">
              {form.productos.map((item, index) => (
                <div
                  key={index}
                  className="flex items-end gap-3 p-3 bg-madera-50 dark:bg-madera-800 rounded-lg"
                >
                  <div className="flex-1">
                    <Select
                      options={productoOptions}
                      placeholder="Seleccione un producto"
                      value={item.id_producto || ''}
                      onChange={(e) =>
                        updateProducto(index, 'id_producto', Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Cant."
                      value={item.cantidad || ''}
                      onChange={(e) =>
                        updateProducto(index, 'cantidad', parseInt(e.target.value) || 0)
                      }
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeProducto(index)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-madera-100 dark:bg-madera-800 rounded-lg">
          <span className="text-lg font-medium text-madera-700 dark:text-madera-300 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Total:
          </span>
          <span className="text-2xl font-bold text-madera-800 dark:text-madera-100">
            ${calcularTotal().toLocaleString('es-AR')}
          </span>
        </div>

        <Button type="submit" loading={submitting} className="w-full">
          Confirmar Operación
        </Button>
      </motion.form>
    </div>
  )
}