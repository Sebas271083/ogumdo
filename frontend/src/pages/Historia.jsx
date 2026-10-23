import { useEffect, useState } from 'react'
import { getGaleria } from '../api/client'
import { useDatosIniciales } from '../context/DatosContext'
import { CINTURONES } from '../utils/cinturones'
import Cinturon from '../components/Cinturon'
import PageHero from '../components/PageHero'
import Reveal from '../components/Reveal'

const LINEA_DE_TIEMPO = [
  {
    fecha: 'Siglo I a.C.',
    titulo: 'Los Tres Reinos de Corea',
    texto:
      'En los reinos de Goguryeo, Baekje y Silla se practicaban formas de combate sin armas. Los murales de las tumbas de Goguryeo muestran figuras en posturas similares a las del taekwondo actual.',
  },
  {
    fecha: 'Siglo VI',
    titulo: 'Los guerreros Hwarang',
    texto:
      'En el reino de Silla surge el Hwarang (“juventud en flor”), una élite de jóvenes que se formaba en artes marciales, letras y ética. Su código de honor inspiró muchos de los principios del taekwondo.',
  },
  {
    fecha: 'Edad Media',
    titulo: 'Subak y Taekkyon',
    texto:
      'Durante las dinastías Goryeo y Joseon se popularizaron el Subak y el Taekkyon, artes de combate basadas en patadas fluidas, consideradas antecesoras directas del taekwondo.',
  },
  {
    fecha: '1910 – 1945',
    titulo: 'La ocupación japonesa',
    texto:
      'Durante la ocupación se prohibieron las artes marciales coreanas. Algunos maestros las preservaron en secreto, y muchos coreanos entraron en contacto con el karate y otras disciplinas japonesas.',
  },
  {
    fecha: '1945',
    titulo: 'Nacen los Kwan',
    texto:
      'Tras la liberación de Corea se fundan las primeras escuelas o “kwan” (Chung Do Kwan, Moo Duk Kwan, Song Moo Kwan, Chang Moo Kwan, Ji Do Kwan, entre otras), que darían forma al arte moderno.',
  },
  {
    fecha: '1955',
    titulo: 'Nace el nombre “Taekwondo”',
    texto:
      'El 11 de abril de 1955 se adopta oficialmente el nombre Taekwondo, impulsado por el general Choi Hong Hi, para unificar los distintos estilos bajo una misma identidad.',
  },
  {
    fecha: '1966',
    titulo: 'Federación Internacional (ITF)',
    texto: 'El general Choi Hong Hi funda la International Taekwon-Do Federation, que difunde el arte por todo el mundo.',
  },
  {
    fecha: '1972 – 1973',
    titulo: 'Kukkiwon y World Taekwondo',
    texto:
      'Se inaugura en Seúl el Kukkiwon, sede mundial del taekwondo, y en 1973 se crea la World Taekwondo Federation (hoy World Taekwondo), junto con el primer Campeonato Mundial.',
  },
  {
    fecha: '1988 – 1992',
    titulo: 'Deporte de exhibición olímpico',
    texto: 'El taekwondo se presenta como deporte de exhibición en los Juegos Olímpicos de Seúl 1988 y Barcelona 1992.',
  },
  {
    fecha: '2000',
    titulo: 'Deporte olímpico oficial',
    texto:
      'En Sídney 2000 el taekwondo debuta como deporte olímpico oficial. Desde entonces forma parte de todos los Juegos y se practica en más de 200 países.',
  },
]

const PRINCIPIOS = [
  ['Cortesía', 'Ye Ui · Respeto hacia los maestros, compañeros y todas las personas.'],
  ['Integridad', 'Yom Chi · Honestidad y capacidad de distinguir lo correcto de lo incorrecto.'],
  ['Perseverancia', 'In Nae · Paciencia y constancia para alcanzar cada objetivo.'],
  ['Autocontrol', 'Guk Gi · Dominio de uno mismo, dentro y fuera del entrenamiento.'],
  ['Espíritu indomable', 'Baekjul Boolgool · Coraje para enfrentar cualquier desafío sin rendirse.'],
]

