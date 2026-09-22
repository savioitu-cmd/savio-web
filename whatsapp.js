export const WHATSAPP_CONFIG = {
  get telefono() {
    return localStorage.getItem('savio_whatsapp_number') || '5493786519242';
  }
};

let currentRecomendacion = null;

export function setKitPrincipal(recomendacion) {
  currentRecomendacion = recomendacion;
}

export function generarMensajeWhatsApp(recomendacion, respuestas) {
  const opName = localStorage.getItem('savio_operator_name') || 'Macarena';
  const ambiente = respuestas.espacio || 'No especificado';
  const problema = respuestas.problema || 'Mantenimiento';
  
  let texto = `¡Hola ${opName}! 👋 Realicé el diagnóstico botánico con Nora y mi espacio necesita atención:\n`;
  texto += `- Ambiente: ${ambiente}\n`;
  texto += `- Problema principal: ${problema}\n\n`;
  texto += `🌿 *Mi Mix Personalizado (${recomendacion.kit.nombre}):*\n`;
  
  recomendacion.kit.productos.forEach(p => {
    texto += `- ${p.item} ($${p.precio.toLocaleString()})\n`;
  });
  recomendacion.kit.herramientas.forEach(h => {
    texto += `- ${h.item} ($${h.precio.toLocaleString()})\n`;
  });

  if (recomendacion.incluyeAsesoria) {
    texto += `\n📋 *Servicio Técnico:*\n- ${recomendacion.asesoria.item} ($${recomendacion.asesoria.precio.toLocaleString()})\n`;
  }
  
  texto += `\n💰 *Total Inversión:* $${recomendacion.total.toLocaleString()}\n\n`;
  texto += `¿Me coordinan el envío y métodos de pago? ¡Gracias!`;
  
  return `https://wa.me/${WHATSAPP_CONFIG.telefono}?text=${encodeURIComponent(texto)}`;
}
