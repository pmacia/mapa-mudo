import React, { useState } from 'react';
import { CategoryType } from '../../types/geography';
import { 
  Droplet, 
  Mountain, 
  Triangle, 
  Compass, 
  Palmtree, 
  Layers, 
  Check, 
  X, 
  Waves, 
  Sparkles, 
  Map as MapIcon, 
  Building2,
  SlidersHorizontal,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap
} from 'lucide-react';
export interface AccidentFilterState {
  rios: boolean;
  afluentes: boolean;
  montanas: boolean;
  picos: boolean;
  costas: boolean;
  mares: boolean;
  islas: boolean;
  unidades_relieve: boolean;
  showLabels: boolean;
  labelsByCategory?: Partial<Record<CategoryType, boolean>>;
  showCommunities?: boolean;
  showProvinces?: boolean;
}
interface AccidentFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AccidentFilterState;
  onToggleFilter: (category: keyof Omit<AccidentFilterState, 'labelsByCategory'>) => void;
  onToggleCategoryLabel: (category: CategoryType) => void;
  onApplyPreset: (preset: 'todos' | 'rios' | 'relieve' | 'costas') => void;
  activeCount: number;
  totalCount: number;
}
export const AccidentFilterPanel: React.FC<AccidentFilterPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onToggleFilter,
  onToggleCategoryLabel,
  onApplyPreset,
  activeCount,
  totalCount,
}) => {
  const [activePreset, setActivePreset] = useState<'todos' | 'rios' | 'relieve' | 'costas' | null>(() =>
    filters.rios && filters.afluentes && filters.montanas && filters.picos && filters.costas &&
    filters.mares && filters.islas && filters.unidades_relieve ? 'todos' : null
  );

  const applyPreset = (preset: 'todos' | 'rios' | 'relieve' | 'costas') => {
    onApplyPreset(preset);
    setActivePreset(preset);
  };

  const presetButtonClass = (preset: 'todos' | 'rios' | 'relieve' | 'costas') =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-DEFAULT font-body-bold text-xs active:translate-y-0.5 transition-all cursor-pointer ${
      activePreset === preset
        ? 'bg-primary text-on-primary shadow-[0_2px_0_#003ea8]'
        : 'bg-surface-container dark:bg-slate-700 text-on-surface dark:text-white hover:bg-surface-container-high shadow-[0_2px_0_#cbd5e1] dark:shadow-none'
    }`;

  if (!isOpen) return null;
  const categoriesList: { 
    key: CategoryType; 
    label: string; 
    countLabel: string; 
    icon: React.ReactNode; 
    badgeClass: string;
    borderClass: string;
  }[] = [
    {
      key: 'rios',
      label: 'Ríos de España',
      countLabel: '17 ríos (Tajo, Ebro, Duero...)',
      icon: <Droplet className="w-5 h-5 text-category-rivers" />,
      badgeClass: 'bg-category-rivers/15 text-category-rivers',
      borderClass: 'border-category-rivers/40',
    },
    {
      key: 'afluentes',
      label: 'Afluentes',
      countLabel: 'Ríos que desembocan en otros ríos',
      icon: <Droplet className="w-5 h-5 text-cyan-600" />,
      badgeClass: 'bg-cyan-100 text-cyan-800',
      borderClass: 'border-cyan-400/40',
    },
    {
      key: 'montanas',
      label: 'Cordilleras y Relieve',
      countLabel: '13 cordilleras y sierras',
      icon: <Mountain className="w-5 h-5 text-category-mountains" />,
      badgeClass: 'bg-category-mountains/15 text-category-mountains',
      borderClass: 'border-category-mountains/40',
    },
    {
      key: 'picos',
      label: 'Picos y Cumbres',
      countLabel: 'Teide, Mulhacén, Aneto...',
      icon: <Triangle className="w-5 h-5 text-category-peaks" />,
      badgeClass: 'bg-category-peaks/15 text-category-peaks',
      borderClass: 'border-category-peaks/40',
    },
    {
      key: 'costas',
      label: 'Cabos, Golfos y Estrechos',
      countLabel: '11 accidentes costeros',
      icon: <Compass className="w-5 h-5 text-category-coasts" />,
      badgeClass: 'bg-category-coasts/15 text-category-coasts',
      borderClass: 'border-category-coasts/40',
    },
    {
      key: 'mares',
      label: 'Mares y Océanos',
      countLabel: 'Atlántico, Cantábrico, Mediterráneo',
      icon: <Waves className="w-5 h-5 text-primary" />,
      badgeClass: 'bg-primary/15 text-primary',
      borderClass: 'border-primary/40',
    },
    {
      key: 'islas',
      label: 'Islas Baleares y Canarias',
      countLabel: '13 islas (inc. La Graciosa y Cabrera)',
      icon: <Palmtree className="w-5 h-5 text-tertiary" />,
      badgeClass: 'bg-tertiary/15 text-tertiary',
      borderClass: 'border-tertiary/40',
    },
    {
      key: 'unidades_relieve',
      label: 'Mesetas y Depresiones',
      countLabel: 'Submesetas y Depresiones Ebro/Guadalquivir',
      icon: <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      badgeClass: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300',
      borderClass: 'border-purple-300 dark:border-purple-800',
    },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-surface-container-lowest dark:bg-slate-900 w-full max-w-3xl rounded-DEFAULT sm:rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER Y RESUMEN CURRICULAR */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-surface-container-low dark:bg-slate-850 flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-label-caps text-[10px] uppercase font-bold">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Personalización Curricular PDI
              </span>
              <span className="text-on-surface-variant font-label-caps text-[10px] uppercase">
                • LOMLOE 1º ESO
              </span>
            </div>
            <h2 className="font-headline-md text-base sm:text-xl text-on-surface dark:text-white font-extrabold leading-tight">
              Herramientas Didácticas: Capas del Mapa y Modo de Estudio
            </h2>
            <p className="font-body-sm text-xs text-on-surface-variant dark:text-slate-400">
              Personaliza qué elementos físicos, hidrográficos y costeros deseas proyectar o practicar en el mapa mudo interactivo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high dark:bg-slate-800 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer shrink-0"
            title="Cerrar panel de capas"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 scrollbar-thin">
          {/* Presets Didácticos de Acceso Rápido */}
          <div className="bg-surface-container-low dark:bg-slate-800/80 p-3.5 rounded-DEFAULT shadow-[0_2px_0_#cbd5e1] dark:shadow-none flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                Presets Recomendados de Aula ({activeCount} de {totalCount} accidentes activos)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => applyPreset('todos')}
                aria-pressed={activePreset === 'todos'}
                className={presetButtonClass('todos')}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Oficial 1º ESO (Todos)</span>
              </button>
              <button
                onClick={() => applyPreset('rios')}
                aria-pressed={activePreset === 'rios'}
                className={presetButtonClass('rios')}
              >
                <Droplet className="w-3.5 h-3.5 text-category-rivers" />
                <span>Ríos y Vertientes</span>
              </button>
              <button
                onClick={() => applyPreset('relieve')}
                aria-pressed={activePreset === 'relieve'}
                className={presetButtonClass('relieve')}
              >
                <Mountain className="w-3.5 h-3.5 text-category-mountains" />
                <span>Relieve Peninsular</span>
              </button>
              <button
                onClick={() => applyPreset('costas')}
                aria-pressed={activePreset === 'costas'}
                className={presetButtonClass('costas')}
              >
                <Compass className="w-3.5 h-3.5 text-category-coasts" />
                <span>Costas e Islas</span>
              </button>
            </div>
          </div>
          {/* SECCIÓN 1: Capas Temáticas Curriculares */}
          <div className="space-y-2.5">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-extrabold tracking-wider">
              Capas Temáticas del Currículo
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {categoriesList.map((cat) => {
                const isActive = filters[cat.key];
                return (
                  <button
                    key={cat.key}
                    aria-pressed={isActive}
                    onClick={() => (setActivePreset(null), onToggleFilter(cat.key))}
                    className={`p-3 rounded-DEFAULT border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                      isActive
                        ? `${cat.borderClass} bg-surface-container-lowest dark:bg-slate-800 shadow-[0_2px_0_#cbd5e1]`
                        : 'bg-surface-container-low/60 dark:bg-slate-800/40 text-slate-400 border-transparent opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${cat.badgeClass}`}>
                        {cat.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-md text-xs sm:text-sm font-bold text-on-surface dark:text-white leading-tight">
                          {cat.label}
                        </span>
                        <span className="font-body-sm text-[11px] text-on-surface-variant dark:text-slate-400">
                          {cat.countLabel}
                        </span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                      isActive 
                        ? 'bg-primary text-on-primary border-primary shadow-xs' 
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {isActive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* SECCIÓN 2: Base Cartográfica y Capas de Territorio */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-extrabold tracking-wider">
              Base Cartográfica y División Política
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Comunidades Autónomas */}
              <button
                onClick={() => onToggleFilter('showCommunities')}
                className={`p-3 rounded-DEFAULT border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                  filters.showCommunities
                    ? 'border-primary/40 bg-surface-container-lowest dark:bg-slate-800 shadow-[0_2px_0_#cbd5e1]'
                    : 'bg-surface-container-low/60 dark:bg-slate-800/40 text-slate-400 border-transparent opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MapIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-md text-xs sm:text-sm font-bold text-on-surface dark:text-white">
                      Comunidades Autónomas
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant dark:text-slate-400">
                      17 CC.AA. y ciudades autónomas
                    </span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                  filters.showCommunities ? 'bg-primary text-on-primary border-primary shadow-xs' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {filters.showCommunities && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
              {/* Provincias */}
              <button
                onClick={() => onToggleFilter('showProvinces')}
                className={`p-3 rounded-DEFAULT border text-left flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                  filters.showProvinces
                    ? 'border-primary/40 bg-surface-container-lowest dark:bg-slate-800 shadow-[0_2px_0_#cbd5e1]'
                    : 'bg-surface-container-low/60 dark:bg-slate-800/40 text-slate-400 border-transparent opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-md text-xs sm:text-sm font-bold text-on-surface dark:text-white">
                      Provincias de España
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant dark:text-slate-400">
                      50 límites provinciales oficiales
                    </span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                  filters.showProvinces ? 'bg-primary text-on-primary border-primary shadow-xs' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  {filters.showProvinces && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>
          {/* SECCIÓN 3: Opciones de Aprendizaje y PDI (Etiquetas y Nombres) */}
          <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-extrabold tracking-wider">
              Opciones de Aprendizaje y Examen
            </span>
            <button
              aria-label="Mostrar textos en el mapa"
              aria-pressed={filters.showLabels}
              onClick={() => onToggleFilter('showLabels')}
              className={`w-full p-3 rounded-DEFAULT border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                filters.showLabels
                  ? 'border-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-[0_2px_0_#a7f3d0]'
                  : 'border-slate-300 dark:border-slate-700 bg-surface-container-low dark:bg-slate-800 text-on-surface dark:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${filters.showLabels ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-container text-slate-500'}`}>
                  {filters.showLabels ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-headline-md text-xs sm:text-sm font-bold">
                    {filters.showLabels ? 'Etiquetas y Topónimos Visibles' : 'Modo Mapa Mudo Escolar Puro (Sin nombres)'}
                  </span>
                  <span className="font-body-sm text-[11px] opacity-80">
                    {filters.showLabels ? 'Muestra nombres de ríos, montañas y cabos para estudio' : 'Oculta nombres para evaluar memoria geográfica'}
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                filters.showLabels ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {filters.showLabels ? 'Activado' : 'Mudo'}
              </div>
            </button>
            <fieldset className="category-label-options" aria-label="Textos por tipo de accidente">
              <legend>Textos por tipo de accidente</legend>
              <p>{filters.showLabels ? 'Elige qué nombres mostrar. Las capas desactivadas no están disponibles.' : 'Activa los textos para ajustar los nombres por tipo. Tu selección se conserva.'}</p>
              <div className="category-label-grid">
                {categoriesList.map(cat => <label key={cat.key} className="category-label-option"
                  data-disabled={!filters[cat.key] || !filters.showLabels}>
                  <input type="checkbox" aria-label={`Textos: ${cat.label}`}
                    checked={filters.labelsByCategory?.[cat.key] !== false}
                    disabled={!filters[cat.key] || !filters.showLabels}
                    onChange={() => onToggleCategoryLabel(cat.key)} />
                  <span>{cat.label}</span>
                </label>)}
              </div>
            </fieldset>
          </div>
        </div>
        {/* Footer with Apply button */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-surface-container-low dark:bg-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary rounded-DEFAULT font-headline-md text-sm shadow-[0_3px_0_#003ea8] active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Aplicar y Volver al Mapa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
