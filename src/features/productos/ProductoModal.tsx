import { useState, useEffect } from 'react'
import { Producto } from '../../types'
import { Button, Input, Modal } from '../../components/ui'

interface ProductoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (producto: Omit<Producto, 'id'>) => Promise<void>
  producto?: Producto | null
}

export function ProductoModal({ isOpen, onClose, onSave, producto }: ProductoModalProps) {
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    unidad_de_medida: '',
    precio_costo: 0,
    precio_venta: 0,
    cantidad: 0,
    cantidad_minima: 0,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (producto) {
      setForm({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        unidad_de_medida: producto.unidad_de_medida,
        precio_costo: producto.precio_costo,
        precio_venta: producto.precio_venta,
        cantidad: producto.cantidad,
        cantidad_minima: producto.cantidad_minima,
      })
    } else {
      setForm({
        nombre: '',
        descripcion: '',
        categoria: '',
        unidad_de_medida: '',
        precio_costo: 0,
        precio_venta: 0,
        cantidad: 0,
        cantidad_minima: 0,
      })
    }
    setErrors({})
  }, [producto, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    if (!form.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    }
    if (!form.categoria.trim()) {
      newErrors.categoria = 'La categoría es requerida'
    }
    if (!form.unidad_de_medida.trim()) {
      newErrors.unidad_de_medida = 'La unidad de medida es requerida'
    }
    if (form.precio_costo <= 0) {
      newErrors.precio_costo = 'El precio de costo debe ser mayor a 0'
    }
    if (form.precio_venta <= 0) {
      newErrors.precio_venta = 'El precio de venta debe ser mayor a 0'
    }
    if (form.cantidad < 0) {
      newErrors.cantidad = 'La cantidad no puede ser negativa'
    }
    if (form.cantidad_minima < 0) {
      newErrors.cantidad_minima = 'La cantidad mínima no puede ser negativa'
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
    try {
      await onSave(form)
      onClose()
    } catch (error) {
      console.error('Error al guardar producto:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={producto ? 'Editar Producto' : 'Nuevo Producto'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          placeholder="Nombre del producto"
          value={form.nombre}
          onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
          error={errors.nombre}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-madera-700 dark:text-madera-300">
            Descripción
          </label>
          <textarea
            placeholder="Descripción del producto"
            value={form.descripcion}
            onChange={(e) => setForm((prev) => ({ ...prev, descripcion: e.target.value }))}
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Categoría"
            placeholder="Ej: Madera"
            value={form.categoria}
            onChange={(e) => setForm((prev) => ({ ...prev, categoria: e.target.value }))}
            error={errors.categoria}
          />
          <Input
            label="Unidad de Medida"
            placeholder="Ej: Unidad, Metro, Kg"
            value={form.unidad_de_medida}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, unidad_de_medida: e.target.value }))
            }
            error={errors.unidad_de_medida}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Precio Costo"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.precio_costo || ''}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                precio_costo: parseFloat(e.target.value) || 0,
              }))
            }
            error={errors.precio_costo}
          />
          <Input
            label="Precio Venta"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.precio_venta || ''}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                precio_venta: parseFloat(e.target.value) || 0,
              }))
            }
            error={errors.precio_venta}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Cantidad"
            type="number"
            min="0"
            placeholder="0"
            value={form.cantidad || ''}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                cantidad: parseFloat(e.target.value) || 0,
              }))
            }
            error={errors.cantidad}
          />
          <Input
            label="Cantidad Mínima"
            type="number"
            min="0"
            placeholder="0"
            value={form.cantidad_minima || ''}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                cantidad_minima: parseFloat(e.target.value) || 0,
              }))
            }
            error={errors.cantidad_minima}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {producto ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}