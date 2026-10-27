// Selección didáctica. Trazados simplificados; fuentes y criterios en docs/tributaries.md.
import type { GeoElement } from '../types/geography';
import { ACCIDENTS_VECTOR_DATA } from './geographyAccidentsData';

export const TRIBUTARIES: GeoElement[] = [
{
  "id": "rio-sil",
  "name": "Río Sil",
  "category": "afluentes",
  "parentRiverId": "rio-mino",
  "subCategory": "Afluente del Miño",
  "vertiente": "atlantico",
  "difficulty": "medio",
  "description": "Nace en la cordillera Cantábrica y atraviesa El Bierzo antes de unirse al Miño en Os Peares.",
  "curiosity": "Sus cañones son uno de los paisajes característicos de la Ribeira Sacra.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-sil"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-sil"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-sil"]
},
{
  "id": "rio-esla",
  "name": "Río Esla",
  "category": "afluentes",
  "parentRiverId": "rio-duero",
  "subCategory": "Afluente del Duero",
  "vertiente": "atlantico",
  "difficulty": "medio",
  "description": "Recoge aguas de la cordillera Cantábrica y cruza León y Zamora hasta el Duero.",
  "curiosity": "Su cuenca recibe las aguas de otros ríos como el Órbigo y el Porma.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-esla"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-esla"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-esla"]
},
{
  "id": "rio-pisuerga",
  "name": "Río Pisuerga",
  "category": "afluentes",
  "parentRiverId": "rio-duero",
  "subCategory": "Afluente del Duero",
  "vertiente": "atlantico",
  "difficulty": "medio",
  "description": "Nace en la montaña palentina y pasa por Valladolid antes de desembocar en el Duero.",
  "curiosity": "El río que pasa por Valladolid es el Pisuerga, no el Duero.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-pisuerga"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-pisuerga"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-pisuerga"]
},
{
  "id": "rio-tormes",
  "name": "Río Tormes",
  "category": "afluentes",
  "parentRiverId": "rio-duero",
  "subCategory": "Afluente del Duero",
  "vertiente": "atlantico",
  "difficulty": "medio",
  "description": "Desciende de la sierra de Gredos y pasa por Salamanca hasta alcanzar el Duero.",
  "curiosity": "El Lazarillo de Tormes toma su nombre de este río.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-tormes"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-tormes"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-tormes"]
},
{
  "id": "rio-jarama",
  "name": "Río Jarama",
  "category": "afluentes",
  "parentRiverId": "rio-tajo",
  "subCategory": "Afluente del Tajo",
  "vertiente": "atlantico",
  "difficulty": "medio",
  "description": "Recorre el entorno oriental de Madrid y desemboca en el Tajo cerca de Aranjuez.",
  "curiosity": "Recibe al Manzanares, el río que atraviesa la ciudad de Madrid.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-jarama"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-jarama"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-jarama"]
},
{
  "id": "rio-tietar",
  "name": "Río Tiétar",
  "category": "afluentes",
  "parentRiverId": "rio-tajo",
  "subCategory": "Afluente del Tajo",
  "vertiente": "atlantico",
  "difficulty": "medio",
  "description": "Discurre al sur de la sierra de Gredos y entrega sus aguas al Tajo en el entorno de Monfragüe.",
  "curiosity": "Su valle separa las laderas de Gredos de las sierras situadas más al sur.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-tietar"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-tietar"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-tietar"]
},
{
  "id": "rio-alagon",
  "name": "Río Alagón",
  "category": "afluentes",
  "parentRiverId": "rio-tajo",
  "subCategory": "Afluente del Tajo",
  "vertiente": "atlantico",
  "difficulty": "medio",
  "description": "Nace en Salamanca, recorre el norte de Cáceres y desemboca en el Tajo.",
  "curiosity": "El Jerte forma parte de su red de afluentes.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-alagon"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-alagon"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-alagon"]
},
{
  "id": "rio-zujar",
  "name": "Río Zújar",
  "category": "afluentes",
  "parentRiverId": "rio-guadiana",
  "subCategory": "Afluente del Guadiana",
  "vertiente": "atlantico",
  "difficulty": "medio",
  "description": "Recorre el entorno de La Serena y desemboca en el Guadiana por su margen izquierda.",
  "curiosity": "Sus aguas están reguladas por los embalses de La Serena y del Zújar.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-zujar"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-zujar"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-zujar"]
},
{
  "id": "rio-genil",
  "name": "Río Genil",
  "category": "afluentes",
  "parentRiverId": "rio-guadalquivir",
  "subCategory": "Afluente del Guadalquivir",
  "vertiente": "atlantico",
  "difficulty": "medio",
  "description": "Baja de Sierra Nevada, pasa por Granada y Écija y desemboca en el Guadalquivir en Palma del Río.",
  "curiosity": "Conecta las altas cumbres de Sierra Nevada con el valle del Guadalquivir.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-genil"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-genil"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-genil"]
},
{
  "id": "rio-aragon",
  "name": "Río Aragón",
  "category": "afluentes",
  "parentRiverId": "rio-ebro",
  "subCategory": "Afluente del Ebro",
  "vertiente": "mediterraneo",
  "difficulty": "medio",
  "description": "Nace en los Pirineos y desemboca en el Ebro en Navarra.",
  "curiosity": "Da nombre al territorio de Aragón, aunque su desembocadura está en Navarra.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-aragon"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-aragon"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-aragon"]
},
{
  "id": "rio-gallego",
  "name": "Río Gállego",
  "category": "afluentes",
  "parentRiverId": "rio-ebro",
  "subCategory": "Afluente del Ebro",
  "vertiente": "mediterraneo",
  "difficulty": "medio",
  "description": "Desciende desde el Pirineo aragonés y llega al Ebro junto a Zaragoza.",
  "curiosity": "Atraviesa el entorno de los Mallos de Riglos antes de alcanzar la depresión del Ebro.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-gallego"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-gallego"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-gallego"]
},
{
  "id": "rio-segre",
  "name": "Río Segre",
  "category": "afluentes",
  "parentRiverId": "rio-ebro",
  "subCategory": "Afluente del Ebro",
  "vertiente": "mediterraneo",
  "difficulty": "medio",
  "description": "Nace en los Pirineos y pasa por Lleida antes de unirse al Ebro.",
  "curiosity": "Recibe las aguas del Cinca antes de llegar al Ebro.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-segre"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-segre"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-segre"]
},
{
  "id": "rio-jalon",
  "name": "Río Jalón",
  "category": "afluentes",
  "parentRiverId": "rio-ebro",
  "subCategory": "Afluente del Ebro",
  "vertiente": "mediterraneo",
  "difficulty": "medio",
  "description": "Nace en el Sistema Ibérico y desemboca en el Ebro por su margen derecha.",
  "curiosity": "Su valle ha servido históricamente como corredor entre la Meseta y el valle del Ebro.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-jalon"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-jalon"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-jalon"]
},
{
  "id": "rio-cabriel",
  "name": "Río Cabriel",
  "category": "afluentes",
  "parentRiverId": "rio-jucar",
  "subCategory": "Afluente del Júcar",
  "vertiente": "mediterraneo",
  "difficulty": "medio",
  "description": "Desciende de los Montes Universales y desemboca en el Júcar en Cofrentes.",
  "curiosity": "Sus hoces forman un destacado paisaje fluvial entre Cuenca y Valencia.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-cabriel"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-cabriel"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-cabriel"]
},
{
  "id": "rio-mundo",
  "name": "Río Mundo",
  "category": "afluentes",
  "parentRiverId": "rio-segura",
  "subCategory": "Afluente del Segura",
  "vertiente": "mediterraneo",
  "difficulty": "medio",
  "description": "Nace en la sierra de Alcaraz y entrega sus aguas al Segura en la provincia de Albacete.",
  "curiosity": "Su nacimiento es conocido por la cascada de Los Chorros del río Mundo.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-mundo"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-mundo"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-mundo"]
},
{
  "id": "rio-cinca",
  "name": "Río Cinca",
  "category": "afluentes",
  "parentRiverId": "rio-segre",
  "subCategory": "Afluente del Segre",
  "vertiente": "mediterraneo",
  "difficulty": "medio",
  "description": "Desciende del Pirineo oscense y desemboca en el Segre, que a su vez desemboca en el Ebro.",
  "curiosity": "Es un ejemplo de afluente de otro afluente: Cinca → Segre → Ebro.",
  "svgType": "polyline"
,
  mapX: ACCIDENTS_VECTOR_DATA.landmarks["rio-cinca"].x,
  mapY: ACCIDENTS_VECTOR_DATA.landmarks["rio-cinca"].y,
  svgPath: ACCIDENTS_VECTOR_DATA.rivers["rio-cinca"]
}
];
