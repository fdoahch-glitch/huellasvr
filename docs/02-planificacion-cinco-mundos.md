# HUELLAS VR — Etapa 2: Diseño y planificación de los cinco mundos
**Versión:** 1.0  
**Fecha:** 25-11-2026  
**Estado:** Etapa cerrada — especificación de diseño lista para implementación  
**Base científica:** `docs/01-investigacion-paleontologica.md`

---

## 1. Objetivo y alcance

Definir de forma completa y coherente los cinco ambientes 3D que compondrán HUELLAS VR. Este documento es la especificación de diseño para la etapa de construcción: fija identidad, geografía visual, composición espacial, elementos naturales, recorrido, puntos de interés, interacciones ambientales, restricciones, prioridades de producción y criterios de aceptación.

**Esta etapa planifica; no construye todavía los escenarios 3D ni implementa interfaz, controles o código de renderizado.** Esas tareas tienen etapas propias. La etapa 2 se considera terminada cuando el diseño de los cinco mundos es suficientemente concreto para que un equipo pueda construirlos sin tener que inventar su identidad o contradecir la investigación.

### Principios obligatorios
1. Los cinco mundos representan Chile mesozoico, no cinco biomas genéricos.
2. La geología observada en las formaciones tiene prioridad sobre clichés de videojuegos.
3. Una facies sedimentaria describe dónde se depositó el sedimento; no demuestra por sí sola todo el hábitat vital del animal.
4. La flora y fauna se muestran a nivel de certeza. Cuando no hay evidencia local, se usan formas vegetales genéricas y discretas o se omiten; nunca se rotula una planta inventada como fósil confirmado.
5. El paisaje moderno de cada región no se copia directamente al pasado.
6. La ambientación debe ser atractiva, colorida, legible y de alta calidad, sin perder credibilidad.
7. Los cinco mundos deben compartir lenguaje visual, navegación y calidad técnica, pero no repetirse en silueta, paleta, relieve ni composición.
8. Los dinosaurios son protagonistas: los elementos del entorno no deben ocultarlos, bloquearlos ni deformar su escala.

## 2. Identidad global y estructura común

### 2.1 Identidad visual
- **Estilo:** aventura paleontológica 3D estilizada-realista, con formas claras y materiales detallados; no caricatura plana ni reconstrucción fotográfica hiperrealista.
- **Color:** saturado y luminoso, con contraste natural entre suelo, vegetación, agua, cielo y fósiles. Evitar filtros grises, marrones uniformes y niebla que apague la escena.
- **Materiales:** roca estratificada, arenisca, conglomerado, toba, ceniza consolidada, barro, agua y vegetación con variación de rugosidad y color.
- **Escala:** el dinosaurio debe poder compararse con árboles, rocas, cauces y estructuras geológicas. No usar objetos de escala arbitraria.
- **Silueta:** cada mundo se reconoce a distancia por su horizonte y perfil geográfico.

### 2.2 Estructura espacial común
Cada mundo se organiza en cinco zonas conectadas, sin que parezcan cinco salas aisladas:

1. **Umbral de llegada:** vista panorámica y reconocimiento del lugar.
2. **Zona de exploración abierta:** espacio seguro para observar el paisaje y al dinosaurio.
3. **Corredor ambiental principal:** recorrido que atraviesa el rasgo geográfico dominante.
4. **Hito paleontológico/geológico:** punto de interés que explica una característica del mundo.
5. **Mirador de salida:** panorámica que resume la identidad del ambiente y permite finalizar la visita.

La distribución exacta se adapta a cada mundo. No se impondrá un camino recto si el paisaje pide un cauce, una terraza, un valle o un circuito.

### 2.3 Reglas comunes de diseño VR
- Mantener el horizonte estable y evitar movimientos de cámara automáticos bruscos.
- Evitar teletransportes, giros forzados, aceleraciones y oscilaciones de cámara como recurso obligatorio.
- Ofrecer espacios despejados para observar al animal desde varios ángulos.
- No colocar ramas, rocas, partículas ni vegetación atravesando la zona de visión del usuario.
- Los elementos interactivos deben tener escala, contraste y respuesta visual claros.
- El agua, humo, polvo y partículas serán ambientales y moderados; no deben tapar al dinosaurio ni generar ruido visual.
- Evitar caminos estrechos con paredes vegetales o rocosas demasiado próximas al rostro del usuario.
- El audio ambiental, cuando se implemente, debe reforzar el lugar sin fingir sonidos de especies cuya vocalización no se conoce.

