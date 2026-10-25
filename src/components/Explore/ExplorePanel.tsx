import React, { useState, useEffect, useRef } from 'react';
import { GeoElement, CategoryType } from '../../types/geography';
import { CATEGORY_INFO, GEO_ELEMENTS } from '../../data/geographyData';
import { speakSpanish } from '../../utils/audio';
import { 
  Search, 
  Volume2, 
  MapPin, 
  Droplet, 
  Mountain, 
  Triangle, 
  Compass, 
  Palmtree, 
  Layers, 
  Waves, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  X, 
  RotateCcw,
  ArrowRight,
  Flame,
  Award,
  Filter,
  FilterX,
  ChevronDown,
  Check
} from 'lucide-react';
interface ExplorePanelProps {
  elements: GeoElement[];
  selectedElement: GeoElement | null;
  onSelectElement: (element: GeoElement | null) => void;
  activeCategory?: CategoryType | 'todos';
  onCategoryChange?: (cat: CategoryType | 'todos') => void;
  visitedAtlasIds?: string[];
  atlasStampUnlocked?: boolean;
  onOpenStampModal?: () => void;
  onResetAtlas?: () => void;
  onStartDailyChallenge?: () => void;
  className?: string;
}
const CATEGORY_TABS: { id: CategoryType | 'todos'; label: string; colorClass: string }[] = [
  { id: 'todos', label: 'Todos', colorClass: 'bg-primary text-on-primary shadow-[0_2px_0_#003ea8]' },
  { id: 'rios', label: 'Ríos', colorClass: 'bg-surface-container text-category-rivers hover:bg-surface-container-high' },
  { id: 'montanas', label: 'Cordilleras', colorClass: 'bg-surface-container text-category-mountains hover:bg-surface-container-high' },
  { id: 'picos', label: 'Picos', colorClass: 'bg-surface-container text-category-peaks hover:bg-surface-container-high' },
  { id: 'costas', label: 'Costas', colorClass: 'bg-surface-container text-category-coasts hover:bg-surface-container-high' },
  { id: 'islas', label: 'Islas', colorClass: 'bg-surface-container text-tertiary hover:bg-surface-container-high' },
  { id: 'unidades_relieve', label: 'Mesetas', colorClass: 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high' },
  { id: 'mares', label: 'Mares', colorClass: 'bg-surface-container text-category-rivers hover:bg-surface-container-high' },
];
export const ExplorePanel: React.FC<ExplorePanelProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  activeCategory = 'todos',
  onCategoryChange,
  visitedAtlasIds = [],
  atlasStampUnlocked,
  onOpenStampModal,
  onResetAtlas,
  onStartDailyChallenge,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<CategoryType | 'todos'>(activeCategory);
  const [isDailyChallengeDismissed, setIsDailyChallengeDismissed] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setSelectedCat(activeCategory);
  }, [activeCategory]);
  useEffect(() => {
    if (activeCategory !== 'todos' && !elements.some((element) => element.category === activeCategory)) {
      onCategoryChange?.('todos');
    }
  }, [activeCategory, elements, onCategoryChange]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleCategorySelect = (cat: CategoryType | 'todos') => {
    setSelectedCat(cat);
    if (onCategoryChange) {
      onCategoryChange(cat);
    }
  };
  const filteredElements = elements.filter((elem) => {
    const matchesCategory = selectedCat === 'todos' || elem.category === selectedCat;
    const matchesSearch =
      elem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (elem.subCategory && elem.subCategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
      elem.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const totalCount = elements.length;
  const scopedVisitedCount = elements.filter((element) => visitedAtlasIds.includes(element.id)).length;
  const progressPercent = totalCount > 0 ? Math.round((scopedVisitedCount / totalCount) * 100) : 0;
  const categoryTabs = CATEGORY_TABS
    .filter((tab) => tab.id === 'todos' || elements.some((element) => element.category === tab.id))
    .map((tab) => {
      const count = tab.id === 'todos'
        ? totalCount
        : elements.filter((element) => element.category === tab.id).length;
      return { ...tab, label: `${tab.label} (${count})` };
    });
  const getCategoryBadgeClass = (category: CategoryType) => {
    switch (category) {
      case 'rios':
        return 'bg-category-rivers/15 text-category-rivers border-category-rivers/30';
      case 'montanas':
        return 'bg-category-mountains/15 text-category-mountains border-category-mountains/30';
      case 'picos':
        return 'bg-category-peaks/15 text-category-peaks border-category-peaks/30';
      case 'costas':
        return 'bg-category-coasts/15 text-category-coasts border-category-coasts/30';
      case 'islas':
        return 'bg-tertiary/15 text-tertiary border-tertiary/30';
      case 'unidades_relieve':
        return 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-300';
      default:
        return 'bg-surface-container text-on-surface-variant border-outline-variant';
    }
  };
  return (
    <aside className={`w-full h-full min-h-0 flex flex-col gap-3.5 [&>*]:shrink-0 overflow-y-auto scrollbar-thin ${className || ''}`}>
      {/* 1. Official Curriculum Status Card */}
      <div className="w-full bg-surface-container-lowest dark:bg-slate-900 rounded-DEFAULT p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="font-label-caps text-[10px] text-primary uppercase tracking-wider font-extrabold">
              Módulo Oficial LOMLOE
            </span>
            <h2 className="font-headline-md text-base sm:text-lg text-on-surface dark:text-white leading-tight">
              1º ESO Geografía Física
            </h2>
          </div>
          {atlasStampUnlocked ? (
            <button
              onClick={onOpenStampModal}
              className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-xs cursor-pointer transition-transform ml-1"
              title="¡Sello Real Conseguido! Pulsa para ver"
            >
              <span>🎖️ Sello Real</span>
            </button>
          ) : (
            <div
              className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-lg ml-1 font-semibold"
              title={`Visita los ${GEO_ELEMENTS.length} accidentes para ganar el Sello Real`}
            >
              🎖️ Sello a los {GEO_ELEMENTS.length}
            </div>
          )}
          <div className="w-10 h-10 rounded-full bg-surface-container-high dark:bg-slate-800 flex items-center justify-center text-primary dark:text-blue-400 font-headline-md text-xs font-black shadow-xs shrink-0">
            {progressPercent}%
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-on-surface-variant dark:text-slate-400">
            <span className="font-body-bold text-xs">
              {scopedVisitedCount} de {totalCount} accidentes dominados
            </span>
            <span className="font-label-caps text-[10px] text-success-emerald font-bold">
              {scopedVisitedCount > 0 ? `+${scopedVisitedCount} explorados` : '¡Explora!'}
            </span>
          </div>
          <div className="w-full h-2.5 bg-surface-container dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-primary to-success-emerald rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
      {/* 2. Reto del Día Banner (Gamified Motivation Card) */}
      {!isDailyChallengeDismissed && (
        <div className="hidden lg:block w-full shrink-0 bg-gradient-to-br from-tertiary-container via-tertiary to-primary p-4 rounded-DEFAULT text-on-tertiary shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-surface-bright/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-[10px] font-extrabold uppercase">
                Reto Diario del Aula
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 font-body-bold text-xs text-secondary-fixed">
                  <Sparkles className="w-3.5 h-3.5 text-secondary-container" />
                  <span>+150 XP</span>
                </div>
                <button
                  onClick={() => setIsDailyChallengeDismissed(true)}
                  className="w-6 h-6 rounded-full bg-black/20 hover:bg-black/35 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer ml-1"
                  title="Cerrar reto diario"
                  aria-label="Cerrar reto diario"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="font-headline-md text-base sm:text-lg text-white font-extrabold leading-tight">
              Los Grandes Ríos y Cordilleras
            </h3>
            <p className="font-body-sm text-xs text-surface-container-high/90">
              Ubica los accidentes en el mapa mudo interactivo para consolidar la lección.
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-on-tertiary-container">
                Sello Cartográfico España 🏅
              </span>
              <button
                onClick={onStartDailyChallenge}
                className="px-3 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-body-bold text-xs shadow-[0_3px_0_#9a6200] active:scale-95 transition-all cursor-pointer"
              >
                ¡Jugar Reto!
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 3. Smart Search Input & Category Filter Dropdown */}
      <div className="w-full flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar picos, golfos o afluentes..."
            className="w-full bg-surface-container-lowest dark:bg-slate-900 text-on-surface dark:text-white font-body-base text-xs pl-10 pr-8 py-2.5 rounded-DEFAULT shadow-[0_2px_0_#cbd5e1] dark:shadow-none border border-slate-200/80 dark:border-slate-800 outline-none focus:ring-2 focus:ring-primary"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
              title="Borrar texto de búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {/* Filter Dropdown to the right of search */}
        <div className="relative shrink-0" ref={filterDropdownRef}>
          {selectedCat === 'todos' ? (
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              className="h-10 px-3 rounded-DEFAULT bg-surface-container-lowest dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_0_#cbd5e1] dark:shadow-none flex items-center gap-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
              title="Filtrar por categoría (ríos, cordilleras, etc.)"
              aria-label="Filtrar por categoría"
            >
              <Filter className="w-4 h-4 text-on-surface-variant" />
              <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
            </button>
          ) : (
            <div className="flex items-center rounded-DEFAULT bg-surface-container-lowest dark:bg-slate-900 border border-red-300 dark:border-red-900/60 shadow-[0_2px_0_#fca5a5] dark:shadow-none overflow-hidden h-10">
              <button
                type="button"
                onClick={() => {
                  handleCategorySelect('todos');
                  setIsFilterDropdownOpen(false);
                }}
                className="h-full px-2.5 flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 active:scale-95 transition-all cursor-pointer"
                title={`Eliminar filtro (${categoryTabs.find((t) => t.id === selectedCat)?.label || selectedCat}). Clic para ver todos.`}
                aria-label="Eliminar filtro"
              >
                <FilterX className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-[11px] font-bold max-w-[70px] truncate hidden sm:inline">
                  {categoryTabs.find((t) => t.id === selectedCat)?.label.split(' ')[0] || selectedCat}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                className="h-full px-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer border-l border-red-200 dark:border-red-900/50"
                title="Cambiar categoría de filtro"
                aria-label="Cambiar categoría de filtro"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {isFilterDropdownOpen && (
            <div className="absolute right-0 top-11 w-56 bg-surface-container-lowest dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-DEFAULT shadow-xl py-1.5 z-50 animate-fadeIn">
              <div className="px-3 py-1 text-[10px] font-label-caps text-on-surface-variant uppercase font-bold border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Filtrar Categoría</span>
                {selectedCat !== 'todos' && (
                  <button
                    onClick={() => {
                      handleCategorySelect('todos');
                      setIsFilterDropdownOpen(false);
                    }}
                    className="text-red-500 hover:text-red-700 text-[10px] font-bold cursor-pointer flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" /> Quitar
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {categoryTabs.map((tab) => {
                  const isSelected = selectedCat === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        handleCategorySelect(tab.id);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-xs font-body-bold flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-on-primary font-bold'
                          : 'text-on-surface dark:text-slate-200 hover:bg-surface-container dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="truncate">{tab.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* 4. Selected Accident Didactic Inspection Card */}
      {selectedElement && (
        <div className="w-full bg-surface-container-lowest dark:bg-slate-900 rounded-DEFAULT p-4 shadow-sm border-2 border-primary/40 dark:border-blue-500/40 flex flex-col gap-2.5 animate-fadeIn">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full font-label-caps text-[9px] uppercase border font-bold ${getCategoryBadgeClass(selectedElement.category)}`}>
                  {selectedElement.subCategory || selectedElement.category}
                </span>
                {selectedElement.vertiente && (
                  <span className="font-label-caps text-[9px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full uppercase">
                    Vertiente {selectedElement.vertiente}
                  </span>
                )}
                {visitedAtlasIds.includes(selectedElement.id) && (
                  <span className="font-label-caps text-[9px] bg-success-emerald/15 text-success-emerald px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Visitado
                  </span>
                )}
              </div>
              <h3 className="font-headline-md text-base sm:text-lg text-primary dark:text-blue-400 mt-1">
                {selectedElement.name}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => speakSpanish(`${selectedElement.name}. ${selectedElement.description}`)}
                className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-[0_2px_0_#b4c5ff] cursor-pointer"
                title="Escuchar locución didáctica"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onSelectElement(null)}
                className="w-8 h-8 rounded-full bg-surface-container dark:bg-slate-800 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high dark:hover:bg-slate-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Cerrar ficha didáctica"
                aria-label="Cerrar ficha del accidente"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="font-body-base text-xs text-on-surface-variant dark:text-slate-300 leading-relaxed">
            {selectedElement.description}
          </p>
          {selectedElement.elevationOrLength && (
            <div className="flex items-center gap-1 text-xs font-body-bold text-on-surface dark:text-white bg-surface-container dark:bg-slate-800 px-2.5 py-1 rounded-DEFAULT w-fit">
              <span>📏 Medida:</span>
              <span className="text-primary font-bold">{selectedElement.elevationOrLength}</span>
            </div>
          )}
          {selectedElement.curiosity && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-2.5 rounded-DEFAULT text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">¿Sabías que? </strong>
                {selectedElement.curiosity}
              </div>
            </div>
          )}
        </div>
      )}
      {/* 5. Directory list of matching accidents for quick location */}
      <div className="w-full flex-1 min-h-[12rem] bg-surface-container-lowest dark:bg-slate-900 rounded-DEFAULT p-3 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col gap-1.5" ref={listRef}>
        <div className="shrink-0 flex justify-between items-center px-1 pb-1 border-b border-slate-100 dark:border-slate-800">
          <span className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
            Directorio Geográfico ({filteredElements.length})
          </span>
          <span className="text-[10px] text-slate-400">
            Toca para centrar en mapa
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-thin flex flex-col gap-1 [&>*]:shrink-0">
          {filteredElements.length === 0 ? (
            <p className="px-2.5 py-3 text-xs text-on-surface-variant">
              No hay accidentes que coincidan con la configuración actual.
            </p>
          ) : filteredElements.map((elem) => {
            const isSelected = selectedElement?.id === elem.id;
            const isVisited = visitedAtlasIds.includes(elem.id);
            return (
              <button
                key={elem.id}
                onClick={() => onSelectElement(elem)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-body-bold flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'hover:bg-surface-container dark:hover:bg-slate-800 text-on-surface dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${isVisited ? 'bg-success-emerald' : 'bg-outline-variant'}`} />
                  <span className="truncate">{elem.name}</span>
                </div>
                <span className={`text-[10px] uppercase font-bold shrink-0 ml-2 ${isSelected ? 'text-primary-fixed' : 'text-slate-400'}`}>
                  {elem.subCategory || elem.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
