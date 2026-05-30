import type { WebviewTag } from 'electron';
import {
  DEFAULT_HOME_URL,
  type Bookmark,
  type BrowserState,
  type BrowserTab,
  addBookmark,
  addTab,
  closeTab,
  createInitialState,
  getActiveTab,
  removeBookmark,
  selectTab,
  updateTab
} from './browserState';
import { normalizeAddressInput } from '../shared/navigation';
import './styles.css';

const BOOKMARK_STORAGE_KEY = 'from-scratch-browser:bookmarks';
const WEBVIEW_PARTITION = 'persist:from-scratch-browser';

const tabStrip = requireElement<HTMLDivElement>('tab-strip');
const addressForm = requireElement<HTMLFormElement>('address-form');
const addressInput = requireElement<HTMLInputElement>('address-input');
const backButton = requireElement<HTMLButtonElement>('back-button');
const forwardButton = requireElement<HTMLButtonElement>('forward-button');
const reloadButton = requireElement<HTMLButtonElement>('reload-button');
const homeButton = requireElement<HTMLButtonElement>('home-button');
const bookmarkButton = requireElement<HTMLButtonElement>('bookmark-button');
const newTabButton = requireElement<HTMLButtonElement>('new-tab-button');
const bookmarkBar = requireElement<HTMLDivElement>('bookmark-bar');
const webviewStage = requireElement<HTMLElement>('webview-stage');
const statusBar = requireElement<HTMLElement>('status-bar');

const webviews = new Map<string, WebviewTag>();
let state: BrowserState = {
  ...createInitialState(),
  bookmarks: loadBookmarks()
};

addressForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const target = normalizeAddressInput(addressInput.value);

  if (target) {
    navigateActiveTab(target.url);
  }
});

backButton.addEventListener('click', () => activeWebview()?.goBack());
forwardButton.addEventListener('click', () => activeWebview()?.goForward());
reloadButton.addEventListener('click', () => {
  const webview = activeWebview();
  if (!webview) {
    return;
  }

  if (getActiveTab(state).isLoading) {
    webview.stop();
  } else {
    webview.reload();
  }
});
homeButton.addEventListener('click', () => navigateActiveTab(DEFAULT_HOME_URL));
newTabButton.addEventListener('click', () => createAndRenderTab(DEFAULT_HOME_URL));
bookmarkButton.addEventListener('click', toggleBookmarkForActiveTab);

window.addEventListener('keydown', (event) => {
  if (!event.ctrlKey && !event.metaKey) {
    return;
  }

  switch (event.key.toLowerCase()) {
    case 'l':
      event.preventDefault();
      addressInput.select();
      break;
    case 'r':
      event.preventDefault();
      activeWebview()?.reload();
      break;
    case 't':
      event.preventDefault();
      createAndRenderTab(DEFAULT_HOME_URL);
      break;
    case 'w':
      event.preventDefault();
      closeTabAndRender(state.activeTabId);
      break;
  }
});

render();

function createAndRenderTab(url: string): void {
  state = addTab(state, url);
  render();
  ensureWebview(getActiveTab(state)).focus();
}

function closeTabAndRender(tabId: string): void {
  const existing = webviews.get(tabId);
  existing?.remove();
  webviews.delete(tabId);
  state = closeTab(state, tabId);
  render();
}

function navigateActiveTab(url: string): void {
  const activeTab = getActiveTab(state);
  state = updateTab(state, activeTab.id, {
    url,
    title: url,
    isLoading: true
  });
  const webview = ensureWebview(getActiveTab(state));
  webview.loadURL(url);
  setStatus(url);
  render();
}

function toggleBookmarkForActiveTab(): void {
  const activeTab = getActiveTab(state);
  const existing = state.bookmarks.find((bookmark) => bookmark.url === activeTab.url);

  if (existing) {
    state = removeBookmark(state, existing.id);
  } else {
    state = addBookmark(state, {
      title: readableTitle(activeTab),
      url: activeTab.url
    });
  }

  saveBookmarks(state.bookmarks);
  render();
}

function render(): void {
  renderTabs();
  renderToolbar();
  renderBookmarks();
  renderWebviews();
}

function renderTabs(): void {
  tabStrip.replaceChildren(
    ...state.tabs.map((tab) => {
      const tabButton = document.createElement('button');
      tabButton.className = 'tab-button';
      tabButton.type = 'button';
      tabButton.setAttribute('role', 'tab');
      tabButton.setAttribute('aria-selected', String(tab.id === state.activeTabId));
      tabButton.title = `${readableTitle(tab)}\n${tab.url}`;
      tabButton.addEventListener('click', () => {
        state = selectTab(state, tab.id);
        render();
      });

      const icon = document.createElement(tab.isLoading ? 'span' : 'img');
      if (tab.isLoading) {
        icon.className = 'tab-spinner';
      } else {
        const image = icon as HTMLImageElement;
        image.className = 'tab-favicon';
        image.alt = '';
        image.src = tab.faviconUrl ?? faviconUrlFor(tab.url);
      }

      const title = document.createElement('span');
      title.className = 'tab-title';
      title.textContent = readableTitle(tab);

      const close = document.createElement('button');
      close.className = 'tab-close';
      close.type = 'button';
      close.title = 'Close tab';
      close.setAttribute('aria-label', `Close ${readableTitle(tab)}`);
      close.textContent = 'x';
      close.addEventListener('click', (event) => {
        event.stopPropagation();
        closeTabAndRender(tab.id);
      });

      tabButton.append(icon, title, close);
      return tabButton;
    })
  );
}

