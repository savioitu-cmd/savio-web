-- Migración: Base de Conocimiento y Políticas para Agente Nora

-- 1. Tabla de Conocimiento Técnico Botánico
CREATE TABLE IF NOT EXISTS nora_conocimiento_tecnico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    contenido_norma TEXT NOT NULL,
    palabras_clave TEXT[] NOT NULL DEFAULT '{}',
    actualizado_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla de Políticas Comerciales y Operativas
CREATE TABLE IF NOT EXISTS nora_politicas_empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave_politica TEXT UNIQUE NOT NULL,
    valor_politica TEXT NOT NULL,
    descripcion TEXT,
    actualizado_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices de consulta
CREATE INDEX IF NOT EXISTS idx_nora_conocimiento_keywords 
ON nora_conocimiento_tecnico USING GIN (palabras_clave);

CREATE INDEX IF NOT EXISTS idx_nora_politicas_clave 
ON nora_politicas_empresa (clave_politica);

-- Inserción de políticas iniciales de ejemplo
INSERT INTO nora_politicas_empresa (clave_politica, valor_politica, descripcion) VALUES
('margen_ganancia_minimo', '45', 'Margen porcentual base sobre kits e insumos'),
('criterio_visita_gratis', 'solo_si_compra_kit_recuperar', 'Condición comercial para ofrecer asesoría técnica presencial bonificada'),
('umbral_envio_gratis', '50000', 'Monto mínimo en pesos para bonificar el costo de envío')
ON CONFLICT (clave_politica) DO UPDATE 
SET valor_politica = EXCLUDED.valor_politica,
    descripcion = EXCLUDED.descripcion,
    actualizado_at = timezone('utc'::text, now());
