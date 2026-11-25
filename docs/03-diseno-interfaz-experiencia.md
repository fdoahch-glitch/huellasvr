# HUELLAS VR — Etapa 3: Diseño de interfaz y experiencia de usuario

**Versión:** 1.0  
**Fecha:** 25 de noviembre de 2026  
**Estado:** Etapa cerrada — especificación funcional de UX/UI lista para arquitectura e implementación  
**Proyecto:** HUELLAS VR  
**Motor previsto:** Babylon.js + WebGL2  
**Destino web:** módulo autónomo integrable en `https://atrapacuentos.cl/huellas-vr/`  
**Documentos base:** `docs/01-investigacion-paleontologica.md` y `docs/02-planificacion-cinco-mundos.md`

---

## 1. Objetivo y alcance

Definir la experiencia completa desde que una persona abre HUELLAS VR hasta que entra a un mundo, explora, consulta información, cambia de dinosaurio o sale. La especificación cubre estructura de navegación, pantallas, componentes, estados, comportamiento, adaptación a Android/PC/VR, accesibilidad, errores y criterios verificables.

Esta etapa define **qué debe ver y cómo debe comportarse la interfaz**. No construye todavía los mundos 3D, no integra los modelos GLB, no implementa WebXR ni decide detalles internos de código: esos trabajos pertenecen a las etapas posteriores.

### Objetivos de experiencia

1. Que un niño pueda comenzar a explorar con pocos pasos y sin necesitar instrucciones de un adulto.
2. Presentar claramente los cinco dinosaurios chilenos y distinguir sus cinco mundos.
3. Mantener una interfaz atractiva, legible y consistente en pantallas pequeñas, PC y visor VR.
4. No bloquear la exploración con ventanas, textos o controles persistentes innecesarios.
5. Hacer comprensible qué es evidencia paleontológica y qué es reconstrucción artística.
6. Permitir regresar, cambiar de mundo, pausar y salir sin perder orientación.
7. Evitar que el usuario dependa de controles táctiles inaccesibles cuando el teléfono está dentro de un visor VR.

## 2. Usuarios, dispositivos y principios

### 2.1 Usuarios principales

- **Niños y niñas:** público principal; necesitan botones grandes, iconografía reconocible, lenguaje sencillo y retroalimentación clara.
- **Familias y docentes:** acompañan la experiencia y pueden consultar información ampliada.
- **Usuarios VR:** necesitan navegación estable, controles accesibles y comodidad visual.

No se presupone que el usuario sepa qué es WebXR, cómo funciona un visor o cómo se usa un control de juego.

### 2.2 Dispositivos y modos

| Modo | Entrada principal | Presentación |
|---|---|---|
| Android sin visor | Táctil; orientación del dispositivo cuando corresponda | Interfaz adaptable, vista 3D en pantalla |
| Android dentro de visor móvil | Mirada y selección por permanencia; botón físico del visor si está disponible | Vista estereoscópica; controles flotantes legibles y simples |
| PC | Ratón y teclado | Interfaz de escritorio; vista 3D y paneles |
| Visor VR compatible con WebXR | Controladores VR si existen; mirada como alternativa | Interfaz espacial dentro de la escena |

La disponibilidad real de WebXR, sensores, orientación y mandos se debe detectar en ejecución. La interfaz no debe prometer una función que el navegador o dispositivo no soporte.

### 2.3 Principios obligatorios

- **Primero la exploración:** la interfaz acompaña al mundo; no lo tapa.
- **Una acción principal por pantalla:** evitar competir con varios botones de igual jerarquía.
- **Siempre hay salida:** el usuario puede volver al inicio o al menú de pausa.
- **Consistencia:** el mismo icono y nombre conservan el mismo significado.
- **Legibilidad:** contraste alto, texto breve, tipografía clara y tamaño adaptable.
- **Tacto cómodo:** objetivos táctiles grandes y separados.
- **VR cómodo:** evitar paneles pegados a la cámara, movimientos forzados y texto pequeño.
- **Carga honesta:** indicar qué se está preparando y permitir recuperarse de un fallo.
- **Ciencia transparente:** separar datos confirmados, interpretaciones y decisiones artísticas.
- **Sin dependencia de red innecesaria:** la interfaz debe explicar con claridad cuándo un recurso local no está disponible.

