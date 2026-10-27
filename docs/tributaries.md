# Afluentes

Se añaden 16 afluentes representativos para el estudio escolar de las grandes cuencas españolas; la selección no es un inventario exhaustivo ni una clasificación por caudal o longitud.

| Río receptor | Afluentes incluidos |
| --- | --- |
| Miño | Sil |
| Duero | Esla, Pisuerga, Tormes |
| Tajo | Jarama, Tiétar, Alagón |
| Guadiana | Zújar |
| Guadalquivir | Genil |
| Ebro | Aragón, Gállego, Segre, Jalón |
| Segre | Cinca |
| Júcar | Cabriel |
| Segura | Mundo |

Los afluentes son ríos: comparten geometría de polilínea, iconografía de agua, el preset de hidrografía y la medalla de ríos. Sus capas y su categoría de práctica se pueden seleccionar de forma independiente. `parentRiverId` identifica el río receptor inmediato; permite representar Cinca → Segre → Ebro sin confundir el receptor con el río principal de la cuenca. El editor excluye autorreferencias y ciclos, toma la vertiente del receptor y protege de eliminar o convertir a otra categoría un río con afluentes asociados. Los datos exportados conservan la relación.

## Precisión de los recorridos

Los nuevos trazados son **esquemáticos y orientativos**, con pocos puntos de paso aproximados, adaptados a las coordenadas del mapa existente. Su extremo final coincide con un punto del trazado del receptor para representar la confluencia. Esto no acredita la precisión geográfica de la confluencia ni sustituye la cartografía del IGN o las confederaciones hidrográficas. Los vértices se pueden afinar con el editor.

No se añaden longitudes: las cifras difieren entre fuentes y criterios de medición y no son necesarias para esta selección.

## Fuentes consultadas

- [Confederación Hidrográfica del Duero: la cuenca del Duero](https://www.chduero.es/la-cuenca-del-duero): Esla, Pisuerga y Tormes y sus redes tributarias.
- [Comisión para la Aplicación y Desarrollo del Convenio de Albufeira: demarcación del Tajo](https://www.cadc-albufeira.eu/es/demarcaciones-internacionales/tajo/descripcion.html): Jarama, Tiétar y Alagón, margen derecha y vertiente atlántica.
- [Confederación Hidrográfica del Ebro: la cuenca del Ebro](https://cph.chebro.es/ca/web/guest/la-cuenca-del-ebro): Aragón, Gállego, Cinca-Segre y Jalón.
- [Xunta de Galicia: río Sil](https://egu.xunta.gal/es/termo/186189/sil): relación con el Miño y confluencia en Os Peares.
- [Confederación Hidrográfica del Segura: red fluvial](https://www.chsegura.es/es/cuenca/caracterizacion/red-fluvial/): Mundo como afluente destacado del Segura.
- [IGME: hidrología de la cuenca del Genil](https://info.igme.es/SidPDF/018000/694/Parte%20II%20Hidrogeologia/18694_0004.pdf): Genil como afluente del Guadalquivir y cabecera en Sierra Nevada.
- [Universidad de Córdoba: la cuenca del Zújar](https://www.uco.es/investiga/grupos/meridies/images/docs/introduccionzujar.pdf): Zújar como afluente del Guadiana por la margen izquierda.
- [Universitat Politècnica de València: modelo hidrológico PATRICAL, demarcación del Júcar](https://riunet.upv.es/bitstreams/270093cf-f79e-4a99-a911-4649b3c1375a/download): recorrido del Cabriel y unión con el Júcar.

## Compatibilidad con datos guardados

Los snapshots antiguos (arrays en `geoespana_elements_v2`) se migran al formato `{ version: 3, elements }`. Se conservan sus elementos editados y solo se añaden los nuevos afluentes cuyos receptores existen. Una vez migrado el snapshot, los afluentes que el usuario elimine no se vuelven a añadir en cada recarga. El reinicio de datos recupera el catálogo completo.
