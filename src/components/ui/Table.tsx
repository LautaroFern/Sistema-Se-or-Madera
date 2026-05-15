import { ReactNode, useState } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { LoadingSpinner } from './LoadingSpinner'

export interface Column<T> {
  key: string
  header: string
  searchKey?: boolean
  render?: (item: T) => ReactNode
}

interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchPlaceholder?: string
  pageSize?: number
  onRowClick?: (item: T) => void
}

export function Table<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  searchPlaceholder = 'Buscar...',
  pageSize = 10,
  onRowClick,
}: TableProps<T>) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const searchKeys = columns.filter((col) => col.searchKey).map((col) => col.key)

  const filteredData = search && searchKeys.length > 0
    ? data.filter((item) =>
        searchKeys.some((key) => {
          const value = item[key as keyof T]
          return String(value).toLowerCase().includes(search.toLowerCase())
        })
      )
    : data

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize)

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-4">
      {searchKeys.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-madera-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 border border-madera-300 dark:border-madera-600 rounded-lg bg-white dark:bg-madera-800 text-madera-900 dark:text-madera-100 focus:outline-none focus:ring-2 focus:ring-madera-500"
          />
        </div>
      )}

      {paginatedData.length === 0 ? (
        <EmptyState message="No se encontraron resultados" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-madera-200 dark:border-madera-700">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-sm font-medium text-madera-600 dark:text-madera-400"
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr
                    key={item.id}
                    onClick={() => onRowClick?.(item)}
                    className={`border-b border-madera-100 dark:border-madera-800 transition-colors
                      ${onRowClick ? 'cursor-pointer hover:bg-madera-50 dark:hover:bg-madera-800' : ''}
                      ${index % 2 === 0 ? 'bg-white dark:bg-madera-900' : 'bg-madera-50/50 dark:bg-madera-900/50'}`}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-sm text-madera-800 dark:text-madera-200">
                        {col.render
                          ? col.render(item)
                          : String(item[col.key as keyof T] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-madera-500">
                Mostrando {(page - 1) * pageSize + 1} a{' '}
                {Math.min(page * pageSize, filteredData.length)} de{' '}
                {filteredData.length} registros
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-madera-300 dark:border-madera-600 disabled:opacity-50 hover:bg-madera-100 dark:hover:bg-madera-800 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-madera-600 dark:text-madera-400">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-madera-300 dark:border-madera-600 disabled:opacity-50 hover:bg-madera-100 dark:hover:bg-madera-800 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}