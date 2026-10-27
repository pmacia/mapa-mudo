import React from 'react';
import { ChevronDown } from 'lucide-react';
interface FloatingRegionProps {
  id: string;
  label: string;
  className?: string;
  children: React.ReactNode;
  collapsed?: boolean;
  actions?: React.ReactNode;
  onCollapse?: () => void;
}
/** Hide presentation without unmounting game sessions or dirty editor drafts. */
export function FloatingRegion({ id, label, className = '', children, collapsed = false, actions, onCollapse }: FloatingRegionProps) {
  return <section className={`floating-region ${className}`} data-region={id} data-collapsed={collapsed} aria-label={label}>
    <div id={`${id}-content`} className="region-body" hidden={collapsed}>
      {(actions || onCollapse) && <div className="region-toolbar"><span>{label}</span><div className="region-actions">{actions}
        {onCollapse && <button type="button" className="ui-icon panel-collapse" aria-label={`Ocultar ${label}`}
          aria-controls={`${id}-content`} aria-expanded={!collapsed} onClick={onCollapse}><ChevronDown size={16} /></button>}
      </div></div>}
      {children}
    </div>
  </section>;
}
