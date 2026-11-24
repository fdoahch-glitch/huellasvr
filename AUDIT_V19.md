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
| Montañas | Anillo procedural y volcanes usan `terrainHeightAt`. | La consulta del terreno puede devolver una celda válida cercana cuando la coordenada cae en una máscara inválida; esa aproximación puede separar la base de la montaña del borde real. | `js/main.js` | Se agregó muestreo hacia el interior buscando suelo válido para fijar la base. Falta verificar las cinco escenas visualmente y revisar costuras. |
| Vegetación | GLB ambientales y Thin Instances; la fusión de algunos lotes se protege con `try/catch`. | La fusión sigue siendo opcional y algunos lotes quedan como mallas separadas. No se debe interpretar el fallback de fusión como migración completada. | `js/main.js` | Mantenerlo solo como recuperación ante fallo; optimizar lotes con Thin Instances y medir draw calls. |
| Física | Hay colisiones de escena y controles manuales. Cámara con `applyGravity=false` y `checkCollisions=false`. | No se encontró integración Havok Physics V2 ni controlador físico de personaje. Las colisiones actuales no equivalen a física completa. | `js/main.js`, `index.html` | Integración Havok pendiente, incluida verificación de WASM, WebGL2 y WebXR. |
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

1. No hay Havok Physics V2 conectado.
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