const COLORES = [
  ['Blanco', 'inocencia, el comienzo del camino.'],
  ['Amarillo', 'la tierra donde la semilla echa raíces.'],
  ['Verde', 'la planta que crece y se desarrolla.'],
  ['Azul', 'el cielo hacia el que crece la planta.'],
  ['Rojo', 'el peligro; el alumno debe aprender a controlarse.'],
  ['Negro', 'madurez y dominio; el fin de una etapa y el inicio de un nuevo aprendizaje.'],
]

export default function Historia() {
  const { galeria } = useDatosIniciales()
  const [foto, setFoto] = useState(galeria?.[1] || galeria?.[0] || null)

  useEffect(() => {
    getGaleria({ limit: 2 })
      .then((f) => setFoto(f[1] || f[0] || null))
      .catch(() => {})
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Historia"
        titulo={
          <>
            El camino del
            <br />
            <span className="accent">pie y el puño</span>
          </>
        }
      >
        <p>
          El taekwondo es un arte marcial de origen coreano que combina técnicas de combate, defensa personal, deporte
          y una profunda filosofía de vida.
        </p>
      </PageHero>

      <section>
        <div className="container split">
          <Reveal>
            <div className="hangul">태권도</div>
            <h2>¿Qué significa Taekwondo?</h2>
            <p className="muted">
              El nombre está formado por tres palabras coreanas que resumen la esencia del arte: el uso de las piernas,
              el uso de las manos y el camino espiritual que guía al practicante.
            </p>
            <div className="meaning">
              <div>
                <strong>Tae 태</strong>
                <small>Pie · Patear, saltar, golpear con los pies</small>
              </div>
              <div>
                <strong>Kwon 권</strong>
                <small>Puño · Golpear o bloquear con las manos</small>
              </div>
              <div>
                <strong>Do 도</strong>
                <small>Camino · El arte, la disciplina, el modo de vida</small>
              </div>
            </div>
          </Reveal>
          <Reveal className="split-media">
            <img src={foto?.url || '/img/profesor/placeholder.svg'} alt="Practicante de taekwondo" />
          </Reveal>
        </div>
      </section>

      <section className="section-alt">
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow">Línea de tiempo</span>
            <h2>De los antiguos reinos al podio olímpico</h2>
          </Reveal>
          <div className="timeline">
            {LINEA_DE_TIEMPO.map((h) => (
              <Reveal className="tl-item" key={h.titulo}>
                <div className="tl-year">{h.fecha}</div>
                <h3>{h.titulo}</h3>
                <p>{h.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="section-head center">
            <span className="eyebrow">Filosofía</span>
            <h2>Los cinco principios</h2>
            <p className="muted">
              Todo practicante de taekwondo se compromete a vivir según estos principios, dentro y fuera del dojang.
            </p>
          </Reveal>
          <div className="cards tenets">
            {PRINCIPIOS.map(([titulo, texto]) => (
              <Reveal as="article" className="card" key={titulo}>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-alt">
        <div className="container split">
          <Reveal>
            <span className="eyebrow">Grados</span>
            <h2>El significado de los cinturones</h2>
            <p className="muted">
              El camino del practicante se divide en grados <strong>Gup</strong> (cinturones de color) y{' '}
              <strong>Dan</strong> (cinturón negro). Cada color representa una etapa del aprendizaje:
            </p>
            <ul className="muted">
              {COLORES.map(([color, significado]) => (
                <li key={color}>
                  <strong>{color}:</strong> {significado}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="lista-cinturones">
            {CINTURONES.slice(0, 11).map((c) => (
              <div key={c.id}>
                <Cinturon id={c.id} grande />
                <span>
                  {c.nombre} <span className="muted">· {c.grado}</span>
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </>
  )
}
