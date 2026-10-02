export const MAX_HISTORY = 50

/** Trim, add https:// when no scheme is given, and return a canonical http(s) URL or null. */
export function normalizeUrl(input: string): string | null {
  let s = input.trim()
  if (!s) return null
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(s)) {
    if (!/^https?:\/\//i.test(s)) return null // ftp://, javascript://, etc.
  } else {
    s = 'https://' + s.replace(/^\/+/, '')
  }
  try {
    const u = new URL(s)
    // A phone can't resolve "localhost" or a bare word, so require a dotted host.
    return u.hostname.includes('.') ? u.href : null
  } catch {
    return null
  }
}

/** Put url first, drop its older duplicate, keep at most MAX_HISTORY entries. */
export function addToHistory(history: string[], url: string): string[] {
  return [url, ...history.filter((h) => h !== url)].slice(0, MAX_HISTORY)
}
