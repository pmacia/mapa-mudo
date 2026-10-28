# GeoEspaña Junior · Mapa mudo interactivo

![Banner de GeoEspaña Junior con vistas de la aplicación en ordenador, tableta y móvil](src/assets/images/geoespana_v2_screenshot.jpg)

Aplicación educativa para explorar la geografía física de España y practicar con retos de localización, identificación y contrarreloj. Incluye un editor de accidentes geográficos, fichas imprimibles y una guía didáctica integrada.

Construida con React 19, TypeScript, Vite 8 y Tailwind CSS 4. Funciona en el navegador, con controles para ordenador, tableta y móvil en orientación vertical u horizontal.

## Interfaz y controles

El mapa vectorial ocupa el fondo de la pantalla. Las barras y los paneles flotan sobre él con superficies traslúcidas; abrirlos u ocultarlos no modifica el tamaño del mapa. El encuadre inicial muestra la península aprovechando el espacio disponible. Se puede ampliar, reducir y desplazar para explorar también los archipiélagos.

- **Temas:** Clásico · Claro, Relieve Moderno · Claro y Modo Nocturno.
- **Visibilidad:** pulsa el ojo para ocultar todos los elementos flotantes. Al pulsar el ojo tachado se muestran todos. La flecha contigua, o una pulsación prolongada sobre el ojo, abre las opciones individuales disponibles para el modo actual.
- **Paneles:** se pueden mover desde su cabecera y ocultar con su flecha. Se recuperan desde el menú de visibilidad. El temporizador de contrarreloj también es flotante y se puede mover.
- **Búsqueda:** la ventana «Buscar en el Atlas» se puede desplazar desde su título; el Atlas dispone además de búsqueda y filtro por categoría.
- **Ayuda:** en el menú de herramientas se encuentra el manual de juego, con controles, reglas, puntuación, edición y guía didáctica para ESO. La ayuda se adapta al tema claro u oscuro.

**Ocultar controles o abrir el manual no pausa el cronómetro.** En móvil vertical, los botones de respuesta permiten jugar sin teclado.

## Modos de juego

| Modo | Cómo se juega | Límite |
| --- | --- | --- |
| Explorar / Atlas | Consulta los accidentes del mapa y sus fichas, escucha sus nombres y descubre el catálogo. | Sin tiempo ni vidas. |
| Ubicar / ¿Dónde está? | Localiza en el mapa el accidente solicitado. La pista muestra su descripción. | Tres vidas. |
| Identificar / Quiz | Elige el nombre del accidente señalado entre cuatro opciones. La ayuda 50:50 elimina dos respuestas incorrectas. | Tres vidas. |
| Contrarreloj | Responde si el nombre corresponde al accidente señalado: **← Sí**, **→ No**, o botones táctiles. | 60 segundos iniciales; cada acierto añade dos segundos. |

Las categorías activas en el menú de capas determinan el contenido disponible para el Atlas, los retos y las fichas imprimibles.

### Puntuación y progreso

| Acción | Puntos |
| --- | ---: |
| Acierto en Ubicar | 30; 20 si se ha consultado la pista. |
| Acierto en Quiz | 30; la ayuda 50:50 no reduce la puntuación. |
| Acierto en Contrarreloj | 20 y dos segundos adicionales. |
| Fallo en Contrarreloj | −5, sin bajar de cero. |
| Primera visita a un accidente del Atlas | 10. |
| Completar el catálogo del Atlas | 100 y sello del Atlas. |

El juego incluye niveles, medallas, rachas y resultados. La nota sobre diez se calcula sobre el total de preguntas de la ronda, incluidas las que quedan sin responder. Las reglas y bonificaciones se pueden consultar en el manual integrado y en [gameConfig.ts](src/constants/gameConfig.ts).

## Cartografía y capas

El catálogo distingue **ríos, afluentes, montañas, picos, costas, mares, islas y unidades de relieve**. Los afluentes mantienen una relación con su río receptor, que también puede ser otro afluente; por ejemplo, Cinca → Segre → Ebro. Consulta los criterios y relaciones en [Afluentes](docs/tributaries.md).

El menú de capas permite:

