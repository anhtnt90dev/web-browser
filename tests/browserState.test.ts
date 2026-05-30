import { describe, expect, it } from 'vitest';
import {
  DEFAULT_HOME_URL,
  addBookmark,
  addTab,
  closeTab,
  createInitialState,
  removeBookmark,
  selectTab,
  updateTab
} from '../src/renderer/browserState';

describe('browser state', () => {
  it('starts with one active home tab', () => {
    const state = createInitialState();

    expect(state.activeTabId).toBe('tab-1');
    expect(state.tabs).toEqual([
      {
        id: 'tab-1',
        title: 'New Tab',
        url: DEFAULT_HOME_URL,
        isLoading: false,
        canGoBack: false,
        canGoForward: false
      }
    ]);
  });

  it('adds a new active tab with the next id', () => {
    const state = addTab(createInitialState(), 'https://example.com');

    expect(state.activeTabId).toBe('tab-2');
    expect(state.tabs.map((tab) => tab.id)).toEqual(['tab-1', 'tab-2']);
    expect(state.tabs[1]?.url).toBe('https://example.com');
  });

  it('selects the previous neighbor when the active tab is closed', () => {
    const state = addTab(addTab(createInitialState(), 'https://a.example'), 'https://b.example');
    const next = closeTab(state, 'tab-3');

    expect(next.activeTabId).toBe('tab-2');
    expect(next.tabs.map((tab) => tab.id)).toEqual(['tab-1', 'tab-2']);
  });

  it('keeps one fresh tab when closing the final tab', () => {
    const next = closeTab(createInitialState(), 'tab-1');

    expect(next.activeTabId).toBe('tab-1');
    expect(next.tabs).toHaveLength(1);
    expect(next.tabs[0]?.url).toBe(DEFAULT_HOME_URL);
  });

  it('selects and updates tabs immutably', () => {
    const state = addTab(createInitialState(), 'https://example.com');
    const selected = selectTab(state, 'tab-1');
    const updated = updateTab(selected, 'tab-1', {
      title: 'Example',
      url: 'https://example.com/docs',
      isLoading: true,
      canGoBack: true,
      canGoForward: false
    });

    expect(selected.activeTabId).toBe('tab-1');
    expect(updated).not.toBe(selected);
    expect(updated.tabs[0]).toMatchObject({
      title: 'Example',
      url: 'https://example.com/docs',
      isLoading: true,
      canGoBack: true,
      canGoForward: false
    });
  });

  it('adds bookmarks once by URL and removes them by id', () => {
    const first = addBookmark(createInitialState(), {
      title: 'Example',
      url: 'https://example.com'
    });
    const duplicate = addBookmark(first, {
      title: 'Duplicate',
      url: 'https://example.com'
    });
    const removed = removeBookmark(duplicate, 'bookmark-1');

    expect(duplicate.bookmarks).toEqual([
      {
        id: 'bookmark-1',
        title: 'Example',
        url: 'https://example.com'
      }
    ]);
    expect(removed.bookmarks).toEqual([]);
  });
});

