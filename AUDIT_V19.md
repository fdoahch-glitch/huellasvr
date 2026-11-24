# Auditoría de paridad con Huellas VR v19

**Estado:** auditoría técnica en curso. Este documento distingue las comprobaciones hechas sobre archivos de las pruebas que todavía requieren ejecutar la escena.

## Referencias y alcance comprobado

- Repositorio: `fdoahch-glitch/huellasvr`, rama `main`.
- Referencia original localizada en la biblioteca de trabajo: `huellas-vr_v19(1).zip` (40.616.794 bytes).
- Motor actual: Babylon.js, WebGL2 y WebXR `immersive-vr`.
- Archivos principales revisados: `index.html`, `js/main.js`, `tests/audit-v19-parity.mjs`.
- Se verificó que existen los cinco GLB de dinosaurio, sus variantes de menor detalle, panoramas, mapas de color y mapas de altura. También se verificó la presencia de las texturas de detalle y de los recursos ambientales citados por el motor.

## Inventario de recursos esenciales

| Mundo | Dinosaurio | Panorama | Color del terreno | Mapa de altura |
|---|---|---|---|---|
| Atacamatitan | `models/atacamatitan.glb` | `img/atacamatitan_sky.jpg` | `img/atacamatitan_c.jpg` | `img/atacamatitan_h.png` |
| Arackar | `models/arackar.glb` | `img/arackar_sky.jpg` | `img/arackar_c.jpg` | `img/arackar_h.png` |
| Gonkoken | `models/gonkoken.glb` | `img/gonkoken_sky.jpg` | `img/gonkoken_c.jpg` | `img/gonkoken_h.png` |
| Stegouros | `models/stegouros.glb` | `img/stegouros_sky.jpg` | `img/stegouros_c.jpg` | `img/stegouros_h.png` |
| Chilesaurus | `models/chilesaurus.glb` | `img/aysen_sky.jpg` | `img/aysen_c.jpg` | `img/aysen_h.png` |

Texturas de detalle encontradas: `tex_sand_d.jpg`, `tex_sand_n.jpg`, `tex_crack_d.jpg`, `tex_gsand_d.jpg`, `tex_gsand_n.jpg`, `tx_dirt_d.jpg`, `tx_dirt_n.jpg`, `tx_leaves_d.jpg`, `tx_leaves_n.jpg`, `tx_redplants_d.jpg`, `tx_redplants_n.jpg`, `tx_stones_d.jpg`, `tx_stones_n.jpg`.

Los GLB originales incluyen los clips `Idle`, `Walk`, `Run` y `Neck_Look` en las cinco especies y en las variantes LOD revisadas.

## Diferencias y problemas encontrados

| Subsistema | Estado actual observado | Diferencia / riesgo | Archivos afectados | Corrección o validación pendiente |
|---|---|---|---|---|
| Orientación de dinosaurios | El pivote se orientaba infiriendo el eje a partir del ancho X/Z y luego aplicando una bandera `flip`. | El ancho de la caja no determina por sí solo hacia dónde mira la cabeza. Atacamatitan tiene la cabeza hacia +X en el GLB inspeccionado; la rotación previa lo orientaba en sentido contrario al avance +Z. | `js/main.js` | Se incorporó orientación explícita por especie. Falta validar visualmente las cinco en navegador. |
| Animaciones | Se buscaban nombres exactos tras `instantiateModelsToScene`. | Los grupos clonados pueden recibir sufijos como `Walk-0`; la búsqueda exacta falla y deja el clip incorrecto o sin transición. | `js/main.js` | Se agregó normalización de nombres y transición ponderada entre clips. Falta prueba de reproducción real y sincronía de pisadas. |
| Locomoción | El movimiento se actualiza por código y la altura se toma del heightmap. | El movimiento y el ciclo no estaban acoplados de forma fiable si el grupo no se encontraba; el perfil de Stegouros usaba velocidad de clip negativa. | `js/main.js` | Se eliminó el uso de velocidad negativa y se relacionó el ratio con la velocidad observada. Falta ajuste por especie con medición visual. |
| Terreno | Se construye geometría desde el heightmap y se genera una textura compuesta con canvas. | La composición no recupera toda la mezcla original por pendiente/altura/distancia; las capas se distribuyen mediante máscaras de ruido. El uso de canvas compone una textura final grande y puede consumir memoria. | `js/main.js` | Pendiente reconstruir el material de terreno original con mapas y mezcla por superficie, y medir memoria/RAM. |
| Montañas | Anillo procedural y volcanes usan `terrainHeightAt`. | La consulta del terreno puede devolver una celda válida cercana cuando la coordenada cae en una máscara inválida; esa aproximación puede separar la base de la montaña del borde real. | `js/main.js` | Se agregó muestreo hacia el interior buscando suelo válido para fijar la base y un colisionador estático Havok para la malla de montañas. Falta verificar las cinco escenas visualmente y revisar costuras. |
| Vegetación | GLB ambientales y Thin Instances; la fusión de algunos lotes se protege con `try/catch`. | La fusión sigue siendo opcional y algunos lotes quedan como mallas separadas. No se debe interpretar el fallback de fusión como migración completada. | `js/main.js` | Mantenerlo solo como recuperación ante fallo; optimizar lotes con Thin Instances y medir draw calls. |
| Física | Ahora se inicializa Havok Physics V2, un controlador cápsula del jugador y colisionadores estáticos de terreno y montañas. | La carga de Havok y la creación de controlador/colisionador pasan en Chromium; falta probar impactos, pendientes, escalones y movimiento VR en hardware. Los árboles/rocas grandes aún no tienen todos sus colisionadores. | `js/main.js`, `index.html` | Completar colisionadores ambientales selectivos y pruebas de respuesta física. |
| Cielo y atmósfera | Panorama por mundo, cúpula de nubes, partículas, estrellas, luna, pterosaurios y mariposas procedurales. | El código asigna panorama y efectos, pero falta probar carga, orientación y visibilidad real por mundo. | `js/main.js` | Añadir pruebas de recursos y capturas de cada mundo. |
| Agua y audio | Ríos/lagunas y audio procedural/ambiente presentes en el motor. | Falta validación visual de orillas, intersecciones, reflejos y mezcla de sonidos contra v19. | `js/main.js` | Pruebas de escena y escucha en navegador/dispositivo. |
| WebXR | Se crea experiencia `immersive-vr` con `local-floor`, selección por gatillo y mirada. | La presencia de la API en el código no valida controladores, tracking ni sesión real en visor. | `js/main.js`, `index.html` | Probar en visor compatible. |
| Pruebas | La auditoría actual inspecciona sintaxis/tokens/archivos y metadatos GLB. | No ejecuta Babylon.js, no renderiza mundos ni mide animaciones, físicas o FPS. | `tests/audit-v19-parity.mjs`, workflow | Añadir navegador automatizado y reportar hardware real. |

