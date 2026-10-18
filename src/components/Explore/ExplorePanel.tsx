import React, { useState, useEffect, useRef } from 'react';
import { GeoElement, CategoryType } from '../../types/geography';
import { CATEGORY_INFO } from '../../data/geographyData';
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
  Filter,
  FilterX,
  ChevronDown,
  X,
  RotateCcw
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
  className?: string;
}

const CATEGORY_OPTIONS: { id: CategoryType | 'todos'; label: string; emoji: string }[] = [
  { id: 'todos', label: 'Todos', emoji: '🗺️' },
  { id: 'rios', label: 'Ríos', emoji: '💧' },
  { id: 'montanas', label: 'Cordilleras', emoji: '⛰️' },
  { id: 'picos', label: 'Picos', emoji: '🔺' },
  { id: 'costas', label: 'Costas y Cabos', emoji: '🧭' },
  { id: 'mares', label: 'Mares', emoji: '🌊' },
  { id: 'islas', label: 'Islas', emoji: '🏝️' },
  { id: 'unidades_relieve', label: 'Mesetas', emoji: '🟫' },
];

export const ExplorePanel: React.FC<ExplorePanelProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  activeCategory = 'todos',
  onCategoryChange,
  visitedAtlasIds,
  atlasStampUnlocked,
  onOpenStampModal,
  onResetAtlas,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<CategoryType | 'todos'>(activeCategory);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const [showProgressCard, setShowProgressCard] = useState(true);

  // Sync if prop changes
  useEffect(() => {
    setSelectedCat(activeCategory);
  }, [activeCategory]);

  // Close filter dropdown on click outside
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

  const isFiltered = selectedCat !== 'todos';
  const activeOption = CATEGORY_OPTIONS.find((opt) => opt.id === selectedCat) || CATEGORY_OPTIONS[0];

  // Filter elements by category and search
  const filteredElements = elements.filter((elem) => {
    const matchesCategory = selectedCat === 'todos' || elem.category === selectedCat;
    const matchesSearch =
      elem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (elem.subCategory && elem.subCategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
      elem.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: CategoryType) => {
    switch (category) {
      case 'rios':
        return <Droplet className="w-4 h-4 text-sky-500" />;
      case 'montanas':
        return <Mountain className="w-4 h-4 text-amber-500" />;
      case 'picos':
        return <Triangle className="w-4 h-4 text-red-500" />;
      case 'costas':
        return <Compass className="w-4 h-4 text-teal-500" />;
      case 'islas':
        return <Palmtree className="w-4 h-4 text-emerald-500" />;
      case 'unidades_relieve':
        return <Layers className="w-4 h-4 text-purple-500" />;
      case 'mares':
        return <Waves className="w-4 h-4 text-blue-500" />;
      default:
        return <MapPin className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className={`flex flex-col flex-1 h-full min-h-0 bg-white dark:bg-slate-900 border-0 lg:border border-slate-200 dark:border-slate-800 rounded-none lg:rounded-2xl shadow-none lg:shadow-sm overflow-hidden ${className || ''}`}>
      {/* Header, Search, Category Filter (Compact layout saving maximum vertical space), detalles de la selección (opcional) */}
      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-2 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Atlas Didáctico
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {filteredElements.length} de {elements.length}
          </span>
        </div>

        {/* Search Bar + Filter Dropdown & Clear Filter Button */}
        <div className="flex items-center gap-1.5">
          {/* Compact Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, cabo, río..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative shrink-0" ref={filterDropdownRef}>
            <button
              onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                isFiltered
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Elegir filtro de categoría"
              aria-label="Elegir filtro"
              aria-expanded={isFilterDropdownOpen}
            >
              <Filter className={`w-3.5 h-3.5 ${isFiltered ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
              <span className="hidden sm:inline max-w-[85px] truncate">
                {isFiltered ? activeOption.label : 'Filtro'}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 text-xs flex flex-col gap-0.5 animate-fadeIn">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  Filtrar por categoría
                </div>
                {CATEGORY_OPTIONS.map((opt) => {
                  const isSelected = selectedCat === opt.id;
                  const count =
                    opt.id === 'todos'
                      ? elements.length
                      : elements.filter((e) => e.category === opt.id).length;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        handleCategorySelect(opt.id);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium transition-colors cursor-pointer text-left ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </span>
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-blue-200/80 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Botón con filtro tachado para eliminar fácilmente un filtro (si es que se ha elegido uno) */}
          {isFiltered && (
            <button
              onClick={() => handleCategorySelect('todos')}
              className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:text-rose-700 transition-colors cursor-pointer shadow-xs animate-fadeIn shrink-0"
              title="Eliminar filtro (mostrar todos)"
              aria-label="Eliminar filtro"
            >
              <FilterX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Atlas Gamification Progress Card */}
        {showProgressCard && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/60 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-200">
              <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Exploración del Atlas</span>
            </div>

            <div className="flex items-center justify-end gap-1.5">
              {atlasStampUnlocked ? (
                <button
                  onClick={onOpenStampModal}
                  className="h-7 flex items-center justify-center gap-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[10px] font-black px-2 rounded-lg shadow-xs cursor-pointer transition-transform"
                  title="¡Sello Real Conseguido! Pulsa para ver"
                >
                  <span>🎖️ Sello Obtenido</span>
                </button>
              ) : (
                <span className="h-7 flex items-center justify-center text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-800 px-2 rounded-lg">
                  🎖️ Sello a los 65
                </span>
              )}

              {/* Botón de reinicio de la exploración del Atlas */}
              <button
                type="button"
                onClick={onResetAtlas}
                className="h-7 w-7 shrink-0 flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/50 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
                title="Reiniciar exploración del Atlas para volver a conseguir el Sello Real"
                aria-label="Reiniciar exploración del Atlas"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Botón para cerrar la Progress Card */}
              <button
                type="button"
                onClick={() => setShowProgressCard(false)}
                className="h-7 w-7 shrink-0 flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
                title="Cerrar progreso"
                aria-label="Cerrar progreso"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Progress bar and counter */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-amber-200/60 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(((visitedAtlasIds?.length || 0) / elements.length) * 100)
                  )}%`,
                }}
              />
            </div>
            <span className="text-[11px] font-mono font-black text-amber-900 dark:text-amber-200 shrink-0">
              {visitedAtlasIds?.length || 0} / {elements.length}
            </span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-amber-800/80 dark:text-amber-300/80">
            <span>+10 pts por cada accidente nuevo visitado</span>
            <span className="font-bold font-mono">
              +{(visitedAtlasIds?.length || 0) * 10} XP
            </span>
          </div>
        </div>
        )}

      {/* Selected Element Detailed Card (If any is selected) */}
      {selectedElement && (                                     
        <div className="p-3.5 bg-blue-50/80 dark:bg-slate-800/95 border border-slate-200/80 dark:border-slate-900/60 rounded-xl p-2.5 flex flex-col gap-1.5 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700">
                  {selectedElement.subCategory || selectedElement.category}
                </span>
                {selectedElement.elevationOrLength && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {selectedElement.elevationOrLength}
                  </span>
                )}
                {visitedAtlasIds?.includes(selectedElement.id) ? (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                    ✓ 10 pts conseguidos
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-1.5 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                    ✨ +10 XP al descubrir
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                {selectedElement.name}
              </h3>
            </div>

            {/* Botón para escuchar el nombre */}
            <button
              onClick={() => speakSpanish(selectedElement.name)}
              className="p-1.5 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Escuchar pronunciación"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

            {/* Botón para cerrar la tarjeta de detalles */}
            <button
              onClick={() => onSelectElement(null)} 
              className="p-1.5 bg-white dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-xs cursor-pointer"
              title="Cerrar descripción"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {selectedElement.description}
          </p>

          <div className="bg-amber-100/70 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-900 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">¿Sabías que...? </span>
              {selectedElement.curiosity}
            </div>
          </div>
        </div>
      )}

      </div>


      {/* List of Geographic Elements */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {filteredElements.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No se han encontrado elementos con esa búsqueda o filtro.
          </div>
        ) : (
          filteredElements.map((elem) => {
            const isSelected = selectedElement?.id === elem.id;
            const isVisited = visitedAtlasIds?.includes(elem.id);

            return (
              <button
                key={elem.id}
                onClick={() => onSelectElement(elem)}
                className={`w-full p-2 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`p-1 rounded-lg shrink-0 ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    {getCategoryIcon(elem.category)}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-xs truncate">{elem.name}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {elem.subCategory || elem.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                  {isVisited ? (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-emerald-400 text-emerald-950 font-black'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                      }`}
                      title="Accidente visitado (+10 pts)"
                    >
                      ✓ 10 pts
                    </span>
                  ) : (
                    <span
                      className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-blue-500/40 text-blue-100'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}
                      title="Pasa el ratón sobre el mapa para descubrirlo"
                    >
                      Nuevo
                    </span>
                  )}
                  {elem.elevationOrLength && (
                    <span
                      className={`text-[10px] font-mono hidden sm:inline ${
                        isSelected ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {elem.elevationOrLength}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
