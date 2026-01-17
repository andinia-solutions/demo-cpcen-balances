import { CheckCircle2, AlertTriangle, Shield } from 'lucide-react'
import type { ValidationResult, GlobalStatus, ConfidenceLevel } from '../../types/validation'

interface SummaryCardsProps {
  result: ValidationResult
}

const statusConfig: Record<GlobalStatus, { label: string; icon: typeof CheckCircle2; color: string; bgColor: string; borderColor: string }> = {
  APROBADO: {
    label: 'Aprobado',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  OBSERVADO: {
    label: 'Observado',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
}

const confidenceConfig: Record<ConfidenceLevel, { color: string; bgColor: string; borderColor: string }> = {
  Alto: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  Medio: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  Bajo: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
}

export function SummaryCards({ result }: SummaryCardsProps) {
  const { status_global, confianza_analisis } = result.resumen_auditoria
  // Fallback for legacy entries with removed statuses
  const statusCfg = statusConfig[status_global] || statusConfig.OBSERVADO
  const confidenceCfg = confidenceConfig[confianza_analisis] || confidenceConfig.Medio
  const StatusIcon = statusCfg.icon

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Global Status Card */}
      <div className={`p-6 bg-white rounded-xl border ${statusCfg.borderColor} hover:shadow-sm transition-shadow`}>
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Estado Global
          </p>
          <div className={`p-2 rounded-lg ${statusCfg.bgColor}`}>
            <StatusIcon className={`w-5 h-5 ${statusCfg.color}`} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-3xl font-bold ${statusCfg.color}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* Confidence Level Card */}
      <div className={`p-6 bg-white rounded-xl border ${confidenceCfg.borderColor} hover:shadow-sm transition-shadow`}>
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Confianza del Análisis
          </p>
          <div className={`p-2 rounded-lg ${confidenceCfg.bgColor}`}>
            <Shield className={`w-5 h-5 ${confidenceCfg.color}`} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-3xl font-bold ${confidenceCfg.color}`}>
            {confianza_analisis}
          </span>
        </div>
      </div>
    </div>
  )
}