## 3. Arquitectura de información

La navegación principal se organiza así:

1. **Inicio**
   - Comenzar
   - Explorar dinosaurios
   - Acerca de HUELLAS VR
   - Ayuda y controles
2. **Selección de dinosaurio**
   - Cinco fichas, una por especie
   - Resumen y acceso a su mundo
3. **Presentación del mundo**
   - Nombre del dinosaurio y del contexto geológico
   - Breve introducción
   - Botón para entrar
4. **Exploración 3D**
   - Ayuda contextual
   - Puntos de interés
   - Ficha del dinosaurio
   - Pausa
5. **Pausa**
   - Continuar
   - Ayuda y controles
   - Cambiar de mundo
   - Volver al inicio
6. **Información / Bitácora**
   - Datos del dinosaurio
   - Evidencia fósil y contexto
   - Qué es evidencia y qué es reconstrucción
7. **Ayuda y ajustes**
   - Método de interacción
   - Audio y volumen
   - Calidad/rendimiento cuando exista implementación
   - Recentrar vista VR cuando sea compatible

La navegación no debe crear callejones sin salida. Desde selección, presentación, exploración y pausa debe existir una ruta clara de regreso.

## 4. Flujo principal del usuario

### 4.1 Primer ingreso

`Carga inicial → Inicio → Seleccionar dinosaurio → Presentación del mundo → Preparar mundo → Explorar`

- La pantalla de inicio aparece primero; no se debe iniciar automáticamente una exploración ni cargar los cinco mundos completos en segundo plano.
- Se muestran cinco opciones identificables por nombre y representación visual.
- La persona puede abrir una ficha antes de entrar.
- Al confirmar, se prepara únicamente el mundo seleccionado y sus recursos necesarios.
- La carga presenta progreso o etapas comprensibles, sin porcentajes falsos.
- Si la carga falla, se ofrece reintentar y volver a selección.

### 4.2 Usuario que vuelve

No se exige cuenta ni inicio de sesión para explorar. Si el navegador conserva una preferencia local (por ejemplo, volumen o modo de control), se puede recuperar de forma no invasiva. No se debe bloquear el acceso si el almacenamiento local está deshabilitado.

### 4.3 Cambio de mundo

`Exploración → Pausa → Cambiar de mundo → Selección → Presentación → Preparar mundo`

Antes de abandonar, se informa de forma breve que se saldrá del mundo actual. No se debe reiniciar la aplicación ni recargar la página para cambiar de dinosaurio.

### 4.4 Salida

El botón Inicio vuelve a la pantalla principal. Si se está explorando, primero se abre la pausa/confirmación para evitar una salida accidental.

## 5. Especificación de pantallas

### 5.1 Pantalla de inicio

**Propósito:** presentar la identidad de HUELLAS VR y permitir comenzar inmediatamente.

Elementos:
- Logotipo/título HUELLAS VR.
- Imagen o composición visual representativa de dinosaurios chilenos.
- Acción primaria **Explorar**.
- Accesos secundarios **Dinosaurios**, **Ayuda** y **Acerca de**.
- Indicador discreto de compatibilidad o estado de VR cuando sea relevante.

Comportamiento:
- La acción primaria conduce a la selección de dinosaurio.
- No inicia una sesión VR automáticamente.
- No carga todos los escenarios al abrir.
- La ayuda explica brevemente cómo comenzar.
- El menú no debe cubrir la composición principal ni presentar información técnica extensa.

### 5.2 Selección de dinosaurio

Mostrar cinco fichas equivalentes en jerarquía, sin ocultar ninguna especie:

