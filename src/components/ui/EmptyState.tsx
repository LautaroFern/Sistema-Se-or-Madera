import { PackageOpen } from 'lucide-react'

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message = 'No hay datos disponibles' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <PackageOpen className="w-16 h-16 text-madera-300 dark:text-madera-600 mb-4" />
      <p className="text-madera-500 dark:text-madera-400 text-center">{message}</p>
    </div>
  )
}