import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { GeoElement, CategoryType } from '../../types/geography';
import { LAYERED_SPAIN_MAP } from '../../data/spainBaseMapData';
import { Printer, X, CheckSquare, Square } from 'lucide-react';
interface PrintableMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  elements: GeoElement[];
}
export const PrintableMapModal: React.FC<PrintableMapModalProps> = ({
  isOpen,
  onClose,
  elements,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<Record<CategoryType, boolean>>({
    rios: true,
    montanas: true,
    picos: true,
    costas: true,
    mares: true,
    islas: true,
    unidades_relieve: false,
  });
  const [showSolutions, setShowSolutions] = useState(false);
  if (!isOpen) return null;
  // Filter elements to number on the map
  const activeElements = elements.filter(
    (e) => selectedCategories[e.category]
  );
  const toggleCategory = (cat: CategoryType) => {
    setSelectedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };
  const handlePrint = () => {
    window.print();
  };
  return createPortal(
    <div id="printable-map-modal" role="dialog" aria-modal="true" aria-labelledby="printable-map-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="print-modal-shell bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          html, body { height: auto !important; overflow: visible !important; }
          body { margin: 0 !important; }
          body > *:not(#printable-map-modal) { display: none !important; }
          #printable-map-modal {
            position: static !important; display: block !important;
            padding: 0 !important; background: white !important;
            overflow: visible !important; backdrop-filter: none !important;
          }
          #printable-map-modal .print-modal-shell,
          #printable-map-modal .print-preview {
            display: block !important; width: 100% !important;
            height: auto !important; max-height: none !important;
            max-width: none !important; overflow: visible !important;
            margin: 0 !important; padding: 0 !important;
            border: 0 !important; border-radius: 0 !important;
            box-shadow: none !important; background: white !important;
          }
          #printable-map-modal .print-controls { display: none !important; }
          #printable-content {
            width: 100% !important; max-width: none !important;
            margin: 0 !important; padding: 0 !important;
            border: 0 !important; border-radius: 0 !important;
            box-shadow: none !important;
            print-color-adjust: exact; -webkit-print-color-adjust: exact;
          }
          #printable-content .print-map,
          #printable-content .print-sheet-heading { break-inside: avoid; page-break-inside: avoid; }
          #printable-content .print-answers {
            display: block !important; column-count: 3; column-gap: 6mm;
          }
          #printable-content .print-answer {
            break-inside: avoid; page-break-inside: avoid; margin-bottom: 2mm;
          }
        }
      `}</style>
      {/* Modal Header */}
        <div className="print-controls shrink-0 p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 id="printable-map-title" className="text-base font-bold text-slate-900 dark:text-white">
                Generador de Ficha Imprimible de Mapa Mudo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ideal para practicar a mano o preparar exámenes de 1º/2º de ESO con geografía real
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ficha</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar ficha imprimible"
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {/* Configuration Bar */}
        <div className="print-controls shrink-0 p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Incluir en el examen:
            </span>
            {(
              [
                ['rios', 'Ríos'],
                ['montanas', 'Cordilleras'],
                ['picos', 'Picos'],
                ['costas', 'Cabos y Golfos'],
                ['mares', 'Mares y Océanos'],
                ['islas', 'Islas'],
              ] as [CategoryType, string][]
            ).map(([catKey, label]) => (
              <button
                key={catKey}
                onClick={() => toggleCategory(catKey)}
                aria-pressed={selectedCategories[catKey]}
                className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-blue-600"
              >
                {selectedCategories[catKey] ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>{label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowSolutions((prev) => !prev)}
            aria-pressed={showSolutions}
            className={`px-3 py-1 rounded-lg font-semibold border transition-colors cursor-pointer ${
              showSolutions
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
            }`}
          >
            {showSolutions ? 'Ocultar Soluciones' : 'Mostrar Clave de Soluciones'}
          </button>
        </div>
        {/* Printable Paper Area (Styled for crisp paper printing) */}
        <div className="print-preview min-h-0 flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200 dark:bg-slate-950">
          <div
            id="printable-content"
            className="mx-auto w-full max-w-[850px] bg-white text-black p-4 sm:p-8 rounded-lg shadow-lg border border-slate-300 space-y-6"
          >
            {/* Sheet Title */}
            <div className="print-sheet-heading border-b-2 border-slate-800 pb-3 flex flex-wrap justify-between items-end gap-3">
              <div>
                <h1 className="text-xl font-black uppercase tracking-wider">
                  Geografía Física de España — Mapa Mudo Oficial
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Nombre del Alumno/a: _____________________________________ Fecha: ____________ Curso: 1º/2º ESO
                </p>
              </div>
              <div className="text-xs text-right font-semibold text-slate-500">
                Puntuación: ____ / {activeElements.length}
              </div>
            </div>
            {/* SVG Real Blank Map with Crisp Numbers */}
            <div className="print-map relative w-full border border-slate-300 rounded-lg overflow-hidden bg-white"
              style={{ aspectRatio: LAYERED_SPAIN_MAP.viewBox.trim().split(/\s+/).slice(2).join(' / ') }}>
              <svg viewBox={LAYERED_SPAIN_MAP.viewBox} preserveAspectRatio="xMidYMid meet" className="block w-full h-full">
                {/* Base: Costas, islas, Portugal, Francia y Norte de África */}
                <g id="print-map-base" transform={`scale(${LAYERED_SPAIN_MAP.sourceScale})`}>
                  {LAYERED_SPAIN_MAP.base.map((part, index) => {
                    const sourceFill = part.fill.toLowerCase();
                    if (sourceFill === '#cbeaf1') return null; // El mar se mantiene blanco papel
                    const isNeighbour = sourceFill === '#f7d3aa';
                    return (
                      <path
                        key={`base-${part.id}-${index}`}
                        d={part.d}
                        fill={sourceFill === 'none' ? 'none' : sourceFill === '#000000' ? '#0f172a' : isNeighbour ? '#f8fafc' : '#ffffff'}
                        stroke={part.stroke === 'none' ? 'none' : isNeighbour ? '#94a3b8' : '#0f172a'}
                        strokeWidth={part.strokeWidth}
                        fillRule={part.fillRule}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  })}
                </g>
                {/* Límites de Comunidades Autónomas */}
                <g id="print-spain-communities" transform={`scale(${LAYERED_SPAIN_MAP.sourceScale})`}>
                  {LAYERED_SPAIN_MAP.communities.map((comm, index) => {
                    const isLand = comm.fill.toLowerCase() === '#ffffd0' || comm.fill.toLowerCase() === '#e6e6e6';
                    const fill = comm.fill === 'none' ? 'none' : isLand ? '#ffffff' : '#64748b';
                    const stroke = comm.stroke === 'none' ? 'none' : '#64748b';
                    return (
                      <path
                        key={`comm-${comm.id}-${index}`}
                        d={comm.d}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={comm.strokeWidth || 1.2}
                        fillRule={comm.fillRule}
                        strokeDasharray="4 2"
                      />
                    );
                  })}
                </g>
                {/* Recuadro Inset de Canarias */}
                <rect
                  {...LAYERED_SPAIN_MAP.canariasInsetBox}
                  fill="none"
                  stroke="#475569"
                  strokeWidth="1.5"
                  rx="4"
                />
                <text
                  x={LAYERED_SPAIN_MAP.canariasInsetBox.x + 10}
                  y={LAYERED_SPAIN_MAP.canariasInsetBox.y + 18}
                  fill="#475569"
                  fontSize="10"
                  fontWeight="bold"
                >
                  CANARIAS
                </text>
                {/* Etiquetas de países limítrofes */}
                <text x="360" y="300" fill="#94a3b8" fontSize="12" letterSpacing="4" fontWeight="600" opacity="0.6">
                  PORTUGAL
                </text>
                <text x="820" y="50" fill="#94a3b8" fontSize="12" letterSpacing="4" fontWeight="600" opacity="0.6">
                  FRANCIA
                </text>
                {/* Real Rivers */}
                {selectedCategories.rios &&
                  activeElements
                    .filter((e) => e.category === 'rios' && e.svgPath)
                    .map((elem) => (
                      <path
                        key={elem.id}
                        d={elem.svgPath}
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2.5"
                      />
                    ))}
                {/* Real Mountain Ranges */}
                {selectedCategories.montanas &&
                  activeElements
                    .filter((e) => e.category === 'montanas' && e.svgPath)
                    .map((elem) => (
                      <path
                        key={elem.id}
                        d={elem.svgPath}
                        fill="#fef3c7"
                        stroke="#b45309"
                        strokeWidth="1.5"
                      />
                    ))}
                {/* Number Badges on the map */}
                {activeElements.map((elem, index) => {
                  const number = index + 1;
                  return (
                    <g key={elem.id} transform={`translate(${elem.mapX}, ${elem.mapY})`}>
                      <circle
                        cx="0"
                        cy="0"
                        r="11"
                        fill="#ffffff"
                        stroke="#0f172a"
                        strokeWidth="1.8"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize="11"
                        fontWeight="black"
                      >
                        {number}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            {/* Questions Answer Table */}
            <div className="print-answers grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs border-t border-slate-200 pt-4">
              {activeElements.map((elem, idx) => (
                <div key={elem.id} className="print-answer flex min-w-0 items-center gap-2 border-b border-slate-200 pb-1">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1 break-words">
                    {showSolutions ? (
                      <span className="font-bold text-blue-700">{elem.name}</span>
                    ) : (
                      <span className="block h-5 w-full border-b border-dotted border-slate-400" aria-label="Espacio para la respuesta" />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="text-[10px] text-slate-400 text-center italic border-t border-slate-100 pt-2">
              GeoEspaña Junior — Material educativo para el estudio de la geografía física de España
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
