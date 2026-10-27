# Interfaz inmersiva centrada en el mapa

Estado: propuesta para revisión, basada en la maqueta aceptada y las precisiones del 27 de octubre de 2026.

## Objetivo y alcance

Rediseñar la presentación y disposición de GeoEspaña con una estética moderna de plataformas de streaming y controles flotantes de cristal translúcido. El mapa ocupa el lienzo de la aplicación; las herramientas aparecen sobre él y se pueden recoger. No se cambian las reglas, contenidos, puntuaciones, tiempos ni funciones existentes.

La referencia visual es la maqueta «Escritorio · Atlas / Móvil · Contrarreloj» presentada en este chat. El usuario acepta esa dirección y pide un zoom inicial algo más cerrado, todas las barras flotantes y ocultables y barras/fichas translúcidas superpuestas al mapa.

## Decisiones confirmadas y criterios de implementación

- Confirmado: interfaz centrada en el mapa, estética estilizada, paneles dinámicos, translucidez y posibilidad de ocultar todas las barras.
- Confirmado: la jugabilidad de contrarreloj en móvil vertical es prioritaria.
- Confirmado: en móvil vertical el mapa se presenta inicialmente completo, con el zoom inicial actual como referencia. El permiso posterior para acercar un poco más el zoom no debe sacrificar esa visibilidad.
- Criterio de implementación: acercar ligeramente el encuadre inicial cuando el espacio disponible lo permita, manteniendo visibles península, Baleares y Canarias; en móvil prevalece el encuadre completo sobre el incremento de zoom. El ajuste exacto se resolverá mediante comprobación visual, sin modificar coordenadas geográficas ni el cálculo de selección.
- Criterio de implementación: conservar los tres temas actuales y sus controles. La maqueta no autoriza sustituir la cartografía por otra ni eliminar el tema claro.
- Criterio de implementación: ningún panel se oculta automáticamente mientras se juega; la ocultación es manual.

## Enfoques considerados

1. Retocar las tarjetas y mantener la cuadrícula mapa/panel. Es de menor alcance, pero no consigue la disposición inmersiva solicitada.
2. Mapa de fondo con barras flotantes y paneles superpuestos. Es la dirección representada por la maqueta aceptada; permite aprovechar la estructura y lógica actuales.
3. Sustituir los componentes y rehacer el flujo de juego. No se adopta: aumenta el riesgo de cambiar funciones o reiniciar sesiones al modificar la disposición.

Se adopta el segundo enfoque, conservando las sesiones y componentes funcionales existentes y reorganizando su presentación.

## Composición de escritorio y tableta horizontal

- Lienzo del mapa a toda la ventana, sin el marco de tarjeta ni la cuadrícula de dos columnas como estructura principal.
- Barra superior flotante: identidad, modos de juego y acceso a búsqueda/ajustes.
- Grupo de controles del mapa flotante: zoom, recentrado y orientación.
- Barra inferior flotante: Atlas, capas, logros y acceso al resto de herramientas actuales, incluyendo editor, impresión, manual, sonido y temas. La distribución exacta de accesos secundarios queda al implementador; ninguno desaparece.
- Panel lateral flotante para Atlas, reto o editor; se puede recoger sin perder selección, borrador ni progreso. El panel puede cubrir parte del mapa, pero la disposición debe mantener utilizables los objetivos y permitir liberar el espacio al recogerlo.
- Los controles del propio editor y sus atajos permanecen disponibles en edición. Se conservan las advertencias de cambios pendientes.

## Móvil vertical y contrarreloj

- La aplicación ocupa la altura útil del navegador y respeta las áreas seguras del dispositivo. La partida activa no requiere desplazar la página para encontrar una pregunta o responder.
- El mapa sigue siendo el fondo y conserva un área central libre que muestra España completa inicialmente. El fondo puede extenderse por debajo de las superficies translúcidas.
- Barra superior compacta flotante; marcador con tiempo, aciertos, fallos, puntuación y racha; tarjeta de pregunta; dos botones grandes «Sí, es» y «No es» al alcance del pulgar; navegación inferior flotante.
- El marcador, la pregunta y ambos botones son visibles por defecto y están disponibles simultáneamente en los tamaños de comprobación. Los botones tienen al menos 44 px de zona táctil; se priorizan 56–64 px cuando quepan.
- Se mantienen el avance automático, las penalizaciones, el tiempo extra, la señalización del objetivo, el feedback y los resultados actuales. La maqueta contiene ejemplos estáticos, no cambios de mecánica.
- La exploración usa una ficha inferior flotante recogible y expandible. Ubicar y Quiz conservan sus respectivas preguntas, pistas, opciones y acciones de continuación.
- Las fichas largas y los resultados pueden desplazarse internamente; los controles críticos y el mapa no deben quedar inaccesibles por ese desplazamiento.
- En pantallas muy bajas, reducir primero adornos y espaciados; no quitar controles ni tapar respuestas. Mantener una zona libre del mapa y permitir recoger paneles secundarios.

