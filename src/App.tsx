import { VisibilityControl, VisibilityRegion } from './components/Layout/VisibilityControl';
import { FloatingRegion } from './components/Layout/FloatingRegion';
import { geometryForCategory } from './utils/vectorEditorUtils';
import { downloadGeographyConfiguration } from './utils/exportGeography';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GeoElement, GameMode, PlayerStats, CategoryType } from './types/geography';
import { SpainMap, MapTheme } from './components/Map/SpainMap';
import { ChallengeMode } from './components/Quiz/ChallengeMode';
import { useChallengeSession, ChallengeType } from './hooks/useChallengeSession';
import { ExplorePanel } from './components/Explore/ExplorePanel';
import { Header } from './components/Header';
import { AccidentFilterPanel, AccidentFilterState } from './components/Controls/AccidentFilterPanel';
import { AchievementsModal } from './components/Achievements/AchievementsModal';
import { PrintableMapModal } from './components/Printable/PrintableMapModal';
import { AtlasStampCelebrationModal } from './components/Achievements/AtlasStampCelebrationModal';
import { GameManualModal } from './components/Manual/GameManualModal';
import { playSound } from './utils/audio';
import { ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MobileBottomNav } from './components/Navigation/MobileBottomNav';
import { GAME_CONFIG } from './constants/gameConfig';
import { useCustomElements } from './hooks/useCustomElements';
import { VectorEditorPanel } from './components/Editor/VectorEditorPanel';
import { UnsavedChangesModal } from './components/Editor/UnsavedChangesModal';
const STORAGE_KEY_STATS = 'geoespana_player_stats_v2';
export default function App() {
  // Persistent custom elements store with full CRUD
  const {
    elements: geoElements,
    saveElement,
    deleteElement,
    duplicateElement,
    createNewElement,
    resetToDefaults,
  } = useCustomElements();

  // Vector Editor State (Desktop & Tablet only)
  const [isVectorEditMode, setIsVectorEditMode] = useState(false);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [draftElement, setDraftElement] = useState<GeoElement | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [isEditorPanelCollapsed, setIsEditorPanelCollapsed] = useState(false);
  const copiedElementRef = useRef<GeoElement | null>(null);

  // Game mode
  const [currentMode, setCurrentMode] = useState<GameMode>('explorar');
  const [selectedElement, setSelectedElement] = useState<GeoElement | null>(null);
  // Quiz interactive state
  const [targetHighlightId, setTargetHighlightId] = useState<string | null>(null);
  const [feedbackElementId, setFeedbackElementId] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'correct' | 'wrong' | null>(null);
  // Accident Filter & Selection State (Active on Map & in Games)
  const [accidentFilters, setAccidentFilters] = useState<AccidentFilterState>({
    rios: true,
    afluentes: true,
    montanas: true,
    picos: true,
    costas: true,
    mares: true,
    islas: true,
    unidades_relieve: true,
    showLabels: true,
    showCommunities: true,
    showProvinces: true,
  });
  const [theme, setTheme] = useState<MapTheme>('clasico');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [isNavigationCollapsed, setIsNavigationCollapsed] = useState(false);
  const [isTelemetryCollapsed, setIsTelemetryCollapsed] = useState(false);
  const [areMapToolsCollapsed, setAreMapToolsCollapsed] = useState(false);
  const [isCompanionCollapsed, setIsCompanionCollapsed] = useState(false);
  const [telemetryTarget, setTelemetryTarget] = useState<HTMLDivElement | null>(null);
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
  const [isManualOpen, setIsManualOpen] = useState(false);
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
  // In vector edit mode, the draft geometry replaces the saved element on the map in real time
  const displayedElements = useMemo(() => {
    if (!isVectorEditMode || !draftElement) return geoElements;
    return geoElements.map((e) => (e.id === draftElement.id ? draftElement : e));
  }, [geoElements, isVectorEditMode, draftElement]);

  // Filtered elements active for both Map and Game challenges
  const activeElements = useMemo(() => {
    return displayedElements.filter((elem) => {
      const cat = elem.category as keyof AccidentFilterState;
      return accidentFilters[cat] === true;
    });
  }, [displayedElements, accidentFilters]);

  const activeSelectedElement = activeElements.some((element) => element.id === selectedElement?.id)
    ? selectedElement
    : null;

  // Vector Editor Action Handlers
  const performSelectElementForEdit = useCallback((elem: GeoElement) => {
    setEditingElementId(elem.id);
    setDraftElement({ ...elem });
    setSelectedElement(elem);
    setHasUnsavedChanges(false);
  }, []);

  const handleSelectElementForEdit = useCallback(
    (elem: GeoElement) => {
      if (editingElementId === elem.id) return;
      if (hasUnsavedChanges) {
        setPendingAction(() => () => performSelectElementForEdit(elem));
        setIsUnsavedModalOpen(true);
      } else {
        performSelectElementForEdit(elem);
      }
    },
    [editingElementId, hasUnsavedChanges, performSelectElementForEdit]
  );

  const handleToggleVectorEditMode = useCallback(() => {
    if (isVectorEditMode) {
      if (hasUnsavedChanges) {
        setPendingAction(() => () => {
          setIsVectorEditMode(false);
          setDraftElement(null);
          setEditingElementId(null);
          setHasUnsavedChanges(false);
          setIsEditorPanelCollapsed(false);
        });
        setIsUnsavedModalOpen(true);
      } else {
        setIsVectorEditMode(false);
        setDraftElement(null);
        setEditingElementId(null);
        setHasUnsavedChanges(false);
        setIsEditorPanelCollapsed(false);
      }
    } else {
      setCurrentMode('explorar');
      setIsVectorEditMode(true);
      setIsEditorPanelCollapsed(false);
      const target = selectedElement || activeElements[0] || geoElements[0];
      if (target) {
        performSelectElementForEdit(target);
      }
    }
  }, [
    isVectorEditMode,
    hasUnsavedChanges,
    selectedElement,
    activeElements,
    geoElements,
    performSelectElementForEdit,
  ]);

  const handleExitEditMode = useCallback(() => {
    if (hasUnsavedChanges) {
      setPendingAction(() => () => {
        setIsVectorEditMode(false);
        setDraftElement(null);
        setEditingElementId(null);
        setHasUnsavedChanges(false);
        setIsEditorPanelCollapsed(false);
      });
      setIsUnsavedModalOpen(true);
    } else {
      setIsVectorEditMode(false);
      setDraftElement(null);
      setEditingElementId(null);
      setHasUnsavedChanges(false);
      setIsEditorPanelCollapsed(false);
    }
  }, [hasUnsavedChanges]);

  const handleUpdateDraftField = useCallback(
    <K extends keyof GeoElement>(field: K, value: GeoElement[K]) => {
      if (field === 'category' && value !== 'rios' && value !== 'afluentes' &&
          geoElements.some(e => e.parentRiverId === draftElement?.id)) {
        window.alert('Este río recibe afluentes. Reasigna primero los afluentes que desembocan en él antes de cambiarlo a una categoría no fluvial.');
        return;
      }
      setDraftElement((prev) => {
        if (!prev) return null;
        if (field === 'category') {
          const category = value as GeoElement['category'];
          return { ...prev, ...geometryForCategory(prev, category), category,
            parentRiverId: category === 'afluentes' ? prev.parentRiverId : undefined };
        }
        if (field === 'parentRiverId') {
          const parent = geoElements.find(e => e.id === value);
          return { ...prev, parentRiverId: parent?.id, vertiente: parent?.vertiente ?? prev.vertiente,
            subCategory: parent ? `Afluente del ${parent.name.replace(/^Río /, '')}` : 'Afluente' };
        }
        return { ...prev, [field]: value };
      });
      setHasUnsavedChanges(true);
    },
    [geoElements, draftElement?.id]
  );

  const handleUpdateDraftGeometry = useCallback((updated: Partial<GeoElement>) => {
    setDraftElement((prev) => (prev ? { ...prev, ...updated } : null));
    setHasUnsavedChanges(true);
  }, []);

  const handleExportConfiguration = () => {
    if (hasUnsavedChanges && draftElement && !window.confirm(
      'Hay cambios pendientes. ¿Quieres guardarlos y exportar toda la configuración?'
    )) return;
    try {
      const snapshot = hasUnsavedChanges && draftElement
        ? geoElements.some(e => e.id === draftElement.id)
          ? geoElements.map(e => e.id === draftElement.id ? draftElement : e)
          : [draftElement, ...geoElements]
        : geoElements;
      downloadGeographyConfiguration(snapshot);
      if (hasUnsavedChanges && draftElement) handleSaveDraft();
    } catch (error) {
      window.alert(`No se pudo exportar: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleSaveDraft = useCallback(() => {
    if (!draftElement) return;
    saveElement(draftElement);
    setEditingElementId(draftElement.id);
    setSelectedElement(draftElement);
    setHasUnsavedChanges(false);
    playSound('stamp');
  }, [draftElement, saveElement]);

  const handleDiscardDraft = useCallback(() => {
    if (!editingElementId) {
      setDraftElement(null);
      setHasUnsavedChanges(false);
      return;
    }
    const original = geoElements.find((e) => e.id === editingElementId);
    if (original) {
      setDraftElement({ ...original });
    }
    setHasUnsavedChanges(false);
    playSound('click');
  }, [editingElementId, geoElements]);

  const handleCreateNewElement = useCallback(() => {
    const doCreate = () => {
      const created = createNewElement();
      performSelectElementForEdit(created);
      playSound('discover');
    };
    if (hasUnsavedChanges) {
      setPendingAction(() => doCreate);
      setIsUnsavedModalOpen(true);
    } else {
      doCreate();
    }
  }, [hasUnsavedChanges, createNewElement, performSelectElementForEdit]);

  const handleDuplicateElement = useCallback(
    (elem: GeoElement) => {
      const doDuplicate = () => {
        const cloned = duplicateElement(elem);
        performSelectElementForEdit(cloned);
        playSound('discover');
      };
      if (hasUnsavedChanges) {
        setPendingAction(() => doDuplicate);
        setIsUnsavedModalOpen(true);
      } else {
        doDuplicate();
      }
    },
    [hasUnsavedChanges, duplicateElement, performSelectElementForEdit]
  );

  const handleDeleteElement = useCallback(
    (elem: GeoElement) => {
      if (geoElements.some(e => e.parentRiverId === elem.id)) {
        window.alert('Este río tiene afluentes asociados. Reasigna o elimina sus afluentes antes de eliminarlo.');
        return;
      }
      if (
        window.confirm(
          `¿Estás seguro de que deseas eliminar "${elem.name}"? Esta acción no se puede deshacer.`
        )
      ) {
        deleteElement(elem.id);
        setDraftElement(null);
        setEditingElementId(null);
        setSelectedElement(null);
        setHasUnsavedChanges(false);
        playSound('click');
      }
    },
    [deleteElement, geoElements]
  );

  useEffect(() => {
    if (!isVectorEditMode) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.shiftKey || event.isComposing) return;
      const key = event.key.toLowerCase();
      const command = event.ctrlKey || event.metaKey;
      const target = event.target;
      const typing = target instanceof Element && !!target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
      const modalOpen = isUnsavedModalOpen || !!document.querySelector('[role="dialog"][aria-modal="true"]');
      if (key === 'escape' && !command) {
        if (typing || modalOpen) return;
        event.preventDefault();
        if (!event.repeat) handleExitEditMode();
        return;
      }
      if (!command || !['s', 'n', 'd', 'c', 'v'].includes(key)) return;
      // Text fields and selected page text retain native copy/paste behavior.
      if (typing && (key === 'c' || key === 'v')) return;
      if (key === 'c' && window.getSelection()?.toString()) return;
      if (key === 'c' && !draftElement) return;
      if (key === 'v' && !copiedElementRef.current) return;
      event.preventDefault();
      if (event.repeat || modalOpen) return;
      if (key === 's') handleSaveDraft();
      if (key === 'n') handleCreateNewElement();
      if (key === 'd' && draftElement) handleDuplicateElement(draftElement);
      if (key === 'c' && draftElement) copiedElementRef.current = structuredClone(draftElement);
      if (key === 'v' && copiedElementRef.current) handleDuplicateElement(copiedElementRef.current);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isVectorEditMode, isUnsavedModalOpen, draftElement, handleSaveDraft, handleExitEditMode, handleCreateNewElement, handleDuplicateElement]);

  // Handle mode changes
  const handleModeChange = (newMode: GameMode) => {
    setIsNavigationCollapsed(false);
    setIsTelemetryCollapsed(false);
    setAreMapToolsCollapsed(false);
    setIsEditorPanelCollapsed(false);
    setIsCompanionCollapsed(false);
    setIsHeaderCollapsed(false);
    if (isVectorEditMode && hasUnsavedChanges) {
      setPendingAction(() => () => {
        setIsVectorEditMode(false);
        setDraftElement(null);
        setEditingElementId(null);
        setHasUnsavedChanges(false);
        setCurrentMode(newMode);
      });
      setIsUnsavedModalOpen(true);
      return;
    }
    if (isVectorEditMode) {
      setIsVectorEditMode(false);
      setDraftElement(null);
      setEditingElementId(null);
      setHasUnsavedChanges(false);
    }
    setCurrentMode(newMode);
    setSelectedElement(null);
    setTargetHighlightId(null);
    setFeedbackElementId(null);
    setFeedbackStatus(null);
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
        afluentes: true,
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
        afluentes: true,
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
        afluentes: false,
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
        afluentes: false,
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
    if (!unlocked.includes('senor-rios') && ((newCounts['rios'] || 0) + (newCounts['afluentes'] || 0)) >= GAME_CONFIG.BADGE_REQUIREMENTS.RIOS_COUNT) {
      unlocked.push('senor-rios');
    }
    if (
      !unlocked.includes('alpinista') &&
      ((newCounts['montanas'] || 0) + (newCounts['picos'] || 0)) >= GAME_CONFIG.BADGE_REQUIREMENTS.MONTANAS_PICOS_COUNT
    ) {
      unlocked.push('alpinista');
    }
    if (!unlocked.includes('marinero-costas') && (newCounts['costas'] || 0) >= GAME_CONFIG.BADGE_REQUIREMENTS.COSTAS_COUNT) {
      unlocked.push('marinero-costas');
    }
    if (!unlocked.includes('explorador-islas') && (newCounts['islas'] || 0) >= GAME_CONFIG.BADGE_REQUIREMENTS.ISLAS_COUNT) {
      unlocked.push('explorador-islas');
    }
    if (!unlocked.includes('racha-de-fuego') && updatedStats.streak >= GAME_CONFIG.BADGE_REQUIREMENTS.STREAK_COUNT) {
      unlocked.push('racha-de-fuego');
    }
    if (!unlocked.includes('geografo-maestro') && updatedStats.xp >= GAME_CONFIG.BADGE_REQUIREMENTS.MASTER_XP) {
      unlocked.push('geografo-maestro');
    }
    return unlocked;
  };
  const handleCorrectAnswer = useCallback((element: GeoElement, earnedXp: number, sessionStreak: number) => {
    setCategoryCorrectCounts((prevCounts) => {
      const updatedCounts = {
        ...prevCounts,
        [element.category]: (prevCounts[element.category] || 0) + 1,
      };
      setStats((prev) => {
        const newXp = prev.xp + earnedXp;
        const newLevel = Math.floor(newXp / GAME_CONFIG.GAMEPLAY.LEVEL_XP_STEP) + 1;
        const newStreak = prev.streak + 1;
        const newMaxStreak = Math.max(prev.maxStreak, newStreak, sessionStreak);
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
        const isNewBadgeUnlocked = updatedBadges.length > prev.unlockedBadges.length;
        if (isNewBadgeUnlocked) {
          playSound('levelup');
          confetti({ particleCount: 160, spread: 85, origin: { y: 0.5 } });
        }
        return {
          ...tempStats,
          unlockedBadges: updatedBadges,
        };
      });
      return updatedCounts;
    });
  }, []);
  const handleWrongAnswer = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      streak: 0,
      totalAttempts: prev.totalAttempts + 1,
    }));
  }, []);
  // Gamification: Track exploration of accidents in Atlas mode
  const handleVisitAtlasElement = (element: GeoElement) => {
    if (currentMode !== 'explorar') return;
    const currentVisited = stats.visitedAtlasElements || [];
    if (currentVisited.includes(element.id)) {
      // Already visited, no duplicate points
      return;
    }
    const newVisited = [...currentVisited, element.id];
    const earnedXp = GAME_CONFIG.POINTS.ATLAS_DISCOVERY_XP;
    const isCompleted = newVisited.length >= geoElements.length;
    if (isCompleted) {
      playSound('stamp');
    } else {
      playSound('discover');
    }
    setStats((prev) => {
      const bonusXp = isCompleted && !prev.atlasStampUnlocked ? GAME_CONFIG.POINTS.ATLAS_STAMP_BONUS_XP : 0;
      const newXp = prev.xp + earnedXp + bonusXp;
      const newLevel = Math.floor(newXp / GAME_CONFIG.GAMEPLAY.LEVEL_XP_STEP) + 1;
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
  // Reset Atlas exploration progress to allow re-discovering accidents and obtaining stamp again
  const handleResetAtlas = () => {
    setStats((prev) => ({
      ...prev,
      visitedAtlasElements: [],
      atlasStampUnlocked: false,
      unlockedBadges: prev.unlockedBadges.filter((b) => b !== 'sello-atlas'),
    }));
    playSound('click');
  };
  const handleMapElementClick = (element: GeoElement) => {
    if (isVectorEditMode) {
      handleSelectElementForEdit(element);
      return;
    }
    if (currentMode === 'explorar') {
      setSelectedElement(element);
      handleVisitAtlasElement(element);
      playSound('click');
    } else if (currentMode === 'reto_localizar') {
      if (
        challengeSession.currentQuestion &&
        !challengeSession.feedback &&
        !challengeSession.isGameOver &&
        !challengeSession.isCompleted
      ) {
        const isCorrect = element.id === challengeSession.currentQuestion.id;
        challengeSession.handleAnswer(isCorrect, element);
      }
    } else if (currentMode === 'contrarreloj') {
      if (
        challengeSession.currentQuestion &&
        !challengeSession.feedback &&
        !challengeSession.isGameOver &&
        !challengeSession.isCompleted
      ) {
        if (element.id === challengeSession.currentQuestion.id) {
          challengeSession.handleContrarrelojAnswer(true);
        } else {
          challengeSession.handleContrarrelojAnswer(false);
        }
      }
    }
  };
  // Authoritative single game session for quiz modes
  const isQuizMode = currentMode !== 'explorar';
  const challengeType: ChallengeType =
    currentMode === 'reto_localizar'
      ? 'localizar'
      : currentMode === 'reto_identificar'
      ? 'identificar'
      : 'contrarreloj';
  const onSetTargetHighlight = useCallback((id: string | null) => {
    setTargetHighlightId(id);
  }, []);
  const onSetFeedback = useCallback((id: string | null, status: 'correct' | 'wrong' | null) => {
    setFeedbackElementId(id);
    setFeedbackStatus(status);
  }, []);
  const challengeSession = useChallengeSession({
    elements: activeElements,
    challengeType,
    filterCategory: 'todos',
    isActive: isQuizMode,
    onCorrectAnswer: handleCorrectAnswer,
    onWrongAnswer: handleWrongAnswer,
    onSetTargetHighlight,
    onSetFeedback,
    roundSize: GAME_CONFIG.GAMEPLAY.DEFAULT_ROUND_SIZE,
  });
  const isGameFinished = challengeSession.isGameOver || challengeSession.isCompleted;
  const companionLabel = isVectorEditMode ? 'Editor' : currentMode === 'explorar' ? 'Atlas' : isGameFinished ? 'Resultados' : 'Ficha del reto';
  const regions: VisibilityRegion[] = [
    { id: 'header', label: 'Barra superior', visible: !isHeaderCollapsed, onToggle: () => setIsHeaderCollapsed(value => !value) },
    { id: 'navigation', label: 'Navegación', visible: !isNavigationCollapsed, onToggle: () => setIsNavigationCollapsed(value => !value) },
    { id: 'companion', label: companionLabel, visible: !(isVectorEditMode ? isEditorPanelCollapsed : isCompanionCollapsed),
      onToggle: () => isVectorEditMode ? setIsEditorPanelCollapsed(value => !value) : setIsCompanionCollapsed(value => !value) },
    ...(currentMode === 'contrarreloj' && !isGameFinished && !isVectorEditMode
      ? [{ id: 'telemetry', label: 'Marcador', visible: !isTelemetryCollapsed, onToggle: () => setIsTelemetryCollapsed(value => !value) }] : []),
    { id: 'tools', label: 'Herramientas del mapa', visible: !areMapToolsCollapsed, onToggle: () => setAreMapToolsCollapsed(value => !value) },
  ];
  const interfaceHidden = regions.every(region => !region.visible);
  const toggleAllRegions = () => {
    regions.filter(region => region.visible !== interfaceHidden).forEach(region => region.onToggle());
  };
  const activeTargetHighlightId = !isGameFinished && currentMode !== 'explorar' ? targetHighlightId : null;
  const activeFeedbackElementId = !isGameFinished && currentMode !== 'explorar' ? feedbackElementId : null;
  const activeFeedbackStatus = !isGameFinished && currentMode !== 'explorar' ? feedbackStatus : null;
  return (
    <div className={`immersive-shell ${theme === 'nocturno' ? 'dark' : ''}`} data-theme={theme}
      data-mode={isVectorEditMode ? 'editor' : currentMode} data-interface-hidden={interfaceHidden}
      data-panel-collapsed={isVectorEditMode ? isEditorPanelCollapsed : isCompanionCollapsed}
      data-expanded={isMobileDrawerOpen} data-finished={isGameFinished}>
      <VisibilityControl regions={regions} onToggleAll={toggleAllRegions} />
      <FloatingRegion id="header" label="barra superior" className="header-region" collapsed={isHeaderCollapsed}>
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
        onOpenManual={() => setIsManualOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onSelectElement={handleMapElementClick}
        isVectorEditMode={isVectorEditMode}
        onSaveVectorEdit={handleSaveDraft}
        onExportConfiguration={handleExportConfiguration}
        onCancelVectorEdit={handleExitEditMode}
        hasUnsavedChanges={hasUnsavedChanges}
        editingElementName={draftElement?.name}
      />
      </FloatingRegion>
      <main className="map-stage" aria-label="Mapa interactivo de España">
        <div className="map-safe-frame">
          <SpainMap
                elements={displayedElements}
                layers={accidentFilters}
                theme={theme}
                selectedElement={isVectorEditMode ? draftElement : selectedElement}
                onSelectElement={isVectorEditMode ? handleSelectElementForEdit : setSelectedElement}
                targetHighlightId={activeTargetHighlightId}
                feedbackElementId={activeFeedbackElementId}
                feedbackStatus={activeFeedbackStatus}
                onElementClick={handleMapElementClick}
                onElementHover={handleVisitAtlasElement}
                visitedAtlasIds={stats.visitedAtlasElements}
                atlasStampUnlocked={stats.atlasStampUnlocked}
                onOpenStampModal={() => setIsStampCelebrationOpen(true)}
                currentMode={currentMode}
                isInteractive={true}
                blankMode={!accidentFilters.showLabels}
                isVectorEditMode={isVectorEditMode}
                onToggleVectorEditMode={handleToggleVectorEditMode}
                editingElement={isVectorEditMode ? draftElement : null}
                onUpdateElementGeometry={handleUpdateDraftGeometry}
                controlsHidden={areMapToolsCollapsed}
              />
        </div>
      </main>
      <FloatingRegion id="companion" label={isVectorEditMode ? 'editor' : currentMode === 'explorar' ? 'Atlas' : 'reto'}
        className={`companion-region ui-glass ${currentMode === 'explorar' && !isVectorEditMode ? 'atlas-region' : ''}`}
        collapsed={isVectorEditMode ? isEditorPanelCollapsed : isCompanionCollapsed}
        actions={currentMode === 'explorar' && !isVectorEditMode ? <button type="button" className="ui-icon expand-atlas" onClick={() => setIsMobileDrawerOpen(value => !value)}
          aria-label={isMobileDrawerOpen ? 'Bajar ficha y ver el mapa' : 'Subir ficha de exploración'} aria-expanded={isMobileDrawerOpen}>
          {isMobileDrawerOpen ? <ChevronDown size={17} /> : <ChevronUp size={17} />}</button> : undefined}>
        {isVectorEditMode ? (
          <VectorEditorPanel
                  elements={geoElements}
                  selectedElement={selectedElement}
                  draftElement={draftElement}
                  hasUnsavedChanges={hasUnsavedChanges}
                  onSelectElement={handleSelectElementForEdit}
                  onUpdateDraftField={handleUpdateDraftField}
                  onSave={handleSaveDraft}
                  onDiscard={handleDiscardDraft}
                  onCreateNew={handleCreateNewElement}
                  onDuplicate={handleDuplicateElement}
                  onDelete={handleDeleteElement}
                  onExitEditMode={handleExitEditMode}
                />
        ) : currentMode === 'explorar' ? (
          <ExplorePanel
                allElements={displayedElements}
                className="explore-panel"
                elements={activeElements}
                selectedElement={activeSelectedElement}
                onSelectElement={(elem) => {
                  setSelectedElement(elem);
                  if (elem) setIsMobileDrawerOpen(false);
                  if (elem) handleVisitAtlasElement(elem);
                  playSound('click');
                }}
                activeCategory={exploreCategory}
                onCategoryChange={setExploreCategory}
                visitedAtlasIds={stats.visitedAtlasElements}
                atlasStampUnlocked={stats.atlasStampUnlocked}
                onOpenStampModal={() => setIsStampCelebrationOpen(true)}
                onResetAtlas={handleResetAtlas}
                onStartDailyChallenge={() => handleModeChange('reto_localizar')}
              />
        ) : (
          <ChallengeMode className="challenge-panel" session={challengeSession} challengeType={challengeType}
            telemetryTarget={telemetryTarget} onSwitchToAtlas={() => handleModeChange('explorar')}
            onOpenPrintable={() => setIsPrintableOpen(true)} />
        )}
      </FloatingRegion>
      {currentMode === 'contrarreloj' && !isGameFinished && !isVectorEditMode && <FloatingRegion id="telemetry" label="marcador" collapsed={isTelemetryCollapsed} className="telemetry-region">
        <div ref={setTelemetryTarget} />
      </FloatingRegion>}
      <FloatingRegion id="navigation" label="navegación" collapsed={isNavigationCollapsed} className="navigation-region">
        <MobileBottomNav currentMode={currentMode} onModeChange={handleModeChange}
          onOpenLayers={() => setIsAccidentFilterOpen(true)} onOpenAchievements={() => setIsAchievementsOpen(true)} />
      </FloatingRegion>
      {/* Unified Accident & Layer Selection Modal */}
      <AccidentFilterPanel
        isOpen={isAccidentFilterOpen}
        onClose={() => setIsAccidentFilterOpen(false)}
        filters={accidentFilters}
        onToggleFilter={handleToggleAccidentFilter}
        onApplyPreset={handleApplyPreset}
        activeCount={activeElements.length}
        totalCount={geoElements.length}
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
        elements={activeElements}
      />
      {/* Celebration modal for completing the full atlas. */}
      <AtlasStampCelebrationModal
        isOpen={isStampCelebrationOpen}
        onClose={() => setIsStampCelebrationOpen(false)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
        totalExplored={stats.visitedAtlasElements?.length || 0}
      />
      {/* Game Manual & Didactic Guide Modal */}
      <GameManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        onSelectMode={(mode) => handleModeChange(mode)}
      />
      {/* Unsaved Changes Confirmation Modal */}
      <UnsavedChangesModal
        isOpen={isUnsavedModalOpen}
        elementName={draftElement?.name || ''}
        onSaveAndProceed={() => {
          handleSaveDraft();
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
          setIsUnsavedModalOpen(false);
        }}
        onDiscardAndProceed={() => {
          handleDiscardDraft();
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
          setIsUnsavedModalOpen(false);
        }}
        onCancel={() => {
          setPendingAction(null);
          setIsUnsavedModalOpen(false);
        }}
      />
    </div>
  );
}
