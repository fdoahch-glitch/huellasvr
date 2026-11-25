# Informe de pruebas — Huellas VR

**Estado: validación automatizada en Chromium/WebGL2.** La suite principal no depende de que el usuario conecte un teléfono, PC o visor físico.

## Suite automática que bloquea la validación
- `tests/audit-v19-parity.mjs`: sintaxis, recursos, Babylon/WebGL2, modelos, animaciones y perfil único Equilibrado.
- `tests/browser-smoke.mjs`: arranque real de los cinco mundos, errores del navegador, escena, colisiones, manadas, LOD, controles panorámicos/estereoscópicos y capturas.
- `HUELLAS_VISUAL_TEST=1 node tests/browser-smoke.mjs`: texturas, terreno PBR, cielo, iluminación y elementos visuales de los cinco mundos.
- `tests/stability-smoke.mjs`: diez cargas secuenciales (cinco mundos dos veces), errores, heap JS después de GC y disponibilidad de API WebXR en el navegador de CI.

Ejecutar toda la suite automatizada con `npm test`.

## Pruebas fuera de la suite
No se exige ninguna acción física del usuario para completar la validación automática. Las pruebas en teléfono Android, PC con GPU dedicada o visor XR quedan como comprobaciones opcionales de aceptación en hardware real, posteriores a la validación automatizada. No bloquean CI ni el cierre de esta fase.

La prueba de rendimiento con GPU identificable se conserva como herramienta opcional: `npm run test:hardware:optional`. En CI, Chromium puede usar SwiftShader; sus FPS no se presentan como rendimiento de GPU física. La compatibilidad de API WebXR tampoco se confunde con una sesión real de visor.

## Capturas
El workflow guarda las capturas PNG generadas en `test-results/` como artefacto descargable `huellasvr-browser-world-screenshots`, con una imagen por mundo y ejecución cuando el arranque alcanza la etapa de captura.

## Estado de ejecución
Consultar el run más reciente de GitHub Actions para el resultado real del commit actual. No se declara una prueba aprobada mientras su paso correspondiente no haya concluido correctamente.
