# Roadmap Browser Engineering

Roadmap này đối chiếu dự án hiện tại với các ý tưởng từ:

- [browser.engineering](https://browser.engineering/)
- [browserengineering/book](https://github.com/browserengineering/book)

Dự án hiện tại là một browser shell desktop chạy được: Chromium render trang web, còn code trong repo quản lý tab, navigation, bookmark, vòng đời webview, tài liệu và kiểm chứng. Cuốn sách đi sâu hơn: xây một browser cơ bản bằng Python theo từng chương, từ networking tới layout, JavaScript, privacy, compositing, scheduling, accessibility, embedded content và invalidation.

## Dự Án Đang Có Gì

| Mảng | Trạng thái hiện tại |
|------|---------------------|
| Browser shell | Electron app có tabs, toolbar, bookmarks, status bar và webview stage |
| Page rendering | Giao cho Chromium thông qua Electron `<webview>` |
| Navigation | Chuẩn hóa URL/search và điều hướng webview |
| State | State tab/bookmark dạng pure function, có unit test |
| Isolation | Context isolation, webview không có Node integration, mặc định từ chối permission |
| Documentation | Guide tiếng Anh/tiếng Việt, Mermaid diagrams, SVG wireframe, GitHub Pages |
| Verification | Vitest, TypeScript typecheck, Vite production build, npm audit |

## Có Thể Bổ Sung Gì

### Track A: Nâng Cấp Browser App Hiện Tại

Các tính năng này dựa trên Electron shell đang có và làm app giống browser dùng hằng ngày hơn.

| Ưu tiên | Tính năng | Lý do | Test gợi ý |
|---------|-----------|-------|------------|
| Cao | Khôi phục session | Mở lại tabs cũ sau khi restart | Test serialize state |
| Cao | History store và history page | Xem lại trang đã đi qua, debug navigation | Test history reducer |
| Cao | Bookmark manager page | Bookmark bar hiện nhỏ; manager dễ mở rộng hơn | Test add/remove/search |
| Cao | Find in page | Workflow browser rất phổ biến qua API webview | Smoke test command renderer |
| Trung bình | Page zoom controls | Hỗ trợ accessibility và productivity | Test state + webview command |
| Trung bình | Downloads shelf | Browser nên hiển thị download thay vì ẩn trong hệ thống | Test event download ở main process |
| Trung bình | Security indicator | Hiển thị origin, protocol và posture quyền | Test phân loại URL |
| Trung bình | Error page | Thay status lỗi thô bằng trang lỗi dễ hiểu | Test event load fail |
| Thấp | DevTools toggle | Hữu ích cho người học debug webview content | Test shortcut wiring |
| Thấp | Profile data controls | Xóa storage/cookies/cache của session app | Test Electron session |

### Track B: Thêm Mini Browser Engine Lab

Đây là bổ sung lớn nhất lấy cảm hứng từ `browser.engineering`. Nên tách khỏi Electron app để browser đang chạy không bị ảnh hưởng.

```text
labs/mini-engine/
├── src/
│   ├── url.ts              # URL parsing và request model
│   ├── httpClient.ts       # HTTP/HTTPS fetch wrapper cơ bản
│   ├── htmlTokenizer.ts    # Token: tag, text, attributes
│   ├── htmlTree.ts         # Tạo cây gần giống DOM
│   ├── cssParser.ts        # Selector và declaration cơ bản
│   ├── style.ts            # Cascade và inherited properties
│   ├── layout.ts           # Block và inline layout boxes
│   ├── paint.ts            # Draw commands
│   └── canvasViewer.ts     # Render draw commands lên canvas
└── tests/
    ├── htmlTokenizer.test.ts
    ├── htmlTree.test.ts
    ├── cssParser.test.ts
    ├── layout.test.ts
    └── paint.test.ts
```

Lab này không cạnh tranh với Chromium. Giá trị của nó là giáo dục: mỗi stage đủ nhỏ để test, đọc và giải thích.

### Track C: Thêm Bài Học Browser Internals Vào Guide

Thêm một learning path thứ hai bên cạnh browser shell path hiện tại.

| Bài | Chủ đề | Output |
|-----|--------|--------|
| E01 | URL và HTTP request lifecycle | Fetch một trang, inspect headers/body |
| E02 | Drawing model | Render text và rectangle lên canvas |
| E03 | Text layout | Word wrap, line height, scrolling |
| E04 | HTML parsing | Token stream và cây gần giống DOM |
| E05 | CSS cascade | Selectors, inherited styles, computed style |
| E06 | Layout tree | Block và inline layout boxes |
| E07 | Links và forms | Click hit-testing và form submission |
| E08 | JavaScript boundary | Giải thích vì sao full JS khó; thêm event hook nhỏ |
| E09 | Privacy và security | Cookies, same-origin, XSS/CSRF concepts |
| E10 | Scheduling và invalidation | Event loop, dirty layout, quyết định repaint |
| E11 | Accessibility | Keyboard navigation, zoom, semantic tree |
| E12 | Embedded content | Images và iframes như loading/rendering path riêng |

### Track D: Làm Verification Mạnh Hơn

Repo sách có code browser theo từng chương và test. Với dự án này, bước tương đương là thêm fixtures để chứng minh từng stage học tập hoạt động đúng.

- HTML fixture pages trong `fixtures/pages/`.
- Unit tests cho parser và reducer.
- Playwright smoke tests cho Electron chrome.
- Screenshot checks cho GitHub Pages guide.
- CI workflow chạy `npm test`, `npm run typecheck`, `npm run build` và Pages deploy.

## Ba Milestone Nên Làm Tiếp

1. **M01: Session và History**
   Thêm persistent tabs, history reducer, history page và tests.

2. **M02: Find, Zoom và Error Pages**
   Thêm workflow browser giá trị cao mà chưa cần đổi rendering model.

3. **M03: Mini Engine Lab**
   Thêm package `labs/mini-engine` để học URL fetching, HTML parsing, CSS, layout và painting qua các bước nhỏ có test.

## Vì Sao Nên Tách Hai Nhánh

Trộn production browser shell và educational rendering engine trong cùng runtime sẽ làm app dễ vỡ. Tách riêng giúp dự án giữ hai lời hứa rõ ràng:

- Electron app vẫn dùng được.
- Mini engine lab giải thích cách browser hoạt động bên trong.