| Dinosaurio | Identidad del mundo | Contexto breve |
|---|---|---|
| Atacamatitan chilensis | Tolar, norte de Chile | Paisaje continental de estratos rojos, brechas y areniscas |
| Arackar licanantay | Hornitos | Cuenca continental volcano-sedimentaria |
| Chilesaurus diegosuarezi | Toqui, Aysén | Paisaje jurásico austral de cuenca volcano-sedimentaria |
| Gonkoken nanoi | Dorotea superior | Mosaico fluvial austral del Maastrichtiano temprano |
| Stegouros elengassen | Dorotea inferior | Canal fluvial y barras arenosas |

Cada ficha contiene:
- Nombre científico completo, con salto de línea si es necesario.
- Imagen/representación del dinosaurio.
- Identidad breve del mundo.
- Acción **Ver ficha** y acción clara **Explorar este mundo** (o selección de ficha seguida de continuar).

Reglas:
- No usar una misma imagen genérica para las cinco especies.
- No intercambiar nombres, modelos o mundos.
- Mantener las cinco fichas disponibles; no bloquear especies mediante progreso, monedas o cuenta.
- En móvil, usar tarjetas en columna o carrusel con indicador visible de posición; no reducirlas hasta volver ilegibles.
- En PC, se permite una cuadrícula de cinco fichas adaptable.
- En VR, presentar las fichas en un arco/semicírculo dentro del campo cómodo de visión, con selección por mirada y confirmación.

### 5.3 Ficha del dinosaurio / Bitácora

Contenido mínimo:
- Nombre científico.
- Nombre común, solo si existe y está validado.
- Ubicación y unidad geológica.
- Edad geológica expresada de forma comprensible, con cautelas cuando exista incertidumbre.
- Rasgos anatómicos respaldados.
- Qué se conoce por fósiles.
- Qué aspectos son reconstrucción artística.
- Acción para entrar a su mundo.

La ficha no debe inventar dieta, conducta, color, sonidos, plantas asociadas ni datos anatómicos. Debe respetar las advertencias de la Etapa 1. En particular:
- No asignar al fósil de Arackar una edad radiométrica de niveles volcánicos cercanos como si fuera su datación directa.
- No presentar como comprobada una facies local de Chilesaurus que no haya sido demostrada para el yacimiento.
- No asumir que Gonkoken y Stegouros compartieron exactamente el mismo hábitat por pertenecer a la Formación Dorotea.
- Mantener la anatomía de la cola de Stegouros como estructura frondiforme aplanada, no como maza esférica.

### 5.4 Presentación del mundo

Antes de cargar:
- Nombre del dinosaurio.
- Nombre/contexto del mundo.
- Una frase de ambientación breve.
- Acción **Entrar al mundo**.
- Acción secundaria **Volver a dinosaurios**.

No mostrar largos textos ni obligar a leer una explicación para entrar.

### 5.5 Carga del mundo

Estados visibles:
1. Preparando experiencia.
2. Cargando escenario.
3. Preparando dinosaurio y recursos.
4. Listo para explorar.

Reglas:
- El progreso numérico solo se muestra si puede medirse de forma real.
- Si no existe porcentaje fiable, usar etapas y animación de actividad.
- Evitar pantallas congeladas sin explicación.
- Si el proceso supera el tiempo esperado, mostrar que continúa y ofrecer reintentar/cancelar cuando sea seguro.
- No iniciar controles de exploración hasta que cámara, mundo y dinosaurio estén listos.
- No descargar ni inicializar todos los mundos por adelantado.

### 5.6 Interfaz durante la exploración

La escena es protagonista. La interfaz en pantalla se limita a:
- Botón **Pausa**.
- Ayuda contextual breve al entrar por primera vez.
- Indicador de interacción al apuntar a un objeto interactivo.
- Panel informativo que aparece solo al seleccionar un punto de interés.
- Acción **Bitácora** para consultar datos del dinosaurio.

No mantener menús abiertos por defecto. Los paneles se pueden cerrar de manera evidente y nunca deben impedir recuperar el control de la experiencia.

### 5.7 Puntos de interés

Al acercarse o seleccionar:
- Nombre del elemento.
- Descripción breve.
- Tipo de información: evidencia, interpretación o reconstrucción artística.
- Acción cerrar/volver a explorar.

