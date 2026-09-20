# Glosario de localización española

## Estado y alcance

Este documento es la autoridad terminológica para los futuros textos del
tracker en `es-ES` (español de España). Restringe la revisión posterior del
catálogo semántico, pero no es dicho catálogo ni autoriza la activación del
idioma en tiempo de ejecución.

Las expresiones de Bethesda proceden de las identidades de
`official-terminology-provenance.csv`. El texto oficial se conserva literalmente
en el artefacto de valores; una frase contextual no se convierte por ello en
una etiqueta. Los términos **tracker** son decisiones editoriales propias.

## Estilo, mayúsculas y gramática

- Usar español de España conciso y natural; no neutralizarlo hacia variantes
  latinoamericanas. Evitar especialmente `insumos` como rótulo general.
- Aplicar mayúscula inicial solo cuando lo exijan la posición o un nombre
  propio. La capitalización de una fuente oficial no obliga a usar versales en
  prosa. Conservar exactamente `Starfield` y `X-Tech`.
- Ajustar artículos, género, número, preposiciones e imperativos al mensaje.
  Los valores de la tabla son lemas o etiquetas, no fragmentos concatenables.
- No abreviar una traducción correcta para encajarla en la interfaz. Los
  riesgos de longitud se revisarán durante el control visual posterior.

## Terminología oficial y decisiones de uso

| Concepto inglés | Clase | Valor preferido | Evidencia oficial | Sentido, capitalización, etiqueta compacta y restricción |
| --- | --- | --- | --- | --- |
| Outpost | Bethesda oficial | Puesto | `term.outpost.standalone`, `term.outpost.free-lanes-context` | Construcción del jugador. Masculino. Apto como etiqueta. Restricción semántica con singular/plural, no sustitución literal global. |
| Cargo Link | Bethesda oficial | Enlace de cargamento | `term.cargo-link.standalone` | Entidad logística. Apto, aunque largo. Coincidencia de frase donde el concepto completo aparezca. |
| Inter-System Cargo Link | Bethesda oficial | Enlace de cargamento intersistema | `term.inter-system-cargo-link.standalone` | Enlace que cruza sistemas y requiere He-3. Apto con riesgo de longitud; no usar `interestelar`. |
| Inter-System | Contextual oficial | Intersistema | `term.inter-system.context-label` | Modificador únicamente cuando el sustantivo ya esté claro. No exigir como fragmento universal. |
| Biome | Contextual oficial | Bioma | cinco evidencias `term.biome.*` | Masculino; admitir `bioma/biomas`. Apto. |
| Planet | Contextual oficial | Planeta | `term.planet.*` | Solo cuerpo de tipo planeta; no engloba lunas u orbitales. Apto. |
| Planetary Body | Contextual oficial | Cuerpo celeste | `term.planetary-body.celestial-context` | Abstracción inclusiva del tracker. `Cuerpo planetario` está documentado, pero es más estrecho. Flexionar número y artículos. |
| Star System | Contextual oficial | Sistema estelar | `term.star-system.full-phrase`; otras formas contextuales | Etiqueta autónoma. `Sistema objetivo` y `sistema de Algorab` no son reemplazos globales. |
| Outpost Management | Bethesda oficial | Gestión de puestos | `skill.outpost-management.name` | Nombre de habilidad; conservar la forma oficial. |
| Outpost Engineering | Bethesda oficial | Ingeniería de puestos | `skill.outpost-engineering.name` | Nombre de habilidad; conservar la forma oficial. |
| Planetary Habitation | Bethesda oficial | Asentamiento planetario | `skill.planetary-habitation.name` | Nombre de habilidad. |
| Research Methods | Bethesda oficial | Mét. de investigación | `skill.research-methods.name` | Nombre oficial abreviado; mantener el punto. |
| Special Projects | Bethesda oficial | Proyectos especiales | `skill.special-projects.name` | Nombre de habilidad. |
| X-Tech | Bethesda oficial | X-Tech | `term.x-tech.*` | Token invariable; guion y mayúsculas exactos. |
| X-Tech Power Core | Bethesda oficial | Núcleo de energía de X-Tech | `term.x-tech-power-core.item-name` | Nombre autónomo. `Núcleo de X-Tech` es variante contextual, no el valor canónico. Riesgo de longitud. |
| Starfield | Marca invariable | Starfield | `term.starfield.product-title` contiene `Firmamento` | La evidencia traduce el sentido común en ese registro; no sustituye la marca del producto. |
| Moon | Contextual oficial | Luna | `term.moon.satellite-context` | Cuerpo de tipo luna; minúscula en prosa salvo inicio. |
| Orbital | Contextual | Según la oración | `term.orbital.adjectival-context` | Solo existe evidencia adjetival (`orbital`); no imponer un sustantivo autónomo. |
| Cargo Pad | Ausencia oficial | Sin término visible | cuatro filas `term.cargo-pad.*-absence` | Término de presentación retirado. Los identificadores internos `CargoPad` no cambian. |

### Mapa de fuentes de evidencia

Las identidades exactas (incluidos `StringID` y, cuando existe, FormID/campo)
permanecen en `official-terminology-provenance.csv`. En resumen:

- `Starfield.esm / strings` aporta las etiquetas autónomas, habilidades y
  contextos UI principales; `Starfield.esm / ilstrings` aporta la prosa
  astronómica y otras variantes contextuales;
