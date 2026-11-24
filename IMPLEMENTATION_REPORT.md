# Informe de implementación — Huellas VR

**Estado general: en curso. No es una declaración de finalización.**

## Cambios aplicados en esta tanda

1. **Orientación por especie:** se sustituyó el uso de una bandera genérica `flip` por el campo explícito `forwardYaw` en las cinco configuraciones. La orientación de Atacamatitan se corrigió a `-PI/2` porque el GLB inspeccionado sitúa cabeza y cuello hacia +X; el giro anterior de +PI/2 lo orientaba en sentido contrario al avance +Z. Las otras cuatro especies conservan la orientación individual equivalente a su configuración previa, ahora expresada explícitamente.
2. **Resolución de clips clonados:** se agregó `resolveDinoClip()`, que normaliza nombres y sufijos numéricos para reconocer `Idle-0`, `Walk-0`, `Run-0` y `Neck_Look-0`.
3. **Transiciones de animación:** se incorporó un crossfade de 240 ms entre el clip anterior y el nuevo, con ponderación de animatables y detención del clip anterior al terminar la transición.
4. **Ritmo de locomoción:** se retiró la inversión de velocidad del clip de Stegouros y se mantiene un ratio positivo calculado según la velocidad efectiva del individuo.
5. **Base de montañas:** el muestreo de altura para la base del anillo ahora busca puntos de terreno válidos hacia el interior antes de recurrir al nivel cero, en vez de depender directamente de una altura aproximada de celdas inválidas.
6. **Cache busting:** `index.html` referencia ahora `js/main.js?v=61`.

## Commits aplicados

- `9db1e131fb7bd00e72fbf4f0c3a05018efef6fd1` — orientación, clips y base de montañas.
- `fc5df0d8184b3beb8e7b127ee29335e9d24e8b79` — normalización de sufijos numéricos.
- `565bddd98f7865bb1b4456784dc01fe9812aa4be` — cache busting.

## Pendiente de implementación

- Restaurar la mezcla de materiales del terreno de v19, incluyendo mezcla controlada por pendiente/altura/distancia y mapas normales separados por capa.
- Validar las cinco orientaciones y afinar los perfiles de animación con reproducción real.
- Reconstruir y validar las uniones de montañas/volcanes con el terreno.
- Integrar Havok Physics V2 y controlador de personaje.
- Verificar materiales PBR/IBL, agua, audio, WebXR y liberación de recursos.
- Completar diagnóstico CPU/GPU y pruebas automatizadas de navegador.

## Estado de validación

Los commits se han escrito en GitHub. No se ha ejecutado todavía la escena en un navegador real desde este entorno, por lo que no se afirma que los errores visuales reportados estén resueltos. Los cambios deben pasar primero la validación de sintaxis/CI y luego las pruebas de ejecución descritas en `TEST_REPORT.md`.
