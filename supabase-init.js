import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://ubvgjxjmcscqooeayhgn.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidmdqeGptY3NjcW9vZWF5aGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwMzE3NTYsImV4cCI6MjEwNTYwNzc1Nn0.U9aH7cDli_Zh9wSlF0WAL4RstqL4TkgH8VRhj2TWPeI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function guardarClienteYDiagnostico(nombre, whatsapp, respuestas, kitId) {
  try {
    const { data: cliente, error: errCliente } = await supabase
      .from('clientes')
      .insert([{ nombre, whatsapp }])
      .select('id')
      .single();

    if (errCliente) throw errCliente;

    const { data: diagnostico, error: errDiag } = await supabase
      .from('diagnosticos_jardin')
      .insert([{
        cliente_id: cliente.id,
        ambiente: respuestas.ambiente,
        tipo: respuestas.tipo,
        problema: respuestas.problema,
        frecuencia: respuestas.frecuencia,
        tamano: respuestas.tamaño || respuestas.tamano,
        kit_recomendado: kitId
      }])
      .select()
      .single();

    if (errDiag) throw errDiag;

    return { 
      success: true, 
      data: { clienteId: cliente.id, diagnostico } 
    };
  } catch (error) {
    console.error('Error al guardar cliente y diagnóstico en Supabase:', error);
    return { 
      success: false, 
      error: error.message || error 
    };
  }
}

export async function cargarDocumentoConocimiento(titulo, contenido, fuente, vector) {
  try {
    const { data, error } = await supabase
      .from('nora_conocimiento_tecnico')
      .insert([{
        titulo,
        contenido_norma: contenido,
        fuente_documento: fuente,
        embedding: vector
      }])
      .select()
      .single();

    if (error) throw error;

    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error('Error al cargar documento técnico en Supabase:', error);
    return { 
      success: false, 
      error: error.message || error 
    };
  }
}
