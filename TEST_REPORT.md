# Informe de pruebas — Huellas VR

**Estado: validación continua. Consultar Actions para el resultado vigente.**

## Suite
- `tests/audit-v19-parity.mjs`: sintaxis, recursos, Babylon/WebGL2 y perfil único Equilibrado.
- `tests/browser-smoke.mjs`: carga funcional de los cinco mundos, errores de navegador y pruebas de clips/desplazamiento.
- `tests/stability-smoke.mjs`: navegación repetida, estado, memoria y disponibilidad WebXR en el navegador CI.
- `tests/performance-smoke.mjs`: mide solo con GPU física verificable; no certifica SwiftShader.

## Ejecución registrada
Workflow [45538954853](https://github.com/fdoahch-glitch/huellasvr/actions/runs/45538954853), commit probado entonces `49f419f83a02f47ddfab0009e6927d541f4934cb`.
En la última consulta: auditoría estática y carga funcional de los cinco mundos completadas correctamente; prueba visual en ejecución; estabilidad, medición física y capturas aún pendientes. Consultar el enlace para el resultado posterior.

## Límites
Chromium/SwiftShader no representa GPU Android/PC. La detección de API WebXR no equivale a sesión real. Inicializar Havok no prueba todas las colisiones. Las pruebas automáticas no sustituyen inspección de capturas ni pruebas táctiles/sensoriales en teléfono.

## Pruebas físicas pendientes
Android: sensores, controles, rendimiento sostenido, memoria y temperatura.
PC: controles y rendimiento con GPU identificada.
Visor compatible: tracking, locomoción, entrada/salida WebXR y estabilidad.
