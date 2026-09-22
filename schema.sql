-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Tabla Clientes (CRM)
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    tipo_cliente TEXT CHECK (tipo_cliente IN ('Temporal', 'Fijo')) DEFAULT 'Temporal',
    tipo_contratacion TEXT CHECK (tipo_contratacion IN ('Directa', 'Contrato', 'Licitación')) DEFAULT 'Directa',
    forma_pago_preferida TEXT,
    fecha_ultima_compra TIMESTAMPTZ,
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
    costo_base NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (costo_base >= 0),
    porcentaje_ganancia NUMERIC(5, 2) NOT NULL DEFAULT 45,
    precio NUMERIC(10, 2) GENERATED ALWAYS AS (costo_base * (1 + porcentaje_ganancia / 100)) STORED,
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
INSERT INTO inventario_kits (id, nombre, stock, costo_base, porcentaje_ganancia) VALUES
('kit-recuperar', 'Kit para recuperar un jardín descuidado', 25, 19655.17, 45),
('kit-mantenimiento', 'Kit mantenimiento mensual', 40, 15172.41, 45),
('kit-huerta', 'Kit para huerta en casa', 30, 16896.55, 45),
('kit-poda', 'Kit poda', 20, 17931.03, 45),
('kit-interior', 'Kit cuidado de plantas de interior', 50, 13448.27, 45)
ON CONFLICT (id) DO NOTHING;

-- Inserción inicial de políticas comerciales para Nora
INSERT INTO nora_politicas_empresa (clave_politica, valor_politica, descripcion) VALUES
('margen_ganancia_minimo', '45', 'Margen porcentual base sobre kits e insumos'),
('criterio_visita_gratis', 'solo_si_compra_kit_recuperar', 'Condición comercial para asesoría técnica presencial bonificada'),
('umbral_envio_gratis', '50000', 'Monto mínimo en pesos para bonificar el costo de envío')
ON CONFLICT (clave_politica) DO UPDATE 
SET valor_politica = EXCLUDED.valor_politica,
    descripcion = EXCLUDED.descripcion,
    actualizado_at = timezone('utc'::text, now());

-- 8. Tabla Portfolio de Trabajos y Obras de Paisajismo
CREATE TABLE IF NOT EXISTS portfolio_trabajos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT NOT NULL CHECK (categoria IN ('Balcones', 'Parques', 'Terrazas', 'Patios')),
    imagen_url TEXT,
    productos_insumos TEXT[] DEFAULT '{}',
    creado_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_portfolio_categoria ON portfolio_trabajos(categoria);

-- Inserción inicial de obras modelo de Savio
INSERT INTO portfolio_trabajos (titulo, descripcion, categoria, imagen_url, productos_insumos) VALUES
('Transformación Balcón Botánico Urbano', 'Restauración completa de macetas con control de humedad y selección de follaje para semisombra.', 'Balcones', 'assets/obra-balcon.jpg', ARRAY['Kit cuidado de plantas de interior', 'Regadera de precisión']),
('Revitalización y Nutrición de Parque Residencial', 'Plan de choque para césped degradado, podas sanitarias y nutrición radicular profunda.', 'Parques', 'assets/obra-parque.jpg', ARRAY['Kit para recuperar un jardín descuidado', 'Kit poda', 'Sustrato universal']),
('Huerta Orgánica Vertical en Terraza', 'Diseño e instalación de huerto de aromáticas y hortalizas con sustrato vivo y compost premium.', 'Terrazas', 'assets/obra-huerta.jpg', ARRAY['Kit para huerta en casa', 'Pulverizador a presión'])
ON CONFLICT DO NOTHING;

-- 9. Tabla de Asientos Contables y Remitos con OCR
CREATE TABLE IF NOT EXISTS asientos_contables_ocr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proveedor_razon_social TEXT NOT NULL,
    cuit TEXT,
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    nro_comprobante TEXT,
    monto_neto NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (monto_neto >= 0),
    iva NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (iva >= 0),
    monto_total NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (monto_total >= 0),
    tipo_comprobante TEXT NOT NULL CHECK (tipo_comprobante IN ('Factura A', 'Factura B', 'Remito', 'Ticket')),
    estado_auditoria TEXT DEFAULT 'pendiente',
    creado_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_asientos_fecha ON asientos_contables_ocr(fecha_emision);
CREATE INDEX IF NOT EXISTS idx_asientos_cuit ON asientos_contables_ocr(cuit);



