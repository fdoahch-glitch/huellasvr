# HUELLAS VR — Seguimiento maestro de etapas

Actualizado: 25 de noviembre de 2026.

- [x] **Etapa 1. Investigación paleontológica de las cinco especies.** Documento guardado y verificado en GitHub.
- [x] **Etapa 2. Diseño y planificación de los cinco mundos.** Documento guardado y verificado en GitHub.
- [x] **Etapa 3. Diseño de interfaz y experiencia de usuario.** Documento guardado y verificado en GitHub.
- [x] **Etapa 4. Arquitectura técnica Babylon.js + WebGL2.** Documento guardado y verificado en GitHub.
- [x] **Etapa 5. Construcción de los cinco mundos 3D.** Cinco escenarios procedurales, terreno y agua ajustados al relieve, vegetación diferenciada, selector, cámara, puntos de interés y ciclo de liberación. Validación aprobada: GitHub Actions `45683579024` (SUCCESS), `npm ci`, TypeScript, nueve pruebas unitarias, Chromium/WebGL2 en los cinco mundos, viewport móvil emulado, capturas visuales y build de producción. Pruebas en hardware físico y rendimiento quedan para las etapas 7–9.
- [x] **Etapa 6. Integración de dinosaurios GLB y animaciones.** Cinco GLB originales incorporados y verificados byte a byte; cada especie carga en su mundo correcto con esqueleto, clips `Idle`, `Walk`, `Run` y `Neck_Look` (Chilesaurus conserva además `Run_Dino`). Escalas normalizadas, apoyo sobre el relieve, cámara reencuadrada y controles de animación adaptados a móvil/PC. Validación aprobada: GitHub Actions `45687524561` (SUCCESS), `npm ci`, TypeScript, 12 pruebas unitarias, 2 pruebas E2E en Chromium/WebGL2 (cinco mundos, 20 cambios de animación y comprobación de solapamiento móvil), capturas y build de producción.
- [ ] **Etapa 7. Controles de PC, móvil y casco Cardboard desde navegador.** Alcance acordado: solo navegador en PC y celular; sin APK, ejecutable nativo ni WebXR. PC: teclado WASD/flechas y ratón. Móvil normal: controles táctiles y gestos. Casco sencillo que aloja el celular: botón «Modo casco», renderizado estereoscópico lado a lado con dos vistas y orientación mediante `DeviceOrientationEvent`; el botón permite salir y volver al modo normal. La implementación reemplaza el flujo WebXR anterior en `src/controls/WorldControls.ts`, añade el botón y las indicaciones en `index.html`/`src/main.ts`, y estilos dedicados en `src/styles.css`. Se añadió una prueba E2E para entrar/salir del modo Cardboard. **Pendiente para cerrar:** confirmar TypeScript/build y E2E de esta revisión; probar en un celular físico con HTTPS el permiso/sensor, movimiento y alineación dentro del casco; evaluar e implementar si hace falta la corrección óptica de distorsión de las lentes Cardboard. La prueba automatizada simula la disponibilidad del sensor; no sustituye la comprobación visual en el teléfono y casco reales.
- [ ] **Etapa 8. Optimización global.**
- [ ] **Etapa 9. Pruebas integrales y corrección de errores.**
- [ ] **Etapa 10. Publicación e integración en atrapacuentos.cl.**

## Regla de avance

Una etapa solo se marca completa cuando sus entregables existen en GitHub y se han comprobado los criterios que correspondan. Una implementación guardada no se presenta como prueba de compilación, compatibilidad o rendimiento.