- `ShatteredSpace.esm / ilstrings` aporta la evidencia ambiental de `Biome`;
- `SFBGS00D.esm / strings` aporta el nombre cualificado de `X-Tech`;
- `SFBGS050.esm / strings|dlstrings|ilstrings` aporta únicamente evidencia
  terminológica de Free Lanes, incluido `X-Tech Power Core`, y nunca entidades
  canónicas del tracker;
- las cuatro filas de ausencia de `Cargo Pad` no tienen tabla ni `StringID` por
  diseño.

## Terminología propia del tracker

| Concepto inglés | Clase | Valor preferido | Sentido y exclusiones | Uso compacto y estrategia de restricción |
| --- | --- | --- | --- | --- |
| Planned Supply | Tracker | Suministro planificado | Intención virtual de suministro futuro; no inventario, reserva ni entrega real. | Apto con riesgo de longitud; concepto semántico. |
| Present | Contextual | Presencia | Existencia o disponibilidad posible/registrada en el puesto; nunca `actual`. En oraciones pueden ser naturales `presente` o `disponible`. | `Presencia` como columna; regla por clave con variantes. |
| Producing | Contextual | En producción | Estado operativo configurado, sin caudal. Acciones: `producir` / `dejar de producir`. | Apto; regla por clave, no substring global. |
| Inputs | Contextual | Materiales de entrada | Recursos necesarios para recetas o producción orgánica; no campos de formulario. Se permiten `materiales necesarios` o `recursos necesarios` en prosa. | Riesgo de longitud; concepto semántico. |
| Logistics | Tracker | Logística | Elementos asignados a exportaciones encaminadas, no meramente exportables. | Apto; regla por clave. |
| Manufacturing | Tracker | Fabricación | Producción configurada de productos a partir de materiales; sin caudal. | Apto; concepto semántico. |
| Validation | Tracker | Validación | Diagnóstico de dominio con errores, advertencias e información; no solo validación de formularios. | Apto; concepto semántico. |
| Resource Matrix | Tracker | Matriz de recursos | Vista de presencia, producción, materiales y logística. | Apto con riesgo de longitud; frase estable. |
| Reshuffle | Contextual | Reordenar | Entra en modo de ordenación manual; rechazar `barajar` o `mezclar`, que implican azar. | Imperativo por clave; `Terminar de reordenar` al salir. |
| Lock order / Lock | Contextual | Bloquear el orden | Finaliza o impide la reordenación; no es seguridad ni inicio de sesión. | Riesgo de longitud; regla por clave. |
| Inorganic / Organic | Contextual | Inorgánico / Orgánico | Categorías de recursos. Concordar género y número (`recursos inorgánicos`, `materia orgánica`). | Forma breve solo con contexto; concepto semántico con variantes. |
| Network | Tracker | Red | Documento de puestos y enlaces; no necesariamente una red informática. | Apto; concepto semántico. |
| Active Production | Tracker | Producción activa | Extracción, recolección o fabricación configurada. | Apto con riesgo de longitud; concepto semántico. |
| Source / Destination | Contextual | Origen / Destino | Procedencia del recurso y puesto receptor del enlace. Artículos y preposiciones dependen de la frase. | Aptos; no imponer concatenación literal. |
| Import / Export (JSON) | Contextual | Importar / Exportar | Operaciones de archivo sobre la colección; no confundir con flujos de carga. | Verbos de botón, por clave. |
| Undo / Redo | Contextual | Deshacer / Rehacer | Navegación por el historial de edición de la sesión. | Verbos de botón, por clave. |
| Error / Warning / Info | Tracker | Error / Advertencia / Información | Niveles de validación; no elevar una advertencia a error. | Aptos; flexionar plurales en mensajes. |

## Conceptos de alto riesgo para la revisión semántica

Todos los conceptos de esta tabla requieren contexto explícito para Codex y
DeepL. La columna de restricción indica si una búsqueda literal es segura.

| Conceptos | Riesgo principal | Substring seguro | Variación esperada |
| --- | --- | --- | --- |
| Planned Supply, Active Production, Resource Matrix | Confundir intención futura, estado configurado o vista con inventario, caudal o tabla genérica. | Solo la frase en encabezados conocidos. | Artículos y preposiciones en prosa. |
| Present, Producing, Inputs | Lectura temporal, acción genérica o campos de entrada. | No. | Estado, verbo, género y número según clave. |
| Logistics, Manufacturing, Validation, Network | Ampliar o estrechar el sentido de dominio. | No globalmente. | Formas integradas en oraciones. |
| Reshuffle, Lock, Undo, Redo | Aleatoriedad, seguridad o acción histórica equivocada. | Solo etiquetas por clave. | Imperativo e infinitivo según el control. |
| Source, Destination | Confusión con código/datos o dirección no logística. | No. | Artículos, `de`, `del`, `al`. |

## Tokens protegidos y control compacto

Conservar exactamente parámetros como `{count}`, además de `He-3`, `JSON`,
`FormID`, identificadores, extensiones, teclas, `Starfield` y `X-Tech`. Los
términos con riesgo compacto son `Enlace de cargamento intersistema`, `Núcleo de
energía de X-Tech`, `Materiales de entrada`, `Suministro planificado`, `Matriz de
recursos` y `Bloquear el orden`. No acortarlos sin una decisión editorial y una
prueba visual posteriores.
