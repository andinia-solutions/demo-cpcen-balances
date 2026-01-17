export type GlobalStatus = 'APROBADO' | 'OBSERVADO';
export type CheckStatus = 'OK' | 'ERROR' | 'N/A';
export type ConfidenceLevel = 'Alto' | 'Medio' | 'Bajo';

export interface AuditSummary {
  status_global: GlobalStatus;
  conclusion_ia: string;
  confianza_analisis: ConfidenceLevel;
  empresa: string;
  cuit: string;
  ejercicio_finalizado: string;
}

export interface ChecklistItem {
  id: string;
  item_text: string;
  estado_actual: CheckStatus;
  estado_anterior: CheckStatus;
  observaciones: string;
}

export interface ValidationResult {
  resumen_auditoria: AuditSummary;
  checklist_data: ChecklistItem[];
}

export type AppScreen = 'upload' | 'processing' | 'results' | 'history';

export interface AppState {
  screen: AppScreen;
  file: File | null;
  fileName: string;
  result: ValidationResult | null;
  error: string | null;
  processingTime: number;
}
