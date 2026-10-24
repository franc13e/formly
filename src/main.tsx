import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthGate } from './auth/AuthGate'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element in index.html')
ReactDOM.createRoot(root).render(
  <AuthGate>
    <App />
  </AuthGate>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
