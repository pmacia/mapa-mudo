# Immersive Map UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Implement the approved map-first interface with floating, translucent, recoverable controls, preserving every existing game and editor function.
**Architecture:** Retain App's functional state and the existing session hook. A reusable FloatingRegion hides presentation without unmounting children; one ChallengeMode instance survives viewport changes. CSS lays out the map canvas, shell and floating regions; timed telemetry can portal into a separate top region without creating a second session.
**Tech Stack:** Existing React, Tailwind CSS and Lucide; no new product dependencies.
**Spec:** `docs/superpowers/specs/2026-10-27-immersive-map-ui-design.md`

## Global Constraints
- No changes to game rules, scoring, timer, saved data or geographic coordinates.
- Three themes retained: classic/light, physical/light and nocturnal/dark. Translucent controls must be readable in all three.
- Initially show complete Spain in portrait; slightly closer framing only where it fits.
- All bars recoverable, hiding manual, no hover-only essential controls.
- One mounted ChallengeMode during games, unchanged on orientation changes or hide/restore.
- Reuse the current checkout on a feature branch; no push or merge is part of this implementation.

## Review Focus
- 360×640 portrait: timer, question, map and both answer buttons are simultaneously usable.
- Hidden regions: children remain mounted and invisible regions do not intercept map input.
- Resize/orientation: timer keeps counting, no duplicate keyboard handlers or question reset.
- Editor: hiding panels keeps a dirty draft; save/export/exit warnings and all keyboard shortcuts remain available.
- Light themes and reduced-motion/transparency: labels and actions retain contrast and visible focus.

### Task 1: Floating layout and stable game mounting
**Files:** create `src/components/Layout/FloatingRegion.tsx`, `src/styles/immersive.css`; modify `src/App.tsx`, `src/components/Quiz/ChallengeMode.tsx`, `src/components/Map/SpainMap.tsx`, `src/index.css`; test `tests/immersive-ui.mjs`.
**Interfaces:** FloatingRegion takes `id`, `label`, `className`, `children`, optional controlled `collapsed/onToggle`, optional `collapsible`; App owns global `interfaceHidden`. ChallengeMode adds optional `telemetryTarget: HTMLElement | null`; SpainMap adds optional `controlsHidden: boolean` and `onToggleControls` presentation props.
- [x] Add browser assertions for hide/restore, one game instance, viewport continuity and timed portrait layout; run against existing UI and observe missing controls fail.
- [x] Add recoverable FloatingRegion with mounted children, accessible toggle and focus restoration.
- [x] Replace responsive duplicate layout branches in App with a single map, one content panel and one ChallengeMode during games; timed telemetry uses a stable DOM portal target. Preserve callbacks verbatim.
- [x] Add full-height responsive layout, safe areas and isolated overlay pointer handling, including compact 360×640 and landscape.
- [x] Run the browser assertions, existing node tests, TypeScript and build; commit task.

### Task 2: Navigation, glass design and existing panels
**Files:** modify `src/components/Header.tsx`, `src/components/Navigation/MobileBottomNav.tsx`, `src/components/Explore/ExplorePanel.tsx`, `src/components/Editor/VectorEditorPanel.tsx`, `src/components/Quiz/ChallengeMode.tsx`, `src/components/Map/SpainMap.tsx`, `src/styles/immersive.css`.
**Interfaces:** Header retains existing props/actions and gains optional `onToggleInterface`, `interfaceHidden`; FloatingRegion from Task 1 supplies panel chrome; no changes to session or data interfaces.
- [x] Extend browser checks to require mobile/desktop access to themes, sound, fullscreen, manual, print, layers, achievements and editor actions.
- [x] Recompose Header as concise floating navigation plus accessible tools popover, retaining search, level/XP and all actions. Make bottom nav a floating dock with visible labels.
- [x] Restyle atlas, editor and challenge surfaces with scoped theme tokens and translucent fallbacks; retain every interactive child and feedback control.
- [x] Keep map controls independently recoverable; preserve compass and coastal blue outline. Use closer desktop framing without clipping portrait archipelagos.
- [x] Verify all three themes, keyboard controls, editor draft retention and printing, then commit.

### Task 3: Mobile gameplay and whole-branch verification
**Files:** `tests/immersive-ui.mjs`, any presentation files needing fixes, plan completion checkboxes.
**Interfaces:** tests use `BASE_URL`, `PLAYWRIGHT_MODULE` and optional `BROWSER_EXECUTABLE` so bundled automation can run without adding product dependencies.
- [ ] Exercise real timed responses, penalty/bonus/feedback, hide/restore, orientation and results/restart; assert no timer reset or duplicate answer.
- [ ] Exercise locate and quiz, atlas and vector editing, restore controls and each theme at 360×640, 390×844, 430×932, 768×1024, desktop, both sides of 1024 and mobile landscape.
- [ ] Save and inspect screenshots; run all node tests, TypeScript, build, browser checks and diff whitespace checks.
- [ ] Request one fresh whole-branch review against the approved spec; address critical/important findings and rerun relevant regressions plus full checks.
- [ ] Commit validated changes and report the branch, evidence and any limitations without publishing or merging.
