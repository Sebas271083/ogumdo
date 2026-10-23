import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import Raiz from './Raiz'
import './index.css'

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
