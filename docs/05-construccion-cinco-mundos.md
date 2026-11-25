# HUELLAS VR — Etapa 5: Construcción de los cinco mundos 3D

**Versión:** 1.0  
**Fecha:** 25 de noviembre de 2026  
**Estado:** Implementación de escenarios procedurales guardada en `main`; validación automática pendiente de ejecución/lectura de GitHub Actions.  
**Motor:** Babylon.js 9.37.1  
**Render:** WebGL2  
**Base:** documentos de las etapas 1–4.

---

## 1. Resultado y alcance

Esta etapa convierte la planificación de los cinco ambientes en módulos ejecutables de Babylon.js. La aplicación permite seleccionar cada mundo, crear su escena, explorarla con cámara orbital, seleccionar hitos ambientales y regresar al selector. La construcción se realiza con geometría 3D generada en tiempo de ejecución; no usa imágenes planas para simular el terreno.

Los cinco mundos están implementados como módulos separados que comparten herramientas de construcción, materiales y ciclo de vida. Cada uno recibe su identidad geológica, paleta, relieve, vegetación, agua y puntos de interés desde su definición de dominio.

**Límite de etapa:** no integra los dinosaurios GLB originales, rigs ni clips de animación. Tampoco declara WebXR, visor móvil, audio final, integración con Atrapacuentos o rendimiento certificado en móviles; esos trabajos tienen etapas posteriores. No se incluyen modelos de dinosaurios de sustitución.

## 2. Estructura implementada

- `src/domain/worlds.ts`: contratos, cinco definiciones de mundo, especies, paletas, ambientes, hitos y nivel de evidencia.
- `src/worlds/common/ProceduralWorld.ts`: generador compartido de terreno, relieve, estratos, rocas, vegetación, agua, marcadores y cámara.
- `src/worlds/tolar/index.ts`: módulo Tolar.
- `src/worlds/hornitos/index.ts`: módulo Hornitos.
- `src/worlds/toqui/index.ts`: módulo Toqui.
- `src/worlds/gonkoken/index.ts`: módulo Dorotea superior.
- `src/worlds/stegouros/index.ts`: módulo Dorotea inferior.
- `src/worlds/WorldFactory.ts`: selección explícita del módulo correspondiente.
- `src/main.ts`: inicialización del motor, navegación, carga y destrucción de escenas, interacción con hitos y recuperación básica.
- `src/styles.css` y `index.html`: selector adaptable y HUD HTML accesible fuera del canvas.
- `tests/worlds.test.mjs`: pruebas de integridad de las cinco definiciones y categorías de evidencia.
- `.github/workflows/quality.yml`: verificación automática de tipos, pruebas y build en GitHub Actions.

## 3. Construcción ambiental por mundo

### 3.1 Tolar — Atacamatitan chilensis

- Cuenca amplia, terreno de ondulación suave y terrazas escalonadas.
- Afloramientos y bandas de estratos rojos/ocres.
- Conglomerados y bloques dispersos.
- Vegetación discontinua y de baja densidad.
- Corredor bajo con agua estacional acotada, identificado como reconstrucción.
- Hitos: estratos rojos, terraza de conglomerados, corredor de drenaje y espacio de escala.

No se representa como desierto hiperárido moderno ni como oasis boscoso permanente.

### 3.2 Hornitos — Arackar licanantay

- Relieve de abanico y depósitos de aporte.
- Escarpes y afloramientos de roca volcánica/sedimentaria en tonos grises, ladrillo y crema.
- Cauce de grava y una depresión calcárea somera diferenciada.
- Vegetación baja y dispersa.
- Hitos: brechas, abanico, cauce, depresión calcárea y afloramiento volcánico.

No se incluyen erupciones, lava activa ni mar abierto. La incertidumbre de edad/correlación de Hornitos se conserva en la ficha y no se resuelve artificialmente en el escenario.

### 3.3 Toqui — Chilesaurus diegosuarezi

- Relieve austral volcaniclástico con ondulación y escarpes.
- Terrazas y depósitos de aspecto tobáceo.
- Vegetación baja tipo helecho como reconstrucción genérica, sin atribuir taxones locales no demostrados.
- Lámina de agua somera moderada.
- Hitos: umbral volcánico, terraza de tobas, orilla somera y plataforma de observación.

