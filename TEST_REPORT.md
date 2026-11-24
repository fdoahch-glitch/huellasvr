# Informe de pruebas — Huellas VR

**Estado: pruebas de ejecución pendientes.**

## Comprobaciones de archivos realizadas

- Se consultó la rama `main` del repositorio.
- Se inspeccionaron `index.html`, `js/main.js` y `tests/audit-v19-parity.mjs`.
- Se verificó la existencia de los cinco modelos principales y LOD, panoramas, mapas de color y mapas de altura del inventario revisado.
- Se inspeccionó la estructura GLB original de Atacamatitan; el esqueleto sitúa la cabeza hacia el eje local +X.
- Se comprobó en el código que la cámara de escritorio aún tiene `applyGravity=false` y `checkCollisions=false`, y que no hay inicialización Havok en el arranque actual.

## Prueba automatizada de navegador ejecutada

Workflow GitHub Actions: [run 45348814252](https://github.com/fdoahch-glitch/huellasvr/actions/runs/45348814252) — **success**.

- Chromium headless con WebGL2/SwiftShader en Ubuntu 24.04.
- Los cinco mundos cargaron correctamente en perfil `baja`.
- Se comprobó que cada mundo expone mallas, texturas y manada de dinosaurios.
- Se confirmó que Havok Physics V2, el controlador cápsula y al menos un colisionador estático se inicializan.
- Se reprodujeron `Idle`, `Walk`, `Run` y `Neck_Look` en una instancia por mundo; el test comprobó desplazamiento durante `Walk` y `Run` cuando había una ruta válida.
- La auditoría estática de Node.js también terminó correctamente.

**Límite:** la prueba no demuestra que cada instancia de cada manada esté libre de deslizamiento, que las patas se apoyen visualmente, ni que el personaje resuelva impactos/escalones en todos los objetos. Tampoco valida WebXR en visor ni rendimiento de hardware físico.

## Cambios que requieren validación después del commit

| Prueba | Resultado |
|---|---|
| Sintaxis del motor modificado | Aprobada por CI |
| Reconocimiento de clips con sufijo | Aprobado en Chromium mediante las pruebas de animación |
| Crossfade Idle/Walk/Run/Neck_Look | Aprobado en Chromium mediante las pruebas de animación |
| Atacamatitan mirando en sentido de avance | Ángulo corregido; movimiento Walk/Run automatizado, orientación visual anatómica pendiente |
| Orientación de Arackar, Gonkoken, Stegouros y Chilesaurus | Configuración explícita; pendiente navegador |
| Montañas apoyadas sobre el terreno | Muestreo mejorado; pendiente capturas de los cinco mundos |
| Carga de los cinco panoramas y texturas | Pendiente navegador |
| Havok / gravedad / colisiones | Havok y controlador inicializados en Chromium; respuesta de colisión/pendientes pendiente |
| WebXR immersive-vr en visor | No probado; requiere hardware compatible |
| Android y PC a 60 FPS | No probado; requiere hardware y benchmark |

## Limitaciones de esta ejecución

Se ejecutó Chromium headless con WebGL2/SwiftShader y se cargaron los cinco mundos. No se dispone de Android/PC físico ni de visor VR conectado. Por ello no se reportan pruebas WebXR inmersivas, estabilidad térmica ni rendimiento de GPU física. Los FPS de CI son métricas de software rendering y no benchmarks de dispositivo. La auditoría estática existente no reemplaza esas pruebas.

## Siguiente puerta de calidad

1. Ejecutar el workflow de auditoría y corregir cualquier error de sintaxis.
2. Añadir pruebas de navegador con Chromium/WebGL para cargar los cinco mundos.
3. Registrar fallos de consola y capturas por mundo.
4. Añadir verificaciones de estado de clips y orientación en tiempo de ejecución.
5. Ejecutar pruebas físicas y WebXR en hardware compatible.
