import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-madera-700 dark:text-madera-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 
            bg-white dark:bg-madera-800 
            text-madera-900 dark:text-madera-100 
            placeholder-madera-400 
            border-madera-300 dark:border-madera-600 
            focus:outline-none focus:ring-2 focus:ring-madera-500 focus:border-transparent
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}`}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'