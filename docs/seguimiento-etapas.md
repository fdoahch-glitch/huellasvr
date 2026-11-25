# HUELLAS VR — Seguimiento maestro de etapas

Actualizado: 25 de noviembre de 2026.

- [x] **Etapa 1. Investigación paleontológica de las cinco especies.** Documento guardado y verificado en GitHub.
- [x] **Etapa 2. Diseño y planificación de los cinco mundos.** Documento guardado y verificado en GitHub.
- [x] **Etapa 3. Diseño de interfaz y experiencia de usuario.** Documento guardado y verificado en GitHub.
- [x] **Etapa 4. Arquitectura técnica Babylon.js + WebGL2.** Documento guardado y verificado en GitHub.
- [x] **Etapa 5. Construcción de los cinco mundos 3D.** Cinco escenarios procedurales, terreno y agua ajustados al relieve, vegetación diferenciada, selector, cámara, puntos de interés y ciclo de liberación. Validación aprobada: GitHub Actions `45683579024` (SUCCESS), `npm ci`, TypeScript, nueve pruebas unitarias, Chromium/WebGL2 en los cinco mundos, viewport móvil emulado, capturas visuales y build de producción. Pruebas en hardware físico y rendimiento quedan para las etapas 7–9.
- [x] **Etapa 6. Integración de dinosaurios GLB y animaciones.** Cinco GLB originales incorporados y verificados byte a byte; cada especie carga en su mundo correcto con esqueleto, clips `Idle`, `Walk`, `Run` y `Neck_Look` (Chilesaurus conserva además `Run_Dino`). Escalas normalizadas, apoyo sobre el relieve, cámara reencuadrada y controles de animación adaptados a móvil/PC. Validación aprobada: GitHub Actions `45687524561` (SUCCESS), `npm ci`, TypeScript, 12 pruebas unitarias, 2 pruebas E2E en Chromium/WebGL2 (cinco mundos, 20 cambios de animación y comprobación de solapamiento móvil), capturas y build de producción.
- [ ] **Etapa 7. Realidad virtual y controles móviles y PC.** Implementación integrada en `src/controls/WorldControls.ts`: adaptador PC (WASD/flechas), cámara táctil (cruceta, zoom continuo, arrastre y gesto de zoom nativo), entrada/salida WebXR `immersive-vr` con `local-floor`, mandos XR y detección de incompatibilidad con retorno seguro a 3D. El ciclo de salida libera entradas, intervalos, observadores, cámara y experiencia XR. Se añadieron pruebas unitarias de contrato y E2E de controles en cinco mundos y HUD móvil. **Pendiente de cierre:** resultado de compilación/E2E automatizado en GitHub Actions y prueba en visor físico compatible; no se marca completa hasta verificar ambos.
- [ ] **Etapa 8. Optimización global.**
- [ ] **Etapa 9. Pruebas integrales y corrección de errores.**
- [ ] **Etapa 10. Publicación e integración en atrapacuentos.cl.**

## Regla de avance

Una etapa solo se marca completa cuando sus entregables existen en GitHub y se han comprobado los criterios que correspondan. Una implementación guardada no se presenta como prueba de compilación, compatibilidad o rendimiento.
