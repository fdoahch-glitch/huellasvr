# Informe de implementación — Huellas VR

**Estado: migración en desarrollo; no declarada finalizada.**
Rama: `perf/ultra-60fps`. Motor: Babylon.js 9.37.2 + WebGL2 + Havok Physics V2. Perfil: uno solo, **Equilibrado**.

## Arquitectura
Experiencia web móvil/escritorio en HTTPS; cinco mundos (Atacamatitan, Arackar, Gonkoken, Stegouros y Chilesaurus). Babylon.js es el único motor 3D activo. Havok proporciona física del terreno/montañas y controlador cápsula del jugador. Las manadas usan agentes cinemáticos con evitación de obstáculos; los dinosaurios no son cuerpos Havok articulados individuales.

## Implementado
1. Orientación explícita por especie con `forwardYaw`.
2. Normalización de nombres de clips clonados, incluidos sufijos numéricos.
3. Crossfade entre animaciones.
4. Ritmo positivo de locomoción y corrección de Stegouros.
5. Muestreo mejorado para apoyar montañas sobre terreno válido.
6. Havok V2, gravedad, colisionadores estáticos de terreno/montañas y controlador cápsula.
7. Diagnóstico de orientación, animaciones, terreno, física, memoria y renderizado.
8. Perfil gráfico único Equilibrado, badge fijo y resolución dinámica.
9. Pruebas de auditoría, navegador, estabilidad y rendimiento.
10. Dependencias Babylon, cargadores y Havok empaquetadas localmente.

## Perfil gráfico
La etiqueta pública es Equilibrado. `quality='media'` se conserva únicamente como identificador interno compatible con ramas existentes del motor; no es una segunda opción seleccionable. No documentar ni utilizar `?q=alta/media/baja`.

## Validación y límites
La auditoría estática y la carga funcional de cinco mundos en Chromium/WebGL2 constan como aprobadas en la ejecución CI consultada. Verificar Actions para el estado del commit actual. Esto no acredita calidad visual completa, FPS en GPU física, respuesta total de colisiones ni sesión WebXR en visor real. SwiftShader no es benchmark de hardware.

## Pendiente
- Inspección visual de los cinco mundos: terreno, montañas, agua, sombras, panorama y vegetación.
- Orientación anatómica y locomoción de cada especie en ejecución.
- Pruebas prolongadas de separación, navegación e interacciones de manada.
- Colisiones, pendientes y movimiento en móvil/estereoscópico/WebXR.
- Benchmark Android/PC y memoria al cambiar mundos.

No convertir la presencia de una función en el código en una prueba aprobada. Solo declarar cierre con evidencia de ejecución y pruebas físicas correspondientes.
