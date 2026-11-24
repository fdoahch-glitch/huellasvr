# Auditoría integral de cierre — Huellas VR
**Fecha:** 24 de noviembre de 2026  
**Alcance:** rama `main`, motor Babylon.js/WebGL2/WebXR, cinco mundos, dinosaurios, recursos, interfaz, física, pruebas y rendimiento.  
**Estado:** auditoría técnica en curso; no es certificación de producto terminado.

## 1. Inventario comprobado del repositorio

- `index.html`: entrada web, dependencias Babylon.js/Havok desde CDN, portada, controles y HUD.
- `js/main.js`: motor de escena, terreno, agua, montañas, vegetación, dinosaurios, física, audio, clima, WebXR y diagnóstico. Es un archivo monolítico de aproximadamente 117 KB.
- `js/home.js`: selector de cinco mundos y retorno a portada.
- `css/style.css`: interfaz adaptable.
- `models/`: cinco modelos principales de dinosaurios, cinco LOD y modelos ambientales/vegetación.
- `img/`: panoramas, fotografías de terreno, mapas de altura y texturas.
- `tests/audit-v19-parity.mjs`: auditoría estática de motor, escenas, GLB, clips y recursos.
- `tests/browser-smoke.mjs`: carga de los cinco mundos con Chromium/WebGL2, diagnóstico, clips y comprobaciones de manada.
- `.github/workflows/v19-parity-audit.yml`: auditoría estática y pruebas de navegador en GitHub Actions.

## 2. Dinosaurios: correcciones y alcance real

### Implementado en el código
- Cada ejemplar tiene tamaño, edad estimada, personalidad, temporizadores, estado, objetivo, velocidad y orientación propios.
- Los perfiles de personalidad incluyen curiosos, sociables, tranquilos, tímidos y juveniles juguetones.
- Los dinosaurios alternan reposo, desplazamiento, carrera, observación, bebida, pastoreo simulado y descanso.
- Los curiosos pueden aproximarse al jugador, frenar a distancia prudente y girar para mirarlo.
- Los tímidos pueden huir cuando el jugador se aproxima demasiado.
- Los sociables pueden buscar un compañero de la misma especie y detenerse frente a él.
- Los juveniles juguetones pueden correr hacia un compañero y describir pequeños desplazamientos circulares alrededor de él.
- El movimiento comprueba el espacio corporal de otros dinosaurios y las zonas de colisión ambiental antes de actualizar la posición.
- El spawn busca posiciones de terreno válidas y separadas según el tamaño de cada ejemplar.
- Los cuatro clips que realmente contienen los GLB originales y LOD son Idle, Walk, Run y Neck_Look; se reconocen nombres clonados con sufijos y se mezclan mediante crossfade.
- El diagnóstico expone estado, personalidad, edad estimada, objetivo, compañero, velocidad y posición.

### Límites que no deben ocultarse
- El movimiento de los dinosaurios sigue siendo cinemático. No tienen cuerpos Havok articulados, cápsulas físicas individuales ni respuesta física completa al empujarse.
- La evitación actual frena y replanifica al detectar una obstrucción; no es todavía un sistema completo de navegación por malla de caminos. En configuraciones difíciles puede haber pausas o rutas fallidas.
- El pastoreo es una pausa de comportamiento con animación de cuello disponible; no elimina hojas ni consume una planta concreta.
- La bebida usa la posición de orillas y una animación de cuello; no existe un clip específico de beber confirmado en los GLB.
- El juego social utiliza los clips disponibles. No existe una animación de juego exclusiva, contacto físico, vocalización contextual ni ciclo de cortejo.
- La etiqueta juvenil se infiere a partir de la escala del ejemplar, no de una edad anatómica o de un rig separado.
- No se ha validado visualmente la anatomía/orientación de cada especie en hardware real ni el comportamiento de todas las instancias durante sesiones largas.

## 3. Mundos, modelos y motor

- Se mantienen cinco escenas: Atacamatitan/Tolar, Arackar/Hornitos, Gonkoken/Dorotea, Stegouros/Dorotea y Chilesaurus/Toqui.
- La auditoría estática revisa modelos GLB principales y LOD, presencia de los cuatro clips, texturas, mapas de altura y recursos GLB referenciados.
- El motor declarado es Babylon.js con WebGL2. El código no debe incorporar Three.js, A-Frame ni WebGPU.
- La física Havok V2 se inicializa para el terreno, obstáculos ambientales seleccionados y el controlador cápsula del jugador.
- La física del jugador y la evitación cinemática de dinosaurios son sistemas diferentes; no deben presentarse como una simulación física unificada.

