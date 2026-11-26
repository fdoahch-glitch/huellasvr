# HUELLAS VR — Seguimiento maestro de etapas

Actualizado: 25 de noviembre de 2026.

- [x] **Etapa 1. Investigación paleontológica de las cinco especies.** Documento guardado y verificado en GitHub.
- [x] **Etapa 2. Diseño y planificación de los cinco mundos.** Documento guardado y verificado en GitHub.
- [x] **Etapa 3. Diseño de interfaz y experiencia de usuario.** Documento guardado y verificado en GitHub.
- [x] **Etapa 4. Arquitectura técnica Babylon.js + WebGL2.** Documento guardado y verificado en GitHub.
- [x] **Etapa 5. Construcción de los cinco mundos 3D.** Cinco escenarios procedurales, terreno y agua ajustados al relieve, vegetación diferenciada, selector, cámara, puntos de interés y ciclo de liberación. Validación aprobada: GitHub Actions `45683579024` (SUCCESS), `npm ci`, TypeScript, nueve pruebas unitarias, Chromium/WebGL2 en los cinco mundos, viewport móvil emulado, capturas visuales y build de producción. Pruebas en hardware físico y rendimiento quedan para las etapas 7–9.
- [x] **Etapa 6. Integración de dinosaurios GLB y animaciones.** Cinco GLB originales incorporados y verificados byte a byte; cada especie carga en su mundo correcto con esqueleto, clips `Idle`, `Walk`, `Run` y `Neck_Look` (Chilesaurus conserva además `Run_Dino`). Escalas normalizadas, apoyo sobre el relieve, cámara reencuadrada y controles de animación adaptados a móvil/PC. Validación aprobada: GitHub Actions `45687524561` (SUCCESS), `npm ci`, TypeScript, 12 pruebas unitarias, 2 pruebas E2E en Chromium/WebGL2 (cinco mundos, 20 cambios de animación y comprobación de solapamiento móvil), capturas y build de producción.
- [ ] **Etapa 7. Realidad virtual y controles móviles y PC.** Implementación integrada y guardada en `src/controls/WorldControls.ts`: PC con WASD/flechas y respuesta inmediata más movimiento continuo; canvas enfocable por teclado; móvil con cruceta, zoom continuo y controles por puntero; WebXR `immersive-vr` con `local-floor`, mandos XR, superficie de teletransporte y retorno 3D seguro cuando el dispositivo no ofrece WebXR. La salida libera listeners, intervalos, observadores, cámara y experiencia XR. Se añadió una sonda de cámara exclusiva de desarrollo para comprobar movimiento real sin incluirla en producción. **Validación automatizada aprobada:** GitHub Actions `45734886834` (Huellas VR validation, SUCCESS) y `45734886857` (HUELLAS VR quality, SUCCESS), commit `83f5f74261a6f2dbfa93e655b27bc610dfb2a62d`; TypeScript, 16 pruebas unitarias, 3 pruebas E2E Chromium/WebGL2 (cinco mundos, 20 cambios de animación, sincronía accesible de botones, movimiento real de cámara con teclado, zoom táctil móvil, HUD móvil y fallback WebXR) y build de producción aprobados. Se corrigió además el foco de teclado para que los botones de interfaz no secuestren la navegación y el canvas pueda recibir foco. **Única comprobación externa pendiente para cerrar el criterio de hardware:** probar con un visor WebXR físico compatible la entrada/salida de sesión, mandos y teletransporte. CI no puede certificar esa experiencia física; no se declara probada ni se marca cerrada hasta realizarla.
- [ ] **Etapa 8. Optimización global.**
- [ ] **Etapa 9. Pruebas integrales y corrección de errores.**
- [ ] **Etapa 10. Publicación e integración en atrapacuentos.cl.**

## Regla de avance

Una etapa solo se marca completa cuando sus entregables existen en GitHub y se han comprobado los criterios que correspondan. Una implementación guardada no se presenta como prueba de compilación, compatibilidad o rendimiento.
