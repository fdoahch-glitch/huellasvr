# HUELLAS VR

Experiencia web 3D educativa sobre cinco dinosaurios chilenos. Motor Babylon.js, renderizado WebGL2 y escenarios procedurales locales.

## Desarrollo

Requisitos: Node.js 20.19+ o 22.12+ y npm.

```bash
npm ci
npm run dev
```

## Comprobaciones

```bash
npm run typecheck
npm test
npm run build
npm run preview
npm run test:e2e
```

La compilación sirve la aplicación desde archivos estáticos. Babylon.js se resuelve desde la dependencia npm y queda incorporado al bundle; no se usa CDN. `package-lock.json` fija las versiones para instalaciones reproducibles.

## Mundos construidos

- Tolar — Atacamatitan chilensis.
- Hornitos — Arackar licanantay.
- Toqui — Chilesaurus diegosuarezi.
- Dorotea superior — Gonkoken nanoi.
- Dorotea inferior — Stegouros elengassen.

### Controles y realidad virtual

- **PC:** arrastrar con ratón para orbitar, rueda para zoom y teclas WASD o flechas para mover la cámara.
- **Móvil/tablet:** arrastrar y pellizcar sobre el escenario, más cruceta táctil y botones de zoom con pulsación continua.
- **Casco Cardboard sencillo:** botón «Modo casco» con dos vistas estereoscópicas lado a lado y orientación mediante giroscopio/acelerómetro (`DeviceOrientationEvent`). No utiliza WebXR ni requiere un visor avanzado.
- **Permisos y compatibilidad:** el modo casco necesita HTTPS (o localhost), sensores disponibles y permiso del usuario cuando el navegador lo solicita. Si se deniega el permiso o no hay sensores, la exploración 3D normal sigue disponible.
- **Ciclo de vida:** al salir de un mundo se detienen entradas, intervalos táctiles, observadores y sensores; al salir del modo casco se restaura la cámara normal.

Los cinco escenarios combinan reconstrucción procedural y el modelo GLB original de su especie, con esqueleto y clips de animación integrados. Los archivos se sirven desde `public/models/` y se incluyen en el build: Atacamatitan, Arackar, Chilesaurus, Gonkoken y Stegouros. En cada mundo se puede alternar entre `Idle`, `Walk`, `Run` y `Neck_Look`; el Chilesaurus conserva además su clip original `Run_Dino`. Los modelos se normalizan de escala y se apoyan sobre el terreno propio del mundo. La comprobación automatizada cubre Chromium/WebGL2 y el flujo Cardboard simulado; la validación final en teléfonos físicos y la distorsión óptica del visor sencillo requieren pruebas en hardware.

## Documentación

- Investigación paleontológica: `docs/01-investigacion-paleontologica.md`
- Diseño de mundos: `docs/02-planificacion-cinco-mundos.md`
- Diseño UX: `docs/03-diseno-interfaz-experiencia.md`
- Arquitectura: `docs/04-arquitectura-tecnica-babylon-webgl2.md`
- Construcción de mundos: `docs/05-construccion-cinco-mundos.md`


## Integración en atrapacuentos.cl

El repositorio genera un plugin instalable para WordPress en el artefacto de GitHub Actions `huellas-vr-wordpress-plugin`. Una vez instalado y activado en WordPress, inserta la experiencia en una página con el shortcode `[huellas_vr]`. Consulta `integration/wordpress/huellas-vr/README.md` para el procedimiento completo. La publicación en producción requiere instalar el ZIP desde el administrador de WordPress.
