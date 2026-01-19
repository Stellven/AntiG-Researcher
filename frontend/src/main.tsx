import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore
import '@fontsource/geist-sans'
// @ts-ignore
import '@fontsource/geist-mono'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="font-sans antialiased">
      <App />
    </div>
  </StrictMode>,
)
