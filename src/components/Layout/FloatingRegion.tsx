import React from 'react';
interface FloatingRegionProps {
  id: string;
  label: string;
  className?: string;
  children: React.ReactNode;
  collapsed?: boolean;
  actions?: React.ReactNode;
}
/** Hide presentation without unmounting game sessions or dirty editor drafts. */
export function FloatingRegion({ id, label, className = '', children, collapsed = false, actions }: FloatingRegionProps) {
  return <section className={`floating-region ${className}`} data-region={id} data-collapsed={collapsed} aria-label={label}>
    <div id={`${id}-content`} className="region-body" hidden={collapsed}>
      {actions && <div className="region-toolbar"><span>{label}</span><div className="region-actions">{actions}</div></div>}
      {children}
    </div>
  </section>;
}
