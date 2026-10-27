import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';

/** Move an overlay without remounting its contents or changing the map beneath it. */
export function DraggableOverlay({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ id: number; x: number; y: number; offsetX: number; offsetY: number; rect: DOMRect } | null>(null);
  useEffect(() => {
    let frame = 0;
    const fit = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = root.current?.getBoundingClientRect();
        if (!rect || !rect.width || !rect.height) return;
        const dx = Math.max(12, Math.min(rect.x, innerWidth - rect.width - 12)) - rect.x;
        const dy = Math.max(12, Math.min(rect.y, innerHeight - rect.height - 12)) - rect.y;
        if (Math.abs(dx) > .5 || Math.abs(dy) > .5) setOffset(value => ({ x: value.x + dx, y: value.y + dy }));
      });
    };
    const observer = new ResizeObserver(fit);
    if (root.current) observer.observe(root.current);
    window.addEventListener('resize', fit);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', fit); };
  }, []);
  const begin = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !event.isPrimary || (event.target as Element).closest('button:not([data-overlay-drag-handle]), input, select, textarea')) return;
    const rect = root.current?.getBoundingClientRect();
    if (!rect) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y, rect };
  };
  return <div ref={root} className="draggable-overlay" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    onPointerDown={begin} onPointerMove={event => {
      const start = drag.current;
      if (!start || start.id !== event.pointerId) return;
      setOffset({
        x: start.offsetX + Math.max(12 - start.rect.x, Math.min(event.clientX - start.x, innerWidth - start.rect.right - 12)),
        y: start.offsetY + Math.max(12 - start.rect.y, Math.min(event.clientY - start.y, innerHeight - start.rect.bottom - 12)),
      });
    }} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
    onKeyDown={event => {
      if (!(event.target as Element).closest('[data-overlay-drag-handle]')) return;
      const direction = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] }[event.key];
      const rect = root.current?.getBoundingClientRect();
      if (!direction || !rect) return;
      event.preventDefault();
      event.stopPropagation();
      setOffset(value => ({
        x: value.x + Math.max(12 - rect.x, Math.min(direction[0], innerWidth - rect.right - 12)),
        y: value.y + Math.max(12 - rect.y, Math.min(direction[1], innerHeight - rect.bottom - 12)),
      }));
    }}>{children}</div>;
}