### 2.4 Estructura de contenido compartida
Cada mundo tendrá:
- paisaje principal y horizonte;
- terreno y geología;
- vegetación según evidencia;
- agua si corresponde a la reconstrucción;
- fauna secundaria solo cuando exista respaldo o se identifique expresamente como ambientación inferida;
- dinosaurio protagonista;
- 3 a 5 hitos de observación;
- puntos de interés paleontológico;
- iluminación y atmósfera propias;
- recorrido cómodo para VR y modo móvil/escritorio;
- versión de calidad escalable sin cambiar la identidad del mundo.

## 3. Mundo 1 — ATACAMATITAN: cuenca continental de Tolar

### 3.1 Identidad
**Concepto:** paisaje continental del Cretácico Superior en la actual Región de Antofagasta, con grandes afloramientos sedimentarios rojizos y un relieve amplio de cuenca. El protagonista es el titanosaurio *Atacamatitan chilensis*.

**Sensación buscada:** amplitud, escala y calma de un paisaje antiguo. Debe sentirse norteño y geológicamente distinto, no como el desierto hiperárido moderno con un dinosaurio añadido.

### 3.2 Base geológica y certeza
- Unidad: Formación Tolar, asignada al Cretácico Superior por correlación estratigráfica.
- Litologías descritas: brechas, conglomerados y areniscas rojas estratificadas.
- El registro del dinosaurio es fragmentario; la reconstrucción completa del animal depende de comparaciones con otros titanosaurios.
- La evidencia pública consultada no permite fijar un inventario florístico del mismo nivel del holotipo ni una reconstrucción detallada de su microhábitat.
- La guía patrimonial del Consejo de Monumentos presenta el antiguo sector como una zona con árboles y ríos y menciona coníferas en la dieta; se utilizará como orientación divulgativa, no como prueba de especies vegetales concretas en el nivel fósil.

### 3.3 Composición del escenario
- **Relieve dominante:** terrazas y lomas de roca sedimentaria, taludes de conglomerado, cortes naturales que dejan ver capas rojas y pardas.
- **Plano medio:** una amplia planicie aluvial o corredor de drenaje estacional sugerido por la geomorfología; cauce visible solo como reconstrucción plausible, no como afirmación de que el sitio exacto del fósil era una ribera permanente.
- **Fondo:** cordones bajos y afloramientos escalonados que enmarcan el horizonte; evitar montañas nevadas o volcanes activos no justificados para esta localidad.
- **Suelo:** grava, bloques, arena gruesa y superficies de arenisca compactada; alternar texturas sin llenar el espacio de rocas repetidas.
- **Vegetación:** vegetación escasa a moderada, en agrupaciones discontinuas. Se pueden usar siluetas de coníferas genéricas de porte variable como recurso de reconstrucción divulgativa, pero no etiquetarlas como una especie fósil local demostrada. Añadir arbustos y plantas bajas solo como elementos de diseño inferido.
- **Agua:** posible curso o poza estacional en un sector bajo, con tamaño moderado y sin convertir todo el mundo en un oasis.
- **Cielo:** luminoso, atmósfera clara, tonos cálidos con nubes discretas. No usar tormenta de arena permanente.

### 3.4 Recorrido y puntos de interés
1. **Mirador de estratos rojos:** vista panorámica que muestra las capas y la amplitud de la cuenca.
2. **Terraza de conglomerados:** bloques de tamaños variados y matriz arenosa para explicar transporte sedimentario.
3. **Corredor de drenaje:** zona baja con vegetación agrupada y una presencia limitada de agua, identificada como reconstrucción ambiental.
4. **Punto de escala del titanosaurio:** espacio amplio donde *Atacamatitan* pueda verse completo y compararse con el paisaje.
5. **Mirador de cierre:** vista hacia los afloramientos y el horizonte.

### 3.5 Elementos que no deben aparecer
- Dunas de arena gigantes como rasgo dominante sin evidencia.
- Cactus modernos, llamas, guanacos, vizcachas u otra fauna actual representada como fauna del Cretácico.
- Selva tropical, palmeras modernas o bosque denso de especies actuales.
- Glaciares, nieve, lagos alpinos o costa marina.
- Árboles identificados con nombre científico sin fósiles locales que lo respalden.

### 3.6 Firma visual
Rojo óxido, ocre, arena cálida, grises de conglomerado y verde vegetal limitado. La silueta del mundo es una cuenca amplia de estratos escalonados y un corredor bajo.

---

## 4. Mundo 2 — ARACKAR: cuenca volcano-sedimentaria de Hornitos

### 4.1 Identidad
**Concepto:** cuenca continental del norte de Chile, con depósitos sedimentarios y volcánicos, relieve abrupto, abanicos de aporte, cauces y sectores de sedimentación fina. El protagonista es *Arackar licanantay*.

