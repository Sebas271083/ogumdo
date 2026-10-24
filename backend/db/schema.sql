CREATE TABLE IF NOT EXISTS usuarios (
  id                INT PRIMARY KEY AUTO_INCREMENT,
  email             VARCHAR(150) NOT NULL UNIQUE,
  password_hash     VARCHAR(100) NOT NULL,
  nombre            VARCHAR(120) NOT NULL,
  rol               ENUM('admin', 'alumno') NOT NULL DEFAULT 'alumno',
  fecha_nacimiento  DATE NULL,
  fecha_ingreso     DATE NULL,
  cinturon_actual   VARCHAR(20) NOT NULL DEFAULT 'blanco',
  creado_ts         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Graduaciones, títulos, capacitaciones y logros de cada alumno
CREATE TABLE IF NOT EXISTS registros (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id      INT NOT NULL,
  tipo            ENUM('graduacion', 'titulo', 'capacitacion', 'logro') NOT NULL,
  titulo          VARCHAR(200) NOT NULL,
  descripcion     TEXT NULL,
  fecha           DATE NULL,
  cinturon        VARCHAR(20) NULL,
  archivo         VARCHAR(100) NULL,
  archivo_nombre  VARCHAR(255) NULL,
  creado_ts       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_registros_usuario (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sesiones (
  token_hash  CHAR(64) PRIMARY KEY,
  usuario_id  INT NOT NULL,
  expira_ts   DATETIME NOT NULL,
  INDEX idx_sesiones_usuario (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS mensajes (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  nombre     VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  telefono   VARCHAR(40) NULL,
  mensaje    TEXT NOT NULL,
  leido      BOOLEAN NOT NULL DEFAULT FALSE,
  creado_ts  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Asistencia a clases =====
-- Las clases salen de "horarios" en backend/contenido/escuela.json; clase_id es su "id".

-- Clases a las que va cada alumno (las asigna el Sabonim): define a quién le llegan los recordatorios
CREATE TABLE IF NOT EXISTS alumno_clases (
  usuario_id  INT NOT NULL,
  clase_id    VARCHAR(40) NOT NULL,
  PRIMARY KEY (usuario_id, clase_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- "Voy" / "No voy" de cada alumno para una clase de una fecha
CREATE TABLE IF NOT EXISTS asistencias (
  usuario_id      INT NOT NULL,
  clase_id        VARCHAR(40) NOT NULL,
  fecha           DATE NOT NULL,
  asiste          BOOLEAN NOT NULL,
  actualizado_ts  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id, clase_id, fecha),
  INDEX idx_asistencias_clase (clase_id, fecha),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS clases_canceladas (
  clase_id   VARCHAR(40) NOT NULL,
  fecha      DATE NOT NULL,
  motivo     VARCHAR(200) NULL,
  creado_ts  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (clase_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Evita mandar dos veces el recordatorio de la misma clase
CREATE TABLE IF NOT EXISTS recordatorios_enviados (
  clase_id  VARCHAR(40) NOT NULL,
  fecha     DATE NOT NULL,
  PRIMARY KEY (clase_id, fecha)
) ENGINE=InnoDB;

-- Avisos del Sabonim (se ven en el panel y llegan como notificación)
CREATE TABLE IF NOT EXISTS avisos (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  titulo     VARCHAR(120) NOT NULL,
  mensaje    TEXT NOT NULL,
  creado_ts  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dispositivos de cada usuario que aceptaron notificaciones push
CREATE TABLE IF NOT EXISTS push_suscripciones (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id  INT NOT NULL,
  endpoint    VARCHAR(500) CHARACTER SET ascii NOT NULL UNIQUE,
  p256dh      VARCHAR(200) NOT NULL,
  auth        VARCHAR(100) NOT NULL,
  creado_ts   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_push_usuario (usuario_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Álbumes de la galería (eventos). Las fotos sin álbum son las generales del dojang.
CREATE TABLE IF NOT EXISTS albumes (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  nombre       VARCHAR(120) NOT NULL,
  descripcion  VARCHAR(300) NULL,
  fecha        DATE NULL,
  creado_ts    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- album_id se agrega también por migración en initDb.js para las bases creadas antes de los álbumes
CREATE TABLE IF NOT EXISTS galeria (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  titulo     VARCHAR(150) NULL,
  archivo    VARCHAR(100) NOT NULL,
  album_id   INT NULL,
  creado_ts  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (album_id) REFERENCES albumes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Archivos para descargar (reglamentos, historia, traducciones...)
CREATE TABLE IF NOT EXISTS descargas (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  titulo          VARCHAR(150) NOT NULL,
  descripcion     VARCHAR(300) NULL,
  categoria       VARCHAR(40) NOT NULL DEFAULT 'otros',
  archivo         VARCHAR(100) NOT NULL,
  archivo_nombre  VARCHAR(255) NOT NULL,
  tamano          INT NOT NULL DEFAULT 0,
  publico         BOOLEAN NOT NULL DEFAULT TRUE,
  creado_ts       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Calendario de fechas importantes
CREATE TABLE IF NOT EXISTS eventos (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  titulo       VARCHAR(150) NOT NULL,
  descripcion  TEXT NULL,
  tipo         VARCHAR(20) NOT NULL DEFAULT 'evento',
  fecha        DATE NOT NULL,
  fecha_fin    DATE NULL,
  hora         VARCHAR(5) NULL,
  lugar        VARCHAR(150) NULL,
  publico      BOOLEAN NOT NULL DEFAULT TRUE,
  creado_ts    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_eventos_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
