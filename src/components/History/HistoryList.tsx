import { useState, useEffect } from 'react'
import { FileText, CheckCircle2, AlertTriangle, Download, Eye, Calendar } from 'lucide-react'
import { getHistory, formatDate } from '../../services/history'
import { exportToExcel } from '../../utils/excelExport'
import type { HistoryEntry } from '../../types/history'
import type { GlobalStatus } from '../../types/validation'

interface HistoryListProps {
  onViewEntry: (entry: HistoryEntry) => void
}

const statusConfig: Record<GlobalStatus, { label: string; icon: typeof CheckCircle2; bgColor: string; textColor: string }> = {
  APROBADO: {
    label: 'Aprobado',
    icon: CheckCircle2,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  OBSERVADO: {
    label: 'Observado',
    icon: AlertTriangle,
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
  },
}

export function HistoryList({ onViewEntry }: HistoryListProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setHistory(getHistory())
  }, [])

  const handleDownloadExcel = (entry: HistoryEntry) => {
    exportToExcel(entry.result, entry.fileName)
  }

  const getStatusSummary = (entry: HistoryEntry) => {
    // Handle both old (checklist_detail) and new (checklist_data) formats
    const checklist = entry.result.checklist_data || (entry.result as unknown as { checklist_detail?: unknown[] }).checklist_detail || []
    const total = checklist.length
    const errors = checklist.filter((i: { estado_actual?: string; actual?: string }) => 
      i.estado_actual === 'ERROR' || i.actual === 'ERROR'
    ).length
    const valid = checklist.filter((i: { estado_actual?: string; actual?: string }) => 
      i.estado_actual === 'OK' || i.actual === 'OK'
    ).length
    return { total, valid, errors }
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay validaciones previas
        </h3>
        <p className="text-gray-500">
          Las validaciones que realice aparecerán aquí para su consulta posterior.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Historial de Validaciones
        </h2>
        <span className="text-sm text-gray-500">
          {history.length} {history.length === 1 ? 'registro' : 'registros'}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Archivo
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Resultado
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((entry) => {
              const { valid, errors } = getStatusSummary(entry)
              // Handle old format (global_status) and new format (resumen_auditoria.status_global)
              const status = entry.result.resumen_auditoria?.status_global || 
                (entry.result as unknown as { global_status?: string }).global_status || 'OBSERVADO'
              // Fallback for legacy entries with removed statuses
              const statusCfg = statusConfig[status as keyof typeof statusConfig] || statusConfig.OBSERVADO
              const StatusIcon = statusCfg.icon
              
              return (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">
                          {entry.fileName}
                        </p>
                        <p className="text-xs text-gray-500">PDF</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(entry.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusCfg.bgColor} ${statusCfg.textColor}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-sm text-green-600 font-medium">{valid} OK</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-sm text-red-600 font-medium">{errors} Error</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onViewEntry(entry)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadExcel(entry)}
                        className="p-2 text-gray-400 hover:bg-gray-100 hover:text-primary rounded-lg transition-colors"
                        title="Descargar Excel"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
