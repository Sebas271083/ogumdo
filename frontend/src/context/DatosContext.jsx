import { createContext, useContext } from 'react'

// Datos que el servidor ya usó para renderizar la página (escuela, profesor, galería).
// Las páginas arrancan con ellos para que el HTML del servidor y el del navegador coincidan,
// y después igual piden datos frescos a la API.
export const DatosContext = createContext({})

export const useDatosIniciales = () => useContext(DatosContext)
