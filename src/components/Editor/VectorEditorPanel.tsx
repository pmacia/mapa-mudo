import React, { useState, useMemo } from 'react';
import {
  GeoElement,
  CategoryType,
  VertienteType,
  DifficultyLevel,
} from '../../types/geography';
import {
  Search,
  Filter,
  FilterX,
  Plus,
  Trash2,
  Copy,
  Save,
  RotateCcw,
  RotateCw,
  Move,
  Check,
  AlertCircle,
  X,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  FlipHorizontal,
  FlipVertical,
  Code2,
  FileDown,
  PanelRightClose,
  ChevronRight,
} from 'lucide-react';
import {
  parseSvgPathToPoints,
  pointsToSvgPath,
  translatePoints,
  rotatePoints,
  scalePoints,
  calculateCentroid,
} from '../../utils/vectorEditorUtils';

interface VectorEditorPanelProps {
  elements: GeoElement[];
  selectedElement: GeoElement | null;
  draftElement: GeoElement | null;
  hasUnsavedChanges: boolean;
  onSelectElement: (element: GeoElement) => void;
  onUpdateDraftField: <K extends keyof GeoElement>(field: K, value: GeoElement[K]) => void;
  onSave: () => void;
  onDiscard: () => void;
  onCreateNew: () => void;
  onDuplicate: (element: GeoElement) => void;
  onDelete: (element: GeoElement) => void;
  onExitEditMode: () => void;
  onToggleCollapse?: () => void;
}

const CATEGORIES: { id: CategoryType | 'todos'; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todos', icon: '🇪🇸' },
  { id: 'rios', label: 'Ríos', icon: '🌊' },
  { id: 'montanas', label: 'Montañas', icon: '🏔️' },
  { id: 'picos', label: 'Picos', icon: '⛰️' },
  { id: 'costas', label: 'Costas', icon: '🏖️' },
  { id: 'mares', label: 'Mares', icon: '🌊' },
  { id: 'islas', label: 'Islas', icon: '🏝️' },
  { id: 'unidades_relieve', label: 'Relieve', icon: '🏞️' },
];

