# Documento maestro — reconstrucción paleogeográfica de los cinco mundos de Huellas VR

**Proyecto:** Huellas VR  
**Rama objetivo:** `perf/ultra-60fps` (PR #1 hacia `main`)  
**Motor:** Babylon.js 9.37.2 · WebGL2 · Havok Physics V2  
**Perfil visual:** único perfil Equilibrado  
**Estado:** dirección artística y especificación de producción. No constituye todavía una reconstrucción visual terminada ni una validación en hardware físico.

---

## 1. Objetivo

Cada mundo debe ser reconocible como un paisaje mesozoico del territorio chileno asociado al registro fósil de su dinosaurio. No se deben reutilizar cinco veces el mismo bosque, la misma montaña o la misma paleta con cambios superficiales.

La escena debe integrar:
1. Geología y relieve con silueta propia.
2. Suelos estratificados y materiales PBR coherentes.
3. Agua únicamente donde la evidencia sedimentológica permita representarla.
4. Vegetación organizada por microhábitats, no como decoración uniforme.
5. Escala, horizonte, atmósfera y luz propios de cada región y período.
6. Recursos 3D de calidad, con siluetas legibles y detalle cercano.
7. Un área despejada y transitable para observar los dinosaurios sin que árboles, rocas o plantas tapen sus cuerpos.

**Regla de evidencia:** una localidad fósil y una formación geológica no describen por sí solas cada detalle del ecosistema. Las reconstrucciones deben separar observación publicada, inferencia sedimentológica y decisión artística.

## 2. Escala de certeza

- **A — Evidencia directa:** dato del artículo científico, fósil, formación o localidad descrita.
- **B — Inferencia geológica:** ambiente deducido de facies, sedimentos, paleosuelos o flora fósil regional.
- **C — Interpretación artística:** color, densidad vegetal, especies vegetales concretas, clima diario, aspecto exacto del cielo o distribución de elementos sin evidencia local directa.

Los elementos C se pueden usar para crear un mundo atractivo, pero nunca se deben presentar como hechos comprobados.

## 3. Los cinco mundos

### Mundo 1 — Atacamatitan chilensis
**Localidad de referencia:** entorno de Conchi Viejo, Región de Antofagasta.  
**Unidad geológica:** Formación Tolar.  
**Edad:** Cretácico Superior.  
**Evidencia:** restos parciales de un titanosaurio en areniscas rojas de la Formación Tolar. La publicación original describe vértebras, partes de húmero y fémur; el registro no conserva un esqueleto completo ni un inventario detallado de la vegetación local.

**Dirección visual**
- Relieve: lomajes, terrazas sedimentarias, afloramientos y quebradas de arenisca rojiza.
- Suelo: capas de arena, grava y roca rojiza; variación por erosión, con estratos expuestos.
- Agua: cauces estacionales o pequeños cursos solo como interpretación prudente; evitar convertirlo en un oasis permanente sin respaldo.
- Vegetación: rala, en parches y asociada a depresiones o cauces. No usar una selva densa ni un bosque de araucarias como cobertura dominante.
- Fondo: mesetas y cerros erosionados, no dunas gigantes uniformes.
- Paleta: ocres, terracotas, rojos apagados, arena cálida, sombras violáceas discretas y vegetación verde grisácea muy localizada.
- Luz: solar cálida y clara, contraste de relieve; evitar sobreexposición naranja.

**Composición jugable:** abrir un claro amplio para el titanosaurio, con afloramientos rocosos laterales y quebradas visibles en el horizonte. Los elementos altos se mantienen fuera del cono de observación del animal.

**No hacer:** presentar el desierto actual como fotografía exacta del Cretácico; llenar el terreno de palmeras, araucarias, helechos gigantes o ríos permanentes.

### Mundo 2 — Arackar licanantay
**Localidad de referencia:** Formación Hornitos, Región de Atacama, interior de Copiapó.  
**Edad publicada:** Campaniano–Maastrichtiano, Cretácico Superior.  
**Evidencia:** titanosaurio litostrotio descrito a partir de un esqueleto parcial de un subadulto de unos 6,3 m. La publicación caracteriza la unidad y el fósil; no fija una reconstrucción completa de la vegetación ni un clima puntual.

**Dirección visual**
- Relieve: llanuras sedimentarias interrumpidas por quebradas, cerros bajos, terrazas y afloramientos.
- Suelo: mezcla de arena compactada, gravas, costras y roca sedimentaria; paleta más clara y variada que el mundo de Tolar.
- Agua: pequeñas pozas o cauces discontinuos solo si se explican como recurso artístico, no como lago permanente demostrado.
- Vegetación: mosaico abierto y discontinuo; arbustos bajos, plantas ribereñas puntuales y parches de vegetación más abundante en depresiones.
- Fondo: horizonte amplio con cordones rocosos y variación atmosférica.
- Paleta: arena dorada, beige mineral, gris cálido, arcillas rojizas y verde apagado.
- Luz: cálida, seca y de alta visibilidad, sin convertir todo el mundo en una escena monocromática.

**Composición jugable:** recorrido abierto y panorámico, con formaciones rocosas a los lados y vegetación agrupada en sectores. El dinosaurio debe destacar por su silueta y escala.

**No hacer:** copiar el paisaje de Tolar; añadir volcanes activos, lagunas enormes o bosques cerrados como si fueran datos confirmados.

### Mundo 3 — Chilesaurus diegosuarezi
**Localidad de referencia:** Mallín Grande, cuenca de Aysén, cerca del lago General Carrera.  
**Unidad:** niveles inferiores de la Formación Toqui.  
**Edad:** Titoniano, Jurásico Superior, aproximadamente 148 Ma.  
**Evidencia:** dataciones U–Pb de niveles volcánicos intercalados y sedimentos clásticos con fósiles excepcionales. El conjunto se interpreta como un abanico deltaico sinvolcánico que alcanzaba una cuenca marina somera; se han reportado minerales marinos y fragmentos volcánicos.

**Dirección visual**
- Relieve: relieve volcánico antiguo, laderas y abanicos de sedimentos que descienden hacia una costa o cuenca somera.
- Suelo: depósitos de gravas y arenas transportadas por corrientes, zonas de barro y roca volcánica.
- Agua: canales distributarios, desembocaduras y una costa somera; evitar un río único recto o un lago moderno genérico.
- Vegetación: franjas de ribera y sectores terrestres más secos; la composición botánica exacta local no está resuelta, por lo que las plantas deben ser una interpretación mesozoica sobria.
- Fondo: elevaciones volcánicas y bruma costera; se puede sugerir actividad volcánica antigua sin mostrar erupciones permanentes.
- Paleta: verdes húmedos localizados, roca gris volcánica, arenas oscuras, azules y turquesas discretos en aguas someras.
- Luz: húmeda y difusa cerca del agua; zonas soleadas en los abanicos.

**Composición jugable:** el recorrido atraviesa una terraza elevada y mira hacia un abanico deltaico con canales secundarios. La ribera y el agua deben quedar claramente separados de la zona de caminar.

**No hacer:** selva tropical moderna, glaciares, fiordos actuales o un volcán humeante como hecho paleontológico.

### Mundo 4 — Stegouros elengassen
**Localidad de referencia:** Valle del Río de las Chinas, Cerro Guido, Región de Magallanes.  
**Unidad:** Formación Dorotea.  
**Edad:** Cretácico Superior, aproximadamente 74–75 Ma según las fuentes de descripción.  
**Evidencia:** esqueleto casi completo de un pequeño dinosaurio acorazado de unos 2 m, con una estructura caudal distintiva formada por siete pares de osteodermos. El yacimiento de procedencia se interpreta como una barra de canal en un sistema fluvial.

**Dirección visual**
- Relieve: planicies de inundación, terrazas de río, barras arenosas y lomajes bajos.
- Suelo: arenas medias, gravas, limos y sectores con suelos húmedos; incluir marcas de canales y depósitos recientes.
- Agua: río sinuoso y brazos secundarios; alternar orillas, barras y zonas de inundación.
- Vegetación: mosaico ribereño y de planicie. Helechos y plantas bajas pueden formar parte de la interpretación; no asumir que el sitio era un bosque moderno de lenga o una tundra.
- Fondo: relieve patagónico suave y horizonte amplio; la nieve no debe dominar la escena.
- Paleta: verdes profundos pero luminosos, ocres de barras fluviales, marrones húmedos, grises azulados en agua y cielo.
- Luz: fresca, con sombras suaves y reflejos controlados.

**Composición jugable:** ubicar el río como elemento principal lateral o al fondo, con barras y vegetación en bandas. El Stegouros debe quedar visible desde varios ángulos; su cola es un rasgo de lectura obligatoria.

**No hacer:** cubrirlo todo con nieve, hielo o bosque denso; tampoco presentar cada sector de Dorotea como idéntico al yacimiento del esqueleto.

### Mundo 5 — Gonkoken nanoi
**Localidad de referencia:** Loma Koken / El Puesto, Valle del Río de las Chinas, Cerro Guido, Región de Magallanes.  
**Unidad:** sección superior de la Formación Dorotea.  
**Edad:** Cretácico Superior, Maastrichtiano temprano (la publicación sitúa los restos en el intervalo Campaniano tardío–Maastrichtiano temprano).  
**Evidencia:** dinosaurio herbívoro hadrosauroideo no hadrosáurido, descrito a partir de restos de varios individuos. La Formación Dorotea comprende depósitos fluviales, deltaicos, de planicie de inundación y sectores costeros; no se debe asumir que Gonkoken y Stegouros vivieron en el mismo microhábitat exacto ni en el mismo momento.

**Dirección visual**
- Relieve: planicies fluviales y deltaicas, canales distributarios, barras de arena y sectores de planicie inundable.
- Suelo: arenas, limos, gravas y manchas de suelo húmedo; incluir vegetación en los márgenes.
- Agua: canales ramificados y zonas someras; el delta debe leerse por sus brazos y barras, no por un lago circular aislado.
- Vegetación: claros y bandas ribereñas con vegetación diversa. La flora fósil de la región respalda ecosistemas vegetados, pero la mezcla exacta de especies del yacimiento requiere cautela.
- Fondo: paisaje abierto con cordones bajos y una transición hacia ambientes costeros.
- Paleta: verdes naturales, arenas doradas, marrones de suelo húmedo y agua azul grisácea.
- Luz: suave y húmeda, con reflejos y bruma muy ligera.

**Composición jugable:** espacio abierto para observar el animal, con canales laterales, barras y grupos vegetales. El pico y el perfil del cráneo deben quedar visibles; el animal no debe quedar encerrado entre troncos.

**No hacer:** duplicar el mundo Stegouros. Gonkoken debe enfatizar el delta, canales distributarios y espacios abiertos.

## 4. Diferenciación visual obligatoria

| Mundo | Silueta dominante | Agua | Vegetación | Identidad de suelo |
|---|---|---|---|---|
| Atacamatitan | lomas erosionadas y quebradas | cauces escasos/discontinuos | muy dispersa | arenisca roja y grava |
| Arackar | llanuras y cordones bajos | puntual y cautelosa | mosaico abierto | arena mineral y arcillas |
| Chilesaurus | abanico volcánico hacia cuenca somera | canales y costa somera | bandas ribereñas | grava, arena y roca volcánica |
| Stegouros | planicie de inundación y barras | río sinuoso | mosaico de ribera | arena, limo y grava |
| Gonkoken | delta ramificado y planicies | canales distributarios | claros y bandas vegetales | arena fina, limo y barras |

Los dos mundos de Dorotea deben compartir coherencia geológica y flora regional plausible, pero tener composición, relieve, canales, densidad vegetal y cámara distintos.

## 5. Especificación de producción de recursos 3D

### Terreno
- Crear mallas de terreno con densidad suficiente cerca del visitante y LOD hacia el horizonte.
- Usar mapas de altura solo como base; añadir geometría de afloramientos, escarpes, terrazas, barras y quebradas.
- Evitar bordes de terreno visibles, intersecciones con montañas y objetos flotantes.
- Mantener colisión Havok simplificada: terreno y obstáculos grandes, no cada hoja o piedra.

### Materiales
- Material PBR con mapas de albedo, normal y roughness cuando aporten lectura real.
- Mezcla por altura, pendiente, humedad y distancia, con transiciones suaves y ruido de escala múltiple.
- Variación de color sutil por fragmento; no saturar cada roca.
- Agua con profundidad visual, orilla, variación de roughness y reflejo moderado; sin SSR costoso por defecto en móvil.
- Usar texturas empaquetadas/comprimidas y mipmaps; anisotropía limitada por el perfil Equilibrado.

### Vegetación
- Priorizar modelos GLB de calidad y silueta natural sobre conos, cilindros y planos repetidos como árbol final.
- Crear 3–5 variantes por tipo de planta, con cambios de escala/rotación y distribución por zonas ecológicas.
- Usar thin instances o instancias compartidas; combinar por material cuando sea seguro.
- LOD: malla completa cerca, variante simplificada a media distancia y billboard/masa agrupada lejos.
- No usar transparencias alfa innecesarias en grandes cantidades; preferir alpha test en hojas.
- Vegetación fuera de la zona central de observación del dinosaurio; mantener caminos y puntos de interés despejados.

### Rocas y geología
- Crear conjuntos de rocas modulares con geometrías diferentes, no duplicar una única piedra escalada.
- Variar tamaño, orientación, erosión y estratos; usar instancias.
- Los grandes afloramientos deben tener geometría propia y colisión simple.
- Incorporar depósitos sedimentarios visibles en cortes y paredes de quebrada.

### Cielo, luz y atmósfera
- Mantener cielo panorámico solo como fondo lejano; el relieve cercano debe ser geometría 3D real.
- Nubes volumétricas/partículas solo en cantidad moderada y con alternativa económica.
- Luz principal + hemisférica, sombras selectivas de objetos grandes.
- Niebla por distancia para integrar horizonte, nunca para ocultar una escena vacía.

### Dinosaurios
- Los GLB principales deben conservar proporciones anatómicas y texturas; no deformarlos para encajar en el paisaje.
- LOD con silueta correcta, especialmente cabeza, cola y extremidades.
- Escala individual revisada por especie; no basar el tamaño del ejemplar en un único parámetro de longitud sin revisar dimensiones reales del GLB.
- Evitar árboles, rocas, partículas y UI superpuestos sobre la silueta.
- No inventar coloración como dato científico: escoger una paleta artística consistente y documentarla como hipotética.

## 6. Arquitectura técnica compatible con el repositorio

El proyecto ya utiliza Babylon.js 9.37.2, WebGL2, Havok, GLB, panoramas, mapas de altura, texturas y sistemas de vegetación. Se debe conservar esa base. No introducir Three.js, A-Frame ni WebGPU en esta fase.

**Herramientas de autoría**
- Blender: modelado, esculpido, retopología, UV, variantes y exportación glTF/GLB.
- Babylon.js Editor: montaje y revisión de escenas.
- Node Material Editor: materiales/shaders.
- Node Geometry Editor: geometría procedural.
- Node Particle Editor: partículas ambientales.
- Herramientas externas de terreno o texturas solo si exportan recursos estándar y no añaden dependencias al runtime.

Los editores de nodos y el editor visual son herramientas de desarrollo, no librerías que deban cargarse en el navegador final. El runtime debe seguir cargando recursos optimizados desde el repositorio.

## 7. Rendimiento — perfil único Equilibrado

- Mantener 60 FPS como objetivo de diseño, no como afirmación de rendimiento ya certificado.
- Priorizar instancias, reutilización de geometría/materiales/texturas, frustum culling y LOD.
- No crear un cuerpo Havok por cada planta, hoja o roca pequeña.
- Reducir resolución de sombras y número de shadow casters según distancia.
- Limitar partículas por distancia y evitar postprocesos costosos por defecto.
- Cargar solo los recursos del mundo elegido; liberar escena, texturas y contenedores al salir.
- Medir draw calls, tiempo CPU, tiempo GPU cuando esté disponible, memoria, número de mallas y texturas.
- Chromium/SwiftShader sirve para pruebas funcionales, no para certificar FPS de GPU física.
- La validación final de 60 FPS requiere Android y PC físicos representativos; WebXR real requiere visor compatible.

## 8. Criterios de aceptación por mundo

Un mundo no se considera terminado hasta cumplir todos estos puntos:
1. Identidad visual claramente distinta a los otros cuatro.
2. Geología y relieve compatibles con la formación/localidad de referencia.
3. Agua y vegetación distribuidas con una explicación paleogeográfica.
4. No hay elementos flotantes, penetraciones evidentes ni costuras de terreno.
5. El dinosaurio se ve completo y tiene escala legible desde la cámara de exploración.
6. Las rocas y vegetación cercanas tienen modelos 3D, materiales y sombras coherentes.
7. El área de desplazamiento está libre de obstáculos decorativos.
8. LOD, instancias y colisiones no degradan la navegación.
9. Capturas de cuatro direcciones y una toma panorámica revisadas.
10. Pruebas automatizadas sin errores y pruebas de rendimiento en hardware separadas.

## 9. Fuentes científicas e institucionales

1. Kellner et al. (2011), *A new titanosaur sauropod from the Atacama Desert, Chile*, Anais da Academia Brasileira de Ciências. https://doi.org/10.1590/S0001-37652011000100011
2. Vargas et al. (2021), *Arackar licanantay gen. et sp. nov.*, Cretaceous Research. https://doi.org/10.1016/j.cretres.2021.104802
3. Suárez et al. (2016), *Tithonian age of dinosaur fossils in central Patagonian, Chile: U–Pb SHRIMP geochronology*, International Journal of Earth Sciences. https://doi.org/10.1007/s00531-015-1287-7
4. Novas et al. (2015), descripción de *Chilesaurus diegosuarezi*, Nature. https://doi.org/10.1038/nature14307
5. Soto-Acuña et al. (2021), *Bizarre tail weaponry in a transitional ankylosaur from subantarctic Chile*, Nature. https://doi.org/10.1038/s41586-021-04147-1
6. Alarcón-Muñoz et al. (2023), *Relict duck-billed dinosaurs survived into the last age of the dinosaurs in subantarctic Chile*, Science Advances. https://doi.org/10.1126/sciadv.adg2456
7. Schwartz & Graham (2015), *Stratigraphic architecture of a tide-influenced shelf-edge delta, Upper Cretaceous Dorotea Formation, Magallanes-Austral Basin, Patagonia*. https://doi.org/10.1111/sed.12176
8. Estudio sedimentológico del Valle del Río de las Chinas y Formación Dorotea, Journal of South American Earth Sciences. Consultar facies fluviales, planicies de inundación y depósitos costeros en la bibliografía del área.
9. Museo Regional de Aysén (2025), *Geositios de la región de Aysén*, ficha de Chilesaurus y Mallín Grande. https://www.museoregionalaysen.gob.cl/
10. Universidad Andrés Bello, ficha de hallazgo de *Chilesaurus diegosuarezi*. https://ciencia.unab.cl/geologo-unab-descubrio-nuevo-dinosaurio-en-la-region-de-aysen/

**Nota:** la edad de Atacamatitan varía en material divulgativo; para el diseño se usa la atribución estratigráfica de la publicación original: Cretácico Superior, Formación Tolar. Las fechas y ambientes se deben actualizar si aparecen nuevas dataciones o revisiones científicas.
