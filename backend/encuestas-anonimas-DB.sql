-- Crear tipos ENUM
CREATE TYPE estado_encuesta AS ENUM('BORRADOR', 'PUBLICADA', 'CERRADA');
CREATE TYPE tipo_pregunta AS ENUM(
    'ELECCION_SIMPLE', 
    'ELECCION_MULTIPLE', 
    'SI_NO', 
    'TEXTO', 
    'NUMERO', 
    'FECHA', 
    'EMAIL', 
    'TELEFONO'
);

-- Tabla creadores
CREATE TABLE creadores (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token_dashboard CHAR(36) NOT NULL,
    UNIQUE(email),
    UNIQUE(token_dashboard)
);

-- Tabla encuestas
CREATE TABLE encuestas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    token_participacion CHAR(36) NOT NULL,
    token_resultados CHAR(36) NOT NULL,
    estado estado_encuesta NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_creador INT NOT NULL,
    UNIQUE(token_participacion),
    UNIQUE(token_resultados),
    FOREIGN KEY (id_creador) REFERENCES creadores(id) ON DELETE CASCADE
);

-- Tabla preguntas
CREATE TABLE preguntas (
    id SERIAL PRIMARY KEY,
    id_encuesta INT NOT NULL,
    numero INT NOT NULL,
    texto VARCHAR(1000) NOT NULL,
    descripcion VARCHAR(1000),
    tipo tipo_pregunta NOT NULL,
    FOREIGN KEY (id_encuesta) REFERENCES encuestas(id) ON DELETE CASCADE,
    UNIQUE(id_encuesta, numero)
);

-- Tabla opciones
CREATE TABLE opciones (
    id SERIAL PRIMARY KEY,
    id_pregunta INT NOT NULL,
    orden INT NOT NULL,
    texto VARCHAR(1000) NOT NULL,
    FOREIGN KEY (id_pregunta) REFERENCES preguntas(id) ON DELETE CASCADE,
    UNIQUE(id_pregunta, orden)
);

-- Tabla respuestas
CREATE TABLE respuestas (
    id SERIAL PRIMARY KEY,
    id_encuesta INT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_encuesta) REFERENCES encuestas(id) ON DELETE CASCADE
);

-- Tabla respuestas_opcion (para respuestas de opciones)
CREATE TABLE respuestas_opcion (
    id SERIAL PRIMARY KEY,
    id_respuesta INT NOT NULL,
    id_pregunta INT NOT NULL,
    id_opcion INT,
    valor_texto VARCHAR(2000),
    valor_numero NUMERIC,
    valor_fecha DATE,
    FOREIGN KEY (id_respuesta) REFERENCES respuestas(id) ON DELETE CASCADE,
    FOREIGN KEY (id_pregunta) REFERENCES preguntas(id) ON DELETE CASCADE,
    FOREIGN KEY (id_opcion) REFERENCES opciones(id) ON DELETE SET NULL
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_respuestas_id_encuesta ON respuestas(id_encuesta);
CREATE INDEX idx_respuestas_opcion_id_respuesta ON respuestas_opcion(id_respuesta);
CREATE INDEX idx_respuestas_opcion_id_pregunta ON respuestas_opcion(id_pregunta);
CREATE INDEX idx_preguntas_id_encuesta ON preguntas(id_encuesta);
CREATE INDEX idx_opciones_id_pregunta ON opciones(id_pregunta);