import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-madera-700 dark:text-madera-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full px-3 py-2 border rounded-lg transition-colors duration-200 
            bg-white dark:bg-madera-800 
            text-madera-900 dark:text-madera-100 
            border-madera-300 dark:border-madera-600 
            focus:outline-none focus:ring-2 focus:ring-madera-500 focus:border-transparent
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'