**Sensación buscada:** energía geológica antigua y diversidad de texturas. Debe distinguirse del mundo de Tolar: menos paisaje abierto de estratos rojos y más contraste entre depósitos gruesos, roca volcánica y sectores finos/lacustres.

### 4.2 Base geológica y certeza
- Unidad: Formación Hornitos, Región de Atacama.
- La unidad contiene brechas, conglomerados, areniscas, fangolitas calcáreas, calizas y niveles volcánicos; hay variación de facies dentro de la formación.
- El artículo de descripción de *Arackar* lo asigna a niveles del Cretácico Superior (Campaniano–Maastrichtiano).
- La geocronología U-Pb de Maksaev et al. (2009) plantea una controversia sobre la edad/correlación de sectores de Hornitos: edades de niveles volcánicos de alrededor de 66,9–65,2 Ma cuestionan la asignación regional tradicional. No se deben trasladar esas edades directamente al estrato fosilífero de Arackar.
- La presencia de calizas y fangolitas calcáreas permite diseñar sectores de agua tranquila/lacustre solo donde se presenten como facies posibles, no un lago permanente de todo el mapa.
- No se dispone de un inventario florístico diagnóstico asociado al holotipo.

### 4.3 Composición del escenario
- **Relieve dominante:** abanicos de sedimentos al pie de lomas volcánicas erosionadas; escarpes con brechas y conglomerados.
- **Plano medio:** cauces de grava y arena, terrazas sedimentarias y pequeñas depresiones con sedimento fino.
- **Sectores volcánicos:** afloramientos de roca volcánica y tobas expuestas; no añadir volcanes en erupción ni ríos de lava como espectáculo, porque no son rasgos demostrados del momento del animal.
- **Sectores lacustres:** una depresión con agua somera y bordes de sedimento fino puede aparecer como subzona opcional, sin dominar todo el paisaje.
- **Vegetación:** cobertura baja y dispersa, con agrupaciones en sectores protegidos y húmedos. Las especies concretas quedan abiertas; usar vegetación de diseño de morfología mesozoica genérica y no plantas modernas identificadas como fósiles.
- **Suelo:** alternancia visible entre brecha, grava, arena roja, barro calcáreo y roca volcánica.
- **Cielo:** luz norteña clara, tonos cálidos; atmósfera más contrastada que Tolar.

### 4.4 Recorrido y puntos de interés
1. **Portal de brechas:** entrada entre afloramientos gruesos que comunica la escala geológica.
2. **Abanico de sedimentos:** superficie abierta donde se distinguen depósitos de grano grueso que se abren hacia la cuenca.
3. **Cauce trenzado:** ramales de grava y bancos arenosos como interpretación de drenaje, sin exagerar el caudal.
4. **Depresión de calizas:** pequeño sector de agua somera o barro carbonatado, claramente separado del cauce principal.
5. **Mirador de roca volcánica:** punto de observación de tobas y afloramientos.
6. **Área de encuentro con Arackar:** espacio abierto y de escala suficiente para observar el saurópodo.

### 4.5 Elementos que no deben aparecer
- Volcán activo con lava, explosiones o lluvia de ceniza como evento constante.
- Bosque tropical o coníferas modernas presentadas como flora probada.
- Mar abierto o playa oceánica: no confundir esta unidad continental con el topónimo costero actual Hornitos.
- Desierto moderno vacío, con dunas como única superficie.
- Repetir el mismo cañón rojo de Tolar.

### 4.6 Firma visual
Ocre, rojo ladrillo, grises volcánicos, crema calcáreo y pequeños acentos verdes en depresiones. Silueta de abanicos aluviales y escarpes volcánico-sedimentarios.

---

## 5. Mundo 3 — CHILESAURUS: borde de cuenca volcano-sedimentaria de Toqui

### 5.1 Identidad
**Concepto:** paisaje del Jurásico Superior (Titoniense) en la zona de Mallín Grande, Región de Aysén. Un ambiente de cuenca relacionado con actividad volcánica y sedimentación, con evidencia regional de influencia marina y ambientes litorales/someros en la sucesión. El protagonista es *Chilesaurus diegosuarezi*.

**Sensación buscada:** paisaje austral antiguo, húmedo en comparación con los mundos del norte, con roca volcánica, sedimentos y agua. No debe parecer una selva tropical moderna ni un paisaje glaciar actual.

