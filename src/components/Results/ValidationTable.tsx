import { useState, type ReactNode } from 'react'
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, MinusCircle } from 'lucide-react'
import type { ValidationResult, CheckStatus } from '../../types/validation'

interface ValidationTableProps {
  result: ValidationResult
  fileName: string
  headerAction?: ReactNode
}

const ITEMS_PER_PAGE = 10

export function ValidationTable({ result, headerAction }: ValidationTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalItems = result.checklist_data.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems)
  const currentItems = result.checklist_data.slice(startIndex, endIndex)

  const getCheckIcon = (status: CheckStatus) => {
    switch (status) {
      case 'OK':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'N/A':
        return <MinusCircle className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Detalle del Checklist</h3>
        {headerAction}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ítem
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                Check
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Observaciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((item, index) => (
              <tr 
                key={item.id || index} 
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4">
                  <span className="font-mono text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {item.id}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="font-medium text-gray-900">{item.item_text}</span>
                </td>
                <td className="px-4 py-4 text-center">
                  {getCheckIcon(item.estado_actual)}
                </td>
                <td className="px-4 py-4">
                  <p className={`text-sm ${item.estado_actual === 'ERROR' ? 'text-red-600' : 'text-gray-500'}`}>
                    {item.observaciones}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          Mostrando {startIndex + 1}-{endIndex} de <strong>{totalItems}</strong> registros totales
        </span>
      </div>
    </div>
  )
}
