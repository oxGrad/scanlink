import { expect, test } from 'bun:test'
import { addToHistory, MAX_HISTORY, normalizeUrl } from './url'

test('normalizeUrl', () => {
  expect(normalizeUrl('example.com')).toBe('https://example.com/')
  expect(normalizeUrl('  example.com/a?b=1  ')).toBe('https://example.com/a?b=1')
  expect(normalizeUrl('http://example.com')).toBe('http://example.com/')
  expect(normalizeUrl('HTTPS://Example.com')).toBe('https://example.com/')
  expect(normalizeUrl('//example.com')).toBe('https://example.com/')
  expect(normalizeUrl('192.168.1.10:5173')).toBe('https://192.168.1.10:5173/')
  expect(normalizeUrl('')).toBeNull()
  expect(normalizeUrl('hello')).toBeNull()
  expect(normalizeUrl('localhost:3000')).toBeNull()
  expect(normalizeUrl('ftp://example.com')).toBeNull()
  expect(normalizeUrl('javascript:alert(1)')).toBeNull()
  expect(normalizeUrl('https://exa mple.com')).toBeNull()
})

test('addToHistory dedupes, moves to top, caps', () => {
  expect(addToHistory(['a', 'b', 'c'], 'b')).toEqual(['b', 'a', 'c'])
  const full = Array.from({ length: MAX_HISTORY }, (_, i) => `u${i}`)
  const next = addToHistory(full, 'new')
  expect(next.length).toBe(MAX_HISTORY)
  expect(next[0]).toBe('new')
  expect(next).not.toContain(`u${MAX_HISTORY - 1}`)
})
