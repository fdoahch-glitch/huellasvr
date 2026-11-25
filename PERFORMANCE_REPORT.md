# Informe de rendimiento — Huellas VR

**Estado: instrumentación implementada; rendimiento físico no certificado.**

## Perfil vigente
El único perfil público es **Equilibrado**. No existen opciones ALTA/MEDIA/BAJA ni parámetros URL para alternarlas. En js/main.js, `quality='media'` es un identificador interno heredado por compatibilidad; la etiqueta visible es `Equilibrado`.

Parámetros principales centralizados:
- Sombras 1024; blur 10.
- Anisotropía 8; bloom 0.055; muestras 2.
- Partículas 360.
- Resolución dinámica inicial 1.0, mínimo 0.88, máximo 1.12.
- Vegetación 90%; IBL y texturas con presupuesto moderado.

## Diagnóstico disponible
`window.__HUELLAS_VR_DIAGNOSTICS__()` y `?debug=1` exponen, según soporte del navegador: FPS, mallas, texturas, partículas, CPU del bloque de actualización JS, draw calls, frame/render/física, tiempo GPU cuando existe extensión, heap JS, resolución, WebGL, Havok y WebXR. El tiempo JS no es el tiempo total de CPU. VRAM no tiene contador universal fiable.

## Evidencia y límites
La auditoría estática y la carga funcional de los cinco mundos pasaron en la ejecución CI consultada. Chromium puede usar SwiftShader: sus FPS son renderizado software y no representan Android/PC con GPU física. La prueba de rendimiento omite la certificación si no identifica una GPU física.

## Pendiente
1. Android real: FPS sostenidos, frame-time p95/p99, CPU, memoria y temperatura.
2. PC real: mismas métricas, GPU, navegador y resolución registrados.
3. Arranque y memoria tras cambiar repetidamente entre mundos.
4. Coste de sombras, vegetación y draw calls en dispositivos modestos.

**Objetivo de diseño: 60 FPS; no se declara alcanzado sin medición en hardware físico.** Si el perfil único no sostiene el objetivo, optimizar su coste sin reintroducir selectores de calidad.