- Activar o desactivar cada categoría de accidentes.
- Mostrar u ocultar globalmente los nombres para usar el mapa mudo.
- Elegir las etiquetas de cada categoría por separado. Una categoría desactivada aparece en gris y no permite activar sus etiquetas.
- Mantener la selección individual de etiquetas al ocultarlas globalmente.
- Mostrar límites autonómicos y provinciales.

La base incluye el realce azul de la línea de costa y una rosa de los vientos adaptada al tema. Los temas son representaciones vectoriales, sin imágenes de satélite.

Desde las herramientas se pueden generar fichas A4 con numeración y soluciones; el diálogo de impresión del navegador permite imprimirlas o guardarlas como PDF.

## Edición de accidentes geográficos

El botón del lápiz abre el editor. Sus controles y selecciones usan **naranja** para distinguir este modo. Permite crear, modificar, duplicar y eliminar accidentes; cambiar su categoría adapta la geometría correspondiente. También permite editar vértices, desplazar, girar y escalar figuras, y configurar las relaciones de los afluentes.

El botón **?** del panel muestra la ayuda de atajos:

| Acción | Atajo |
| --- | --- |
| Guardar cambios | Ctrl / Cmd + S |
| Nuevo accidente | Ctrl / Cmd + N |
| Duplicar accidente | Ctrl / Cmd + D |
| Copiar accidente | Ctrl / Cmd + C |
| Pegar accidente | Ctrl / Cmd + V |
| Salir del editor | Esc |
| Insertar un vértice a partir del seleccionado | + |
| Eliminar el vértice seleccionado | − / Supr |

Copiar y pegar accidentes se aplica fuera de los campos de texto, donde se conserva la edición habitual. Al salir con cambios pendientes se solicita guardarlos o descartarlos. La configuración se puede exportar en un archivo ZIP.

## Instalación y ejecución

### Desarrollo local

Necesitas **Node.js 22.12 o posterior** y npm. No se necesita una cuenta ni una clave de API para utilizar los modos actuales de la aplicación.

```bash
git clone https://github.com/pmacia/mapa-mudo.git
cd mapa-mudo
npm ci
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://localhost:3000`. Si ese puerto está ocupado, utiliza el que indique la consola.

Para probar desde un móvil de la misma red, abre `http://IP_LOCAL_DEL_ORDENADOR:PUERTO`. El servidor de desarrollo escucha en la red local. Para instalar la web app en un dispositivo, es preferible utilizar una publicación estable con HTTPS.

### Compilación y publicación

```bash
npm run lint
npm run build
npm run preview
```

`lint` comprueba los tipos de TypeScript; `build` genera la aplicación en `dist/`; `preview` sirve esa compilación para comprobarla localmente.

Publica el contenido de `dist/` en un alojamiento estático con HTTPS. El servidor de desarrollo y `preview` no sustituyen a un alojamiento de producción. La configuración actual usa rutas de recursos desde la raíz del dominio: si se publica bajo una subcarpeta, hay que adaptar la base de Vite y las rutas de los recursos de instalación antes de compilar.

Subir cambios a GitHub conserva el código; por sí solo no publica una nueva versión del sitio web.

### Instalar desde el navegador como web app

Abre primero la dirección publicada de GeoEspaña en el navegador. La aplicación incluye un manifiesto e iconos de instalación para abrirse en una ventana independiente cuando el navegador lo permite.

