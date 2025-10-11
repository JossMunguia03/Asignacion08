-- Base de datos y uso
CREATE DATABASE IF NOT EXISTS gratiday
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE gratiday;

-- Tabla Usuario
CREATE TABLE IF NOT EXISTS usuario (
  id_user INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  correo_electronico VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  rol VARCHAR(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla Categoria
CREATE TABLE IF NOT EXISTS categoria (
  id_category INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla Frase (con scheduled_at + status DEFAULT 'draft')
CREATE TABLE IF NOT EXISTS frase (
  id_quote INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
  texto TEXT NOT NULL,
  autor VARCHAR(120),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  -- Fecha/hora programada para publicación (NULL = disponible inmediatamente según política)
  scheduled_at DATETIME NULL,
  -- Estado editorial; por defecto 'draft' para evitar publicar sin revisión
  status ENUM('draft','scheduled','published') NOT NULL DEFAULT 'draft',
  creado_por INT NOT NULL,
  categoria_id INT NOT NULL,
  FOREIGN KEY (creado_por) REFERENCES usuario(id_user),
  FOREIGN KEY (categoria_id) REFERENCES categoria(id_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índices recomendados
CREATE INDEX IF NOT EXISTS idx_frase_fecha ON frase(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_frase_categoria_fecha ON frase(categoria_id, fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_frase_scheduled_at ON frase(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_frase_status ON frase(status);
