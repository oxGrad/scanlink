# ScanLink

Type a URL, get a QR code, scan it with your phone camera to open the link. History (last 50) is kept in localStorage.

```sh
bun install
bun dev        # also exposed on your LAN (vite --host)
bun test       # url normalization + history helpers
bun run build  # static output in dist/
bun run deploy # build + deploy to Cloudflare (scanlink.graditya.com)
```
