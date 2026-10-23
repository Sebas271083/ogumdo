import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useEscuela } from '../context/EscuelaContext'
import { metaDeRuta } from '../seo'

// Actualiza título y descripción al navegar del lado del cliente. La primera carga ya
// llega con estos datos en el HTML desde el servidor.
export function useSeo() {
  const escuela = useEscuela()
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = metaDeRuta(pathname, escuela)
    document.title = meta.titulo
    let tag = document.querySelector('meta[name="description"]')
    if (meta.descripcion) {
      if (!tag) {
        tag = document.createElement('meta')
        tag.name = 'description'
        document.head.append(tag)
      }
      tag.content = meta.descripcion
    }
  }, [pathname, escuela])
}
