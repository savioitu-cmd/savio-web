export const KITS = [
  {
    id: 'kit-recuperar',
    nombre: 'Kit para recuperar un jardín descuidado',
    precio: 28500,
    imagen: 'assets/kit-recuperar.jpg',
    productosIncluidos: [
      'Sustrato enriquecido con biochar 20L',
      'Bioestimulante radicular orgánico 250ml',
      'Fertilizante regenerador NPK alto fósforo',
      'Tijera de limpieza botánica',
      'Guía paso a paso de choque vegetal'
    ]
  },
  {
    id: 'kit-mantenimiento',
    nombre: 'Kit mantenimiento mensual',
    precio: 22000,
    imagen: 'assets/kit-mantenimiento.jpg',
    productosIncluidos: [
      'Fertilizante equilibrado orgánico 500ml',
      'Bioestimulante foliar anti-estrés',
      'Jabón potásico con aceite de neem 250ml',
      'Dosificador graduado'
    ]
  },
  {
    id: 'kit-huerta',
    nombre: 'Kit para huerta en casa',
    precio: 24500,
    imagen: 'assets/kit-huerta.jpg',
    productosIncluidos: [
      'Selección de 5 variedades de semillas de estación',
      'Compost maduro premium 15dm³',
      'Humus de lombriz puro 5dm³',
      'Pala de trasplante milimetrada',
      'Tutores de bambú natural y calendario'
    ]
  },
  {
    id: 'kit-poda',
    nombre: 'Kit poda',
    precio: 26000,
    imagen: 'assets/kit-poda.jpg',
    productosIncluidos: [
      'Tijera de podar bypass con hoja de acero SK5',
      'Pasta cicatrizante natural con propóleo 150g',
      'Guantes ergonómicos reforzados',
      'Serrucho curvo plegable para ramas medias'
    ]
  },
  {
    id: 'kit-interior',
    nombre: 'Kit cuidado de plantas de interior',
    precio: 19500,
    imagen: 'assets/kit-interior.jpg',
    productosIncluidos: [
      'Tónico y abrillantador vegetal eco 250ml',
      'Gotas fertilizantes de absorción lenta',
      'Medidor análogo de humedad de suelo',
      'Pulverizador bruma ultra fina 300ml'
    ]
  }
];

export const CROSS_SELL_CATALOG = {
  regadera: { id: 'cs-regadera', nombre: 'Regadera pico fino de precisión 1.5L', precio: 8500 },
  semillas_aromaticas: { id: 'cs-semillas', nombre: 'Mix semillas aromáticas bio', precio: 3200 },
  sustrato_universal: { id: 'cs-sustrato', nombre: 'Sustrato universal liviano 10L', precio: 5400 },
  pulverizador_presion: { id: 'cs-pulverizador', nombre: 'Pulverizador a presión continua 2L', precio: 9200 },
  aceite_neem: { id: 'cs-neem', nombre: 'Preventivo Neem + Potásico listo para usar', precio: 4100 },
  aceite_limpieza_hojas: { id: 'cs-panos', nombre: 'Paño de microfibra + limpiador de hojas', precio: 3800 },
  tijera_precision: { id: 'cs-tijera-p', nombre: 'Tijera de despunte para esquejes', precio: 6200 },
  guantes_nitrilo: { id: 'cs-guantes', nombre: 'Par de guantes impermeables de jardinería', precio: 2900 }
};

export function recomendarKit(respuestas) {
  const { ambiente, tipo, problema, frecuencia, tamaño } = respuestas;

  let kitId;
  let crossSell = [];

  if (problema === 'descuidado') {
    kitId = 'kit-recuperar';
    crossSell = [
      CROSS_SELL_CATALOG.pulverizador_presion,
      tamaño === 'grande' ? CROSS_SELL_CATALOG.sustrato_universal : CROSS_SELL_CATALOG.aceite_neem
    ];
  } else if (tipo === 'huerta') {
    kitId = 'kit-huerta';
    crossSell = [
      CROSS_SELL_CATALOG.semillas_aromaticas,
      CROSS_SELL_CATALOG.regadera
    ];
  } else if (problema === 'poda') {
    kitId = 'kit-poda';
    crossSell = [
      CROSS_SELL_CATALOG.guantes_nitrilo,
      CROSS_SELL_CATALOG.tijera_precision
    ];
  } else if (ambiente === 'interior') {
    kitId = 'kit-interior';
    crossSell = [
      CROSS_SELL_CATALOG.aceite_limpieza_hojas,
      CROSS_SELL_CATALOG.regadera
    ];
  } else {
    kitId = 'kit-mantenimiento';
    crossSell = [
      CROSS_SELL_CATALOG.aceite_neem,
      frecuencia === 'alta' ? CROSS_SELL_CATALOG.pulverizador_presion : CROSS_SELL_CATALOG.sustrato_universal
    ];
  }

  const kit = KITS.find(k => k.id === kitId);

  return {
    kit,
    sugeridos: crossSell
  };
}
