import { EstadoOperacion } from '../../types'

interface BadgeProps {
  estado: EstadoOperacion
}

const estadoConfig: Record<EstadoOperacion, { label: string; className: string }> = {
  presupuesto: {
    label: 'Presupuesto',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  },
  aprobado: {
    label: 'Aprobado',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  en_progreso: {
    label: 'En Progreso',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  finalizado: {
    label: 'Finalizado',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
}

export function Badge({ estado }: BadgeProps) {
  const config = estadoConfig[estado]

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}