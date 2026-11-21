import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.tsx'

// A refresh always starts at the top: no restored scroll position, no
// leftover #section hash pulling the page down to that section.
const forceTop = () => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)
}
if (location.hash) history.replaceState(null, '', location.pathname + location.search)
forceTop()
// Libraries can flip scrollRestoration back to "auto" while the page runs, so
// re-assert it at the moment the page is left (refresh, close, navigate away).
window.addEventListener('beforeunload', forceTop)
window.addEventListener('pagehide', forceTop)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