## 4. Hallazgos y bloqueos para cerrar el proyecto

| Área | Estado | Qué falta para cerrar |
|---|---|---|
| IA y separación de dinosaurios | Implementación ampliada | Ejecutar CI actualizado; observar manadas durante varios minutos y comprobar rutas, atascos y distancias en los cinco mundos |
| Animaciones | Cuatro clips por modelo verificados por auditoría estática | Inspección visual de orientación, apoyo de patas, velocidad y transiciones por especie |
| Alimentación/socialización | Conductas iniciales implementadas | Clips/gestos específicos o aceptar formalmente la simulación con clips existentes |
| Colisiones de dinosaurios | Evitación cinemática | Navegación y respuesta física real si se exige contacto/choque; pruebas con grupos densos |
| Colisiones del jugador | Controlador Havok y colliders simplificados | Probar pendientes, bordes, árboles, rocas, agua y recuperación de posición en cada mundo |
| Terreno y materiales | Fotografía, normal map y PBR conectados por código | Revisar capturas nuevas y comparar visualmente con v19; ajustar iluminación y mezcla de capas si el suelo sigue uniforme |
| Montañas y volcanes | Geometría y muestreo de base mejorados | Revisar visualmente uniones, cráteres, flotación y sombras en cinco capturas |
| Agua | Ríos/lagunas y material PBR | Comprobar orillas, profundidad aparente, transparencia y estabilidad de animación |
| WebXR | Ruta immersive-vr implementada | Probar con visor físico, mandos, seguimiento, altura, locomoción, salida y reconexión |
| Android / PC | Perfiles alta/media/baja | Benchmark por dispositivo y mundo; el objetivo de 60 FPS no está certificado |
| Memoria y ciclo de vida | Pausa en segundo plano y eventos de contexto WebGL | Prueba prolongada, restauración real del contexto, liberar recursos al cambiar/reiniciar mundo |
| Dependencias | Babylon.js, loaders y Havok se cargan desde CDN | Confirmar política de red/HTTPS y decidir si se requiere modo offline/autohospedado |
| Distribución | Sitio web adaptable | No hay APK/EXE ni empaquetado nativo documentado; solo es necesario si el producto final los exige |

## 5. Rendimiento: lectura correcta

Las mediciones históricas de CI con Chromium headless/SwiftShader dieron aproximadamente 8–14 FPS en calidad baja y entre 581 y 934 mallas según el mundo. Es renderizado por software y no sirve como benchmark de GPU Android/PC. No demuestra 60 FPS ni demuestra que el hardware real no pueda alcanzarlos.

Todavía faltan mediciones en dispositivos identificados:
- modelo de teléfono, GPU, RAM, resolución y navegador;
- PC, GPU, CPU, RAM, resolución y navegador;
- FPS promedio y mínimos, CPU de actualización, GPU, draw calls, memoria y temperatura;
- duración de prueba y mundo/calidad utilizados.

## 6. Criterios de aceptación antes de declarar terminado

1. La auditoría estática debe pasar sobre el último commit.
2. Chromium debe cargar los cinco mundos sin errores de consola, con panorama, textura, normal map, PBR y Havok.
3. Las pruebas de manada deben confirmar cero superposiciones al inicio y durante movimiento, además de poder iniciar acercamiento al jugador e interacción entre dinosaurios en cada mundo.
4. Debe revisarse la captura de cada mundo y comprobar que terreno, montañas, agua y dinosaurios se ven correctamente.
5. Debe probarse en Android y PC reales; registrar resultados, sin extrapolar los FPS de SwiftShader.
6. Debe probarse WebXR con visor físico compatible.
7. Debe completarse una sesión prolongada para detectar congelamientos, pérdida de animación, fugas de memoria o dinosaurios atascados.

**Conclusión:** el repositorio contiene una base funcional amplia y se han aplicado correcciones importantes, pero aún no hay evidencia suficiente para declarar HUELLAS VR terminado. Los bloqueos principales son validación visual de los cinco mundos, pruebas físicas y WebXR en hardware, rendimiento real y comprobar que las nuevas conductas de manada se mantienen estables durante uso prolongado.