### 5.2 Base geológica y certeza
- Los fósiles se encuentran en la base de la Formación Toqui, en el área de Mallín Grande.
- Las edades U-Pb publicadas para niveles asociados se sitúan alrededor de 148–147 Ma, en el Titoniense.
- La Formación Toqui y sus correlaciones regionales comprenden asociaciones volcaniclásticas y carbonatadas, con calizas, areniscas, lutitas, tobas, coquinas y depósitos de aporte volcánico.
- Estudios de la unidad en otros sectores de la cuenca describen rampas marinas someras y asociaciones de abanicos/deltas volcaniclásticos. Esas facies no deben atribuirse automáticamente al estrato exacto de Chilesaurus.
- La tesis de Riveros Martínez (2020), centrada en Mallín Grande, es la referencia local para ajustar la secuencia y las facies del yacimiento; el escenario debe conservar una transición entre depósitos continentales/volcaniclásticos y ambientes de agua somera sin fingir que la paleogeografía está resuelta al detalle.
- No hay un inventario botánico completo y diagnóstico del nivel fósil de Chilesaurus confirmado en las fuentes revisadas.

### 5.3 Composición del escenario
- **Relieve dominante:** lomas y escarpes de origen volcánico erosionado, con depósitos sedimentarios en la base y una cuenca que se abre hacia una zona baja.
- **Plano medio:** terrazas de arenisca y niveles finos; sectores de grava volcánica, toba y sedimento carbonatado.
- **Agua:** una laguna litoral, ensenada o lámina somera en el fondo puede representar el componente de agua de la cuenca, pero su extensión y conexión deben mantenerse moderadas y sin simular un océano profundo.
- **Costa/transición:** alternar orillas blandas, bancos sedimentarios y superficies rocosas; no crear una playa tropical de arena blanca.
- **Vegetación:** más abundante que en los mundos de Tolar y Hornitos solo en zonas protegidas y húmedas. Usar helechos y formas de vegetación baja como recurso de reconstrucción genérica, no como especies locales demostradas; los árboles deben ser moderados y sin etiquetado taxonómico no probado.
- **Elementos volcánicos:** tobas, brechas volcánicas, bloques y paredes de roca. No mostrar erupción activa.
- **Cielo:** luz austral suave, nubes variables y colores verdes/azules moderados; evitar nieve permanente y estética de Patagonia actual.

### 5.4 Recorrido y puntos de interés
1. **Umbral de roca volcánica:** entrada por un corredor abierto entre afloramientos.
2. **Terraza de tobas:** muestra depósitos finos y gruesos de origen volcánico.
3. **Orilla de agua somera:** espacio amplio para contemplar la transición entre tierra y agua.
4. **Plataforma de observación:** punto de vista hacia la cuenca y las facies.
5. **Claro de Chilesaurus:** zona de observación sin vegetación que oculte el cuerpo, la cola o la cabeza.
6. **Mirador de cierre:** panorama del paisaje de cuenca austral.

### 5.5 Elementos que no deben aparecer
- Volcán en erupción con lava visible como evento principal.
- Glaciares, bosques actuales de lenga/coigüe o montañas nevadas modernas.
- Palmeras, lianas tropicales o selva lluviosa de fantasía.
- Dinosaurios marinos o fauna marina colocada junto al dinosaurio terrestre sin razón ecológica.
- Un delta específico representado como certeza absoluta antes de cotejar la columna local de la tesis.

### 5.6 Firma visual
Verdes húmedos contenidos, grises volcánicos, ocres de arenisca, tonos carbón de sedimentos finos y azul/verde de agua somera. Silueta de cuenca austral con borde volcánico y una lámina de agua al fondo.

---

## 6. Mundo 4 — GONKOKEN: planicie fluvial y deltaica de Dorotea superior

### 6.1 Identidad
**Concepto:** paisaje subantártico del Maastrichtiano temprano, en el sector de Loma Koken, El Puesto, valle del Río de las Chinas. El protagonista es *Gonkoken nanoi*.

**Sensación buscada:** un ambiente austral con vegetación más desarrollada, planicies húmedas y cursos de agua, sin convertirlo en un bosque templado moderno. Es un mundo de escala amplia, con mosaico de ambientes.

### 6.2 Base geológica y certeza
- Localidad tipo: Loma Koken, sector El Puesto, Río de las Chinas, Estancia Cerro Guido.
- Horizonte: parte superior de la Formación Dorotea; Maastrichtiano temprano, aproximadamente 71,7–70,5 Ma según el artículo original.
- El nivel portador descrito incluye fangolita arenosa parda con lentes de carbón y arenisca fina pardo-rojiza; los restos aparecen en esos niveles.
- Dorotea es una sucesión variable de areniscas, conglomerados, limolitas y fangolitas, interpretada regionalmente como fluvial, shoreface y deltaica. No todos esos ambientes están presentes en el mismo punto.
- La formación contiene macroflora, madera fósil y registros palinológicos, además de fauna marina y continental en diferentes niveles.
- La evidencia vegetal regional permite una flora más diversa que en los mundos del norte; aun así, no todas las hojas, polen y maderas corresponden necesariamente al mismo instante o al nivel de Loma Koken.

