import * as XLSX from 'xlsx'
import type { ValidationResult } from '../types/validation'

export function exportToExcel(result: ValidationResult, originalFileName: string): void {
  // Create workbook
  const wb = XLSX.utils.book_new()

  // Prepare data for the checklist sheet
  const checklistData = [
    // Header row
    ['Estado Global', result.resumen_auditoria.status_global],
    ['Confianza del Análisis', result.resumen_auditoria.confianza_analisis],
    ['Empresa', result.resumen_auditoria.empresa],
    ['CUIT', result.resumen_auditoria.cuit],
    ['Ejercicio Finalizado', result.resumen_auditoria.ejercicio_finalizado],
    ['Archivo Original', originalFileName],
    ['Fecha de Exportación', new Date().toLocaleDateString('es-AR')],
    [], // Empty row for spacing
    // Column headers
    ['ID', 'Ítem', 'Estado Actual', 'Observaciones'],
    // Data rows
    ...result.checklist_data.map(item => [
      item.id,
      item.item_text,
      item.estado_actual,
      item.observaciones,
    ]),
  ]

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(checklistData)

  // Set column widths
  ws['!cols'] = [
    { wch: 12 },  // ID
    { wch: 60 },  // Ítem
    { wch: 15 },  // Estado Actual
    { wch: 80 },  // Observaciones
  ]

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Checklist')

  // Create summary sheet
  const summaryData = [
    ['Resumen de Auditoría'],
    [],
    ['Estado Global', result.resumen_auditoria.status_global],
    ['Confianza del Análisis', result.resumen_auditoria.confianza_analisis],
    [],
    ['Empresa', result.resumen_auditoria.empresa],
    ['CUIT', result.resumen_auditoria.cuit],
    ['Ejercicio Finalizado', result.resumen_auditoria.ejercicio_finalizado],
    [],
    ['Conclusión IA', result.resumen_auditoria.conclusion_ia],
    [],
    ['Estadísticas del Checklist'],
    [],
    ['Total de Items', result.checklist_data.length],
    ['Items OK', result.checklist_data.filter(i => i.estado_actual === 'OK').length],
    ['Items con Error', result.checklist_data.filter(i => i.estado_actual === 'ERROR').length],
    ['Items N/A', result.checklist_data.filter(i => i.estado_actual === 'N/A').length],
  ]

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
  summaryWs['!cols'] = [{ wch: 25 }, { wch: 80 }]
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen')

  // Generate filename
  const baseFileName = originalFileName.replace('.pdf', '').replace('.PDF', '')
  const exportFileName = `${baseFileName}_validacion_${new Date().toISOString().split('T')[0]}.xlsx`

  // Download file
  XLSX.writeFile(wb, exportFileName)
}
