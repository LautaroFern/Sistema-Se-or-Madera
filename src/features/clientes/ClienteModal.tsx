import { useState, useEffect } from 'react'
import { Cliente } from '../../types'
import { Button, Input, Modal } from '../../components/ui'

interface ClienteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (cliente: Omit<Cliente, 'id'>) => Promise<void>
  cliente?: Cliente | null
}

export function ClienteModal({ isOpen, onClose, onSave, cliente }: ClienteModalProps) {
  const [form, setForm] = useState({
    nombre: '',
    dni: '',
    cuit_rut: '',
    mail: '',
    telefono: '',
    direccion: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cliente) {
      setForm({
        nombre: cliente.nombre,
        dni: cliente.dni,
        cuit_rut: cliente.cuit_rut,
        mail: cliente.mail,
        telefono: cliente.telefono,
        direccion: cliente.direccion,
      })
    } else {
      setForm({
        nombre: '',
        dni: '',
        cuit_rut: '',
        mail: '',
        telefono: '',
        direccion: '',
      })
    }
    setErrors({})
  }, [cliente, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!form.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    } else if (form.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(form.nombre.trim())) {
      newErrors.nombre = 'El nombre solo debe contener letras y espacios'
    }

    if (!form.dni.trim()) {
      newErrors.dni = 'El DNI es requerido'
    } else if (!/^\d+$/.test(form.dni.trim())) {
      newErrors.dni = 'El DNI solo debe contener números'
    } else if (form.dni.trim().length !== 8) {
      newErrors.dni = 'El DNI debe tener 8 dígitos'
    }

    if (!form.cuit_rut.trim()) {
      newErrors.cuit_rut = 'El CUIT/RUT es requerido'
    } else if (!/^\d{2}-\d{8}-\d$/.test(form.cuit_rut.trim())) {
      newErrors.cuit_rut = 'Formato válido: XX-XXXXXXXX-X'
    }

    if (!form.mail.trim()) {
      newErrors.mail = 'El email es requerido'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.mail.trim())) {
      newErrors.mail = 'El email no es válido'
    }

    if (!form.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    } else if (!/^\d+$/.test(form.telefono.trim())) {
      newErrors.telefono = 'El teléfono solo debe contener números'
    } else if (form.telefono.trim().length !== 10) {
      newErrors.telefono = 'El teléfono debe tener 10 dígitos'
    }

    if (!form.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida'
    } else if (form.direccion.trim().length < 5) {
      newErrors.direccion = 'La dirección debe tener al menos 5 caracteres'
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
      console.error('Error al guardar cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          placeholder="Nombre completo"
          value={form.nombre}
          onChange={(e) => setForm((prev) => ({ ...prev, nombre: e.target.value }))}
          error={errors.nombre}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="DNI"
            placeholder="12345678"
            value={form.dni}
            onChange={(e) => setForm((prev) => ({ ...prev, dni: e.target.value }))}
            error={errors.dni}
          />
          <Input
            label="CUIT/RUT"
            placeholder="20-12345678-9"
            value={form.cuit_rut}
            onChange={(e) => setForm((prev) => ({ ...prev, cuit_rut: e.target.value }))}
            error={errors.cuit_rut}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="correo@ejemplo.com"
          value={form.mail}
          onChange={(e) => setForm((prev) => ({ ...prev, mail: e.target.value }))}
          error={errors.mail}
        />

        <Input
          label="Teléfono"
          placeholder="+54 11 1234-5678"
          value={form.telefono}
          onChange={(e) => setForm((prev) => ({ ...prev, telefono: e.target.value }))}
          error={errors.telefono}
        />

        <Input
          label="Dirección"
          placeholder="Av. Ejemplo 1234"
          value={form.direccion}
          onChange={(e) => setForm((prev) => ({ ...prev, direccion: e.target.value }))}
          error={errors.direccion}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            {cliente ? 'Guardar Cambios' : 'Crear Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}