## Sistemas originales que deben mantenerse

- Cinco entornos independientes y sus recursos de paisaje.
- GLB originales de dinosaurios y sus variantes de detalle.
- Animaciones originales de los modelos.
- Cielo/panorama específico de cada mundo.
- Vegetación, rocas, troncos y modelos ambientales originales.
- Ciclo día/tarde/noche, lluvia, niebla y efectos atmosféricos.
- Ríos, lagunas y bancos de arena según configuración de cada mundo.
- Navegación por cámara, selección por mirada/tacto y WebXR.
- Modo estereoscópico móvil y controles de orientación.
- Sonidos ambientales y efectos de pisadas/polvo.

## Riesgos que bloquean declarar la migración terminada

1. Havok Physics V2 ya está conectado y arranca en Chromium; la respuesta física completa aún no está validada.
2. No existe una prueba automatizada de navegador que abra cada mundo y valide los recursos renderizados.
3. No hay mediciones de FPS, CPU/GPU o memoria en Android y PC dentro de esta auditoría.
4. No se ha validado una sesión WebXR en visor físico.
5. No se ha completado la paridad visual de materiales/terreno con v19.
6. La corrección de orientación/animación recién aplicada necesita inspección en ejecución.

## Próximas pruebas obligatorias

- Cargar cada GLB en Babylon y verificar su eje anatómico frontal después de la conversión glTF.
- Reproducir los cuatro clips por especie, comprobar transiciones y medir desplazamiento de patas.
- Abrir los cinco mundos, comprobar panorama, heightmap, textura, vegetación, montañas, agua y luces.
- Probar colisiones/gravedad con Havok y movimiento en pendiente.
- Ejecutar Playwright/WebGL en navegador compatible, capturar errores de consola y screenshots.
- Medir perfiles alta/media/baja y probar Android/PC.
- Entrar y salir de una sesión WebXR real.

**Conclusión:** el repositorio conserva una parte importante del inventario original, pero la presencia de recursos o funciones no acredita paridad funcional. Los subsistemas anteriores siguen abiertos hasta superar sus pruebas de ejecución.


## Inventario completo del ZIP v19 (105 archivos)

El ZIP contiene 20 GLB, 57 JPG, 22 PNG, 2 JS y 1 HTML. No contiene archivos de audio MP3, OGG ni WAV.

### Modelos GLB (20)

**Dinosaurios principales (5):**
- `models/atacamatitan.glb`
- `models/arackar.glb`
- `models/gonkoken.glb`
- `models/stegouros.glb`
- `models/chilesaurus.glb`

**Variantes LOD (5):**
- `models/lo_atacamatitan.glb`
- `models/lo_arackar.glb`
- `models/lo_gonkoken.glb`
- `models/lo_stegouros.glb`
- `models/lo_chilesaurus.glb`

