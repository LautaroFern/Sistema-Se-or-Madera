import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variantStyles = {
  primary: 'bg-madera-700 hover:bg-madera-800 dark:bg-madera-600 dark:hover:bg-madera-500 text-white',
  secondary: 'bg-madera-100 hover:bg-madera-200 dark:bg-madera-800 dark:hover:bg-madera-700 text-madera-900 dark:text-madera-100 border border-madera-300 dark:border-madera-700',
  danger: 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white',
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${sizeStyles[size]} rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}