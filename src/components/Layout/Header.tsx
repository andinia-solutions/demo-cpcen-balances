import { Moon, Bell, FileText } from 'lucide-react'

interface HeaderProps {
  title: string
  fileName?: string
}

export function Header({ title, fileName }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {fileName && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-sm text-gray-600">{fileName}</span>
          </div>
        )}
      </div>

      {/* <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Moon className="w-5 h-5 text-gray-500" />
        </button>
      </div> */}
    </header>
  )
}