La selección no debe activar desplazamiento automático ni teletransportar al usuario sin solicitud expresa. Los elementos interactivos deben distinguirse visualmente sin convertir el paisaje completo en una colección de botones.

### 5.8 Pausa

Opciones:
- **Continuar** (acción principal).
- **Ayuda y controles**.
- **Cambiar de mundo**.
- **Volver al inicio**.

El panel debe poder cerrarse siempre. Abrir pausa detiene o suspende las interacciones de exploración de forma coherente, sin dejar animaciones de control o entradas activas accidentalmente.

### 5.9 Ayuda y controles

Explicar con imágenes/iconos y pocas palabras:
- Android táctil: tocar, arrastrar, seleccionar.
- Visor móvil: mirar al elemento y confirmar mediante permanencia o botón físico compatible.
- PC: ratón/teclado.
- VR con mandos: apuntar y confirmar mediante controlador, si se detecta.
- Cómo abrir/cerrar información, pausar y volver.

Mostrar únicamente el esquema de entrada detectado o permitir cambiarlo si el dispositivo lo admite. Nunca asumir que todos los visores móviles tienen el mismo botón físico.

### 5.10 Acerca de HUELLAS VR

Incluye propósito educativo, procedencia chilena del proyecto, créditos y aviso de reconstrucción científica/artística. Los créditos y fuentes deben poder ampliarse sin ocupar la pantalla de exploración.

## 6. Comportamiento por dispositivo

### 6.1 Android sin visor

- Diseño mobile-first.
- Botones táctiles grandes, separados y con texto/icono.
- Orientación vertical para menús; la experiencia 3D puede adaptar el encuadre a vertical u horizontal.
- No depender de hover.
- Evitar texto superpuesto a zonas de interacción.
- Solicitar sensores/permisos solo cuando sean necesarios y explicar para qué.
- Si el giroscopio no está disponible o se deniega, ofrecer control táctil alternativo.

### 6.2 Android dentro de visor móvil

- Detectar capacidades del navegador antes de ofrecer entrada VR.
- Mantener una interfaz de selección simple antes de colocar el teléfono en el visor.
- En modo estereoscópico, texto corto, alto contraste y tamaño legible a distancia.
- Elementos interactivos dentro de una zona cómoda de mirada; evitar extremos del campo visual.
- Mirada con permanencia configurable y confirmación visible (anillo/progreso) como método de respaldo.
- Evitar que la selección por mirada se dispare al pasar accidentalmente por un botón.
- No exigir teclado, ratón ni pantalla táctil una vez colocado el teléfono en el visor.
- Proporcionar una forma clara de pausar/salir mediante el mecanismo disponible en el dispositivo; no prometer un botón físico universal.
- Recentrar solo mediante acción solicitada por el usuario y si la plataforma lo permite.

### 6.3 PC

- Menús con ancho máximo de lectura y jerarquía visual clara.
- Navegación por ratón y teclado.
- Foco visible al recorrer controles con teclado.
- Atajos opcionales y documentados: Escape para pausa/cerrar panel; no interceptar teclas cuando el foco está en un campo editable.
- Soporte para ventana/redimensionamiento sin perder selección ni estado.
- Si no hay WebXR, mantener modo 3D de escritorio sin presentar un error como si la aplicación estuviera rota.

### 6.4 VR con controladores

- Paneles espaciales estables y anclados al usuario o a puntos de interfaz definidos; no adheridos de forma incómoda a la cámara.
- Objetivos de selección grandes y separados.
- Confirmación visual, auditiva opcional y respuesta al foco.
- Mirada como alternativa si no se detectan controladores.
- No depender de vibración háptica.

## 7. Sistema visual y componentes

### 7.1 Jerarquía visual

- Un título principal por pantalla.
- Una acción primaria claramente reconocible.
- Acciones secundarias con menor peso visual.
- Textos explicativos breves; información científica extensa en ficha/Bitácora.
- Iconos acompañados de texto en acciones importantes, especialmente para niños.

### 7.2 Componentes reutilizables

