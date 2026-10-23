import { useEffect, useState } from 'react'
import { getGaleria } from '../api/client'
import { useDatosIniciales } from '../context/DatosContext'
import Galeria from '../components/Galeria'
import PageHero from '../components/PageHero'

export default function GaleriaPage() {
  const { galeria } = useDatosIniciales()
  const [fotos, setFotos] = useState(galeria ?? null)

  useEffect(() => {
    getGaleria()
      .then(setFotos)
      .catch(() => setFotos([]))
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Galería"
        titulo={
          <>
            Momentos en el <span className="accent">dojang</span>
          </>
        }
      >
        <p>Clases, exámenes de graduación, torneos y eventos de nuestra escuela.</p>
      </PageHero>
      <section>
        <div className="container">{fotos ? <Galeria fotos={fotos} /> : <div className="cargando">Cargando…</div>}</div>
      </section>
    </>
  )
}
