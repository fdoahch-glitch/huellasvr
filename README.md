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

Los escenarios actuales son reconstrucciones procedurales. Los modelos GLB originales y sus animaciones se integrarán en la Etapa 6. La compatibilidad WebXR, el rendimiento en dispositivos reales y la integración en atrapacuentos.cl se validarán en sus etapas correspondientes.

## Documentación

- Investigación paleontológica: `docs/01-investigacion-paleontologica.md`
- Diseño de mundos: `docs/02-planificacion-cinco-mundos.md`
- Diseño UX: `docs/03-diseno-interfaz-experiencia.md`
- Arquitectura: `docs/04-arquitectura-tecnica-babylon-webgl2.md`
- Construcción de mundos: `docs/05-construccion-cinco-mundos.md`
