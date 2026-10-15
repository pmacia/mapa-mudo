/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { GeoElement, GameMode, PlayerStats, CategoryType } from './types/geography';
import { GEO_ELEMENTS } from './data/geographyData';
import { SpainMap, MapTheme } from './components/Map/SpainMap';
import { ChallengeMode } from './components/Quiz/ChallengeMode';
import { useChallengeSession, ChallengeType } from './hooks/useChallengeSession';
import { ExplorePanel } from './components/Explore/ExplorePanel';
import { Header } from './components/Header';
import { AccidentFilterPanel, AccidentFilterState } from './components/Controls/AccidentFilterPanel';
import { AchievementsModal } from './components/Achievements/AchievementsModal';
import { PrintableMapModal } from './components/Printable/PrintableMapModal';
import { AtlasStampCelebrationModal } from './components/Achievements/AtlasStampCelebrationModal';
import { playSound } from './utils/audio';
import { List, X, ChevronUp } from 'lucide-react';

const STORAGE_KEY_STATS = 'geoespana_player_stats_v2';

export default function App() {
  // Game mode
  const [currentMode, setCurrentMode] = useState<GameMode>('explorar');
  const [selectedElement, setSelectedElement] = useState<GeoElement | null>(GEO_ELEMENTS[0]);

  // Quiz interactive state
  const [targetHighlightId, setTargetHighlightId] = useState<string | null>(null);
  const [feedbackElementId, setFeedbackElementId] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'correct' | 'wrong' | null>(null);
  const [lastClickedElement, setLastClickedElement] = useState<GeoElement | null>(null);

  // Accident Filter & Selection State (Active on Map & in Games)
  const [accidentFilters, setAccidentFilters] = useState<AccidentFilterState>({
    rios: true,
    montanas: true,
    picos: true,
    costas: true,
    mares: true,
    islas: true,
    unidades_relieve: true,
    showLabels: true,
  });

  const [theme, setTheme] = useState<MapTheme>('clasico');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [exploreCategory, setExploreCategory] = useState<CategoryType | 'todos'>('todos');

  // Synchronize dark mode class with document and html
  useEffect(() => {
    if (theme === 'nocturno') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Modals & Drawers
  const [isAccidentFilterOpen, setIsAccidentFilterOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isPrintableOpen, setIsPrintableOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isStampCelebrationOpen, setIsStampCelebrationOpen] = useState(false);

  // Player stats
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          visitedAtlasElements: parsed.visitedAtlasElements || [],
          atlasStampUnlocked: parsed.atlasStampUnlocked || false,
        };
      }
    } catch {
      // fallback to initial
    }
    return {
      xp: 0,
      level: 1,
      correctAnswers: 0,
      totalAttempts: 0,
      streak: 0,
      maxStreak: 0,
      unlockedBadges: [],
      completedCategories: [],
      visitedAtlasElements: [],
      atlasStampUnlocked: false,
    };
  });

  const [categoryCorrectCounts, setCategoryCorrectCounts] = useState<Record<string, number>>({});

  // Persist stats
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch {
      // Ignore
    }
  }, [stats]);

  // Filtered elements active for both Map and Game challenges
  const activeElements = useMemo(() => {
    return GEO_ELEMENTS.filter((elem) => {
      const cat = elem.category as keyof AccidentFilterState;
      return accidentFilters[cat] === true;
    });
  }, [accidentFilters]);

  // Handle mode changes
  const handleModeChange = (newMode: GameMode) => {
    setCurrentMode(newMode);
    setSelectedElement(null);
    setTargetHighlightId(null);
    setFeedbackElementId(null);
    setFeedbackStatus(null);
    setLastClickedElement(null);
    setIsMobileDrawerOpen(false);

    // In quiz challenge, automatically toggle off labels for authentic "mapa mudo" test
    if (newMode === 'reto_localizar' || newMode === 'contrarreloj') {
      setAccidentFilters((prev) => ({ ...prev, showLabels: false }));
    } else if (newMode === 'explorar') {
      setAccidentFilters((prev) => ({ ...prev, showLabels: true }));
    }
  };

  const handleToggleAccidentFilter = (key: keyof AccidentFilterState) => {
    setAccidentFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleApplyPreset = (preset: 'todos' | 'rios' | 'relieve' | 'costas') => {
    playSound('click');
    if (preset === 'todos') {
      setAccidentFilters((prev) => ({
        ...prev,
        rios: true,
        montanas: true,
        picos: true,
        costas: true,
        mares: true,
        islas: true,
        unidades_relieve: true,
      }));
    } else if (preset === 'rios') {
      setAccidentFilters((prev) => ({
        ...prev,
        rios: true,
        montanas: false,
        picos: false,
        costas: false,
        mares: false,
        islas: false,
        unidades_relieve: false,
      }));
    } else if (preset === 'relieve') {
      setAccidentFilters((prev) => ({
        ...prev,
        rios: false,
        montanas: true,
        picos: true,
        costas: false,
        mares: false,
        islas: false,
        unidades_relieve: true,
      }));
    } else if (preset === 'costas') {
      setAccidentFilters((prev) => ({
        ...prev,
        rios: false,
        montanas: false,
        picos: false,
        costas: true,
        mares: true,
        islas: true,
        unidades_relieve: false,
      }));
    }
  };

  // Check badges unlock
  const checkBadgeUnlocks = (
    updatedStats: PlayerStats,
    newCounts: Record<string, number>
  ): string[] => {
    const unlocked = [...updatedStats.unlockedBadges];

    if (!unlocked.includes('primer-paso') && updatedStats.correctAnswers >= 1) {
      unlocked.push('primer-paso');
    }
    if (!unlocked.includes('senor-rios') && (newCounts['rios'] || 0) >= 5) {
      unlocked.push('senor-rios');
    }
    if (
      !unlocked.includes('alpinista') &&
      ((newCounts['montanas'] || 0) + (newCounts['picos'] || 0)) >= 5
    ) {
      unlocked.push('alpinista');
    }
    if (!unlocked.includes('marinero-costas') && (newCounts['costas'] || 0) >= 5) {
      unlocked.push('marinero-costas');
    }
    if (!unlocked.includes('explorador-islas') && (newCounts['islas'] || 0) >= 4) {
      unlocked.push('explorador-islas');
    }
    if (!unlocked.includes('racha-de-fuego') && updatedStats.streak >= 5) {
      unlocked.push('racha-de-fuego');
    }
    if (!unlocked.includes('geografo-maestro') && updatedStats.xp >= 500) {
      unlocked.push('geografo-maestro');
    }

    return unlocked;
  };

  const handleCorrectAnswer = (element: GeoElement, earnedXp: number) => {
    const updatedCounts = {
      ...categoryCorrectCounts,
      [element.category]: (categoryCorrectCounts[element.category] || 0) + 1,
    };
    setCategoryCorrectCounts(updatedCounts);

    setStats((prev) => {
      const newXp = prev.xp + earnedXp;
      const newLevel = Math.floor(newXp / 100) + 1;
      const newStreak = prev.streak + 1;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);
      const newCorrect = prev.correctAnswers + 1;
      const newTotal = prev.totalAttempts + 1;

      const tempStats: PlayerStats = {
        ...prev,
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        maxStreak: newMaxStreak,
        correctAnswers: newCorrect,
        totalAttempts: newTotal,
      };

      const updatedBadges = checkBadgeUnlocks(tempStats, updatedCounts);
      return {
        ...tempStats,
        unlockedBadges: updatedBadges,
      };
    });
  };

  const handleWrongAnswer = () => {
    setStats((prev) => ({
      ...prev,
      streak: 0,
      totalAttempts: prev.totalAttempts + 1,
    }));
  };

  // Gamification: Track exploration of accidents in Atlas mode (10 pts per visited accident, stamp at 65)
  const handleVisitAtlasElement = (element: GeoElement) => {
    if (currentMode !== 'explorar') return;

    const currentVisited = stats.visitedAtlasElements || [];
    if (currentVisited.includes(element.id)) {
      // Already visited, no duplicate points
      return;
    }

    const newVisited = [...currentVisited, element.id];
    const earnedXp = 10;
    const isCompleted = newVisited.length >= GEO_ELEMENTS.length; // 65/65

    if (isCompleted) {
      playSound('stamp');
    } else {
      playSound('discover');
    }

    setStats((prev) => {
      const bonusXp = isCompleted && !prev.atlasStampUnlocked ? 100 : 0;
      const newXp = prev.xp + earnedXp + bonusXp;
      const newLevel = Math.floor(newXp / 100) + 1;
      const updatedBadges = [...prev.unlockedBadges];
      if (isCompleted && !updatedBadges.includes('sello-atlas')) {
        updatedBadges.push('sello-atlas');
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        visitedAtlasElements: newVisited,
        atlasStampUnlocked: prev.atlasStampUnlocked || isCompleted,
        unlockedBadges: updatedBadges,
      };
    });

    if (isCompleted && !stats.atlasStampUnlocked) {
      setIsStampCelebrationOpen(true);
    }
  };

  const handleMapElementClick = (element: GeoElement) => {
    if (currentMode === 'explorar') {
      setSelectedElement(element);
      handleVisitAtlasElement(element);
      playSound('click');
    } else {
      setLastClickedElement(element);
    }
  };

  // Authoritative single game session for quiz modes
  const challengeType: ChallengeType =
    currentMode === 'reto_localizar'
      ? 'localizar'
      : currentMode === 'reto_identificar'
      ? 'identificar'
      : 'contrarreloj';

  const challengeSession = useChallengeSession({
    elements: activeElements.length > 0 ? activeElements : GEO_ELEMENTS,
    challengeType,
    filterCategory: 'todos',
    onCorrectAnswer: handleCorrectAnswer,
    onWrongAnswer: handleWrongAnswer,
    onSetTargetHighlight: setTargetHighlightId,
    onSetFeedback: (id, status) => {
      setFeedbackElementId(id);
      setFeedbackStatus(status);
    },
    roundSize: 10,
  });

  return (
    <div
      className={`min-h-screen ${
        theme === 'nocturno' ? 'dark' : ''
      } bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200`}
    >
      {/* Header & Controls */}
      <Header
        currentMode={currentMode}
        onModeChange={handleModeChange}
        activeCount={activeElements.length}
        onOpenAccidentFilter={() => setIsAccidentFilterOpen(true)}
        theme={theme}
        onThemeChange={setTheme}
        stats={stats}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        onOpenPrintable={() => setIsPrintableOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isCollapsed={isHeaderCollapsed}
        onToggleCollapse={() => setIsHeaderCollapsed((prev) => !prev)}
      />

      {/* Main App Container */}
      <main
        className={`flex-1 max-w-7xl w-full mx-auto flex flex-col gap-4 pb-20 lg:pb-6 transition-all duration-300 ${
          isHeaderCollapsed ? 'p-2 sm:p-3 md:p-4' : 'p-3 sm:p-4 md:p-6'
        }`}
      >
        {/* Central Workspace: Real Map + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Map Column (Full width on mobile, prominent on desktop) */}
          <div
            className={`flex flex-col ${
              currentMode === 'explorar' ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-8 xl:col-span-9'
            }`}
          >
            <div
              className={`w-full aspect-[1000/720] relative rounded-2xl overflow-hidden shadow-lg border border-slate-300 dark:border-slate-800 transition-all duration-300 ${
                isHeaderCollapsed ? 'max-h-[82vh]' : 'max-h-[76vh]'
              }`}
            >
              <SpainMap
                elements={GEO_ELEMENTS}
                layers={accidentFilters}
                theme={theme}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                targetHighlightId={targetHighlightId}
                feedbackElementId={feedbackElementId}
                feedbackStatus={feedbackStatus}
                onElementClick={handleMapElementClick}
                onElementHover={handleVisitAtlasElement}
                visitedAtlasIds={stats.visitedAtlasElements}
                atlasStampUnlocked={stats.atlasStampUnlocked}
                onOpenStampModal={() => setIsStampCelebrationOpen(true)}
                currentMode={currentMode}
                isInteractive={true}
                blankMode={!accidentFilters.showLabels}
              />
            </div>
          </div>

          {/* Right Column (Desktop only: sticky companion with independent scroll) */}
          <div
            className={`hidden lg:flex flex-col ${
              currentMode === 'explorar' ? 'lg:col-span-5 xl:col-span-4' : 'lg:col-span-4 xl:col-span-3'
            } lg:sticky transition-all duration-300 ${
              isHeaderCollapsed ? 'lg:top-14' : 'lg:top-20'
            }`}
          >
            {currentMode === 'explorar' ? (
              <ExplorePanel
                elements={GEO_ELEMENTS}
                selectedElement={selectedElement}
                onSelectElement={(elem) => {
                  setSelectedElement(elem);
                  handleVisitAtlasElement(elem);
                  playSound('click');
                }}
                activeCategory={exploreCategory}
                onCategoryChange={setExploreCategory}
                visitedAtlasIds={stats.visitedAtlasElements}
                atlasStampUnlocked={stats.atlasStampUnlocked}
                onOpenStampModal={() => setIsStampCelebrationOpen(true)}
              />
            ) : (
              <ChallengeMode
                session={challengeSession}
                challengeType={challengeType}
                lastClickedElement={lastClickedElement}
                onResetClickedElement={() => setLastClickedElement(null)}
              />
            )}
          </div>

          {/* Mobile Bottom Challenge Banner (When in Quiz mode on mobile) */}
          {currentMode !== 'explorar' && (
            <div className="lg:hidden mt-2">
              <ChallengeMode
                session={challengeSession}
                challengeType={challengeType}
                lastClickedElement={lastClickedElement}
                onResetClickedElement={() => setLastClickedElement(null)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Button for Mobile (In Explore Mode) */}
      {currentMode === 'explorar' && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 lg:hidden">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-xs shadow-xl active:scale-95 transition-transform border border-blue-400/40 cursor-pointer"
          >
            <List className="w-4 h-4" />
            <span>Accidentes ({activeElements.length})</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Bottom Sheet Drawer for Explore Panel */}
      {isMobileDrawerOpen && currentMode === 'explorar' && (
        <div 
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div 
            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] animate-slideUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle & Close Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Accidentes Geográficos ({activeElements.length})
                </span>
              </div>

              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Volver al Mapa</span>
              </button>
            </div>

            {/* Explore Panel inside Bottom Sheet */}
            <div className="flex-1 overflow-hidden">
              <ExplorePanel
                elements={GEO_ELEMENTS}
                selectedElement={selectedElement}
                onSelectElement={(elem) => {
                  setSelectedElement(elem);
                  handleVisitAtlasElement(elem);
                  playSound('click');
                  // Auto close sheet so student sees the element on map
                  setIsMobileDrawerOpen(false);
                }}
                activeCategory={exploreCategory}
                onCategoryChange={setExploreCategory}
                visitedAtlasIds={stats.visitedAtlasElements}
                atlasStampUnlocked={stats.atlasStampUnlocked}
                onOpenStampModal={() => setIsStampCelebrationOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Unified Accident & Layer Selection Modal */}
      <AccidentFilterPanel
        isOpen={isAccidentFilterOpen}
        onClose={() => setIsAccidentFilterOpen(false)}
        filters={accidentFilters}
        onToggleFilter={handleToggleAccidentFilter}
        onApplyPreset={handleApplyPreset}
        activeCount={activeElements.length}
        totalCount={GEO_ELEMENTS.length}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        stats={stats}
      />

      {/* Printable Sheet Generator Modal */}
      <PrintableMapModal
        isOpen={isPrintableOpen}
        onClose={() => setIsPrintableOpen(false)}
        elements={activeElements.length > 0 ? activeElements : GEO_ELEMENTS}
      />

      {/* Celebration Modal for completing the Atlas exploration (65/65) */}
      <AtlasStampCelebrationModal
        isOpen={isStampCelebrationOpen}
        onClose={() => setIsStampCelebrationOpen(false)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        totalExplored={stats.visitedAtlasElements?.length || 0}
      />
    </div>
  );
}
