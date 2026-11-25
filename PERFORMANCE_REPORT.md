# Informe de rendimiento — Huellas VR

**Estado: perfil Equilibrado e instrumentación implementados; rendimiento físico no certificado por CI.**

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

## Validación automatizada
La suite principal usa Chromium/WebGL2 y verifica carga de los cinco mundos, errores, escena, estabilidad de memoria, recursos y capturas. El renderizador de CI puede ser SwiftShader: sus FPS son renderizado software y no representan Android/PC con GPU física.

## Comprobación física opcional
La medición en hardware real no forma parte de la suite obligatoria ni requiere que el usuario la ejecute para cerrar la validación automática. Se conserva como comprobación posterior opcional mediante `npm run test:hardware:optional` en un equipo con GPU identificable.

**Objetivo de diseño: 60 FPS; no se declara alcanzado sin medición representativa en hardware físico.** Si el perfil único no sostiene el objetivo, optimizar su coste sin reintroducir selectores de calidad.
