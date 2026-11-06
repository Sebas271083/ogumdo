import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import Raiz from './Raiz'
import './utils/instalacion'
// Tipografías servidas desde el propio sitio (antes Google Fonts): sin recursos externos que
// puedan alterarse y sin avisarle a Google cada visita
import '@fontsource/bebas-neue/400.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './index.css'

// Service worker: hace instalable la web y recibe las notificaciones push (public/sw.js)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}

const contenedor = document.getElementById('root')
const app = (
  <StrictMode>
    <BrowserRouter>
      <Raiz datos={window.__DATOS__ ?? {}} />
    </BrowserRouter>
  </StrictMode>
)

// En producción las páginas públicas llegan renderizadas desde el servidor: se "hidratan".
// En desarrollo (Vite) y en las páginas privadas el contenedor viene vacío.
if (contenedor.firstElementChild) hydrateRoot(contenedor, app)
else createRoot(contenedor).render(app)
