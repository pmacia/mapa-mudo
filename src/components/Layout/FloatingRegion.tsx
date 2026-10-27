import React from 'react';
import { useDraggableOverlay } from './DraggableOverlay';
import { ChevronDown, GripHorizontal } from 'lucide-react';
interface FloatingRegionProps {
  id: string;
  label: string;
  className?: string;
  children: React.ReactNode;
  collapsed?: boolean;
  actions?: React.ReactNode;
  onCollapse?: () => void;
  resetKey?: string;
}
/** Hide presentation without unmounting game sessions or dirty editor drafts. */
export function FloatingRegion({ id, label, className = '', children, collapsed = false, actions, onCollapse, resetKey }: FloatingRegionProps) {
  const draggable = Boolean(onCollapse);
  const drag = useDraggableOverlay<HTMLElement>({ enabled: draggable, handleOnly: true, resetKey });
  return <section {...drag} className={`floating-region ${className}`} data-region={id} data-collapsed={collapsed} aria-label={label}>
    <div id={`${id}-content`} className="region-body" hidden={collapsed}>
      {(actions || onCollapse) && <div className="region-toolbar">{draggable ? <button type="button" className="panel-drag-handle" data-overlay-drag-handle
        aria-label={`Mover panel ${label}`} title="Arrastra para mover · Flechas del teclado para ajustar"><GripHorizontal size={15} /><span>{label}</span></button> : <span>{label}</span>}<div className="region-actions">{actions}
        {onCollapse && <button type="button" className="ui-icon panel-collapse" aria-label={`Ocultar ${label}`}
          aria-controls={`${id}-content`} aria-expanded={!collapsed} onClick={onCollapse}><ChevronDown size={16} /></button>}
      </div></div>}
      {children}
    </div>
  </section>;
}