## Ocultar y recuperar la interfaz

- Todas las barras flotantes, controles del mapa y fichas de contenido pueden recogerse. Los diálogos de confirmación y los formularios modales mantienen su cierre y comportamiento actuales; no se disimulan como decoración del mapa.
- Cada agrupación principal dispone de un control de recoger; además hay un control general «Ocultar interfaz» para dejar el mapa despejado.
- Cuando una agrupación se recoge, queda un acceso pequeño y claramente identificable para recuperarla. En la ocultación general solo queda un acceso de restauración de la interfaz, con zona táctil suficiente; no depende de hover ni de un gesto oculto.
- Ocultar es solo presentación: no desmonta la sesión ni el editor, no cambia de modo, no pausa ni reinicia el cronómetro y no borra selección, respuestas, filtros o borradores.
- Durante contrarreloj, la ocultación de sus controles es manual y reversible; no se introduce ocultación automática, pausa nueva ni cambio de reglas.
- La interfaz completa vuelve a estar visible al iniciar un modo distinto. Los filtros y los estados funcionales mantienen el comportamiento actual.

## Sistema visual y accesibilidad

- Tipografía nítida, menos bordes decorativos, sombras suaves y jerarquía clara. El mapa domina sobre los elementos secundarios.
- Superficies translúcidas con desenfoque moderado, borde sutil y suficiente densidad para leer sobre tierra, mar, ríos y etiquetas. No se ofrece inicialmente un ajuste nuevo de opacidad: el implementador determina valores legibles para cada tema.
- Alternativa de fondo más opaco cuando no haya soporte de desenfoque; reducir transparencias y animaciones cuando lo solicite el sistema.
- Contraste legible en los tres temas; estados correctos/incorrectos reconocibles también por texto e iconos.
- Botones con nombres accesibles, foco visible, navegación por teclado y controles táctiles suficientemente grandes. Ninguna acción esencial depende exclusivamente del color o del hover.
- Las superficies flotantes capturan eventos solo en su propio contenido; las zonas transparentes libres permiten interactuar con el mapa.
- Jerarquía de capas predecible: mapa, controles/fichas, diálogos. Un panel recogido no deja una capa invisible bloqueando el mapa.

## Conservación de funcionalidad

Comprobar explícitamente:

- Explorar: búsqueda, categorías, selección y ficha, registro de visitas, sello y reinicio del Atlas.
- Ubicar: seleccionar accidentes en el mapa, pistas, feedback, vidas, puntuación y continuación manual/automática.
- Quiz: opciones, ayudas, feedback y avance.
- Contrarreloj: respuestas Sí/No y teclado, tiempo, extras/penalizaciones, racha, feedback, avance automático, fin y reinicio.
- Mapa: temas, capas independientes, etiquetas, límites administrativos, zoom/recentrado, selección y señales.
- Editor: crear, copiar/pegar, duplicar, eliminar, modificar datos y geometrías, receptor de afluentes, guardar, descartar, ayuda/atajos, exportar y salir con protección del borrador.
- Herramientas: impresión con sus controles y estilos de impresión, manual, logros y sonido.
- Persistencia: formatos y claves de datos, estadísticas y progreso sin modificaciones por el rediseño.

## Límites técnicos

Reutilizar React, Tailwind, Lucide y las dependencias ya presentes. Mantener la lógica de `useChallengeSession`, los datos geográficos y las utilidades de puntuación/edición fuera del rediseño. Se permiten adaptaciones de props y estado exclusivamente de presentación. Evitar instancias duplicadas de `ChallengeMode` y remounts al redimensionar u ocultar fichas. No añadir servicios, librerías ni un segundo sistema de temas.

## Verificación y entrega

1. Mantener las pruebas de geometría y afluentes, TypeScript y compilación.
2. Comprobar en navegador los cuatro modos de pantalla y el editor, en los tres temas y a ambos lados del breakpoint compartido de 1024 px.
3. Priorizar móvil vertical: 360×640, 390×844 y 430×932; añadir 768×1024, escritorio y móvil horizontal. Comprobar que la partida activa no tiene desbordamiento horizontal, que los botones y la pregunta están a la vista y que el objetivo no queda oculto.
4. Probar una secuencia real de contrarreloj: responder, recibir feedback, avanzar y llegar a resultados. Confirmar que recoger/restaurar paneles y cambiar orientación no reinicia ni duplica el cronómetro.
5. Verificar que todos los controles recogidos se recuperan con teclado y táctil, que no quedan capas invisibles y que funcionan las áreas seguras.
6. Revisar visualmente los paneles sobre zonas claras y oscuras del mapa, guardar capturas de escritorio y móvil y revisar impresión por separado.

El implementador decide la organización interna de componentes, los tamaños exactos y las transiciones dentro de estos criterios. Si un cambio exige alterar las reglas del juego o perder una función, queda fuera del alcance y debe replantearse.
