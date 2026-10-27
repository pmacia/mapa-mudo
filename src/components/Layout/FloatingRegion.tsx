import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FloatingRegionProps {
  id: string;
  label: string;
  className?: string;
  children: React.ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
  actions?: React.ReactNode;
  resetKey?: string;
}

/** Hiding presentation must never unmount a game, timer or dirty editor. */
export function FloatingRegion({ id, label, className = '', children, collapsed, onToggle, actions, resetKey }: FloatingRegionProps) {
  const [localCollapsed, setLocalCollapsed] = useState(false);
  useEffect(() => setLocalCollapsed(false), [resetKey]);
  const hidden = collapsed ?? localCollapsed;
  const restoreRef = useRef<HTMLButtonElement>(null);
  const collapseRef = useRef<HTMLButtonElement>(null);
  const toggle = () => {
    if (onToggle) onToggle(); else setLocalCollapsed(value => !value);
    requestAnimationFrame(() => (hidden ? collapseRef : restoreRef).current?.focus());
  };
  return (
    <section className={`floating-region ${className}`} data-region={id} data-collapsed={hidden} aria-label={label}>
      <button ref={restoreRef} type="button" className="region-restore ui-glass" hidden={!hidden}
        onClick={toggle} aria-label={`Mostrar ${label}`} aria-controls={`${id}-content`} aria-expanded={!hidden}>
        <ChevronUp size={16} /><span>{label}</span>
      </button>
      <div id={`${id}-content`} className="region-body" hidden={hidden}>
        <div className="region-toolbar">
          <span>{label}</span>
          <div className="region-actions">{actions}<button ref={collapseRef} type="button" className="ui-icon region-collapse"
            onClick={toggle} aria-label={`Ocultar ${label}`} aria-controls={`${id}-content`} aria-expanded={!hidden}>
            <ChevronDown size={16} />
          </button></div>
        </div>
        {children}
      </div>
    </section>
  );
}
