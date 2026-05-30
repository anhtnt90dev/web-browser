export const DEFAULT_HOME_URL = 'https://duckduckgo.com';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  faviconUrl?: string;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
}

export interface BrowserState {
  activeTabId: string;
  tabs: BrowserTab[];
  bookmarks: Bookmark[];
}

export type TabPatch = Partial<Omit<BrowserTab, 'id'>>;
export type BookmarkInput = Omit<Bookmark, 'id'>;

export function createInitialState(homeUrl = DEFAULT_HOME_URL): BrowserState {
  return {
    activeTabId: 'tab-1',
    tabs: [createTab('tab-1', homeUrl)],
    bookmarks: []
  };
}

export function addTab(state: BrowserState, url = DEFAULT_HOME_URL): BrowserState {
  const tab = createTab(nextTabId(state), url);

  return {
    ...state,
    activeTabId: tab.id,
    tabs: [...state.tabs, tab]
  };
}

export function closeTab(state: BrowserState, tabId: string): BrowserState {
  if (!state.tabs.some((tab) => tab.id === tabId)) {
    return state;
  }

  if (state.tabs.length === 1) {
    return createInitialState();
  }

  const closingIndex = state.tabs.findIndex((tab) => tab.id === tabId);
  const remainingTabs = state.tabs.filter((tab) => tab.id !== tabId);
  const activeTabId =
    state.activeTabId === tabId
      ? remainingTabs[Math.max(0, closingIndex - 1)]?.id ?? remainingTabs[0].id
      : state.activeTabId;

  return {
    ...state,
    activeTabId,
    tabs: remainingTabs
  };
}

export function selectTab(state: BrowserState, tabId: string): BrowserState {
  if (!state.tabs.some((tab) => tab.id === tabId)) {
    return state;
  }

  return {
    ...state,
    activeTabId: tabId
  };
}

export function updateTab(state: BrowserState, tabId: string, patch: TabPatch): BrowserState {
  if (!state.tabs.some((tab) => tab.id === tabId)) {
    return state;
  }

  return {
    ...state,
    tabs: state.tabs.map((tab) => (tab.id === tabId ? { ...tab, ...patch } : tab))
  };
}

export function addBookmark(state: BrowserState, bookmark: BookmarkInput): BrowserState {
  if (state.bookmarks.some((item) => item.url === bookmark.url)) {
    return state;
  }

  return {
    ...state,
    bookmarks: [
      ...state.bookmarks,
      {
        id: nextBookmarkId(state),
        title: bookmark.title,
        url: bookmark.url
      }
    ]
  };
}

export function removeBookmark(state: BrowserState, bookmarkId: string): BrowserState {
  return {
    ...state,
    bookmarks: state.bookmarks.filter((bookmark) => bookmark.id !== bookmarkId)
  };
}

export function getActiveTab(state: BrowserState): BrowserTab {
  return state.tabs.find((tab) => tab.id === state.activeTabId) ?? state.tabs[0];
}

function createTab(id: string, url: string): BrowserTab {
  return {
    id,
    title: 'New Tab',
    url,
    isLoading: false,
    canGoBack: false,
    canGoForward: false
  };
}

function nextTabId(state: BrowserState): string {
  const maxId = state.tabs.reduce((max, tab) => {
    const match = /^tab-(\d+)$/.exec(tab.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `tab-${maxId + 1}`;
}

function nextBookmarkId(state: BrowserState): string {
  const maxId = state.bookmarks.reduce((max, bookmark) => {
    const match = /^bookmark-(\d+)$/.exec(bookmark.id);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `bookmark-${maxId + 1}`;
}

