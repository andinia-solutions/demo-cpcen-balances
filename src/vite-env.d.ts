/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Allow importing markdown files as raw strings
declare module '*.md?raw' {
  const content: string
  export default content
}

