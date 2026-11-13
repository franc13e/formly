import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthGate } from './auth/AuthGate'
import { initAppearance } from './hooks/useAppearance'

// Colours are CSS variables; set them before the first paint.
initAppearance()

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element in index.html')
ReactDOM.createRoot(root).render(
  <AuthGate>
    <App />
  </AuthGate>,
)

// Dev server modules shouldn't end up in the offline cache
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
