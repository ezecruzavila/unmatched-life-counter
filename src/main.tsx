import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initInstallCapture } from './installState'
import './styles.css'

// Listen for the install prompt BEFORE React mounts — the event can fire that
// early, and a late listener would miss it.
initInstallCapture()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