No hay erupción activa, glaciar moderno ni selva tropical.

### 3.4 Dorotea superior — Gonkoken nanoi

- Planicie fluvial de relieve bajo.
- Bancos arenosos, superficies fangosas y sectores de ribera.
- Agua sinuosa segmentada, no una gran laguna uniforme.
- Vegetación mixta de mayor densidad, distribuida en mosaico.
- Hitos: planicie fluvial, banco arenoso, lentes carbonosos y meandro.

La escena no copia un bosque moderno ni atribuye cada planta regional a la capa del fósil.

### 3.5 Dorotea inferior — Stegouros elengassen

- Canal sinuoso con barras y terrazas.
- Cortes de estratos que contrastan arenisca y lutita.
- Vegetación ribereña discontinua.
- Agua de canal separada en segmentos y superficies de barra.
- Hitos: canal, barra arenosa, corte de estratos y terraza fluvial.

No se construye un pantano profundo dominante ni se reutiliza el diseño de Dorotea superior.

## 4. Interacción y ciclo de vida

1. El usuario selecciona una tarjeta de mundo.
2. Se inicializa Babylon.js y se comprueba que el motor haya creado contexto WebGL2.
3. Se crea una escena del mundo seleccionado; no se cargan los otros cuatro escenarios.
4. La cámara permite orbitar y acercar/alejar.
5. Los marcadores dorados son seleccionables y actualizan el panel de información.
6. Cada punto muestra si el contenido se clasifica como evidencia, interpretación científica o reconstrucción artística.
7. Al volver al selector, se retiran observadores y se destruye la escena activa.
8. Al abandonar la página, se destruyen escena y motor y se retiran listeners.

## 5. Calidad, rendimiento y límites técnicos

- Terreno generado como malla con normales calculadas.
- Materiales compartidos dentro de cada escena.
- Un motor y una escena activa; no se retienen cinco mundos simultáneos.
- Geometría y densidad ambiental moderadas para una primera implementación.
- Resolución adaptada mediante el escalado del motor.
- Canvas con controles táctiles y cámara orbital.
- UI en HTML/CSS, no dibujada en el canvas.

La escena aún no cuenta con LOD avanzado, instancing de toda la vegetación/rocas, sombras de calidad por distancia, perfiles de dispositivo, medición de memoria ni benchmark en Android/PC. No se afirma un objetivo de FPS alcanzado. Estas optimizaciones y las pruebas de hardware deben completarse en Etapas 8 y 9.

## 6. Pruebas y criterios de aceptación

Se añadió una suite automatizada que comprueba:
- existencia de los cinco identificadores de mundo;
- vinculación de las cinco especies;
- presencia de las tres categorías de evidencia.

Se añadió workflow de GitHub Actions que ejecuta:
- instalación de dependencias;
- TypeScript;
- pruebas unitarias;
- build de producción.

**Estado de validación:** el código y el workflow están guardados en GitHub. Hasta que GitHub Actions reporte un resultado satisfactorio, no se debe interpretar la existencia del workflow como prueba de compilación correcta. Tampoco se ha ejecutado una prueba visual en navegador o dispositivo desde esta sesión.

## 7. Criterios de cierre de la Etapa 5

- [x] Los cinco mundos tienen módulos de construcción reales, no carpetas vacías.
- [x] Cada mundo tiene identidad ambiental diferenciada y puntos de interés.
- [x] Se mantiene la distinción entre evidencia, interpretación y reconstrucción.
- [x] Selector de mundos y entrada/salida de escena implementados.
- [x] La escena activa se libera al salir.
- [x] Los dinosaurios GLB no se sustituyen por modelos inventados.
- [x] Pruebas de integridad y workflow de compilación añadidos.
- [ ] Confirmar resultado verde de GitHub Actions.
- [ ] Ejecutar inspección visual en navegador y prueba real en Android/PC.
- [ ] Integrar los modelos GLB originales (Etapa 6, no incluida aquí).

La implementación de los escenarios está realizada y versionada. La validación automática y de dispositivos permanece explícitamente pendiente; el cierre de la etapa no equivale a certificación visual o de rendimiento.
