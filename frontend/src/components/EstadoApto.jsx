import { archivoAptoUrl } from '../api/client'
import { fecha } from '../utils/format'

const ETIQUETAS = {
  vigente: { texto: 'Apto vigente', icono: '✅' },
  'por-vencer': { texto: 'Apto por vencer', icono: '⚠️' },
  vencido: { texto: 'Adeuda apto', icono: '❌' },
  'sin-apto': { texto: 'Adeuda apto', icono: '❌' },
}

// Etiqueta corta para listas: "✅ Apto vigente", "❌ Adeuda apto"...
export function ChipApto({ apto }) {
  const e = ETIQUETAS[apto?.estado] ?? ETIQUETAS['sin-apto']
  return (
    <span className={`chip apto-${apto?.estado ?? 'sin-apto'}`}>
      {e.icono} {e.texto}
    </span>
  )
}

// Explicación completa del estado, con el link al certificado si hay
export function MensajeApto({ apto, vos = false }) {
  const { estado, dias, actual } = apto
  const vence = actual && fecha(actual.fecha_vencimiento)
  // "vos": texto para el alumno ("Adeudás"), si no, para el Sabonim ("Adeuda")
  const textos = {
    vigente: `Apto físico vigente hasta el ${vence}.`,
    'por-vencer':
      dias === 0
        ? `El apto físico vence hoy. ${vos ? 'Traé' : 'Tiene que traer'} uno nuevo.`
        : `El apto físico vence el ${vence} (en ${dias} ${dias === 1 ? 'día' : 'días'}). ${vos ? 'Traé' : 'Tiene que traer'} uno nuevo.`,
    vencido: `${vos ? 'Adeudás' : 'Adeuda'} el apto físico: venció el ${vence}.`,
    'sin-apto': `${vos ? 'Adeudás' : 'Adeuda'} el apto físico: todavía no ${vos ? 'lo entregaste' : 'lo entregó'}.`,
  }
  return (
    <div className={`aviso-apto apto-${estado}`}>
      <span className="aviso-apto-icono">{ETIQUETAS[estado].icono}</span>
      <div>
        <strong>{textos[estado]}</strong>
        {actual && (
          <p className="muted">
            Entregado el {fecha(actual.fecha_emision)}
            {actual.observaciones ? ` · ${actual.observaciones}` : ''}
          </p>
        )}
      </div>
      {actual?.tiene_archivo && (
        <a className="btn btn-sm btn-dark" href={archivoAptoUrl(actual.id)} target="_blank" rel="noopener noreferrer">
          Ver certificado
        </a>
      )}
    </div>
  )
}
