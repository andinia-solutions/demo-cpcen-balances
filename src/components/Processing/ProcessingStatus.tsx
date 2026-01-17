import { Loader2, BarChart3 } from 'lucide-react'

interface ProcessingStatusProps {
  fileName: string
}

export function ProcessingStatus({ fileName }: ProcessingStatusProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 max-w-lg w-full text-center">
        {/* Animated Icon */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse" />
          <div className="absolute inset-2 bg-primary/5 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-primary" />
          </div>
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Procesando balance...
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Estamos validando la consistencia aritmética y normativa de los estados contables cargados.
          <br />
          <span className="text-gray-500">Esto puede demorar unos minutos.</span>
        </p>

        {/* File indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span className="text-sm text-gray-600">{fileName}</span>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>Procesando en servidor seguro</span>
          </div>
        </div>
      </div>
    </div>
  )
}

