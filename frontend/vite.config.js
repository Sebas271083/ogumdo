import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// El proxy deja frontend y API en el mismo origen: así la cookie de sesión funciona sin
// configurar CORS con credenciales.
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  // El bundle para el servidor (dist-server) no necesita las imágenes de public/
  build: { copyPublicDir: !isSsrBuild },
}))
