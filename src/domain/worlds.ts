export type WorldId = "tolar" | "hornitos" | "toqui" | "dorotea-superior" | "dorotea-inferior";
export type EvidenceKind = "direct-evidence" | "scientific-interpretation" | "artistic-reconstruction";

export interface PointOfInterest {
  id: string;
  title: string;
  description: string;
  evidence: EvidenceKind;
  position: [number, number, number];
}

export interface WorldDefinition {
  id: WorldId;
  title: string;
  subtitle: string;
  species: string;
  period: string;
  summary: string;
  palette: { ground: string; rock: string; accent: string; vegetation: string; sky: string; water?: string };
  terrain: "basin" | "fan" | "volcanic" | "riverplain" | "channel";
  vegetation: "sparse" | "low" | "ferns" | "mixed" | "riparian";
  water: "none" | "seasonal" | "shallow" | "meandering";
  landmarks: PointOfInterest[];
}

export const worlds: WorldDefinition[] = [
  {
    id: "tolar", title: "Cuenca de Tolar", subtitle: "Antofagasta · Cretácico Superior",
    species: "Atacamatitan chilensis", period: "Cretácico Superior",
    summary: "Una cuenca continental de gran amplitud, con terrazas, conglomerados y estratos rojizos. El drenaje estacional y la vegetación dispersa se presentan como reconstrucción ambiental.",
    palette: { ground: "#a96843", rock: "#8f4935", accent: "#e2a35e", vegetation: "#71834a", sky: "#91c5d5", water: "#548f9c" },
    terrain: "basin", vegetation: "sparse", water: "seasonal",
    landmarks: [
      { id: "strata", title: "Mirador de estratos rojos", description: "Las capas rojizas representan una sucesión continental de brechas, conglomerados y areniscas descrita para la Formación Tolar.", evidence: "direct-evidence", position: [-54, 3, -32] },
      { id: "conglomerate", title: "Terraza de conglomerados", description: "Los bloques de distintos tamaños permiten observar depósitos de grano grueso y su matriz sedimentaria.", evidence: "direct-evidence", position: [48, 4, -12] },
      { id: "drainage", title: "Corredor de drenaje", description: "El cauce estacional y las agrupaciones vegetales son una interpretación plausible; no demuestran un río permanente en el punto del fósil.", evidence: "artistic-reconstruction", position: [0, 1, 26] },
      { id: "scale", title: "Paisaje de escala", description: "Un espacio despejado permite imaginar la escala de un titanosaurio sin incorporar todavía el modelo GLB de la especie.", evidence: "artistic-reconstruction", position: [5, 1, -8] }
    ]
  },
  {
    id: "hornitos", title: "Cuenca de Hornitos", subtitle: "Atacama · Cretácico Superior",
    species: "Arackar licanantay", period: "Cretácico Superior (asignación publicada; correlación en revisión)",
    summary: "Abanicos de aporte, cauces de grava y afloramientos volcánico-sedimentarios. Una depresión calcárea aporta contraste sin convertir el mapa en un lago.",
    palette: { ground: "#b7794d", rock: "#68645d", accent: "#e6bd83", vegetation: "#82905b", sky: "#a5c9d5", water: "#6d9fa2" },
    terrain: "fan", vegetation: "low", water: "shallow",
    landmarks: [
      { id: "breccia", title: "Portal de brechas", description: "Afloramientos de depósitos gruesos evocan las brechas y conglomerados descritos en la Formación Hornitos.", evidence: "direct-evidence", position: [-52, 5, -30] },
      { id: "fan", title: "Abanico de sedimentos", description: "La forma abierta del abanico es una reconstrucción geomorfológica basada en la presencia de depósitos gruesos y variación de facies.", evidence: "scientific-interpretation", position: [44, 3, -28] },
      { id: "braided", title: "Cauce de grava", description: "Ramales someros y bancos arenosos interpretan un drenaje continental; no representan un curso fluvial medido en el punto del holotipo.", evidence: "artistic-reconstruction", position: [0, 1, 22] },
      { id: "limestone", title: "Depresión calcárea", description: "Las fangolitas calcáreas y calizas permiten representar una subzona de sedimentación fina y agua somera, no un lago universal.", evidence: "direct-evidence", position: [50, 1, 25] },
      { id: "volcanic", title: "Afloramiento volcánico", description: "Tobas y rocas volcánicas se muestran como depósitos consolidados y erosionados, sin erupciones ni lava activa.", evidence: "direct-evidence", position: [-42, 5, 28] }
    ]
  },
  {
    id: "toqui", title: "Cuenca de Toqui", subtitle: "Aysén · Jurásico Superior",
    species: "Chilesaurus diegosuarezi", period: "Titoniense · aprox. 148–147 millones de años",
    summary: "Un paisaje austral de roca volcaniclástica erosionada, terrazas sedimentarias y una transición moderada hacia agua somera. Las facies locales se mantienen prudentes.",
    palette: { ground: "#777d58", rock: "#555d5b", accent: "#b4a17b", vegetation: "#537d4f", sky: "#8db7c6", water: "#4e929b" },
    terrain: "volcanic", vegetation: "ferns", water: "shallow",
    landmarks: [
      { id: "volcanic-gate", title: "Umbral de roca volcánica", description: "Los escarpes representan el aporte y la erosión de materiales volcánicos en la cuenca.", evidence: "scientific-interpretation", position: [-55, 5, -28] },
      { id: "tuff", title: "Terraza de tobas", description: "La escena contrasta depósitos volcaniclásticos finos y gruesos. No se atribuye una facies concreta de otros sectores al nivel fósil.", evidence: "scientific-interpretation", position: [48, 4, -26] },
      { id: "shore", title: "Orilla de agua somera", description: "La lámina de agua representa una posibilidad de transición litoral/somera dentro de la cuenca, no una costa tropical documentada.", evidence: "artistic-reconstruction", position: [0, 1, 30] },
      { id: "observation", title: "Plataforma de observación", description: "Punto abierto para contemplar la relación entre roca volcánica, sedimentos y zonas bajas.", evidence: "artistic-reconstruction", position: [44, 2, 28] }
    ]
  },
  {
    id: "dorotea-superior", title: "Llanura de Dorotea", subtitle: "Magallanes · Maastrichtiano temprano",
    species: "Gonkoken nanoi", period: "Maastrichtiano temprano · aprox. 71,7–70,5 millones de años",
    summary: "Una llanura fluvial austral con bancos arenosos, meandros, sectores fangosos y vegetación ribereña en mosaico. Se distingue de Dorotea inferior.",
    palette: { ground: "#746d4e", rock: "#8b8064", accent: "#c2a66f", vegetation: "#547c4c", sky: "#91bac6", water: "#4b8d91" },
    terrain: "riverplain", vegetation: "mixed", water: "meandering",
    landmarks: [
      { id: "floodplain", title: "Planicie fluvial", description: "La composición representa una llanura de sedimentación fluvial regional, no una reconstrucción topográfica exacta del sitio.", evidence: "scientific-interpretation", position: [-52, 2, -26] },
      { id: "sandbank", title: "Banco arenoso", description: "Los bancos y depósitos finos evocan areniscas finas y fangolitas arenosas descritas para el contexto de Loma Koken.", evidence: "direct-evidence", position: [48, 2, -12] },
      { id: "carbon", title: "Lentes carbonosos", description: "Los pequeños niveles oscuros evocan lentes de carbón presentes en la sucesión; no son vetas explotables ni un bosque moderno.", evidence: "direct-evidence", position: [-40, 1, 30] },
      { id: "river", title: "Meandro", description: "La geometría sinuosa es una interpretación visual de un sistema fluvial; el trazado no pretende reproducir un cauce fósil exacto.", evidence: "artistic-reconstruction", position: [8, 1, 32] }
    ]
  },
  {
    id: "dorotea-inferior", title: "Canal de Dorotea", subtitle: "Magallanes · Cretácico Superior",
    species: "Stegouros elengassen", period: "Cretácico Superior · Formación Dorotea inferior",
    summary: "Un canal sinuoso con barras arenosas y cortes de arenisca y lutita. El espacio abierto destaca la geometría del canal y no copia el paisaje de Gonkoken.",
    palette: { ground: "#8b765b", rock: "#756b60", accent: "#d0b18a", vegetation: "#5b8052", sky: "#9bbdc9", water: "#4f8991" },
    terrain: "channel", vegetation: "riparian", water: "meandering",
    landmarks: [
      { id: "channel", title: "Canal sinuoso", description: "La escena se inspira en un ambiente de canal fluvial y no en un pantano profundo dominante.", evidence: "scientific-interpretation", position: [-48, 1, -26] },
      { id: "bar", title: "Barra arenosa", description: "El punto muestra una barra de canal de arenisca de grano medio, interpretación sedimentológica publicada para el nivel de SP17.", evidence: "direct-evidence", position: [48, 2, -18] },
      { id: "cutbank", title: "Corte de estratos", description: "El talud alterna arenisca y lutita para hacer visible el contraste entre capas.", evidence: "direct-evidence", position: [-44, 4, 28] },
      { id: "terrace", title: "Terraza fluvial", description: "Una superficie elevada permite observar la geometría del canal sin confundirla con la llanura de Dorotea superior.", evidence: "scientific-interpretation", position: [42, 2, 30] }
    ]
  }
];

export function getWorld(id: WorldId): WorldDefinition {
  const world = worlds.find((item) => item.id === id);
  if (!world) throw new Error(`Mundo desconocido: ${id}`);
  return world;
}