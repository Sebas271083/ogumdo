# Sitio web de la escuela de Taekwondo

Sitio público (inicio, historia, Sabonim, galería y contacto) con acceso para alumnos y panel de administración.

**Stack:** Node.js + Express 5 · React 19 + Vite · MySQL (mysql2)

```
backend/     API Express (routes → controllers → services), sesiones con cookie, subida de archivos
  contenido/ escuela.json y profesor.json (textos editables)
  db/        schema.sql
  storage/   diplomas y fotos subidas (no se versiona)
frontend/    React + Vite (React Router)
```

## Cómo ejecutarlo

```bash
# 1. Backend
cd backend
cp .env.example .env        # completar MYSQL_USER / MYSQL_PASSWORD
npm install
npm run init-db             # crea la base, las tablas y los usuarios iniciales
npm run dev                 # http://localhost:4000

# 2. Frontend (otra terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Vite redirige `/api` al backend (ver `vite.config.js`), así que la cookie de sesión funciona sin configurar nada más.

`npm run init-db` se puede correr las veces que haga falta: no pisa datos. Si la tabla de usuarios está vacía crea:

| Rol    | Email               | Contraseña   |
|--------|---------------------|--------------|
| Admin  | admin@escuela.com   | cambiar123   |
| Alumno | alumno@demo.com     | alumno123    |

> Cambiá la contraseña del admin apenas entres (Panel → Mi cuenta), o definí `ADMIN_EMAIL` / `ADMIN_PASSWORD` en `.env` antes del primer `init-db`.

## Personalizar el contenido

| Qué                                   | Dónde                                              |
|---------------------------------------|----------------------------------------------------|
| Banner GIF de la portada              | `frontend/public/img/banner.gif` (o `banner.mp4`, que tiene prioridad y pesa mucho menos) |
| Nombre, dirección, teléfono, WhatsApp, redes, horarios, estadísticas | `backend/contenido/escuela.json` |
| Biografía, graduaciones y diplomas del Sabonim        | `backend/contenido/profesor.json` |
| Foto y diplomas del Sabonim           | `frontend/public/img/profesor/` (y actualizá las rutas en `profesor.json`) |
| Fotos de la galería                   | Panel admin → Galería                              |
| Texto de la historia                  | `frontend/src/pages/Historia.jsx`                  |
| Colores y tipografías                 | Variables al inicio de `frontend/src/index.css`    |
| Sistema de cinturones                 | `frontend/src/utils/cinturones.js`                 |

Los cambios en `backend/contenido/*.json` se ven al recargar, sin reiniciar el servidor.

**Tip para el banner:** un GIF a pantalla completa puede pesar varios MB. Convertido a MP4 se ve igual y carga mucho más rápido:
`ffmpeg -i banner.gif -movflags faststart -pix_fmt yuv420p -vf "scale=1920:-2" banner.mp4`.
Mientras no haya ninguno, la portada muestra un fondo animado.

## Panel de administración (`/admin`)

- **Alumnos:** alta, edición y baja (cada alumno entra con su email y contraseña).
- **Registros:** graduaciones, títulos, capacitaciones y logros, con fecha, descripción y diploma adjunto (imagen o PDF). Al cargar una graduación se puede actualizar automáticamente el cinturón actual.
- **Galería:** subir varias fotos a la vez y borrarlas.
- **Mensajes:** bandeja del formulario de contacto.

Los diplomas solo los puede ver el alumno dueño o el admin.

## Producción

```bash
cd frontend && npm run build     # genera frontend/dist (navegador) y frontend/dist-server (render en servidor)
cd ../backend && npm start       # sirve la API y la web en el mismo puerto
```

Requiere Node **22.12 o superior** (lo exige Vite 8).

### Deploy en Coolify

El `Dockerfile` de la raíz compila el frontend y arranca el backend en una sola imagen.

1. **MySQL:** + New → Databases → MySQL (base `taekwondo`). Copiá los datos de la *Internal URL*.
2. **App:** + New → repositorio `ogumdo`, con:
   - Build Pack: **Dockerfile**, Base Directory: `/`
   - Ports Exposes: `4000`
   - Persistent Storage: volumen montado en `/app/backend/storage` (fotos y diplomas)
   - Variables: `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`,
     `SITE_URL=https://ogumdo.com.ar`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
3. Después del primer deploy, en la **Terminal** de la app: `npm run init-db`.

Los textos de `backend/contenido/*.json` quedan dentro de la imagen: para cambiarlos, editá, hacé push y redeploy.

## SEO

En producción las páginas públicas (`/`, `/historia`, `/profesor`, `/galeria`, `/contacto`) se renderizan
en el servidor con los datos actuales, así Google recibe el contenido completo sin ejecutar JavaScript.
Cada página lleva:

- título y descripción propios (`frontend/src/seo.js`);
- link canónico y Open Graph (vista previa al compartir por WhatsApp o redes);
- datos estructurados Schema.org con nombre, dirección, teléfono y redes (`backend/src/services/seoService.js`).

`/robots.txt` y `/sitemap.xml` se generan solos con `SITE_URL` del `.env`. Login y paneles llevan `noindex`.

Para que funcione bien:

- Completá `barrio` en `backend/contenido/escuela.json`: se agrega a los títulos ("Clases de Taekwondo en Chacarita, CABA").
- Cargá teléfono, email y redes reales: van a los datos que lee Google.
- Cuando el sitio esté online, dalo de alta en [Google Search Console](https://search.google.com/search-console) y enviá `https://ogumdo.com.ar/sitemap.xml`.
- Creá el Perfil de Empresa de Google con la misma dirección y teléfono, y el link a la web.

Poné `NODE_ENV=production` (la cookie de sesión pasa a ser `Secure`, requiere HTTPS) detrás de un proxy como Nginx.
Hacé backup de la base MySQL y de `backend/storage/`.

## Problemas conocidos

Si `npm run dev` del frontend falla con *"Cannot find native binding"* (bug de npm con dependencias opcionales en Windows):

```bash
npm install --no-save @rolldown/binding-win32-x64-msvc
```
