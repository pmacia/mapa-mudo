import React from 'react';
import { AlertTriangle, Save, Trash2, X } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  elementName: string;
  onSaveAndProceed: () => void;
  onDiscardAndProceed: () => void;
  onCancel: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  elementName,
  onSaveAndProceed,
  onDiscardAndProceed,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-900/50 p-6 flex flex-col gap-5 animate-scaleUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-title"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="unsaved-title" className="text-lg font-bold text-slate-900 dark:text-white">
              Cambios sin guardar
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Tienes cambios pendientes en el accidente{' '}
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                "{elementName || 'Sin nombre'}"
              </span>
              . ¿Deseas guardarlos antes de continuar?
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
            aria-label="Cerrar aviso"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onDiscardAndProceed}
            className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900 font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Descartar cambios
          </button>
          <button
            type="button"
            onClick={onSaveAndProceed}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Guardar y continuar
          </button>
        </div>
      </div>
    </div>
  );
};