1. Botón primario, secundario y de retorno.
2. Tarjeta de dinosaurio.
3. Ficha informativa.
4. Etiqueta de estado/carga.
5. Panel modal y panel contextual.
6. Control de pausa.
7. Indicador de mirada/selección.
8. Aviso de error con reintento.
9. Control de volumen.
10. Indicador de modo/dispositivo.

Los componentes deben mantener tamaño, tipografía, espaciado, estados de foco y comportamiento coherentes entre pantallas.

### 7.3 Color, contraste y tipografía

La paleta debe acompañar la identidad visual de los cinco mundos sin sacrificar contraste. Los fondos de paisaje pueden ser luminosos o variados; por eso los paneles de texto necesitan superficies controladas y contraste suficiente. No colocar texto claro directamente sobre zonas claras ni texto oscuro sobre sombras/texturas impredecibles.

Requisitos:
- Contraste objetivo WCAG AA para texto normal cuando sea aplicable (4.5:1) y texto grande (3:1).
- Tipografía sans serif legible, con tamaños fluidos y límites mínimos adecuados a móvil/VR.
- No usar color como único indicador de estado.
- Estados de foco, selección, deshabilitado, carga y error claramente distinguibles.
- No usar texto largo en mayúsculas ni fuentes decorativas para información científica.

### 7.4 Movimiento y animación de interfaz

- Transiciones breves y no invasivas.
- Sin parpadeos, destellos intensos ni movimiento de paneles que simule desplazamiento de cámara.
- Respetar la preferencia de movimiento reducido cuando el navegador/sistema la exponga.
- No animar botones de forma que distraigan continuamente.
- Las animaciones no deben retrasar la respuesta a una acción.

## 8. Audio y retroalimentación

- El audio es complementario; toda información esencial también debe aparecer visualmente.
- Controles de volumen accesibles desde ayuda/ajustes y pausa.
- No reproducir audio antes de una interacción del usuario si el navegador lo bloquea.
- No atribuir vocalizaciones reales a una especie si no existe evidencia: cualquier sonido de ambientación debe identificarse como diseño sonoro, no como registro fósil.
- Los sonidos de selección/error deben ser discretos y poder silenciarse.

## 9. Estados, errores y recuperación

| Situación | Respuesta de interfaz |
|---|---|
| WebGL2 no disponible | Explicar incompatibilidad y ofrecer información de ayuda; no dejar pantalla negra |
| WebXR no disponible | Mantener modo 3D compatible y explicar que VR no está disponible en ese navegador |
| Permiso de orientación denegado | Ofrecer control alternativo y explicar cómo habilitarlo si se desea |
| GLB o textura no carga | Identificar recurso fallido, reintentar cuando proceda y evitar bloqueo infinito |
| Mundo no termina de cargar | Mostrar estado real, cancelar/volver si es seguro y ofrecer reintento |
| Pérdida de contexto WebGL | Mostrar recuperación; reconstruir recursos si es posible o permitir recargar con aviso |
| Cambio de orientación/tamaño | Recalcular interfaz y cámara sin perder el flujo |
| Sin audio o audio bloqueado | Continuar sin audio; no bloquear exploración |
| Selección accidental | Permitir cerrar/volver sin penalización |
| Almacenamiento local no disponible | Continuar con valores predeterminados |

Los mensajes deben describir el problema en lenguaje sencillo y ofrecer una acción útil. Los detalles técnicos se reservan para un panel de diagnóstico, no para el flujo infantil.

## 10. Accesibilidad, seguridad y comodidad

- Navegación por teclado en pantallas de menú.
- Foco visible y orden de tabulación lógico.
- Etiquetas accesibles para controles e iconos.
- Contraste suficiente y texto escalable.
- No depender exclusivamente de sonido, color, movimiento o precisión motora fina.
- Opción de reducir movimiento de interfaz.
- Sin temporizadores que expulsen al usuario de una pantalla educativa.
- No solicitar nombre, correo, ubicación, cámara ni otros datos personales para explorar.
- No activar cámara/micrófono sin una función explícita, permiso y explicación.
- No incluir enlaces externos en medio de la exploración que saquen accidentalmente al niño del módulo.
- Evitar teletransportes, aceleraciones o giros forzados en VR.
- Permitir descansos y salida inmediata.

