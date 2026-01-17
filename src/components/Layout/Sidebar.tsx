import { Sparkles, History, Landmark, User } from 'lucide-react'
import type { AppScreen } from '../../types/validation'

interface SidebarProps {
  currentScreen: AppScreen
  onNavigate: (screen: AppScreen) => void
}

export function Sidebar({ currentScreen, onNavigate }: SidebarProps) {
  const navItems: Array<{
    id: string
    label: string
    icon: typeof Sparkles
    screen: AppScreen
    active: boolean
  }> = [
    { 
      id: 'analizar', 
      label: 'Analizar', 
      icon: Sparkles,
      screen: 'upload',
      active: currentScreen === 'upload' || currentScreen === 'processing' || currentScreen === 'results'
    },
    { 
      id: 'historial', 
      label: 'Historial', 
      icon: History,
      screen: 'history',
      active: currentScreen === 'history'
    },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <button 
          onClick={() => onNavigate('upload')}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-bold text-primary">CPCEN</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Validador de balances</p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.screen)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  item.active
                    ? 'bg-primary/5 text-primary border-l-4 border-primary -ml-1 pl-5'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${item.active ? 'text-primary' : 'text-gray-400'}`} />
                <span className={`font-medium ${item.active ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Usuario</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Juan Pérez</p>
            <p className="text-xs text-gray-500">Contador Público</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
