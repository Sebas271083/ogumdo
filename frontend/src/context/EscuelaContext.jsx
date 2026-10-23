import { createContext, useContext, useEffect, useState } from 'react'
import { getEscuela } from '../api/client'

const EscuelaContext = createContext({})

// Datos generales de la escuela (backend/contenido/escuela.json): nombre, contacto, horarios...
export function EscuelaProvider({ inicial, children }) {
  const [escuela, setEscuela] = useState(inicial ?? { nombre: 'Ogum Do Taekwondo', redes: {} })

  useEffect(() => {
    getEscuela()
      .then(setEscuela)
      .catch(() => {})
  }, [])

  return <EscuelaContext.Provider value={escuela}>{children}</EscuelaContext.Provider>
}

export const useEscuela = () => useContext(EscuelaContext)
