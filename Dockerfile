# Imagen única: compila el frontend y lo sirve el backend (necesario para el render en el servidor / SEO).
# Vite 8 necesita Node >= 22.12: por eso se fija la imagen acá en vez de usar Nixpacks.

# ---------- 1. Build del frontend ----------
FROM node:22-bookworm-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---------- 2. Backend + build del frontend ----------
FROM node:22-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY backend/ ./
COPY --from=frontend /app/frontend/dist /app/frontend/dist
COPY --from=frontend /app/frontend/dist-server /app/frontend/dist-server

# Fotos de la galería y diplomas: montar un volumen persistente en esta carpeta
VOLUME /app/backend/storage

EXPOSE 4000
CMD ["node", "src/server.js"]
