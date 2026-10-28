import { Eye, EyeOff, ChevronDown, GripHorizontal, Maximize2, Layers, Search, Palette, Map, Pencil } from 'lucide-react';
import { EDITOR_SHORTCUTS } from '../../constants/editorShortcuts';

const CONTROLS = [
  {icon:Eye,title:'Ocultar la interfaz',text:'Pulsa el ojo para ocultar todos los elementos flotantes y dejar sólo el mapa. El temporizador sigue contando.'},
  {icon:EyeOff,title:'Recuperar todos los elementos',text:'Pulsa el ojo tachado para mostrar todos los componentes disponibles. Si apagas las opciones individualmente hasta que no quede ninguna, también aparece el ojo tachado.'},
  {icon:ChevronDown,title:'Elegir qué quieres ver',text:'La flecha debajo del ojo abre Visibilidad. Mantener pulsado el ojo abre el mismo menú. Sus opciones cambian según el modo: Atlas, reto, resultados o editor, además de las barras, herramientas y el marcador cuando corresponde.'},
  {icon:GripHorizontal,title:'Mover paneles y marcador',text:'Arrastra la cabecera de un panel o el asa del marcador con ratón o dedo. También puedes enfocar el asa con Tab y usar las flechas del teclado. El contenido de las fichas sigue desplazándose por dentro y los borradores se conservan.'},
  {icon:Maximize2,title:'Expandir y ocultar el Atlas',text:'En móvil vertical, el icono de expandir amplía la ficha del Atlas y el de reducir la devuelve a su tamaño inicial. La flecha de la cabecera oculta el panel; se recupera desde Visibilidad.'},
  {icon:Map,title:'Explorar el mapa',text:'El mapa ocupa toda la pantalla. Su tamaño, zoom y posición no cambian al abrir o cerrar paneles. El encuadre inicial aprovecha la pantalla con la península, incluido Portugal. Arrastra con un dedo para desplazarte y separa o junta dos dedos sobre el mapa para acercar o alejar, manteniendo el punto entre ambos como referencia. Los botones + y − siguen disponibles. Aleja o arrastra el mapa para llegar a los archipiélagos; Recentrar recupera el encuadre inicial.'},
  {icon:Layers,title:'Capas y textos por categoría',text:'Capas permite activar accidentes y elegir sus nombres por separado. El interruptor global oculta todos los textos sin borrar tu selección por tipos. Las categorías que no están activas aparecen en gris y no se pueden seleccionar.'},
  {icon:Search,title:'Buscar en el Atlas',text:'La lupa de la barra superior abre una búsqueda que se mueve arrastrando su título. El panel del Atlas también permite buscar y filtrar por categoría. Selecciona un resultado para consultar su ficha.'},
  {icon:Palette,title:'Temas y herramientas',text:'La paleta ofrece Clásico y Relieve Moderno en claro, y Nocturno en oscuro. Más herramientas reúne capas, logros, impresión, manual, sonido y pantalla completa.'},
];
export function InterfaceGuide() {
  return <section className="manual-current-guide" aria-labelledby="interface-guide-title">
    <h3 id="interface-guide-title">Interfaz y paneles flotantes</h3>
    <div className="manual-guide-grid">{CONTROLS.map(({icon:Icon,title,text})=><article key={title}>
      <h4><Icon size={18} aria-hidden="true" />{title}</h4><p>{text}</p>
    </article>)}</div>
  </section>;
}
export function EditorGuide() {
  return <section className="manual-current-guide" aria-labelledby="editor-guide-title">
    <h3 id="editor-guide-title"><Pencil size={20} />Edición y atajos</h3>
    <p>En escritorio y tablet, el lápiz de las herramientas del mapa abre el editor. Selecciona un accidente para modificar sus datos y su geometría. La cabecera del panel permite moverlo y su flecha permite ocultarlo sin perder el borrador.</p>
    <dl className="manual-shortcut-list">{EDITOR_SHORTCUTS.map(({label,keys})=><div key={label}><dt>{label}</dt><dd><kbd>{keys}</kbd></dd></div>)}</dl>
    <div className="manual-guide-grid">
      <article><h4>Vértices y figuras</h4><p>Arrastra los tiradores para trasladar o girar una figura y sus vértices para cambiar el contorno. Selecciona un vértice para insertar con + o borrar con − o Supr. El doble clic también borra un vértice, respetando el mínimo necesario para la figura. Al cambiar la categoría, la geometría se adapta al tipo de accidente.</p></article>
      <article><h4>Copiar, guardar y salir</h4><p>Copiar y pegar accidentes funciona dentro del editor y fuera de los campos de texto; la copia se pega desplazada. En los campos se conserva la copia y el pegado de texto habituales. Esc cierra primero la ayuda; fuera de los campos, sale del editor y avisa si hay cambios sin guardar. Puedes guardar, descartar o cancelar la salida.</p></article>
      <article><h4>Ríos y afluentes</h4><p>Un afluente necesita un río receptor válido, que también puede ser otro afluente. Se impiden las relaciones circulares y se mantiene la vertiente del receptor. Para borrar un río con afluentes asociados, revisa antes esas relaciones.</p></article>
      <article><h4>Exportar la configuración</h4><p>Exportar descarga un ZIP con los datos y trazados. Guarda los cambios del borrador para conservarlos. El editor mantiene los accidentes guardados en este navegador; exportar permite tener una copia fuera de él.</p></article>
    </div>
  </section>;
}