## 11. Reglas de integración con Atrapacuentos

HUELLAS VR debe funcionar como módulo autónomo en `/huellas-vr/`:
- Rutas de recursos relativas a la raíz del módulo, no a la raíz del dominio.
- No modificar estilos globales, navegación, almacenamiento ni variables de Atrapacuentos.
- Encapsular estilos y nombres de componentes para evitar colisiones.
- No depender de que la página anfitriona tenga una fuente, botón o librería concreta.
- Mantener HTTPS para las funciones que lo requieran, especialmente WebXR.
- La interfaz debe poder iniciarse directamente desde su URL y no depender de una sesión previa en el sitio anfitrión.

## 12. Telemetría y privacidad

La experiencia no requiere analítica personal para funcionar. Durante desarrollo se puede habilitar un modo de diagnóstico local para medir tiempos de carga, errores de recursos, FPS y capacidades detectadas. Ese diagnóstico no debe enviar datos personales ni activarse de forma invasiva en la experiencia infantil.

Si en el futuro se propone analítica remota, deberá diseñarse y aprobarse por separado, con minimización de datos y revisión de privacidad.

## 13. Inventario de pantallas y estados para implementación

| ID | Pantalla/estado | Obligatorio |
|---|---|---|
| UI-01 | Inicio | Sí |
| UI-02 | Selección de cinco dinosaurios | Sí |
| UI-03 | Ficha/Bitácora del dinosaurio | Sí |
| UI-04 | Presentación del mundo | Sí |
| UI-05 | Preparación/carga | Sí |
| UI-06 | Exploración 3D con HUD mínimo | Sí |
| UI-07 | Panel de punto de interés | Sí |
| UI-08 | Pausa | Sí |
| UI-09 | Ayuda y controles adaptados al dispositivo | Sí |
| UI-10 | Ajustes básicos de audio/accesibilidad | Sí |
| UI-11 | Acerca de/créditos | Sí |
| UI-12 | Error y recuperación | Sí |
| UI-13 | Diagnóstico de desarrollo | Solo desarrollo |

## 14. Criterios de aceptación de la Etapa 3

La etapa se considera documentalmente completa cuando:
- [x] Están definidos los usuarios y dispositivos objetivo.
- [x] Está definida la arquitectura de información y navegación.
- [x] Está descrito el flujo de primer ingreso, exploración, cambio de mundo y salida.
- [x] Están especificadas las pantallas principales y sus acciones.
- [x] Las cinco especies y sus mundos están correctamente vinculados.
- [x] Está definida la adaptación a Android, visor móvil, PC y VR con controladores.
- [x] Están definidos los estados de carga, errores y recuperación.
- [x] Están documentados contraste, legibilidad, accesibilidad y comodidad VR.
- [x] Están especificadas las reglas de integración autónoma con Atrapacuentos.
- [x] Se han definido criterios claros para la implementación posterior.

**Límite de validación:** este cierre certifica que la especificación de UX/UI está documentada y es utilizable como entrada para la Etapa 4. No certifica que las pantallas estén implementadas, que se haya probado en teléfonos/visores reales ni que el sitio publicado haya sido validado visualmente.

## 15. Entregables y dependencias

Entregable principal: este documento.

La Etapa 4 debe traducir esta especificación en arquitectura de módulos, gestión de estados, detección de capacidades, capas de interfaz, sistema de recursos y estrategia de integración. La Etapa 5 construirá los mundos; las etapas 6 y 7 integrarán modelos, animaciones y entradas reales.

No iniciar la construcción de mundos ni marcar como implementadas pantallas por el solo hecho de que estén descritas aquí.

## 16. Acta de cierre

**Etapa 3 cerrada en alcance de diseño y documentación.** La navegación, pantallas, comportamiento por dispositivo, reglas de interfaz, accesibilidad, errores y criterios de aceptación quedan especificados. La implementación y las pruebas de funcionamiento permanecen asignadas a sus etapas correspondientes.

