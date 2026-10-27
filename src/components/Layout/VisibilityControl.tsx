import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Eye, EyeOff, PanelTop, PanelBottom, PanelRight, Timer, ZoomIn } from 'lucide-react';

export interface VisibilityRegion {
  id: string;
  label: string;
  visible: boolean;
  onToggle: () => void;
}
interface VisibilityControlProps {
  regions: VisibilityRegion[];
  onToggleAll: () => void;
}
const icons = { header: PanelTop, navigation: PanelBottom, companion: PanelRight, telemetry: Timer, tools: ZoomIn };

/** One visibility control; its state describes the regions actually available in this mode. */
export function VisibilityControl({ regions, onToggleAll }: VisibilityControlProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const disclosure = useRef<HTMLButtonElement>(null);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPress = useRef(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const allHidden = regions.every(region => !region.visible);
  const cancelTimer = () => {
    if (pressTimer.current !== null) clearTimeout(pressTimer.current);
    pressTimer.current = null;
  };
  useEffect(() => {
    const onOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        disclosure.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onOutside);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onOutside);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);
  useEffect(() => () => cancelTimer(), []);

  return <div className="visibility-control" ref={root}>
    <button type="button" className="visibility-eye" aria-label={allHidden ? 'Mostrar interfaz' : 'Ocultar interfaz'}
      aria-pressed={allHidden} aria-controls="visibility-options"
      title={allHidden ? 'Mostrar todos los elementos disponibles · Mantén pulsado para elegir' : 'Ocultar todos los elementos flotantes · Mantén pulsado para elegir'}
      onPointerDown={event => {
        if (event.button !== 0 || !event.isPrimary) return;
        cancelTimer();
        longPress.current = false;
        start.current = { x: event.clientX, y: event.clientY };
        pressTimer.current = setTimeout(() => {
          longPress.current = true;
          setOpen(true);
          pressTimer.current = null;
        }, 500);
      }}
      onPointerMove={event => {
        if (start.current && Math.hypot(event.clientX - start.current.x, event.clientY - start.current.y) > 10) cancelTimer();
      }}
      onPointerUp={cancelTimer} onPointerCancel={cancelTimer} onPointerLeave={cancelTimer}
      onContextMenu={event => event.preventDefault()}
      onClick={() => {
        cancelTimer();
        if (longPress.current) { longPress.current = false; return; }
        setOpen(false);
        onToggleAll();
      }}>
      {allHidden ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
    <button ref={disclosure} type="button" className="visibility-disclosure" aria-label="Subopciones de visibilidad"
      aria-expanded={open} aria-controls="visibility-options" title={open ? 'Cerrar opciones del ojo' : 'Elegir qué barras y paneles mostrar'} onClick={() => setOpen(value => !value)}>
      <ChevronDown size={14} />
    </button>
    {open && <div id="visibility-options" className="visibility-menu ui-glass" role="dialog" aria-label="Visibilidad">
      <div className="visibility-menu-title"><Eye size={15} /><span>Visibilidad</span></div>
      {regions.map(region => {
        const Icon = icons[region.id as keyof typeof icons] ?? PanelRight;
        return <button key={region.id} type="button" className="visibility-option" aria-label={region.label}
          aria-pressed={region.visible} title={`${region.visible ? 'Ocultar' : 'Mostrar'} ${region.label}`} onClick={region.onToggle}>
          <Icon size={17} /><span>{region.label}</span><small>{region.visible ? 'Visible' : 'Oculto'}</small>
        </button>;
      })}
    </div>}
  </div>;
}