### 6.3 Composición del escenario
- **Relieve dominante:** planicie amplia con terrazas fluviales, suaves elevaciones y un cauce principal de meandros moderados.
- **Plano medio:** bancos arenosos, márgenes de barro, pequeñas lagunas o brazos abandonados y zonas de suelo con materia orgánica.
- **Vegetación:** mosaico de plantas bajas, helechos, grupos de gimnospermas y angiospermas de aspecto fósil regional. La selección final de modelos vegetales debe estar respaldada por los registros paleobotánicos del valle; no copiar sin más un bosque moderno de Nothofagus.
- **Árboles:** agrupaciones de alturas y copas diversas, con claros para mantener visibilidad y permitir la observación del dinosaurio.
- **Agua:** curso fluvial con orillas reconocibles y zonas tranquilas. No inundar todo el escenario ni usar cascadas gigantes.
- **Suelo:** arenisca fina, barro, bancos de grava, materia orgánica y lentes carbonosos visibles en puntos de exposición geológica.
- **Cielo:** luz austral, nubes y atmósfera húmeda; color luminoso, no clima oscuro o tormentoso permanente.

### 6.4 Recorrido y puntos de interés
1. **Mirador de planicie:** vista general de la llanura y su mosaico de vegetación.
2. **Bosque abierto fósil:** agrupaciones vegetales con panel interpretativo sobre hojas, polen y madera fósil.
3. **Ribera de meandro:** orilla accesible con bancos arenosos y barro.
4. **Exposición de fangolita y carbón:** sección geológica que explica el nivel portador, sin convertirla en una mina o pantano moderno.
5. **Claro de Gonkoken:** área despejada y amplia para contemplar el animal.
6. **Mirador deltaico:** panorama de la transición entre planicie y zonas de agua.

### 6.5 Elementos que no deben aparecer
- Bosque moderno de lenga, coigüe o ñirre presentado como reconstrucción literal.
- Glaciares, fiordos actuales o montañas con nieve como horizonte dominante.
- Selva tropical, lianas gigantes y flores modernas de colores imposibles.
- Fauna actual de Magallanes (guanacos, pumas, cóndores, cisnes, etc.) como fauna del Cretácico.
- Una playa marina junto al punto de Loma Koken sin justificar que se trata de otro sector/facies de la formación.

### 6.6 Firma visual
Verdes variados, tonos de hoja fósil, marrones de suelo orgánico, ocres y grises de arenisca, agua azul verdosa. Silueta de planicie fluvial con grupos de árboles y cauce serpenteante.

---

## 7. Mundo 5 — STEGOUROS: corredor de canal fluvial de Dorotea inferior

### 7.1 Identidad
**Concepto:** ambiente fluvial del Cretácico Superior en el valle del Río de las Chinas, basado en el nivel inferior de Dorotea donde se encontró *Stegouros elengassen*. El protagonista es el pequeño dinosaurio acorazado con su distintiva arma caudal.

**Sensación buscada:** un valle fluvial más estructurado y rocoso que el mundo de Gonkoken. Debe compartir la identidad austral de Dorotea, pero diferenciarse claramente por su relieve, distribución de agua, vegetación y recorrido.

### 7.2 Base geológica y certeza
- El holotipo procede de la parte inferior de la Formación Dorotea, localidad SP17, valle del Río de las Chinas.
- La descripción original de *Stegouros* documenta un esqueleto mayoritariamente completo, con una cola armada muy particular.
- El resumen tafonómico de SP17 interpreta la arenisca de grano medio que contiene la mayor parte del esqueleto como depósito de barra de canal; lutitas suprayacentes contienen restos desarticulados.
- Dorotea, en conjunto, incluye depósitos fluviales, deltaicos y de shoreface, pero el escenario inmediato debe partir del canal y barra arenosa.
- La flora fósil regional de Dorotea orienta la vegetación, pero no hay que asegurar que cada planta regional se encontraba exactamente junto al individuo de SP17.

