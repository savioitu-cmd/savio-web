export const KITS = [
  {
    id: 'kit-recuperar',
    nombre: 'Kit Rescate Litoral',
    precioBase: 28500,
    productos: [
      { item: 'Sustrato enriquecido con biochar (20L)', precio: 8000 },
      { item: 'Bioestimulante radicular orgánico (250ml)', precio: 6500 },
      { item: 'Fertilizante regenerador NPK alto fósforo', precio: 5000 }
    ],
    herramientas: [
      { item: 'Tijera de limpieza botánica', precio: 9000 }
    ]
  },
  {
    id: 'kit-mantenimiento',
    nombre: 'Kit Mantenimiento Correntino',
    precioBase: 22000,
    productos: [
      { item: 'Fertilizante equilibrado orgánico (500ml)', precio: 7500 },
      { item: 'Bioestimulante foliar anti-estrés', precio: 6000 },
      { item: 'Jabón potásico con neem (250ml)', precio: 4500 }
    ],
    herramientas: [
      { item: 'Dosificador graduado de precisión', precio: 4000 }
    ]
  },
  {
    id: 'kit-huerta',
    nombre: 'Kit Huerta Urbana Ituzaingó',
    precioBase: 24500,
    productos: [
      { item: 'Semillas adaptadas al clima litoral (5 var.)', precio: 6500 },
      { item: 'Compost maduro premium (15L)', precio: 7000 },
      { item: 'Humus de lombriz puro (5L)', precio: 5000 }
    ],
    herramientas: [
      { item: 'Pala de trasplante milimetrada', precio: 6000 }
    ]
  },
  {
    id: 'kit-poda',
    nombre: 'Kit Poda Profesional',
    precioBase: 26000,
    productos: [
      { item: 'Pasta cicatrizante con propóleo (150g)', precio: 6000 }
    ],
    herramientas: [
      { item: 'Tijera bypass acero SK5', precio: 12000 },
      { item: 'Serrucho curvo plegable', precio: 8000 }
    ]
  },
  {
    id: 'kit-interior',
    nombre: 'Kit Oasis Interior',
    precioBase: 19500,
    productos: [
      { item: 'Tónico abrillantador vegetal (250ml)', precio: 5500 },
      { item: 'Gotas fertilizantes liberación lenta', precio: 4000 }
    ],
    herramientas: [
      { item: 'Medidor análogo de humedad', precio: 6000 },
      { item: 'Pulverizador bruma fina (300ml)', precio: 4000 }
    ]
  }
];

export const ASESORIA = {
  item: 'Asesoría Técnica SAVIO (Ing. Agrónomo)',
  precio: 15000,
  descripcion: 'Planificación detallada, visita técnica y seguimiento post-venta.'
};

export function recomendarKit(respuestas) {
  const { ambiente, tipo, problema, frecuencia, tamaño } = respuestas;
  let kitId;

  if (problema === 'descuidado') kitId = 'kit-recuperar';
  else if (tipo === 'huerta' || respuestas.objetivo === 'huerta') kitId = 'kit-huerta';
  else if (problema === 'poda') kitId = 'kit-poda';
  else if (ambiente === 'interior' || respuestas.espacio === 'interior') kitId = 'kit-interior';
  else kitId = 'kit-mantenimiento';

  const kit = KITS.find(k => k.id === kitId);
  const incluyeAsesoria = (respuestas.objetivo === 'asesoria');

  let total = kit.precioBase;
  if (incluyeAsesoria) total += ASESORIA.precio;

  return {
    kit,
    incluyeAsesoria,
    asesoria: ASESORIA,
    total
  };
}
