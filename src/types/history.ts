import type { ValidationResult } from './validation'

export interface HistoryEntry {
  id: string
  fileName: string
  pdfBase64: string
  result: ValidationResult
  processingTime: number
  createdAt: string
}