### 7.3 Composición del escenario
- **Relieve dominante:** canal fluvial sinuoso, barras arenosas expuestas, orillas erosionadas y terrazas bajas.
- **Plano medio:** alternancia de agua, bancos de arena, grava y llanura de inundación; el canal es el rasgo principal.
- **Vegetación:** grupos discontinuos de plantas de ribera y vegetación regional de Dorotea; mantener una densidad media, con claros en la barra y el recorrido.
- **Árboles y arbustos:** agrupaciones a distancia de la zona de observación; no cerrar el camino con ramas ni hacer que el bosque tape al animal.
- **Suelo:** arenisca de grano medio, arena, grava y barro en orillas; incluir un corte geológico que permita ver la superposición de arenisca y lutita.
- **Agua:** corriente de anchura moderada, con zonas de remanso y bordes bajos; no representar rápidos peligrosos o cataratas.
- **Cielo:** atmósfera austral luminosa, ligeramente más contrastada y abierta que en Gonkoken.

### 7.4 Recorrido y puntos de interés
1. **Mirador del canal:** panorama del cauce y de las barras arenosas.
2. **Barra de arena:** zona de observación que explica el contexto de enterramiento del esqueleto.
3. **Corte de estratos:** sección visual con arenisca y lutita para explicar la secuencia sedimentaria.
4. **Llanura de inundación:** área de vegetación regional y suelo fino.
5. **Claro de Stegouros:** espacio de observación cercano, despejado y seguro.
6. **Mirador de cierre:** vista de la curva del río y las terrazas.

### 7.5 Elementos que no deben aparecer
- Maza esférica en la cola: la estructura distintiva debe ser la cola aplanada/frondiforme descrita.
- Bosque denso que impida observar su silueta baja.
- Pantano profundo como ambiente dominante.
- Glaciares, montañas nevadas modernas o fauna actual.
- Copiar exactamente el mapa de Gonkoken: aquí domina el canal y la barra, no la gran planicie deltaica.

### 7.6 Firma visual
Arenas claras, grises y marrones de canal, agua azul verdosa, verdes ribereños y taludes sedimentarios. Silueta de cauce sinuoso con bancos expuestos y terrazas.

---

## 8. Diferenciación obligatoria entre los cinco mundos

| Mundo | Forma dominante del horizonte | Terreno protagonista | Agua | Vegetación | Identidad |
|---|---|---|---|---|---|
| Atacamatitan | Cuenca amplia y estratos escalonados | Brechas, conglomerados y areniscas rojas | Drenaje bajo opcional | Escasa/discontinua, muy cautelosa | Amplitud continental norteña |
| Arackar | Abanicos y escarpes volcano-sedimentarios | Brechas, roca volcánica y depósitos finos | Cauce y posible depresión lacustre | Baja, concentrada en sectores protegidos | Energía geológica y contraste de facies |
| Chilesaurus | Cuenca austral con borde volcánico y agua al fondo | Toba, arenisca, depósitos mixtos | Agua somera/transición litoral inferida | Moderada en sectores húmedos | Cuenca jurásica volcano-sedimentaria |
| Gonkoken | Planicie fluvial amplia con vegetación | Fangolita, arenisca fina, bancos y suelos orgánicos | Meandros y brazos tranquilos | Mosaico regional relativamente diverso | Llanura austral húmeda |
| Stegouros | Valle fluvial con canal sinuoso | Barra arenosa, grava y terrazas | Canal protagonista | Ribereña discontinua | Geometría de canal y barra |

**Regla de producción:** si al poner los cinco mundos en miniaturas no se distinguen por su silueta, paleta y geografía, el diseño no está aprobado.

## 9. Fauna secundaria y vida ambiental

La fauna secundaria no se inventará para llenar el paisaje. Se aplicará esta prioridad:

1. Taxones fósiles documentados en el mismo nivel o localidad.
2. Taxones documentados en niveles próximos y compatibles de la misma unidad, identificados como fauna regional.
3. Animales de unidades contemporáneas y paleogeografía compatible, solo si existe una justificación publicada.
4. Si no hay evidencia suficiente, no se agrega fauna secundaria.

No se incluirán animales actuales de Chile por el mero hecho de vivir hoy en esa región. Tampoco se asignarán llamadas, rugidos, cantos o sonidos específicos a especies extintas sin evidencia. Los sonidos ambientales genéricos (viento, agua, insectos) podrán utilizarse como diseño sonoro, sin atribuirlos a una especie fósil concreta.

## 10. Actividades de exploración y aprendizaje

Cada mundo tendrá tres tipos de actividad, de alcance sencillo y consistente:

- **Observar:** acercarse a un punto de interés y contemplar el rasgo geológico o al dinosaurio.
- **Descubrir:** activar una ficha visual breve sobre el fósil, la roca o la evidencia ambiental.
- **Comparar:** mostrar una comparación clara entre evidencia fósil y reconstrucción artística, indicando el nivel de certeza.

