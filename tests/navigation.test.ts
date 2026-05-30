import { describe, expect, it } from 'vitest';
import { normalizeAddressInput } from '../src/shared/navigation';

describe('normalizeAddressInput', () => {
  it('keeps complete https URLs and trims whitespace', () => {
    expect(normalizeAddressInput('  https://example.com/docs  ')).toEqual({
      kind: 'url',
      url: 'https://example.com/docs'
    });
  });

  it('adds https to bare domain names', () => {
    expect(normalizeAddressInput('example.com/path')).toEqual({
      kind: 'url',
      url: 'https://example.com/path'
    });
  });

  it('uses http for localhost addresses', () => {
    expect(normalizeAddressInput('localhost:5173/app')).toEqual({
      kind: 'url',
      url: 'http://localhost:5173/app'
    });
  });

  it('turns plain text into a DuckDuckGo search URL', () => {
    expect(normalizeAddressInput('build a browser')).toEqual({
      kind: 'search',
      query: 'build a browser',
      url: 'https://duckduckgo.com/?q=build%20a%20browser'
    });
  });

  it('returns null for blank input', () => {
    expect(normalizeAddressInput('   ')).toBeNull();
  });
});