function renderToolbar(): void {
  const activeTab = getActiveTab(state);
  const bookmarked = state.bookmarks.some((bookmark) => bookmark.url === activeTab.url);

  if (document.activeElement !== addressInput) {
    addressInput.value = activeTab.url;
  }

  backButton.disabled = !activeTab.canGoBack;
  forwardButton.disabled = !activeTab.canGoForward;
  reloadButton.innerHTML = activeTab.isLoading ? '&#10005;' : '&#8635;';
  reloadButton.title = activeTab.isLoading ? 'Stop' : 'Reload';
  reloadButton.setAttribute('aria-label', activeTab.isLoading ? 'Stop' : 'Reload');
  bookmarkButton.classList.toggle('is-active', bookmarked);
  bookmarkButton.innerHTML = bookmarked ? '&#9733;' : '&#9734;';
}

function renderBookmarks(): void {
  bookmarkBar.replaceChildren(
    ...state.bookmarks.map((bookmark) => {
      const button = document.createElement('button');
      button.className = 'bookmark-item';
      button.type = 'button';
      button.textContent = bookmark.title;
      button.title = bookmark.url;
      button.addEventListener('click', () => navigateActiveTab(bookmark.url));
      return button;
    })
  );
}

function renderWebviews(): void {
  const activeTabId = state.activeTabId;

  for (const tab of state.tabs) {
    const webview = ensureWebview(tab);
    webview.classList.toggle('is-active', tab.id === activeTabId);
  }
}

function ensureWebview(tab: BrowserTab): WebviewTag {
  const existing = webviews.get(tab.id);
  if (existing) {
    return existing;
  }

  const webview = document.createElement('webview') as WebviewTag;
  webview.className = 'page-view';
  webview.setAttribute('partition', WEBVIEW_PARTITION);
  webview.setAttribute('src', tab.url);

  webview.addEventListener('did-start-loading', () => {
    state = updateTab(state, tab.id, { isLoading: true });
    render();
  });
  webview.addEventListener('did-stop-loading', () => syncTabFromWebview(tab.id));
  webview.addEventListener('did-navigate', () => syncTabFromWebview(tab.id));
  webview.addEventListener('did-navigate-in-page', () => syncTabFromWebview(tab.id));
  webview.addEventListener('page-title-updated', (event) => {
    state = updateTab(state, tab.id, { title: event.title || tab.url });
    render();
  });
  webview.addEventListener('page-favicon-updated', (event) => {
    state = updateTab(state, tab.id, { faviconUrl: event.favicons[0] });
    render();
  });
  webview.addEventListener('did-fail-load', (event) => {
    if (event.errorCode === -3) {
      return;
    }

    state = updateTab(state, tab.id, {
      title: 'Load failed',
      isLoading: false
    });
    setStatus(`${event.errorDescription}: ${event.validatedURL}`);
    render();
  });
  webview.addEventListener('update-target-url', (event) => setStatus(event.url));

  webviews.set(tab.id, webview);
  webviewStage.append(webview);
  return webview;
}

function syncTabFromWebview(tabId: string): void {
  const webview = webviews.get(tabId);
  if (!webview) {
    return;
  }

  state = updateTab(state, tabId, {
    title: webview.getTitle() || webview.getURL(),
    url: webview.getURL(),
    isLoading: webview.isLoading(),
    canGoBack: webview.canGoBack(),
    canGoForward: webview.canGoForward()
  });
  setStatus(webview.getURL());
  render();
}

function activeWebview(): WebviewTag | undefined {
  return webviews.get(state.activeTabId);
}

function loadBookmarks(): Bookmark[] {
  try {
    const raw = window.localStorage.getItem(BOOKMARK_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Bookmark[];
    return Array.isArray(parsed) ? parsed.filter(isBookmark) : [];
  } catch {
    return [];
  }
}

function saveBookmarks(bookmarks: Bookmark[]): void {
  window.localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
}

function isBookmark(value: unknown): value is Bookmark {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const bookmark = value as Record<string, unknown>;
  return (
    typeof bookmark.id === 'string' &&
    typeof bookmark.title === 'string' &&
    typeof bookmark.url === 'string'
  );
}

function readableTitle(tab: BrowserTab): string {
  return tab.title.trim() || tab.url || 'New Tab';
}

function faviconUrlFor(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}/favicon.ico`;
  } catch {
    return '';
  }
}

function setStatus(message: string): void {
  statusBar.textContent = message;
}

function requireElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);

  if (!element) {
    throw new Error(`Missing element #${id}`);
  }

  return element as T;
}
