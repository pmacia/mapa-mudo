/** Shared by the editor's contextual help and the in-app manual. */
export const EDITOR_SHORTCUTS = [
  { label: 'Guardar cambios', keys: 'Ctrl / Cmd + S' },
  { label: 'Nuevo accidente', keys: 'Ctrl / Cmd + N' },
  { label: 'Duplicar accidente', keys: 'Ctrl / Cmd + D' },
  { label: 'Copiar accidente', keys: 'Ctrl / Cmd + C' },
  { label: 'Pegar accidente', keys: 'Ctrl / Cmd + V' },
  { label: 'Salir del editor', keys: 'Esc' },
  { label: 'Insertar vértice seleccionado', keys: '+' },
  { label: 'Borrar vértice seleccionado', keys: '− / Supr' },
] as const;
