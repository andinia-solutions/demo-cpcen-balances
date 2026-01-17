import { Download } from 'lucide-react'
import { exportToExcel } from '../../utils/excelExport'
import type { ValidationResult } from '../../types/validation'

interface ExportButtonProps {
  result: ValidationResult
  fileName: string
  variant?: 'outline' | 'filled'
  label?: string
}

export function ExportButton({ result, fileName, variant = 'filled', label = 'Descargar Excel' }: ExportButtonProps) {
  const handleExport = () => {
    exportToExcel(result, fileName)
  }

  if (variant === 'outline') {
    return (
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
      >
        <Download className="w-4 h-4" />
        {label}
      </button>
    )
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm rounded-lg font-medium hover:bg-primary-600 transition-colors"
    >
      <Download className="w-3.5 h-3.5" />
      {label}
    </button>
  )
}