No se diseñan todavía botones, menús, puntuaciones, recompensas ni pantallas: pertenecen a la etapa 3. Tampoco se define aún la implementación técnica de las interacciones.

### Fichas interpretativas por mundo
- **Atacamatitan:** qué es un titanosaurio; qué partes se encontraron; cómo se interpreta una sucesión de areniscas y conglomerados.
- **Arackar:** qué partes del esqueleto se conocen; cómo se forman brechas/conglomerados; por qué Hornitos tiene una discusión cronológica.
- **Chilesaurus:** por qué su anatomía es singular; qué significa Titoniense; cómo se relacionan volcanismo, sedimentos y agua somera.
- **Gonkoken:** qué significa hadrosauroideo no hadrosáurido; qué informa la fangolita con lentes de carbón; qué sabemos de la flora fósil regional.
- **Stegouros:** cómo era su armadura y su arma caudal; qué es una barra de canal; por qué el nivel de enterramiento no equivale a todo el hábitat.

## 11. Producción modular de escenarios

Los mundos se construirán con módulos reutilizables, pero cada mundo tendrá conjuntos propios de módulos y materiales. La reutilización no debe homogeneizar los paisajes.

### Módulos compartidos
- rocas pequeñas y medianas de escala ajustable;
- vegetación de suelo genérica sin identificación taxonómica;
- puntos de observación;
- superficies de sendero/terreno;
- elementos de escala y señalización paleontológica;
- cielo, iluminación y fondos configurables;
- materiales base de agua y suelo.

### Módulos exclusivos o especializados
- Tolar: capas sedimentarias rojas, taludes de conglomerado, terrazas y cuenca amplia.
- Hornitos: abanicos de brecha, depósitos volcánicos, calizas/fangolitas y escarpes.
- Toqui: tobas, brechas volcánicas, superficies mixtas y orilla de agua somera.
- Dorotea superior: planicie fluvial, meandros, suelos orgánicos, vegetación regional y lentes carbonosos.
- Dorotea inferior: canal, barras arenosas, terrazas, cortes de arenisca y lutita.

### Regla de rendimiento para la etapa 8
Diseñar desde el principio con repetición inteligente, instanciación, materiales compartidos, niveles de detalle y culling. No se fijan aquí presupuestos numéricos de polígonos, draw calls o memoria: deberán medirse en el hardware objetivo durante las etapas técnicas y de optimización, no inventarse en un documento de arte.

## 12. Orden recomendado de construcción posterior

La construcción de la etapa 5 seguirá el orden de los mundos en este documento, pero no se considerará que el primero está terminado hasta completar y probar su conjunto de requisitos. El orden permite validar primero los materiales sedimentarios norteños, luego el mundo volcánico de Hornitos, después el paisaje de cuenca de Toqui y finalmente los dos ambientes de Dorotea.

El hecho de que Gonkoken y Stegouros compartan formación no autoriza a reutilizar el mismo escenario: podrán compartir una biblioteca regional de materiales y vegetación con variaciones de estrato, pero tendrán mapas, composición y recorrido propios.

## 13. Lista de decisiones cerradas y asuntos que no deben reabrirse sin nueva evidencia

### Decisiones cerradas
- Son cinco mundos separados, uno por dinosaurio.
- Tolar no se representa como el desierto moderno.
- Hornitos se representa como una cuenca continental volcano-sedimentaria, no como la playa moderna de Hornitos.
- Toqui se representa como un paisaje jurásico de cuenca volcano-sedimentaria con agua somera posible, sin afirmar una facies local no demostrada.
- Gonkoken corresponde al contexto superior de Dorotea y a una planicie fluvial/deltaica regional.
- Stegouros corresponde al contexto inferior de Dorotea y su diseño parte de un canal/barra arenosa.
- Gonkoken y Stegouros no comparten un mapa idéntico.
- Las plantas sin identificación fósil local se tratan como reconstrucción artística, no como hechos.
- No se incorporan fauna moderna ni plantas modernas como fauna/flora mesozoica.
- El dinosaurio protagonista debe permanecer visible y tener espacio de observación.

### Asuntos deliberadamente abiertos
- Especies vegetales exactas para Tolar, Hornitos y Toqui, mientras no aparezca evidencia local suficiente.
- Microclima, coloración del cielo y paleta de piel de cada dinosaurio: son decisiones artísticas, no datos fósiles.
- Ubicación exacta de agua y distribución de vegetación donde la facies local no está resuelta.
- Fauna secundaria que no tenga respaldo por nivel y edad.
- Geometría definitiva del terreno, escala del mapa y duración del recorrido: se concretarán en prototipado de la etapa 5 y se validarán sin alterar la identidad acordada.

