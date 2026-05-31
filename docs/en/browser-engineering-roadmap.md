# Browser Engineering Roadmap

This roadmap compares the current Electron browser shell with ideas from:

- [browser.engineering](https://browser.engineering/)
- [browserengineering/book](https://github.com/browserengineering/book)

The current project is a working desktop browser shell: Chromium renders the page, while this code owns tabs, navigation, bookmarks, webview lifecycle, documentation, and verification. The book takes a lower-level route: it builds a basic browser in Python, chapter by chapter, from networking through layout, JavaScript, privacy, compositing, scheduling, accessibility, embedded content, and invalidation.

## What The Project Has Now

| Area | Current State |
|------|---------------|
| Browser shell | Electron app with tabs, toolbar, bookmarks, status bar, and webview stage |
| Page rendering | Delegated to Chromium through Electron `<webview>` |
| Navigation | URL/search normalization and webview navigation |
| State | Pure tab and bookmark state with unit tests |
| Isolation | Context isolation, no Node integration in webviews, denied permissions by default |
| Documentation | English/Vietnamese guides, Mermaid diagrams, SVG wireframe, GitHub Pages guide |
| Verification | Vitest, TypeScript typecheck, Vite production build, npm audit |

## What Can Be Added

### Track A: Improve The Product Browser

These features build on the existing Electron shell and make it feel more like a daily-use browser.

| Priority | Feature | Why It Matters | Suggested Test |
|----------|---------|----------------|----------------|
| High | Persistent session restore | Reopen previous tabs after restart | State serialization test |
| High | History store and history page | Let users revisit pages and debug navigation | History reducer tests |
| High | Bookmark manager page | Current bookmark bar is small; a manager scales better | Add/remove/search tests |
| High | Find in page | Common browser workflow using Electron webview APIs | Renderer command smoke test |
| Medium | Page zoom controls | Accessibility and productivity | State + webview command tests |
| Medium | Downloads shelf | Browser should surface downloads instead of hiding them | Main-process download event test |
| Medium | Security indicator | Show origin, protocol, and permission posture | URL classification tests |
| Medium | Error page | Replace raw failed-load status with a readable in-app page | Failure event test |
| Low | DevTools toggle | Useful for learners debugging webview content | Shortcut wiring test |
| Low | Profile data controls | Clear storage/cookies/cache for the app session | Main-process session tests |

### Track B: Add A Mini Browser Engine Lab

This is the biggest improvement inspired by `browser.engineering`. Keep it separate from the Electron app so the working browser shell remains stable.

```text
labs/mini-engine/
├── src/
│   ├── url.ts              # URL parsing and request model
│   ├── httpClient.ts       # Basic HTTP/HTTPS fetch wrapper
│   ├── htmlTokenizer.ts    # Tokens: tags, text, attributes
│   ├── htmlTree.ts         # DOM-like tree construction
│   ├── cssParser.ts        # Basic selectors and declarations
│   ├── style.ts            # Cascade and inherited properties
│   ├── layout.ts           # Block and inline layout boxes
│   ├── paint.ts            # Draw commands
│   └── canvasViewer.ts     # Render draw commands to canvas
└── tests/
    ├── htmlTokenizer.test.ts
    ├── htmlTree.test.ts
    ├── cssParser.test.ts
    ├── layout.test.ts
    └── paint.test.ts
```

The lab should not try to compete with Chromium. Its value is educational: every stage is small enough to test, inspect, and explain.

### Track C: Add Browser Internals Lessons To The Guide

Add a second course path next to the current browser shell path.

| Lesson | Topic | Output |
|--------|-------|--------|
| E01 | URL and HTTP request lifecycle | Fetch a page and inspect headers/body |
| E02 | Drawing model | Render text and rectangles to a canvas |
| E03 | Text layout | Word wrap, line height, scrolling |
| E04 | HTML parsing | Token stream and DOM-like tree |
| E05 | CSS cascade | Selectors, inherited styles, computed style |
| E06 | Layout tree | Block and inline layout boxes |
| E07 | Links and forms | Click hit-testing and form submission |
| E08 | JavaScript boundary | Explain why full JS is hard; add a tiny event hook |
| E09 | Privacy and security | Cookies, same-origin, XSS/CSRF concepts |
| E10 | Scheduling and invalidation | Event loop, dirty layout, repaint decisions |
| E11 | Accessibility | Keyboard navigation, zoom, semantic tree |
| E12 | Embedded content | Images and iframes as separate loading/rendering paths |

### Track D: Strengthen Verification

The book repository includes chapter-by-chapter browser code and tests. For this project, the comparable step is to add fixtures that prove each learning stage works.

- HTML fixture pages in `fixtures/pages/`.
- Unit tests for parsers and reducers.
- Playwright smoke tests for the Electron chrome.
- Screenshot checks for the GitHub Pages guide.
- CI workflow that runs `npm test`, `npm run typecheck`, `npm run build`, and Pages deploy.

## Recommended Next Three Milestones

1. **M01: Session and History**
   Add persistent tabs, history reducer, history page, and tests.

2. **M02: Find, Zoom, and Error Pages**
   Add high-value browser-shell workflows without changing the rendering model.

3. **M03: Mini Engine Lab**
   Add a separate `labs/mini-engine` package that teaches URL fetching, HTML parsing, CSS, layout, and painting in small tested steps.

## Why This Split Is Important

Mixing a production browser shell and an educational rendering engine in the same runtime would make the app fragile. Keeping them separate gives the project two clear promises:

- The Electron app remains usable.
- The mini engine lab explains how browsers work internally.

