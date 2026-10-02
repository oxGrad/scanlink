<script lang="ts">
  import QRCode from 'qrcode'
  import { addToHistory, normalizeUrl } from './lib/url'

  const KEY = 'scanlink:history'

  function loadHistory(): string[] {
    try {
      const v = JSON.parse(localStorage.getItem(KEY) ?? '[]')
      return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
    } catch {
      return []
    }
  }

  let input = $state('')
  let error = $state('')
  let current = $state('')
  let qr = $state('')
  let copyLabel = $state('Copy URL')
  let history = $state(loadHistory())
  let request = 0
  let dark = $state(
    (document.documentElement.dataset.theme ??
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark',
  )

  function toggleTheme() {
    dark = !dark
    const theme = dark ? 'dark' : 'light'
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('scanlink:theme', theme)
    } catch {
      // storage blocked: theme just won't persist
    }
  }

  $effect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(history))
    } catch {
      // storage blocked or full: history just won't persist
    }
  })

  async function show(url: string): Promise<boolean> {
    const id = ++request
    try {
      const data = await QRCode.toDataURL(url, { width: 640, margin: 2 })
      if (id === request) {
        current = url
        qr = data
      }
      return true
    } catch {
      error = 'That URL is too long to fit in a QR code.'
      return false
    }
  }

  async function generate(e: SubmitEvent) {
    e.preventDefault()
    const url = normalizeUrl(input)
    if (!url) {
      error = 'Enter a valid web address, e.g. example.com'
      return
    }
    error = ''
    if (!(await show(url))) return
    input = url
    history = addToHistory(history, url)
  }

  function reopen(url: string) {
    error = ''
    input = url
    show(url)
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(current)
      copyLabel = 'Copied!'
    } catch {
      copyLabel = 'Copy failed'
    }
    setTimeout(() => (copyLabel = 'Copy URL'), 1500)
  }

  function clearAll() {
    if (confirm('Clear all history?')) history = []
  }
</script>

<main>
  <div class="top">
    <h1>ScanLink</h1>
    <button
      type="button"
      class="theme"
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      onclick={toggleTheme}>{dark ? '☀' : '☾'}</button
    >
  </div>
  <p class="hint">Enter a URL, then scan the code with your phone camera to open it.</p>

  <form onsubmit={generate}>
    <input
      type="text"
      inputmode="url"
      autocomplete="url"
      autocapitalize="off"
      spellcheck="false"
      placeholder="example.com"
      aria-label="URL"
      aria-invalid={!!error}
      bind:value={input}
    />
    <button type="submit">Generate</button>
  </form>
  {#if error}<p class="error" role="alert">{error}</p>{/if}

  {#if qr}
    <section class="result">
      <img src={qr} alt={`QR code for ${current}`} />
      <p class="url">{current}</p>
      <div class="actions">
        <a class="button" href={qr} download={`qr-${new URL(current).hostname}.png`}>Download PNG</a>
        <button type="button" onclick={copy}>{copyLabel}</button>
      </div>
    </section>
  {/if}

  {#if history.length}
    <section class="history">
      <header>
        <h2>History</h2>
        <button type="button" class="link" onclick={clearAll}>Clear all</button>
      </header>
      <ul>
        {#each history as url (url)}
          <li class:active={url === current}>
            <button type="button" class="entry" onclick={() => reopen(url)}>{url}</button>
            <button
              type="button"
              class="remove"
              aria-label={`Remove ${url}`}
              onclick={() => (history = history.filter((h) => h !== url))}>×</button
            >
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</main>