## 14. Criterios de aceptación de la Etapa 2

La etapa se considera completada cuando:
- [x] Hay una ficha de diseño independiente para cada uno de los cinco mundos.
- [x] Cada ficha especifica identidad, base geológica, relieve, suelo, agua, vegetación, atmósfera y recorrido.
- [x] Cada mundo incluye puntos de interés y una firma visual reconocible.
- [x] Se documentan elementos prohibidos o no respaldados para evitar errores de reconstrucción.
- [x] Se distingue la evidencia directa de la inferencia y de la decisión artística.
- [x] Gonkoken y Stegouros tienen composiciones diferenciadas pese a compartir la Formación Dorotea.
- [x] Se definen principios comunes de comodidad VR, observación y legibilidad.
- [x] Se especifican módulos comunes y módulos exclusivos para la futura construcción.
- [x] Se deja un orden de construcción y una lista de decisiones cerradas/abiertas.
- [x] El documento queda guardado en GitHub y se verifica su contenido.

## 15. Bibliografía y referencias principales de diseño

1. Kellner et al. (2011), descripción de *Atacamatitan chilensis*: https://pubmed.ncbi.nlm.nih.gov/21437382/
2. Rubilar-Rogers et al. (2012), registro de dinosaurios mesozoicos de Chile y descripción geológica de Tolar: https://csgutstein.wordpress.com/wp-content/uploads/2010/07/2012rubilar.pdf
3. Consejo de Monumentos Nacionales, ficha patrimonial de *Atacamatitan*: https://www.monumentos.gob.cl/sites/default/files/fauna_prehistorica_v2.pdf
4. Rubilar-Rogers et al. (2021), descripción de *Arackar licanantay*: https://www.sciencedirect.com/science/article/pii/S0195667121000495
5. Maksaev et al. (2009), geocronología U-Pb y discusión de la edad de Hornitos: https://www.scielo.cl/scielo.php?pid=S0718-71062009000200005&script=sci_arttext
6. Novas et al. (2015), descripción de *Chilesaurus diegosuarezi*: https://www.nature.com/articles/nature14307
7. Riveros Martínez (2020), tesis de estratigrafía y sedimentología de Mallín Grande: https://repositorio.unab.cl/items/c1f9f74e-c5f2-4e63-91c4-a4821d0ac1a6
8. Rivas et al. (2021), facies y estratigrafía secuencial de la Formación Toqui en el distrito El Toqui; se usa como contexto de la unidad, no como facies automática del yacimiento de Chilesaurus: https://www.sciencedirect.com/science/article/pii/S0895981121001395
9. Alarcón-Muñoz et al. (2023), descripción de *Gonkoken nanoi*, localidad y niveles de Dorotea: https://pmc.ncbi.nlm.nih.gov/articles/PMC10275600/
10. Soto-Acuña et al. (2021), descripción de *Stegouros elengassen*: https://www.nature.com/articles/s41586-021-04147-1
11. Manríquez et al. (2022), nuevos terópodos y contexto sedimentario/paleontológico de localidades de Dorotea: https://www.sciencedirect.com/science/article/abs/pii/S0895981122004497
12. Cisterna y Vogt (2015), contribución al registro palinológico del Río de las Chinas: https://investigadores.anid.cl//es/public_search/work?id=399855
13. V Simposio de Paleontología de Chile (2016), estratigrafía y paleontología de Dorotea inferior: https://www.achp.cl/manejador/resources/libro-de-resmenes-v-simposio-paleo-en-chile-1.pdf
14. Boletín del Museo Nacional de Historia Natural, contexto geológico y paleontológico de Dorotea: https://www.boletinmnhn.cl/index.php/ojs/article/download/8/8/11

---

## 16. Acta de cierre de Etapa 2

La planificación de los cinco mundos queda cerrada en su alcance de diseño. Cada mundo dispone de identidad propia, base geológica, composición espacial, vegetación/agua con niveles de certeza, recorrido, puntos de interés, restricciones, firma visual y lineamientos de producción. Las incertidumbres científicas se han convertido en límites explícitos de diseño, no en tareas pendientes para improvisar durante la construcción.

**Resultado:** documento de diseño aprobado como referencia de la futura construcción. La etapa siguiente del plan general es la Etapa 3 — diseño de interfaz y experiencia de usuario. La construcción material de los mundos se realizará en la Etapa 5, respetando este documento y sin saltarse la arquitectura técnica.
