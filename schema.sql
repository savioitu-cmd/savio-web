-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Tabla Clientes (CRM)
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    creado_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla Diagnósticos de Jardín (CRM)
CREATE TABLE IF NOT EXISTS diagnosticos_jardin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    ambiente TEXT NOT NULL,
    tipo TEXT NOT NULL,
    problema TEXT NOT NULL,
    frecuencia TEXT NOT NULL,
    tamano TEXT NOT NULL,
    kit_recomendado TEXT NOT NULL,
    creado_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla Inventario de Kits (RPM / ERP)
CREATE TABLE IF NOT EXISTS inventario_kits (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    actualizado_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabla Visitas de Mantenimiento (RPM / Operaciones)
CREATE TABLE IF NOT EXISTS visitas_mantenimiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    fecha_visita TIMESTAMPTZ NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'realizada', 'cancelada')) DEFAULT 'pendiente',
    notas_botanicas TEXT,
    creado_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Tabla de Conocimiento Técnico Botánico con Embeddings RAG
CREATE TABLE IF NOT EXISTS nora_conocimiento_tecnico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    contenido_norma TEXT NOT NULL,
    fuente_documento TEXT,
    embedding VECTOR(1536),
    palabras_clave TEXT[] NOT NULL DEFAULT '{}',
    actualizado_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Tabla de Políticas de Empresa
CREATE TABLE IF NOT EXISTS nora_politicas_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave_politica TEXT UNIQUE NOT NULL,
    valor_politica TEXT NOT NULL,
    descripcion TEXT,
    actualizado_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices de optimización
CREATE INDEX IF NOT EXISTS idx_clientes_whatsapp ON clientes(whatsapp);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_cliente ON diagnosticos_jardin(cliente_id);
CREATE INDEX IF NOT EXISTS idx_visitas_cliente ON visitas_mantenimiento(cliente_id);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas_mantenimiento(fecha_visita);
CREATE INDEX IF NOT EXISTS idx_nora_conocimiento_keywords ON nora_conocimiento_tecnico USING GIN (palabras_clave);
CREATE INDEX IF NOT EXISTS idx_nora_politicas_clave ON nora_politicas_empresa (clave_politica);

-- Índice HNSW para búsqueda por similitud vectorial (distancia coseno)
CREATE INDEX IF NOT EXISTS idx_nora_embedding_hnsw 
ON nora_conocimiento_tecnico USING hnsw (embedding vector_cosine_ops);

-- Inserción inicial de inventario
INSERT INTO inventario_kits (id, nombre, stock, precio) VALUES
('kit-recuperar', 'Kit para recuperar un jardín descuidado', 25, 28500.00),
('kit-mantenimiento', 'Kit mantenimiento mensual', 40, 22000.00),
('kit-huerta', 'Kit para huerta en casa', 30, 24500.00),
('kit-poda', 'Kit poda', 20, 26000.00),
('kit-interior', 'Kit cuidado de plantas de interior', 50, 19500.00)
ON CONFLICT (id) DO NOTHING;
