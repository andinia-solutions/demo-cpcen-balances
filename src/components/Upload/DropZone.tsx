import { useState, useCallback, useRef } from 'react'
import { Upload, FileUp } from 'lucide-react'

interface DropZoneProps {
  onFileSelect: (file: File) => void
}

export function DropZone({ onFileSelect }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf') {
        onFileSelect(file)
      } else {
        alert('Por favor, seleccione un archivo PDF.')
      }
    }
  }, [onFileSelect])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type === 'application/pdf') {
        onFileSelect(file)
      } else {
        alert('Por favor, seleccione un archivo PDF.')
      }
    }
  }, [onFileSelect])

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative bg-white rounded-2xl border-2 border-dashed transition-all duration-200
        ${isDragging 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <div className="flex flex-col items-center justify-center py-16 px-8">
        {/* Icon */}
        <div className={`
          w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors
          ${isDragging ? 'bg-primary/10' : 'bg-primary/5'}
        `}>
          <FileUp className={`w-10 h-10 ${isDragging ? 'text-primary' : 'text-primary/70'}`} />
        </div>

        {/* Text */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {isDragging ? 'Suelte el archivo aquí' : 'Arrastre su archivo PDF aquí'}
        </h3>
        <p className="text-gray-500 mb-6">
          o haga clic para seleccionar desde su ordenador
        </p>

        {/* Button */}
        <button
          onClick={handleButtonClick}
          className="px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Seleccionar Archivo
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/5 rounded-2xl pointer-events-none" />
      )}
    </div>
  )
}

