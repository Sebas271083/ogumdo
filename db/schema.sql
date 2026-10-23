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

CREATE TABLE IF NOT EXISTS galeria (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  titulo     VARCHAR(150) NULL,
  archivo    VARCHAR(100) NOT NULL,
  creado_ts  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
