import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const mostrar = useCallback((texto, tipo = 'ok') => {
    const id = Date.now()
    setToast({ id, texto, tipo })
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3500)
  }, [])

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      {toast && (
        <div key={toast.id} className={`toast ${toast.tipo}`} role="status">
          {toast.texto}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
