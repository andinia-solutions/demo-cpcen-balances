import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai'
import type { ValidationResult } from '../types/validation'
// Import the system prompt from markdown file (Vite raw import)
import SYSTEM_INSTRUCTION from '../prompts/system.md?raw'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Custom error class for user-friendly error messages
export class ValidationError extends Error {
  constructor(message: string, public readonly internalError?: unknown) {
    super(message)
    this.name = 'ValidationError'
  }
}

// JSON Schema for structured output - enforces strict response format
// Using type assertion due to SDK type limitations with complex nested schemas
const VALIDATION_RESPONSE_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    resumen_auditoria: {
      type: SchemaType.OBJECT,
      properties: {
        status_global: {
          type: SchemaType.STRING,
          format: 'enum',
          enum: ['APROBADO', 'OBSERVADO'],
          description: 'Estado global de la auditoría',
        },
        conclusion_ia: {
          type: SchemaType.STRING,
          description: 'Resumen ejecutivo detallando la integridad del balance y hallazgos críticos',
        },
        confianza_analisis: {
          type: SchemaType.STRING,
          format: 'enum',
          enum: ['Alto', 'Medio', 'Bajo'],
          description: 'Nivel de confianza del análisis',
        },
        empresa: {
          type: SchemaType.STRING,
          description: 'Nombre de la empresa',
        },
        cuit: {
          type: SchemaType.STRING,
          description: 'CUIT de la empresa',
        },
        ejercicio_finalizado: {
          type: SchemaType.STRING,
          description: 'Fecha de cierre del ejercicio en formato DD/MM/AAAA',
        },
      },
      required: ['status_global', 'conclusion_ia', 'confianza_analisis', 'empresa', 'cuit', 'ejercicio_finalizado'],
    },
    checklist_data: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: {
            type: SchemaType.STRING,
            description: 'Identificador del punto del checklist',
          },
          item_text: {
            type: SchemaType.STRING,
            description: 'Texto literal del checklist',
          },
          estado_actual: {
            type: SchemaType.STRING,
            format: 'enum',
            enum: ['OK', 'ERROR', 'N/A'],
            description: 'Estado basado en el ejercicio actual',
          },
          estado_anterior: {
            type: SchemaType.STRING,
            format: 'enum',
            enum: ['OK', 'ERROR', 'N/A'],
            description: 'Estado basado en el ejercicio comparativo',
          },
          observaciones: {
            type: SchemaType.STRING,
            description: 'Explicación técnica detallada',
          },
        },
        required: ['id', 'item_text', 'estado_actual', 'estado_anterior', 'observaciones'],
      },
      description: 'Array con los 17 items del checklist de validación',
    },
  },
  required: ['resumen_auditoria', 'checklist_data'],
}

export async function validatePDF(file: File): Promise<ValidationResult> {
  if (!API_KEY || API_KEY === 'your_api_key_here') {
    // Return mock data if no API key is configured
    console.warn('No API key configured. Returning mock data.')
    return getMockResult()
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-pro-preview',
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: VALIDATION_RESPONSE_SCHEMA as Schema,
      },
    })

    // Convert PDF to base64
    const base64Data = await fileToBase64(file)

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64Data,
        },
      },
      'Analiza este estado contable y genera el informe de validación técnica.',
    ])

    const response = await result.response
    const text = response.text()
    
    // With structured output, the response should be valid JSON directly
    try {
      const validationResult: ValidationResult = JSON.parse(text)
      return validationResult
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response:', text)
      throw new ValidationError('Error al interpretar los resultados del análisis. Por favor, intente nuevamente.')
    }
  } catch (error) {
    // Log the full error for debugging (only visible in console)
    console.error('Gemini API error:', error)
    
    // If it's already our custom error, re-throw it
    if (error instanceof ValidationError) {
      throw error
    }

    // Map common API errors to user-friendly messages
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    if (errorMessage.includes('429') || errorMessage.includes('quota')) {
      throw new ValidationError('El servicio está temporalmente saturado. Por favor, intente nuevamente en unos minutos.')
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('API key')) {
      throw new ValidationError('Error de configuración del servicio. Contacte al administrador.')
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      throw new ValidationError('Error de conexión. Verifique su conexión a internet e intente nuevamente.')
    }
    
    if (errorMessage.includes('timeout')) {
      throw new ValidationError('El análisis tardó demasiado tiempo. Por favor, intente con un archivo más pequeño.')
    }

    // Generic fallback message - never expose internal details
    throw new ValidationError('Ocurrió un error al procesar el documento. Por favor, intente nuevamente.')
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Mock data for development without API key
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