| Dispositivo y navegador | Pasos |
| --- | --- |
| **Ordenador · Chrome** | Menú **⋮ → Enviar, guardar y compartir → Instalar página como aplicación…**. También puedes usar el icono de instalación de la barra de direcciones si aparece. Confirma la instalación. [Ayuda de Chrome](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DDesktop&hl=es). |
| **Ordenador · Edge** | Menú **⋯ → Más herramientas → Aplicaciones → Instalar este sitio como una aplicación**. Según la versión, «Aplicaciones» puede aparecer directamente en el menú. [Ayuda de Microsoft](https://support.microsoft.com/en-US/edge/install-manage-or-uninstall-apps-in-microsoft-edge). |
| **Mac · Safari** | En macOS Sonoma 14 o posterior, abre **Archivo → Añadir al Dock**, elige el nombre y confirma. También puede aparecer en el menú Compartir. [Ayuda de Apple](https://support.apple.com/en-ie/104996). |
| **Android · Chrome** | Menú **⋮ → Instalar y crear acceso directo → Instalar** y sigue las instrucciones. El texto puede variar según la versión. [Ayuda de Chrome para Android](https://support.google.com/chrome/answer/9658361?co=GENIE.Platform%3DAndroid&hl=es). |
| **iPhone / iPad · Safari** | Abre **Compartir → Añadir a pantalla de inicio**. Si aparece **Abrir como app web**, actívalo y pulsa **Añadir**. [Ayuda de Apple](https://support.apple.com/guide/iphone/open-as-web-app-iphea86e5236/ios), [compatibilidad de Safari](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/). |

Después, abre GeoEspaña desde su icono en el escritorio, el Dock, el menú de aplicaciones o la pantalla de inicio. Si el navegador solo ofrece crear un acceso directo, este puede abrir el sitio en una pestaña en lugar de una ventana independiente.

**La instalación no añade funcionamiento sin conexión.** Actualmente no se incluye un service worker ni una caché offline gestionada por la aplicación. Mantén acceso a la dirección donde esté alojada; una instalación basada en un servidor local depende de que ese servidor siga disponible.

### Datos guardados

El progreso y los accidentes editados se guardan localmente en el navegador mediante `localStorage`. No hay sincronización entre dispositivos. Cambiar de navegador, de dirección del sitio o de contexto de instalación puede dar acceso a un almacenamiento distinto. Borrar los datos del sitio puede eliminar el progreso y las ediciones: exporta la configuración del editor para conservar una copia de ese trabajo.

## Comprobaciones de desarrollo

```bash
npm run lint
npm run build
node --import tsx --test src/utils/editorGeometry.test.ts tests/tributaries.test.ts
```

Las pruebas de navegador están en `tests/*.mjs`. Utilizan Playwright y permiten indicar el módulo, el ejecutable del navegador y la dirección de la aplicación mediante variables de entorno. Por ejemplo, con Playwright disponible en el entorno:

```bash
PLAYWRIGHT_MODULE=/ruta/absoluta/a/playwright/index.mjs \
BROWSER_EXECUTABLE=/ruta/absoluta/al/navegador \
BASE_URL=http://localhost:3000 \
node tests/help-and-icons.mjs
```

Hay comprobaciones de disposición responsive, interacción con el mapa, visibilidad, etiquetas por categoría, accesibilidad, arrastre de paneles y temporizador, ayuda e iconos. Consulta también [Verificación de la interfaz](docs/immersive-ui-verification.md).

## Organización del proyecto

| Ruta | Contenido |
| --- | --- |
| `src/App.tsx` | Estado general, modos y composición de la interfaz. |
| `src/components/Map/` | Mapa SVG, rosa de los vientos y edición vectorial. |
| `src/components/Layout/` | Regiones flotantes, arrastre y control de visibilidad. |
| `src/components/Editor/` | Formulario y controles de edición. |
| `src/components/Manual/` | Manual integrado y ayuda de interfaz. |
| `src/components/Quiz/` | Interfaz de los retos. |
| `src/data/` | Base cartográfica, accidentes y afluentes. |
| `src/constants/gameConfig.ts` | Reglas, puntuaciones y progresión. |
| `src/constants/editorShortcuts.ts` | Atajos compartidos por el editor y el manual. |
| `src/hooks/` y `src/utils/` | Lógica de sesiones, geometría y utilidades. |
| `public/manifest.webmanifest` y `public/icons/` | Manifiesto, favicon e iconos de instalación. |
| `tests/` | Pruebas de navegador y de relaciones entre afluentes. |

## Créditos y licencia

El proyecto utiliza React, Vite, Tailwind CSS, D3 Geo, Lucide, Motion y otras dependencias cuyas versiones y licencias se pueden consultar en `package.json` y en sus respectivos paquetes.

El código incluye identificadores SPDX `Apache-2.0`. Actualmente el repositorio no contiene un archivo `LICENSE` independiente.
