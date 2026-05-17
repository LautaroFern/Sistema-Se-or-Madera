export interface Rol {
  id: number
  nombre: string
}

export interface Usuario {
  id: string
  nombre: string
  mail: string
  dni: string
  id_rol: number
}

export interface Cliente {
  id: number
  nombre: string
  dni: string
  cuit_rut: string
  mail: string
  telefono: string
  direccion: string
  numero: string
}

export interface Producto {
  id: number
  nombre: string
  descripcion: string
  categoria: string
  unidad_de_medida: string
  precio_costo: number
  precio_venta: number
  cantidad: number
  cantidad_minima: number
}

export type EstadoOperacion = 'presupuesto' | 'aprobado' | 'en_progreso' | 'finalizado'

export interface Operacion {
  id: number
  nombre_operacion: string
  descripcion: string
  duracion: number
  costo: number
  estado: EstadoOperacion
  fecha_creacion: string
  id_usuario: string
  id_cliente: number
  cliente?: Cliente
  usuario?: Usuario
  productos?: OperacionProducto[]
}

export interface OperacionProducto {
  id: number
  cantidad: number
  id_operacion: number
  id_producto: number
  producto?: Producto
}

export interface Auditoria {
  id: string
  tabla_afectada: string
  accion: string
  id_registro: string
  datos_anteriores: Record<string, unknown> | null
  datos_nuevos: Record<string, unknown> | null
  id_usuario: string
  fecha: string
  usuario?: Usuario
}

export interface AuthUser {
  id: string
  email: string
  nombre: string
  rol: 'admin' | 'empleado'
  id_rol: number
}

export interface FacturacionForm {
  id_cliente: number | null
  nombre_operacion: string
  descripcion: string
  duracion: number
  productos: { id_producto: number; cantidad: number }[]
}