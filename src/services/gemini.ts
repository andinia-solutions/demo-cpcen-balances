import type { ValidationResult } from '../types/validation'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Custom error class for user-friendly error messages
export class ValidationError extends Error {
  constructor(message: string, public readonly internalError?: unknown) {
    super(message)
    this.name = 'ValidationError'
  }
}

export async function validatePDF(file: File): Promise<ValidationResult> {
  if (!API_BASE_URL) {
    // Return mock data if no API base URL is configured
    console.warn('No API base URL configured. Returning mock data.')
    return getMockResult()
  }

  try {
    // Create FormData with the PDF file
    const formData = new FormData()
    formData.append('pdf', file)

    // Call the backend API
    const response = await fetch(`${API_BASE_URL}/demos/cpcen/analyze`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: string; message?: string }
      
      // Map HTTP status codes to user-friendly messages
      if (response.status === 429) {
        throw new ValidationError('El servicio está temporalmente saturado. Por favor, intente nuevamente en unos minutos.')
      }
      
      if (response.status === 401 || response.status === 403) {
        throw new ValidationError('Error de configuración del servicio. Contacte al administrador.')
      }
      
      if (response.status === 503) {
        throw new ValidationError(errorData.message || 'El servicio no está disponible temporalmente.')
      }
      
      throw new ValidationError(errorData.message || 'Ocurrió un error al procesar el documento. Por favor, intente nuevamente.')
    }

    const validationResult: ValidationResult = await response.json()
    return validationResult

  } catch (error) {
    // Log the full error for debugging (only visible in console)
    console.error('API error:', error)
    
    // If it's already our custom error, re-throw it
    if (error instanceof ValidationError) {
      throw error
    }

    // Map common errors to user-friendly messages
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch')) {
      throw new ValidationError('Error de conexión. Verifique su conexión a internet e intente nuevamente.')
    }
    
    if (errorMessage.includes('timeout')) {
      throw new ValidationError('El análisis tardó demasiado tiempo. Por favor, intente con un archivo más pequeño.')
    }

    // Generic fallback message - never expose internal details
    throw new ValidationError('Ocurrió un error al procesar el documento. Por favor, intente nuevamente.')
  }
}

// Mock data for development without API
function getMockResult(): ValidationResult {
  return {
    resumen_auditoria: {
      status_global: 'OBSERVADO',
      conclusion_ia: 'Se detectaron inconsistencias materiales en los cálculos del ejercicio. Existen errores de suma en el Activo Corriente del ESP y en el subtotal de la Nota 2.2.',
      confianza_analisis: 'Alto',
      empresa: 'EMPRESA MODELO S.R.L.',
      cuit: '30-12345678-7',
      ejercicio_finalizado: '30/06/2024',
    },
    checklist_data: [
      {
        id: '1',
        item_text: '1. Revisión del tipeado a partir del borrador',
        estado_actual: 'OK',
        estado_anterior: 'OK',
        observaciones: 'La información es consistente en su estructura general.',
      },
      {
        id: '2',
        item_text: '2. Revisión de cálculos y sumas horizontales y verticales',
        estado_actual: 'ERROR',
        estado_anterior: 'OK',
        observaciones: 'Error en suma de Activo Corriente 2024: diferencia de $1,000 detectada.',
      },
      {
        id: '3.1.I',
        item_text: '3.1.I Estado de Situacion Patrimonial: Activo = Pasivo + Patrimonio Neto',
        estado_actual: 'OK',
        estado_anterior: 'OK',
        observaciones: 'La igualdad contable se mantiene en los totales expuestos.',
      },
      {
        id: '3.1.I.b',
        item_text: 'Patrimonio Neto = Estado de Evolución del Patrimonio Neto',
        estado_actual: 'OK',
        estado_anterior: 'OK',
        observaciones: 'El Patrimonio Neto al cierre coincide entre el ESP y el EEPN.',
      },
      {
        id: '3.1.II',
        item_text: 'II. Estado de Resultados: Resultado del ejercicio = Estado de Evolución del Patrimonio Neto',
        estado_actual: 'OK',
        estado_anterior: 'OK',
        observaciones: 'El resultado neto es consistente entre el ER y el EEPN.',
      },
      {
        id: '3.1.III.a',
        item_text: 'III. Estado de Flujo de Efectivo: Estado de Situación Patrimonial (fondos al inicio / cierre)',
        estado_actual: 'OK',
        estado_anterior: 'OK',
        observaciones: 'Los saldos de efectivo coinciden con el rubro Caja y Bancos del ESP.',
      },
      {
        id: '3.2.I',
        item_text: '3.2.I Notas: Estado de Situación Patrimonial',
        estado_actual: 'ERROR',
        estado_anterior: 'OK',
        observaciones: 'Inconsistencia en Nota 2.2: El subtotal no coincide con el importe del ESP.',
      },
      {
        id: '3.3',
        item_text: '3.3 Estados Contables con Anexos (Bienes de Uso, Gastos, etc)',
        estado_actual: 'OK',
        estado_anterior: 'OK',
        observaciones: 'El valor residual de Bienes de Uso coincide entre el ESP y el Anexo I.',
      },
      {
        id: '3.6',
        item_text: '3.6 Anexos entre sí: Anexo Bienes de Uso / Cuadro de Gastos',
        estado_actual: 'OK',
        estado_anterior: 'OK',
        observaciones: 'La amortización del ejercicio es idéntica en ambos anexos.',
      },
      {
        id: '4-5',
        item_text: '4 y 5. Revisión de fechas, Informe del Auditor y datos de los firmantes',
        estado_actual: 'OK',
        estado_anterior: 'N/A',
        observaciones: 'Fechas y firmas consistentes en todo el documento.',
      },
      {
        id: '6',
        item_text: '6. Verificación pase a libros rubricados',
        estado_actual: 'N/A',
        estado_anterior: 'N/A',
        observaciones: 'PENDIENTE MANUAL',
      },
    ],
  }
}
