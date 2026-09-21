export const carrito = {
  kit: null,
  extras: []
};

export const WHATSAPP_CONFIG = {
  telefono: '5491100000000'
};

export function setKitPrincipal(kit) {
  carrito.kit = kit;
}

export function agregarAlCarrito(producto) {
  const existe = carrito.extras.some(item => item.id === producto.id);
  if (!existe) {
    carrito.extras.push(producto);
  }
}

export function quitarDelCarrito(productoId) {
  carrito.extras = carrito.extras.filter(item => item.id !== productoId);
}

export function vaciarCarrito() {
  carrito.kit = null;
  carrito.extras = [];
}

export function calcularTotal() {
  let total = 0;
  if (carrito.kit && typeof carrito.kit.precio === 'number') {
    total += carrito.kit.precio;
  }
  total += carrito.extras.reduce((acc, item) => acc + (item.precio || 0), 0);
  return total;
}

export function generarMensajeWhatsApp(datosCliente) {
  const { nombre = 'Cliente', ambiente = 'No especificado', problema = 'Mantenimiento' } = datosCliente;
  const total = calcularTotal();

  let lineasPedido = '';
  if (carrito.kit) {
    lineasPedido += `- 1x ${carrito.kit.nombre} ($${carrito.kit.precio.toLocaleString('es-AR')})\n`;
  }

  carrito.extras.forEach(extra => {
    lineasPedido += `- 1x ${extra.nombre} ($${extra.precio.toLocaleString('es-AR')})\n`;
  });

  const texto = 
`¡Hola Savio! 👋 Mi nombre es ${nombre}. Realicé el diagnóstico botánico con Nora y mi espacio necesita atención:
- Ambiente: ${ambiente}
- Problema principal: ${problema}

🌿 *Mi Pedido:*
${lineasPedido.trim()}

💰 *Total:* $${total.toLocaleString('es-AR')}

¿Me coordinan el envío y el método de pago? ¡Muchas gracias!`;

  const textoCodificado = encodeURIComponent(texto);
  return `https://wa.me/${WHATSAPP_CONFIG.telefono}?text=${textoCodificado}`;
}
