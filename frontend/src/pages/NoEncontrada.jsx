import { Link } from 'react-router'

export default function NoEncontrada() {
  return (
    <div className="auth-wrap centrado">
      <div>
        <div className="hangul">404</div>
        <h2>Esta página no existe</h2>
        <p className="muted">Parece que esta patada no dio en el blanco.</p>
        <Link className="btn" to="/">
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
