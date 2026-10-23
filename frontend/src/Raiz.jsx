import { AuthProvider } from './context/AuthContext'
import { DatosContext } from './context/DatosContext'
import { EscuelaProvider } from './context/EscuelaContext'
import { ToastProvider } from './context/ToastContext'
import App from './App.jsx'

// Providers comunes al render del navegador (main.jsx) y del servidor (entry-server.jsx)
export default function Raiz({ datos = {} }) {
  return (
    <DatosContext.Provider value={datos}>
      <EscuelaProvider inicial={datos.escuela}>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </EscuelaProvider>
    </DatosContext.Provider>
  )
}