export const VectorEditorPanel: React.FC<VectorEditorPanelProps> = ({
  elements,
  selectedElement,
  draftElement,
  hasUnsavedChanges,
  onSelectElement,
  onUpdateDraftField,
  onSave,
  onDiscard,
  onCreateNew,
  onDuplicate,
  onDelete,
  onExitEditMode,
  onToggleCollapse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'todos'>('todos');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'geometry' | 'list'>('info');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [showRawPath, setShowRawPath] = useState(false);

  // Filter elements by search query and category
  const filteredElements = useMemo(() => {
    return elements.filter((elem) => {
      const matchesCategory =
        selectedCategory === 'todos' || elem.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        elem.name.toLowerCase().includes(q) ||
        (elem.subCategory && elem.subCategory.toLowerCase().includes(q)) ||
        (elem.description && elem.description.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [elements, selectedCategory, searchQuery]);

  // Points of current draft
  const draftPoints = useMemo(() => {
    if (!draftElement || draftElement.svgType === 'point' || !draftElement.svgPath) return [];
    return parseSvgPathToPoints(draftElement.svgPath);
  }, [draftElement]);

  const handleSaveWithFeedback = () => {
    onSave();
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 2500);
  };

  // Geometric transformations
  const handleNudge = (dx: number, dy: number) => {
    if (!draftElement) return;
    if (draftElement.svgType === 'point') {
      onUpdateDraftField('mapX', Number((draftElement.mapX + dx).toFixed(2)));
      onUpdateDraftField('mapY', Number((draftElement.mapY + dy).toFixed(2)));
    } else if (draftPoints.length > 0) {
      const nextPoints = translatePoints(draftPoints, dx, dy);
      const newPath = pointsToSvgPath(nextPoints, draftElement.svgType === 'polygon');
      onUpdateDraftField('svgPath', newPath);
      onUpdateDraftField('mapX', Number((draftElement.mapX + dx).toFixed(2)));
      onUpdateDraftField('mapY', Number((draftElement.mapY + dy).toFixed(2)));
    }
  };

  const handleRotate = (degrees: number) => {
    if (!draftElement || draftElement.svgType === 'point' || draftPoints.length === 0) return;
    const center = calculateCentroid(draftPoints);
    const nextPoints = rotatePoints(draftPoints, degrees, center);
    const newPath = pointsToSvgPath(nextPoints, draftElement.svgType === 'polygon');
    onUpdateDraftField('svgPath', newPath);
  };

  const handleScale = (factor: number) => {
    if (!draftElement || draftElement.svgType === 'point' || draftPoints.length === 0) return;
    const center = calculateCentroid(draftPoints);
    const nextPoints = scalePoints(draftPoints, factor, factor, center);
    const newPath = pointsToSvgPath(nextPoints, draftElement.svgType === 'polygon');
    onUpdateDraftField('svgPath', newPath);
  };

  const handleFlip = (axis: 'horizontal' | 'vertical') => {
    if (!draftElement || draftElement.svgType === 'point' || draftPoints.length === 0) return;
    const center = calculateCentroid(draftPoints);
    const nextPoints = scalePoints(
      draftPoints,
      axis === 'horizontal' ? -1 : 1,
      axis === 'vertical' ? -1 : 1,
      center
    );
    const newPath = pointsToSvgPath(nextPoints, draftElement.svgType === 'polygon');
    onUpdateDraftField('svgPath', newPath);
  };

  const handleRecalculateCenter = () => {
    if (!draftElement || draftElement.svgType === 'point' || draftPoints.length === 0) return;
    const center = calculateCentroid(draftPoints);
    onUpdateDraftField('mapX', center.x);
    onUpdateDraftField('mapY', center.y);
  };

  return (
    <div className="w-full flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border-2 border-amber-400/80 dark:border-amber-500/50 overflow-hidden transition-all">
      {/* HEADER: Title & Exit */}
      <div className="p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <div className="truncate">
            <h2 className="text-sm font-black tracking-wide leading-tight flex items-center gap-1.5">
              <span>EDITOR VECTORIAL</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/25 uppercase font-bold">
                Activo
              </span>
            </h2>
            <p className="text-[11px] text-amber-100 truncate">
              {draftElement ? draftElement.name : 'Selecciona un accidente en el mapa'}
            </p>
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS TOOLBAR */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 shrink-0 flex-wrap">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onCreateNew}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            title="Crear un nuevo accidente geográfico"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo</span>
          </button>

          {draftElement && (
            <>
              <button
                type="button"
                onClick={() => onDuplicate(draftElement)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-medium transition-colors cursor-pointer"
                title="Duplicar accidente actual"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden sm:inline">Duplicar</span>
              </button>

              <button
                type="button"
                onClick={() => onDelete(draftElement)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-slate-200 dark:border-slate-600 hover:border-rose-300 text-xs font-medium transition-colors cursor-pointer"
                title="Eliminar accidente actual"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Eliminar</span>
              </button>
            </>
          )}
        </div>

        {/* SAVE & DISCARD BUTTONS */}
        <div className="flex items-center gap-1.5 ml-auto">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={onDiscard}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              title="Descartar cambios no guardados"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Descartar</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveWithFeedback}
            disabled={!hasUnsavedChanges}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              hasUnsavedChanges
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/50 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
            title={hasUnsavedChanges ? 'Guardar cambios' : 'Sin cambios pendientes'}
          >
            {saveSuccessMsg ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-100 font-bold">¡Guardado!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Guardar</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="p-2.5 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar accidentes para editar..."
            className="w-full pl-8 pr-7 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category dropdown toggle */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryMenu((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory !== 'todos'
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
            title="Filtrar por categoría"
          >
            <Filter className="w-3.5 h-3.5" />
            <span className="capitalize">{selectedCategory === 'todos' ? 'Categorías' : selectedCategory}</span>
          </button>

          {selectedCategory !== 'todos' && (
            <button
              onClick={() => setSelectedCategory('todos')}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] shadow"
              title="Borrar filtro"
            >
              ×
            </button>
          )}

          {showCategoryMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-xl z-30 py-1 overflow-hidden animate-fadeIn">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setShowCategoryMenu(false);
                  }}
                  className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    selectedCategory === cat.id ? 'bg-amber-50 dark:bg-amber-950/40 font-bold text-amber-600' : ''
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </span>
                  {selectedCategory === cat.id && <Check className="w-3 h-3 text-amber-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TABS: FICHA / GEOMETRÍA / LISTADO */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-xs shrink-0">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors cursor-pointer ${
            activeTab === 'info'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Ficha e Info
        </button>
        <button
          onClick={() => setActiveTab('geometry')}
          className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors cursor-pointer ${
            activeTab === 'geometry'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Trazado y Puntos ({draftPoints.length > 0 ? draftPoints.length : 'Punto'})
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 font-bold text-center border-b-2 transition-colors cursor-pointer ${
            activeTab === 'list'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Buscar ({filteredElements.length})
        </button>
      </div>

      {/* UNSAVED CHANGES NOTICE BAR */}
      {hasUnsavedChanges && (
        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5 font-medium truncate">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate">Cambios pendientes de guardar</span>
          </span>
          <button
            onClick={handleSaveWithFeedback}
            className="text-[11px] font-bold underline hover:text-amber-950 dark:hover:text-amber-100 shrink-0 ml-2"
          >
            Guardar ahora
          </button>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3.5 space-y-4">
        {activeTab === 'list' && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Haz clic en cualquier accidente para seleccionarlo y editarlo:
            </div>
            {filteredElements.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No se encontraron accidentes con los filtros actuales.
              </div>
            ) : (
              filteredElements.map((elem) => {
                const isSelected = draftElement?.id === elem.id;
                return (
                  <button
                    key={elem.id}
                    onClick={() => onSelectElement(elem)}
                    className={`w-full text-left p-2.5 rounded-2xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-400 text-amber-900 dark:text-amber-200 font-bold shadow-sm'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="truncate">
                      <div className="text-xs truncate">{elem.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                        <span className="capitalize">{elem.category}</span>
                        {elem.subCategory && <span>• {elem.subCategory}</span>}
                        {elem.elevationOrLength && <span>• {elem.elevationOrLength}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase font-mono">
                      {elem.svgType}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'info' && draftElement && (
          <div className="space-y-3.5 text-xs">
            {/* NAME */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre del accidente:
              </label>
              <input
                type="text"
                value={draftElement.name}
                onChange={(e) => onUpdateDraftField('name', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* CATEGORY & SUBCATEGORY */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoría:
                </label>
                <select
                  value={draftElement.category}
                  onChange={(e) => onUpdateDraftField('category', e.target.value as CategoryType)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="rios">Ríos</option>
                  <option value="montanas">Montañas</option>
                  <option value="picos">Picos</option>
                  <option value="costas">Costas</option>
                  <option value="mares">Mares</option>
                  <option value="islas">Islas</option>
                  <option value="unidades_relieve">Unidades de Relieve</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subcategoría / Tipo:
                </label>
                <input
                  type="text"
                  value={draftElement.subCategory || ''}
                  onChange={(e) => onUpdateDraftField('subCategory', e.target.value)}
                  placeholder="ej. Río Principal, Cordillera..."
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* VERTIENTE & DIFFICULTY */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Vertiente:
                </label>
                <select
                  value={draftElement.vertiente || 'interior'}
                  onChange={(e) => onUpdateDraftField('vertiente', e.target.value as VertienteType)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="cantabrico">Cantábrica</option>
                  <option value="atlantico">Atlántica</option>
                  <option value="mediterraneo">Mediterránea</option>
                  <option value="interior">Interior</option>
                  <option value="insular">Insular</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dificultad:
                </label>
                <select
                  value={draftElement.difficulty}
                  onChange={(e) => onUpdateDraftField('difficulty', e.target.value as DifficultyLevel)}
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="facil">Fácil</option>
                  <option value="medio">Medio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
            </div>

            {/* ELEVATION / LENGTH */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Altitud / Longitud / Medida:
              </label>
              <input
                type="text"
                value={draftElement.elevationOrLength || ''}
                onChange={(e) => onUpdateDraftField('elevationOrLength', e.target.value)}
                placeholder="ej. 3.479 m o 1.007 km"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Descripción didáctica:
              </label>
              <textarea
                rows={4}
                value={draftElement.description}
                onChange={(e) => onUpdateDraftField('description', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            {/* CURIOSITY */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Curiosidad / Dato curioso:
              </label>
              <textarea
                rows={2}
                value={draftElement.curiosity}
                onChange={(e) => onUpdateDraftField('curiosity', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'geometry' && draftElement && (
          <div className="space-y-4 text-xs">
            {/* SHAPE TYPE & CENTER */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">Tipo de forma geométrica:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold uppercase">
                  {draftElement.svgType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Centro X (SVG):</label>
                  <input
                    type="number"
                    value={draftElement.mapX}
                    onChange={(e) => onUpdateDraftField('mapX', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 mb-0.5">Centro Y (SVG):</label>
                  <input
                    type="number"
                    value={draftElement.mapY}
                    onChange={(e) => onUpdateDraftField('mapY', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
                  />
                </div>
              </div>

              {draftPoints.length > 0 && (
                <button
                  type="button"
                  onClick={handleRecalculateCenter}
                  className="w-full py-1 text-center text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Recalcular centro al centroide del polígono
                </button>
              )}
            </div>

            {/* TRANSFORM CONTROLS */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Transformar en el mapa:</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {draftPoints.length} vértices
                </span>
              </div>

              {/* Nudge buttons */}
              <div>
                <span className="block text-[10px] text-slate-500 mb-1">Mover (Desplazamiento):</span>
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleNudge(-5, 0)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 cursor-pointer"
                    title="Mover 5px a la izquierda"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleNudge(0, -5)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 cursor-pointer"
                      title="Mover 5px arriba"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge(0, 5)}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 cursor-pointer"
                      title="Mover 5px abajo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNudge(5, 0)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 cursor-pointer"
                    title="Mover 5px a la derecha"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rotation & Scaling */}
              {draftPoints.length > 0 && (
                <>
                  <div>
                    <span className="block text-[10px] text-slate-500 mb-1">Rotación:</span>
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        type="button"
                        onClick={() => handleRotate(-15)}
                        className="py-1 px-1.5 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 font-mono text-[11px] cursor-pointer"
                      >
                        -15°
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotate(-5)}
                        className="py-1 px-1.5 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 font-mono text-[11px] cursor-pointer"
                      >
                        -5°
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotate(5)}
                        className="py-1 px-1.5 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 font-mono text-[11px] cursor-pointer"
                      >
                        +5°
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotate(15)}
                        className="py-1 px-1.5 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 font-mono text-[11px] cursor-pointer"
                      >
                        +15°
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[10px] text-slate-500 mb-1">Escala y Reflejo:</span>
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        type="button"
                        onClick={() => handleScale(1.08)}
                        className="py-1 px-1.5 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                        title="Aumentar tamaño un 8%"
                      >
                        <Maximize2 className="w-3 h-3" />
                        +8%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleScale(0.92)}
                        className="py-1 px-1.5 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer"
                        title="Reducir tamaño un 8%"
                      >
                        <Minimize2 className="w-3 h-3" />
                        -8%
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFlip('horizontal')}
                        className="py-1 px-1.5 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 font-semibold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                        title="Invertir horizontalmente"
                      >
                        <FlipHorizontal className="w-3 h-3" />
                        Voltear H
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFlip('vertical')}
                        className="py-1 px-1.5 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 font-semibold text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                        title="Invertir verticalmente"
                      >
                        <FlipVertical className="w-3 h-3" />
                        Voltear V
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* RAW SVG PATH CODE VIEWER */}
            {draftElement.svgPath && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Code2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Trazado SVG (d):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRawPath((prev) => !prev)}
                    className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    {showRawPath ? 'Ocultar código' : 'Ver / Editar código'}
                  </button>
                </div>

                {showRawPath && (
                  <textarea
                    rows={4}
                    value={draftElement.svgPath}
                    onChange={(e) => onUpdateDraftField('svgPath', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 text-emerald-300 font-mono text-[10px] rounded border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {!draftElement && (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center">
              <Move className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">
              Ningún accidente seleccionado
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Haz clic directamente en cualquier polígono o punto sobre el mapa, o pulsa en la pestaña{' '}
              <strong className="text-amber-600">Buscar</strong> para seleccionarlo.
            </p>
            <button
              onClick={onCreateNew}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear nuevo accidente</span>
            </button>
          </div>
        )}
      </div>

      {/* FOOTER HELPER HINT */}
      <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between">
        <span>💡 Arrastra vértices para deformar, centro para mover, o rueda para rotar.</span>
      </div>
    </div>
  );
};
