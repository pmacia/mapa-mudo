import React, { useState } from 'react';
import { GeoElement, CategoryType } from '../../types/geography';
import { REAL_SPAIN_MAP } from '../../data/realSpainMapData';
import { FRANCE_PATH, NORTH_AFRICA_PATH, PORTUGAL_CONTOUR_PATH } from '../../data/supplementalMapData';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Generador de Ficha Imprimible de Mapa Mudo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ideal para practicar a mano o preparar exámenes de 1º/2º de ESO con geografía real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Ficha</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
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
            onClick={() => setShowSolutions(!showSolutions)}
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
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200 dark:bg-slate-950 flex justify-center">
          <div
            id="printable-content"
            className="w-full max-w-[850px] bg-white text-black p-8 rounded-lg shadow-lg border border-slate-300 flex flex-col gap-6 print:m-0 print:p-2 print:shadow-none print:border-none"
          >
            {/* Sheet Title */}
            <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-end">
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
            <div className="relative border border-slate-300 rounded-lg overflow-hidden bg-white">
              <svg viewBox={REAL_SPAIN_MAP.viewBox} className="w-full h-auto">
                {/* Portugal (Contorno exterior sin divisiones internas) */}
                <path
                  d={REAL_SPAIN_MAP.portugalPath}
                  fill="#f8fafc"
                  stroke="none"
                />
                <path
                  d={PORTUGAL_CONTOUR_PATH}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                />

                {/* France */}
                <path
                  d={FRANCE_PATH}
                  fill="#f8fafc"
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                />

                {/* North Africa */}
                <path
                  d={NORTH_AFRICA_PATH}
                  fill="#f8fafc"
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                />

                {/* Real Spain Autonomous Communities */}
                {REAL_SPAIN_MAP.communities.map((comm) => (
                  <path
                    key={comm.name}
                    d={comm.d}
                    fill="#ffffff"
                    stroke="#1e293b"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Real Canary Inset */}
                <rect
                  x={REAL_SPAIN_MAP.canariasInsetBox.x}
                  y={REAL_SPAIN_MAP.canariasInsetBox.y}
                  width={REAL_SPAIN_MAP.canariasInsetBox.width}
                  height={REAL_SPAIN_MAP.canariasInsetBox.height}
                  fill="#ffffff"
                  stroke="#475569"
                  strokeWidth="1.5"
                />
                <text
                  x={REAL_SPAIN_MAP.canariasInsetBox.x + 10}
                  y={REAL_SPAIN_MAP.canariasInsetBox.y + 18}
                  fill="#475569"
                  fontSize="10"
                  fontWeight="bold"
                >
                  CANARIAS
                </text>
                <path
                  d={REAL_SPAIN_MAP.canariasPath}
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1.4"
                />

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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs border-t border-slate-200 pt-4">
              {activeElements.map((elem, idx) => (
                <div key={elem.id} className="flex items-center gap-2 border-b border-slate-200 pb-1">
                  <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                    {idx + 1}
                  </span>
                  <div className="flex-1 truncate">
                    {showSolutions ? (
                      <span className="font-bold text-blue-700">{elem.name}</span>
                    ) : (
                      <span className="text-slate-400">................................................</span>
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
    </div>
  );
};
