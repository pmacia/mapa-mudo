import React from 'react';
import { CategoryType } from '../../types/geography';
import { 
  Droplet, 
  Mountain, 
  Triangle, 
  Compass, 
  Palmtree, 
  Layers, 
  Check, 
  SlidersHorizontal,
  Eye,
  EyeOff,
  X,
  Waves,
  Sparkles
} from 'lucide-react';

export interface AccidentFilterState {
  rios: boolean;
  montanas: boolean;
  picos: boolean;
  costas: boolean;
  mares: boolean;
  islas: boolean;
  unidades_relieve: boolean;
  showLabels: boolean;
}

interface AccidentFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AccidentFilterState;
  onToggleFilter: (category: keyof AccidentFilterState) => void;
  onApplyPreset: (preset: 'todos' | 'rios' | 'relieve' | 'costas') => void;
  activeCount: number;
  totalCount: number;
}

export const AccidentFilterPanel: React.FC<AccidentFilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onToggleFilter,
  onApplyPreset,
  activeCount,
  totalCount,
}) => {
  if (!isOpen) return null;

  const categoriesList: { key: CategoryType; label: string; countLabel: string; icon: React.ReactNode; color: string }[] = [
    {
      key: 'rios',
      label: 'Ríos de España',
      countLabel: '17 ríos',
      icon: <Droplet className="w-5 h-5 text-sky-500" />,
      color: 'border-sky-300 dark:border-sky-700 bg-sky-50/90 dark:bg-sky-950/70 text-sky-950 dark:text-sky-200',
    },
    {
      key: 'montanas',
      label: 'Cordilleras y Relieve',
      countLabel: '13 cordilleras/sierras',
      icon: <Mountain className="w-5 h-5 text-amber-600" />,
      color: 'border-amber-300 dark:border-amber-700 bg-amber-50/90 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200',
    },
    {
      key: 'picos',
      label: 'Picos y Cumbres',
      countLabel: 'Teide, Mulhacén, Aneto...',
      icon: <Triangle className="w-5 h-5 text-red-500" />,
      color: 'border-red-300 dark:border-red-700 bg-red-50/90 dark:bg-red-950/70 text-red-950 dark:text-red-200',
    },
    {
      key: 'costas',
      label: 'Cabos, Golfos y Estrechos',
      countLabel: '11 accidentes costeros',
      icon: <Compass className="w-5 h-5 text-teal-600" />,
      color: 'border-teal-300 dark:border-teal-700 bg-teal-50/90 dark:bg-teal-950/70 text-teal-950 dark:text-teal-200',
    },
    {
      key: 'mares',
      label: 'Mares y Océanos',
      countLabel: 'Atlántico, Cantábrico, Mediterráneo',
      icon: <Waves className="w-5 h-5 text-blue-500" />,
      color: 'border-blue-300 dark:border-blue-700 bg-blue-50/90 dark:bg-blue-950/70 text-blue-950 dark:text-blue-200',
    },
    {
      key: 'islas',
      label: 'Islas Baleares y Canarias',
      countLabel: '13 islas (inc. Cabrera y La Graciosa)',
      icon: <Palmtree className="w-5 h-5 text-emerald-600" />,
      color: 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/90 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200',
    },
    {
      key: 'unidades_relieve',
      label: 'Mesetas y Depresiones',
      countLabel: 'Submesetas y Depresiones Ebro/Guadalquivir',
      icon: <Layers className="w-5 h-5 text-purple-600" />,
      color: 'border-purple-300 dark:border-purple-700 bg-purple-50/90 dark:bg-purple-950/70 text-purple-950 dark:text-purple-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Capas y Selección de Accidentes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configura qué accidentes geográficos se muestran en el mapa y entran en los retos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Active summary & Quick Presets */}
          <div className="bg-blue-50/80 dark:bg-slate-800/90 p-3.5 rounded-xl border border-blue-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                Estado Actual
              </span>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                {activeCount} de {totalCount} accidentes seleccionados
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                onClick={() => onApplyPreset('todos')}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-blue-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                ⭐ Todo ESO
              </button>
              <button
                onClick={() => onApplyPreset('rios')}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-sky-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                💧 Solo Ríos
              </button>
              <button
                onClick={() => onApplyPreset('relieve')}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                🏔️ Relieve
              </button>
              <button
                onClick={() => onApplyPreset('costas')}
                className="px-2.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-teal-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                ⚓ Costas
              </button>
            </div>
          </div>

          {/* Category Cards Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Tipos de accidentes para ver y jugar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categoriesList.map((cat) => {
                const isActive = filters[cat.key];

                return (
                  <button
                    key={cat.key}
                    onClick={() => onToggleFilter(cat.key)}
                    className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-2 text-left cursor-pointer ${
                      isActive
                        ? cat.color + ' shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/80 shadow-xs">
                        {cat.icon}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {cat.label}
                        </div>
                        <div className="text-[11px] opacity-70 font-normal">
                          {cat.countLabel}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map labels toggle */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Visualización en el mapa
            </h3>
            <button
              onClick={() => onToggleFilter('showLabels')}
              className={`w-full p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer ${
                filters.showLabels
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800'
                  : 'bg-amber-100/70 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-800/80">
                  {filters.showLabels ? (
                    <Eye className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm">
                    {filters.showLabels ? 'Modo Didáctico: Rótulos Visibles' : 'Modo Mapa Mudo 100%'}
                  </div>
                  <div className="text-[11px] opacity-75 font-normal">
                    {filters.showLabels
                      ? 'Los nombres de los accidentes se muestran directamente sobre el mapa.'
                      : 'Sin textos en el mapa: ideal para memorizar, practicar y examinarse.'}
                  </div>
                </div>
              </div>

              <span className="text-xs uppercase font-mono px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 font-bold border border-slate-200 dark:border-slate-700 shadow-xs">
                {filters.showLabels ? 'Activado' : 'Mudo'}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {activeCount === 0 ? (
              <span className="text-rose-500 font-semibold">⚠️ Selecciona al menos 1 categoría</span>
            ) : (
              <span>Listo para jugar con {activeCount} elementos</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Aplicar y Ver Mapa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
