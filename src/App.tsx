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
import { List, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  // Responsive device detection to prevent duplicate mounted ChallengeMode instances
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= GAME_CONFIG.UI.DESKTOP_BREAKPOINT_PX;
    }
    return true;
  });
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= GAME_CONFIG.UI.DESKTOP_BREAKPOINT_PX);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
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
  const [isPortraitExplore, setIsPortraitExplore] = useState(false);
  const [sheetBounds, setSheetBounds] = useState({ top: 80, bottom: 80, collapsedTop: 400, collapsedHeight: 200 });
  const workspaceRef = useRef<HTMLElement>(null);
  const mapFrameRef = useRef<HTMLDivElement>(null);
  const bottomNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px) and (orientation: portrait)');
    const updateLayout = () => {
      setIsPortraitExplore(media.matches);
      const nav = bottomNavRef.current?.firstElementChild;
      const navRect = nav?.getBoundingClientRect();
      const top = Math.max(0, workspaceRef.current?.getBoundingClientRect().top ?? 0);
      const bottom = navRect && navRect.height > 0
        ? Math.max(0, window.innerHeight - navRect.top) : 0;
      const availableBottom = window.innerHeight - bottom;
      const mapBottom = mapFrameRef.current?.getBoundingClientRect().bottom ?? top;
      const collapsedTop = Math.max(top, Math.min(mapBottom + 8, availableBottom - 96));
      const collapsedHeight = Math.max(0, availableBottom - collapsedTop);
      setSheetBounds(prev => prev.top === top && prev.bottom === bottom &&
        prev.collapsedTop === collapsedTop && prev.collapsedHeight === collapsedHeight
        ? prev : { top, bottom, collapsedTop, collapsedHeight });
    };
    updateLayout();
    const observer = new ResizeObserver(updateLayout);
    if (bottomNavRef.current?.firstElementChild) observer.observe(bottomNavRef.current.firstElementChild);
    if (workspaceRef.current?.previousElementSibling) observer.observe(workspaceRef.current.previousElementSibling);
    if (mapFrameRef.current) observer.observe(mapFrameRef.current);
    media.addEventListener('change', updateLayout);
    window.addEventListener('resize', updateLayout);
    window.addEventListener('scroll', updateLayout, { passive: true });
    return () => {
      observer.disconnect();
      media.removeEventListener('change', updateLayout);
      window.removeEventListener('resize', updateLayout);
      window.removeEventListener('scroll', updateLayout);
    };
  }, []);

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
  const activeTargetHighlightId = !isGameFinished && currentMode !== 'explorar' ? targetHighlightId : null;
  const activeFeedbackElementId = !isGameFinished && currentMode !== 'explorar' ? feedbackElementId : null;
  const activeFeedbackStatus = !isGameFinished && currentMode !== 'explorar' ? feedbackStatus : null;
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
        onOpenManual={() => setIsManualOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        isCollapsed={isHeaderCollapsed}
        onToggleCollapse={() => setIsHeaderCollapsed((prev) => !prev)}
        onSelectElement={handleMapElementClick}
        isVectorEditMode={isVectorEditMode}
        onSaveVectorEdit={handleSaveDraft}
        onExportConfiguration={handleExportConfiguration}
        onCancelVectorEdit={handleExitEditMode}
        hasUnsavedChanges={hasUnsavedChanges}
        editingElementName={draftElement?.name}
        isEditorPanelCollapsed={isEditorPanelCollapsed}
        onToggleEditorPanelCollapse={() => setIsEditorPanelCollapsed(prev => !prev)}
      />
      {/* Main App Container */}
      <main
      ref={workspaceRef}
        className="flex-1 w-full max-w-[1720px] mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-5 pb-20 sm:pb-28 lg:pb-8 transition-all duration-300"
      >
        {/* Switch the entire workspace at lg (1024px), matching isDesktop and mobile navigation. */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4 lg:gap-6 items-start relative">
          {/* Main Map Column (Full width below lg, 7/8 columns on desktop, or full 12 columns if collapsed) */}
          <div
            className={`flex flex-col transition-all duration-300 ease-in-out ${
              isVectorEditMode
                ? isEditorPanelCollapsed
                  ? 'lg:col-span-12'
                  : 'lg:col-span-7 xl:col-span-8'
                : currentMode === 'explorar'
                ? 'lg:col-span-7 xl:col-span-8'
                : 'lg:col-span-8 xl:col-span-8'
            }`}
          >
            <div
              ref={mapFrameRef}
              className="w-full aspect-[1000/720] relative rounded-DEFAULT lg:rounded-2xl overflow-hidden shadow-[0_4px_0_#cbd5e1] dark:shadow-none border border-slate-200 dark:border-slate-800 transition-all duration-300 bg-map-water-light"
            >
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
                isEditorPanelCollapsed={isEditorPanelCollapsed}
                onToggleEditorPanelCollapse={() => setIsEditorPanelCollapsed((prev) => !prev)}
              />
            </div>
          </div>
          {/* Right Column (Desktop sticky companion dock with independent scroll) */}
          {(!isVectorEditMode || !isEditorPanelCollapsed) && (
            <div
              className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out animate-slideInRight ${
                isVectorEditMode || currentMode === 'explorar'
                  ? 'lg:col-span-5 xl:col-span-4'
                  : 'lg:col-span-4 xl:col-span-4'
              } lg:sticky lg:top-20 max-h-[calc(100vh-6.5rem)]`}
            >
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
                  onToggleCollapse={() => setIsEditorPanelCollapsed(true)}
                />
              ) : currentMode === 'explorar' ? (
              <ExplorePanel
                allElements={displayedElements}
                className="w-full max-h-[calc(100vh-6.5rem)]"
                elements={activeElements}
                selectedElement={activeSelectedElement}
                onSelectElement={(elem) => {
                  setSelectedElement(elem);
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
            ) : isDesktop ? (
              <ChallengeMode
                className="w-full max-h-[calc(100vh-6.5rem)]"
                session={challengeSession}
                challengeType={challengeType}
                onSwitchToAtlas={() => handleModeChange('explorar')}
                onOpenPrintable={() => setIsPrintableOpen(true)}
              />
            ) : null}
          </div>
        )}
  
        {/* Portrait exploration: always visible, with two positions. */}
        {isPortraitExplore && currentMode === 'explorar' && (
          <div aria-hidden="true" style={{ height: sheetBounds.collapsedHeight }} />
        )}
        {isPortraitExplore && currentMode === 'explorar' && (
          <section
            aria-label="Panel de exploración"
            className="fixed inset-x-2.5 z-30 flex min-h-0 flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-[top,bottom] duration-[350ms] ease-in-out motion-reduce:transition-none"
            style={{
              top: isMobileDrawerOpen ? sheetBounds.top : sheetBounds.collapsedTop,
              bottom: sheetBounds.bottom,
            }}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
              <span className="text-xs font-bold">Accidentes ({activeElements.length})</span>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(prev => !prev)}
                aria-expanded={isMobileDrawerOpen}
                aria-controls="portrait-explore-content"
                aria-label={isMobileDrawerOpen ? 'Bajar ficha y ver el mapa' : 'Subir ficha de exploración'}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                {isMobileDrawerOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </button>
            </div>
            <div id="portrait-explore-content" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
            <ExplorePanel
                allElements={displayedElements}
              className="h-full min-h-0 w-full"
                elements={activeElements}
                selectedElement={activeSelectedElement}
                onSelectElement={(elem) => {
                  setSelectedElement(elem);
                  if (elem) {
                    handleVisitAtlasElement(elem);
                    playSound('click');
                    // Return to the lower position so the selected element is visible on the map
                    setIsMobileDrawerOpen(false);
                  }
                }}
                activeCategory={exploreCategory}
                onCategoryChange={setExploreCategory}
                visitedAtlasIds={stats.visitedAtlasElements}
                atlasStampUnlocked={stats.atlasStampUnlocked}
                onOpenStampModal={() => setIsStampCelebrationOpen(true)}
                onResetAtlas={handleResetAtlas}
              onStartDailyChallenge={() => handleModeChange('reto_localizar')}
              />
            </div>
          </section>
        )}
        {/* Mobile Bottom Challenge Banner (When in Quiz mode on mobile) */}
          {!isDesktop && currentMode !== 'explorar' && (
            <div className="lg:hidden mt-1 sm:mt-2">
              <ChallengeMode
                session={challengeSession}
                challengeType={challengeType}
                onSwitchToAtlas={() => handleModeChange('explorar')}
                onOpenPrintable={() => setIsPrintableOpen(true)}
              />
            </div>
          )}
        </div>
      </main>
      {/* Floating Bottom Button for Mobile (In Explore Mode) */}
      {!isPortraitExplore && currentMode === 'explorar' && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 lg:hidden">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-full font-headline-md text-xs shadow-[0_3px_0_#003ea8] active:translate-y-0.5 transition-all cursor-pointer"
          >
            <List className="w-4 h-4" />
            <span>Accidentes ({activeElements.length})</span>
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Mobile Bottom Navigation Bar (Persistent touch dock) */}
      <div ref={bottomNavRef}>
    <MobileBottomNav
        currentMode={currentMode}
        onModeChange={handleModeChange}
        onOpenLayers={() => setIsAccidentFilterOpen(true)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
      />
    </div>
      {/* Mobile Bottom Sheet Drawer for Explore Panel */}
      {!isPortraitExplore && isMobileDrawerOpen && currentMode === 'explorar' && (
        <div 
          className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div 
            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 flex flex-col h-[95vh] animate-slideUp overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle & Close Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {/*   <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Accidentes Geográficos ({activeElements.length})
                </span>
              </div> */}
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold cursor-pointer"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Explore Panel inside Bottom Sheet */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <ExplorePanel
                allElements={displayedElements}
                elements={activeElements}
                selectedElement={activeSelectedElement}
                onSelectElement={(elem) => {
                  setSelectedElement(elem);
                  if (elem) {
                    handleVisitAtlasElement(elem);
                    playSound('click');
                    // Auto close sheet so student sees the element on map
                    setIsMobileDrawerOpen(false);
                  }
                }}
                activeCategory={exploreCategory}
                onCategoryChange={setExploreCategory}
                visitedAtlasIds={stats.visitedAtlasElements}
                atlasStampUnlocked={stats.atlasStampUnlocked}
                onOpenStampModal={() => setIsStampCelebrationOpen(true)}
                onResetAtlas={handleResetAtlas}
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
