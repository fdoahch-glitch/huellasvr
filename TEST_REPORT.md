# Informe de pruebas — Huellas VR

**Estado: pruebas de ejecución pendientes.**

## Comprobaciones de archivos realizadas

- Se consultó la rama `main` del repositorio.
- Se inspeccionaron `index.html`, `js/main.js` y `tests/audit-v19-parity.mjs`.
- Se verificó la existencia de los cinco modelos principales y LOD, panoramas, mapas de color y mapas de altura del inventario revisado.
- Se inspeccionó la estructura GLB original de Atacamatitan; el esqueleto sitúa la cabeza hacia el eje local +X.
- Se comprobó en el código que la cámara de escritorio aún tiene `applyGravity=false` y `checkCollisions=false`, y que no hay inicialización Havok en el arranque actual.

## Cambios que requieren validación después del commit

| Prueba | Resultado |
|---|---|
| Sintaxis del motor modificado | Pendiente de CI |
| Reconocimiento de clips con sufijo | Implementado en código; pendiente ejecución Babylon |
| Crossfade Idle/Walk/Run/Neck_Look | Implementado en código; pendiente visualización |
| Atacamatitan mirando en sentido de avance | Corrección aplicada; pendiente navegador |
| Orientación de Arackar, Gonkoken, Stegouros y Chilesaurus | Configuración explícita; pendiente navegador |
| Montañas apoyadas sobre el terreno | Muestreo mejorado; pendiente capturas de los cinco mundos |
| Carga de los cinco panoramas y texturas | Pendiente navegador |
| Havok / gravedad / colisiones | No implementado todavía |
| WebXR immersive-vr en visor | No probado; requiere hardware compatible |
| Android y PC a 60 FPS | No probado; requiere hardware y benchmark |

## Limitaciones de esta ejecución

No se dispone aquí de una sesión de navegador gráfico con WebGL2/WebXR ni de un visor VR conectado. Por ello no se reportan screenshots, FPS, resultados físicos ni una sesión WebXR como si hubieran sido ejecutados. La auditoría estática existente no reemplaza esas pruebas.

## Siguiente puerta de calidad

1. Ejecutar el workflow de auditoría y corregir cualquier error de sintaxis.
2. Añadir pruebas de navegador con Chromium/WebGL para cargar los cinco mundos.
3. Registrar fallos de consola y capturas por mundo.
4. Añadir verificaciones de estado de clips y orientación en tiempo de ejecución.
5. Ejecutar pruebas físicas y WebXR en hardware compatible.