**Entorno (5):**
- `models/env/fern_02.glb`
- `models/env/dead_tree_trunk_02.glb`
- `models/env/rock_07.glb`
- `models/env/rock_09.glb`
- `models/env/cerro_desierto.glb`

**Vegetación (5):**
- `models/veg/araucaria_adulta.glb`
- `models/veg/araucaria_joven.glb`
- `models/veg/fern_small.glb`
- `models/veg/fern_tripo.glb`
- `models/veg/pebble.glb`

### Texturas JPG (57)

`img/gonkoken_sky.jpg`, `img/tex_sand_n.jpg`, `img/valle_c.jpg`, `img/atacamatitan_sky.jpg`, `img/mundo1_sW.jpg`, `img/arackar_leaf.jpg`, `img/arackar_c.jpg`, `img/tex_crack_d.jpg`, `img/atacamatitan.jpg`, `img/atacama360_c.jpg`, `img/stegouros_bark.jpg`, `img/atacamatitan360.jpg`, `img/arackar_bark.jpg`, `img/mundo1_sS.jpg`, `img/aysen_bark.jpg`, `img/tx_redplants_n.jpg`, `img/patagonia_sky.jpg`, `img/pat_bark.jpg`, `img/tx_leaves_n.jpg`, `img/patagonia.jpg`, `img/tex_tiger_d.jpg`, `img/tex_rterr_d.jpg`, `img/aysen_sky.jpg`, `img/aysen_leaf.jpg`, `img/stegouros_sky.jpg`, `img/arackar.jpg`, `img/tex_sand_d.jpg`, `img/tx_dirt_n.jpg`, `img/tex_gsand_n.jpg`, `img/stegouros_leaf.jpg`, `img/atacama360.jpg`, `img/tex_gravel_d.jpg`, `img/mundo1_c.jpg`, `img/atacamatitan_c.jpg`, `img/tx_stones_d.jpg`, `img/valle.jpg`, `img/tex_grass_d.jpg`, `img/stegouros_c.jpg`, `img/pat_leaf.jpg`, `img/tx_dirt_d.jpg`, `img/tx_stones_n.jpg`, `img/atacamatitan_leaf.jpg`, `img/arackar_sky.jpg`, `img/portada.jpg`, `img/tex_gsand_d.jpg`, `img/aysen_c.jpg`, `img/tx_leaves_d.jpg`, `img/atacamatitan_bark.jpg`, `img/tx_redplants_d.jpg`, `img/gonkoken_bark.jpg`, `img/mundo1_sE.jpg`, `img/gonkoken_leaf.jpg`, `img/mundo1_sN.jpg`, `img/gonkoken_c.jpg`, `img/patagonia_c.jpg`, `img/aysen.jpg`.

### Texturas PNG (22)

`img/pat_h.png`, `img/aysen_grass.png`, `img/arackar_frond.png`, `img/gonkoken_grass.png`, `img/gonkoken_h.png`, `img/stegouros_frond.png`, `img/gonkoken_frond.png`, `img/stegouros_h.png`, `img/flat_h.png`, `img/aysen_frond.png`, `img/pat_grass.png`, `img/arackar_grass.png`, `img/mundo1_h.png`, `img/atacamatitan_h.png`, `img/atacamatitan_frond.png`, `img/atacamatitan_grass.png`, `img/aysen_h.png`, `img/atacama360_h.png`, `img/arackar_h.png`, `img/pat_frond.png`, `img/valle_h.png`, `img/stegouros_grass.png`.

**Otros:** `js/main.js`, `lib/aframe.min.js` y `index.html`. La presencia de A-Frame en el ZIP original no significa que deba volver a usarse: la migración actual mantiene Babylon.js como único motor.

**Audio:** el ZIP v19 no contiene archivos de sonido separados, pero sí contiene un sistema procedural Web Audio en `js/main.js`: ruido filtrado para viento/agua/lluvia, osciladores de modulación, ambiente de insectos/grillos y llamados de dinosaurios generados con osciladores y envolventes. La paridad de audio debe compararse por parámetros y comportamiento del código, no por recuperación de MP3/OGG/WAV.

### Regresión visual confirmada por capturas de Chromium

Las primeras capturas de mundo mostraron que el domo del panorama no se veía: el domo tenía diámetro 900 (radio 450) y la cámara cortaba en `maxZ=320`, por lo que quedaba fuera del plano lejano. Se corrigió el domo a diámetro 500 para mantenerlo dentro del rango visible. Las capturas también muestran que el suelo sigue viéndose demasiado uniforme aunque el mapa fotográfico y el normal reportan carga; se añadió diagnóstico del material, UV, estado de textura y muestra de píxel para localizar si el problema es el enlace de textura, la geometría o la iluminación. La recuperación visual del terreno aún no se considera terminada.
