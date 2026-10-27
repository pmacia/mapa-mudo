# Map Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full-window stable map with peninsula framing and one dynamic visibility controller.
**Architecture:** App controls visible regions; VisibilityControl owns menu and pointer gestures only. FloatingRegion retains hidden mounted children without local recovery chrome. SpainMap computes base framing from peninsula bounds and viewport, independently of overlays, with user zoom/pan relative to that base.
**Tech Stack:** Existing React, CSS, Lucide and Playwright harness; no dependencies.
**Spec:** docs/superpowers/specs/2026-10-27-map-visibility-design.md

## Global Constraints
- Preserve game rules, timer, saved data, coordinates, editor actions and three themes.
- No panel-dependent map dimensions, transforms or framing; map occupies the entire viewport.
- Initial framing fills available width with peninsula, constrained by viewport height.
- Mounted children survive hiding; explicit recovery always available, coarse targets >=44 px.
- Keep current checkout on a feature branch; no publishing as part of this adjustment.

## Review Focus
- All individually disabled implies crossed-out eye; restore recovers last nonempty set.
- Long press opens menu without hiding everything, including pointer cancellation.
- Marker options change on timed results; editor dirty drafts survive hiding and mode transitions respect unsaved prompts.
- Portrait timed controls and quiz scrolling remain accessible; landscape map fills viewport.
- Zoom/pan remain identical while overlays change; editor SVG coordinate conversion remains correct.

### Task 1: Central visibility and stable full-window map
**Files:** create src/components/Layout/VisibilityControl.tsx; modify src/components/Layout/FloatingRegion.tsx, src/App.tsx, src/components/Header.tsx, src/components/Editor/VectorEditorPanel.tsx, src/components/Map/SpainMap.tsx, src/styles/immersive.css; create tests/map-visibility.mjs; update tests/immersive-ui.mjs and tests/immersive-layout.mjs.
**Interfaces:** VisibilityControl receives regions `{id:string,label:string,visible:boolean,onToggle:()=>void}[]` and `onToggleAll:()=>void`; App owns region booleans and restore snapshot. FloatingRegion remains a controlled hidden wrapper with optional actions. SpainMap receives controlsHidden and computes fitted viewBox from peninsula bounds, with zoom relative to it.
- [ ] Add browser regression for full-viewport canvas, invariant transform/viewBox under panel toggles, dynamic menu, eye semantics/restore, long press and pointer cancellation; observe failure on current UI.
- [ ] Implement controller, central App state, dynamic labels and remove duplicate minimize/recovery controls while retaining functional actions.
- [ ] Remove all map-safe-frame insets dependent on overlays. Fit peninsula to viewport, with 16 px padding and height constraint, retaining manual zoom/pan and editor transforms.
- [ ] Adapt existing browser checks to central menu; verify timed continuity/results, touch targets, all themes, editor draft/shortcuts/export and quiz scrolling. Inspect portrait and landscape captures.
- [ ] Run node tests, browser regressions, lint, build, diff check. Request one independent review and address findings. Commit validated result and report.
