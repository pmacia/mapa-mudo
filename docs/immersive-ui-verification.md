# Verificación de la interfaz inmersiva

La presentación conserva los temas Clásico y Relieve Moderno claros y el tema Nocturno. Las barras se ocultan sin desmontar las sesiones de juego ni los borradores del editor.

Con el servidor de desarrollo en marcha (por defecto las pruebas usan `http://localhost:3002`):

```sh
npm run lint
npm run build
node --import tsx --test src/utils/editorGeometry.test.ts tests/tributaries.test.ts
node tests/immersive-ui.mjs
node tests/immersive-accessibility.mjs
node tests/immersive-layout.mjs
node tests/map-visibility.mjs
node tests/map-interactions.mjs
node tests/category-labels.mjs
```

Las pruebas de navegador necesitan Playwright y un navegador instalado. Admiten `BASE_URL`, `PLAYWRIGHT_MODULE` (ruta al módulo Playwright) y `BROWSER_EXECUTABLE` (ruta al navegador); no añaden dependencias a la aplicación.

Cobertura: continuidad del temporizador al redimensionar y ocultar, respuestas sin duplicación, resultados, controles táctiles, paneles recuperables, herramientas, temas, edición y exportación, desplazamiento del quiz y preferencia de reducir transparencia. Se comprueban tamaños de móvil vertical desde 360×640, horizontal, tablet y escritorio, incluidos ambos lados del punto de cambio de 1024 px.

Validación final: 15 pruebas de lógica, cinco comprobaciones de navegador, TypeScript y compilación correctos. Una revisión independiente no encontró problemas críticos o importantes; su observación sobre reducir transparencia quedó corregida con una prueba de regresión. La inspección visual adicional detectó y corrigió el desbordamiento de la ficha del quiz en móvil.

Las pruebas táctiles usan emulación de Chrome; queda pendiente la comprobación en dispositivos físicos, especialmente las áreas seguras de iOS. La compilación mantiene los avisos existentes de Vite sobre `__dirname` y el tamaño del paquete JavaScript.

La revisión de visibilidad centralizada comprueba el menú dinámico, la alineación de su flecha, pulsación larga/cancelada, el ojo sincronizado con todos los elementos y el encuadre estable al abrir o cerrar fichas. El mapa llena la ventana en ambas orientaciones; el zoom inicial encuadra la península con 16 px de margen, limitado por ancho y altura. Alejar permite recuperar los archipiélagos y el desplazamiento admite ratón y tacto.

La revisión independiente de esta segunda iteración detectó y verificó tres correcciones: desplazamiento del fondo en edición (sin interferir con los tiradores), acceso real a los botones de zoom sobre el quiz vertical e inclusión de Portugal en el encuadre inicial. `map-interactions.mjs` reprodujo los tres problemas antes de corregirlos y pasa después de los cambios.

Etiquetas por categoría: se comprueba que los ríos puedan ocultar sus nombres sin afectar afluentes ni relieve; las categorías ausentes quedan bloqueadas; el interruptor global conserva la selección y los juegos mantienen su modo mudo. Los paneles grandes recuperan cierre directo y se reabren desde Visibilidad. El Atlas diferencia expandir/reducir de ocultar mediante iconos distintos.
