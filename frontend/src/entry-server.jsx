import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import Raiz from './Raiz'

export { metaDeRuta, RUTAS_PUBLICAS } from './seo'

// Lo usa el backend (npm run build genera dist-server/entry-server.js)
export function render(url, datos) {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <Raiz datos={datos} />
      </StaticRouter>
    </StrictMode>,
  )
}
