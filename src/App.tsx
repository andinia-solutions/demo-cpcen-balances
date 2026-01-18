import { useState, useCallback } from 'react'
import { MessageSquareText } from 'lucide-react'
import { Sidebar } from './components/Layout/Sidebar'
import { Header } from './components/Layout/Header'
import { DropZone } from './components/Upload/DropZone'
import { ProcessingStatus } from './components/Processing/ProcessingStatus'
import { SummaryCards } from './components/Results/SummaryCards'
import { ValidationTable } from './components/Results/ValidationTable'
import { ExportButton } from './components/Results/ExportButton'
import { HistoryList } from './components/History/HistoryList'
import { validatePDF, ValidationError } from './services/gemini'
import { addToHistory, fileToBase64 } from './services/history'
import type { AppScreen, ValidationResult } from './types/validation'
import type { HistoryEntry } from './types/history'

function App() {
  const [screen, setScreen] = useState<AppScreen>('upload')
  const [fileName, setFileName] = useState<string>('')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFileName(selectedFile.name)
    setError(null)
    setScreen('processing')

    const startTime = Date.now()

    try {
      // Convert PDF to base64 for storage
      const pdfBase64 = await fileToBase64(selectedFile)
      
      const validationResult = await validatePDF(selectedFile)
      const endTime = Date.now()
      const time = (endTime - startTime) / 1000
      
      setResult(validationResult)
      setScreen('results')
      
      // Save to history
      addToHistory(selectedFile.name, pdfBase64, validationResult, time)
    } catch (err) {
      // Only show user-friendly messages from ValidationError
      // Never expose internal error details to the user
      if (err instanceof ValidationError) {
        setError(err.message)
      } else {
        // Fallback for unexpected errors - generic message only
        console.error('Unexpected error:', err)
        setError('Ocurrió un error inesperado. Por favor, intente nuevamente.')
      }
      setScreen('upload')
    }
  }, [])

  const handleNavigate = useCallback((newScreen: AppScreen) => {
    setScreen(newScreen)
    if (newScreen === 'upload') {
      setFileName('')
      setResult(null)
      setError(null)
    }
  }, [])

  const handleViewHistoryEntry = useCallback((entry: HistoryEntry) => {
    setFileName(entry.fileName)
    setResult(entry.result)
    setScreen('results')
  }, [])

  const getPageTitle = () => {
    switch (screen) {
      case 'upload':
        return 'Analizar balance'
      case 'processing':
        return 'Procesando...'
      case 'results':
        return 'Resultados de Validación'
      case 'history':
        return 'Historial'
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar currentScreen={screen} onNavigate={handleNavigate} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title={getPageTitle()} 
          fileName={screen === 'results' || screen === 'processing' ? fileName : undefined}
        />
        
        <main className="flex-1 p-8">
          {screen === 'upload' && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Subir estado contable
                </h1>
                <p className="text-gray-600">
                  Cargue el archivo PDF de los estados contables para realizar la validación automática.
                </p>
              </div>
              
              <DropZone onFileSelect={handleFileSelect} />
              
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
            </div>
          )}

          {screen === 'processing' && (
            <ProcessingStatus fileName={fileName} />
          )}

          {screen === 'results' && result && (
            <div className="space-y-6">
              <SummaryCards result={result} />

              {/* AI Conclusion Card */}
              <div className="p-6 bg-white rounded-xl border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MessageSquareText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Conclusión del Análisis
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {result.resumen_auditoria.conclusion_ia}
                    </p>
                  </div>
                </div>
              </div>
              
              <ValidationTable 
                result={result} 
                fileName={fileName} 
                headerAction={<ExportButton result={result} fileName={fileName} variant="filled" label="Descargar Excel" />}
              />
            </div>
          )}

          {screen === 'history' && (
            <HistoryList onViewEntry={handleViewHistoryEntry} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
