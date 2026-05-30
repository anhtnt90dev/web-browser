# Web Browser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TypeScript/Electron desktop web browser from scratch with bilingual documentation and diagrams.

**Architecture:** Electron owns the native window and webview security policy. The renderer owns browser chrome, tabs, bookmarks, and navigation UI. Shared TypeScript modules hold pure logic so behavior can be tested without Electron.

**Tech Stack:** TypeScript, Electron, Vite, Vitest, Mermaid Markdown diagrams, SVG docs assets.

---

## File Structure

- `package.json`: scripts and dependencies.
- `tsconfig.json`: shared TypeScript compiler settings.
- `vite.main.config.ts`: builds Electron main and preload files.
- `vite.renderer.config.ts`: builds renderer HTML, CSS, and TypeScript.
- `vitest.config.ts`: unit test configuration.
- `src/main/main.ts`: Electron startup and webview security.
- `src/main/preload.ts`: safe renderer bridge.
- `src/shared/navigation.ts`: address/search normalization.
- `src/renderer/browserState.ts`: tab and bookmark state.
- `src/renderer/renderer.ts`: UI event wiring and webview management.
- `src/renderer/index.html`: application shell.
- `src/renderer/styles.css`: browser UI styling.
- `tests/navigation.test.ts`: navigation tests.
- `tests/browserState.test.ts`: state tests.
- `docs/en/build-from-scratch.md`: English guide.
- `docs/vi/xay-dung-tu-dau.md`: Vietnamese guide.
- `docs/diagrams/*.mmd`: Mermaid diagram sources.
- `docs/assets/*.svg`: visual documentation assets.

## Tasks

### Task 1: Project scaffold

- [x] Create package and TypeScript/Vite/Vitest configuration files.
- [x] Create source and documentation folders.

### Task 2: Navigation behavior by TDD

- [x] Write tests for address input normalization.
- [x] Run tests and confirm they fail before implementation.
- [x] Implement `src/shared/navigation.ts`.
- [x] Run tests and confirm they pass.

### Task 3: Browser state behavior by TDD

- [x] Write tests for tab and bookmark state.
- [x] Run tests and confirm they fail before implementation.
- [x] Implement `src/renderer/browserState.ts`.
- [x] Run tests and confirm they pass.

### Task 4: Electron and renderer UI

- [x] Implement Electron main process, preload bridge, HTML, CSS, and renderer wiring.
- [x] Keep web content isolated through webview settings.
- [x] Add toolbar, tabs, bookmark bar, status bar, and keyboard shortcuts.

### Task 5: Documentation

- [x] Write English guide.
- [x] Write Vietnamese guide.
- [x] Add Mermaid architecture diagrams and SVG UI illustration.

### Task 6: Verification

- [x] Install dependencies.
- [x] Run unit tests.
- [x] Run production build.
- [x] Launch the app in development mode when possible.
