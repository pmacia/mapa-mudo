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
```

Las pruebas de navegador necesitan Playwright y un navegador instalado. Admiten `BASE_URL`, `PLAYWRIGHT_MODULE` (ruta al módulo Playwright) y `BROWSER_EXECUTABLE` (ruta al navegador); no añaden dependencias a la aplicación.

Cobertura: continuidad del temporizador al redimensionar y ocultar, respuestas sin duplicación, resultados, controles táctiles, paneles recuperables, herramientas, temas, edición y exportación, desplazamiento del quiz y preferencia de reducir transparencia. Se comprueban tamaños de móvil vertical desde 360×640, horizontal, tablet y escritorio, incluidos ambos lados del punto de cambio de 1024 px.

Validación final: 15 pruebas de lógica, tres comprobaciones de navegador, TypeScript y compilación correctos. Una revisión independiente no encontró problemas críticos o importantes; su observación sobre reducir transparencia quedó corregida con una prueba de regresión. La inspección visual adicional detectó y corrigió el desbordamiento de la ficha del quiz en móvil.

Las pruebas táctiles usan emulación de Chrome; queda pendiente la comprobación en dispositivos físicos, especialmente las áreas seguras de iOS. La compilación mantiene los avisos existentes de Vite sobre `__dirname` y el tamaño del paquete JavaScript.
