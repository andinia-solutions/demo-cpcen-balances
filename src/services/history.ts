import type { HistoryEntry } from '../types/history'
import type { ValidationResult } from '../types/validation'

const HISTORY_KEY = 'cpcen_validation_history'
const MAX_HISTORY_ENTRIES = 50 // Limit to prevent localStorage overflow

export function getHistory(): HistoryEntry[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    if (!data) return []
    return JSON.parse(data) as HistoryEntry[]
  } catch (error) {
    console.error('Error reading history from localStorage:', error)
    return []
  }
}

export function addToHistory(
  fileName: string,
  pdfBase64: string,
  result: ValidationResult,
  processingTime: number
): HistoryEntry {
  const entry: HistoryEntry = {
    id: generateId(),
    fileName,
    pdfBase64,
    result,
    processingTime,
    createdAt: new Date().toISOString(),
  }

  try {
    const history = getHistory()
    
    // Add new entry at the beginning
    history.unshift(entry)
    
    // Limit history size
    if (history.length > MAX_HISTORY_ENTRIES) {
      history.splice(MAX_HISTORY_ENTRIES)
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Error saving to history:', error)
    // If localStorage is full, try removing old entries
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      clearOldEntries()
      try {
        const history = getHistory()
        history.unshift(entry)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
      } catch {
        console.error('Failed to save even after clearing old entries')
      }
    }
  }

  return entry
}

export function getHistoryEntry(id: string): HistoryEntry | null {
  const history = getHistory()
  return history.find(entry => entry.id === id) || null
}

export function deleteHistoryEntry(id: string): void {
  try {
    const history = getHistory()
    const filtered = history.filter(entry => entry.id !== id)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting history entry:', error)
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    console.error('Error clearing history:', error)
  }
}

function clearOldEntries(): void {
  try {
    const history = getHistory()
    // Keep only the 10 most recent entries
    const trimmed = history.slice(0, 10)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.error('Error clearing old entries:', error)
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

