# Informe de rendimiento — Huellas VR

**Estado: línea base parcial; no hay benchmark de navegador/dispositivo en esta entrega.**

## Instrumentación que ya existe en el proyecto

El motor expone `window.__HUELLAS_VR_DIAGNOSTICS__()` y permite abrir el panel con `?mundo=atacamatitan&debug=1`. Actualmente registra:

- FPS reportados por Babylon Engine.
- Cantidad total y activa de mallas.
- Texturas cargadas en caché.
- Cantidad de dinosaurios.
- Cantidad de contenedores de recursos ambientales en caché.
- Sistemas de partículas.
- Tiempo CPU del bloque de actualización y promedio suavizado.
- Heap JavaScript cuando `performance.memory` está disponible.
- Estado de WebXR.

La métrica de CPU actual mide el bloque de actualización JavaScript, no el tiempo total de CPU del navegador. Babylon no expone un tiempo GPU universal en todos los navegadores; debe medirse mediante extensiones disponibles o herramientas del dispositivo. VRAM tampoco está disponible como contador fiable multiplataforma.

## Optimizaciones ya presentes que deben medirse

- Reutilización de `AssetContainer` y recursos compartidos.
- Thin Instances para grupos de bosque.
- Fusión de lotes ambientales cuando la geometría/materiales lo permiten.
- Perfiles de calidad alta/media/baja.
- Reducción escalada de partículas y vegetación.
- Pausa del render loop cuando la página queda en segundo plano.

## No medido todavía

| Métrica | Android | PC |
|---|---|---|
| FPS sostenidos por mundo | Pendiente | Pendiente |
| CPU total / actualización | Pendiente | Parcial: el panel mide solo actualización JS |
| Tiempo GPU | Pendiente | Pendiente |
| Draw calls reales | Pendiente | Pendiente |
| RAM del proceso | Pendiente | Pendiente |
| VRAM | No expuesta de forma universal | No expuesta de forma universal |
| Temperatura/estabilidad prolongada | Pendiente | Pendiente |
| Coste de WebXR | Pendiente en visor físico | Pendiente en visor físico |

## Criterio de aceptación

No se declarará 60 FPS ni mejora de rendimiento sin medir cada mundo en hardware identificado, con perfil de calidad, resolución, duración y condiciones de prueba registradas. No se reducirá arbitrariamente la calidad de los dinosaurios o terrenos para hacer pasar una prueba.
