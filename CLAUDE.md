# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project at a glance

GT-QURANREADER v4.0.0 (stable) — Quran reader that ships from **one codebase** to multiple distribution targets:
- Linux desktop (Electron): **AppImage · DEB · RPM · Flatpak** via `apps/desktop/`
- Browser + installable PWA via `apps/web/`
- **Android APK** (+ iOS) via Capacitor wrapping `apps/web/`

All packaging is orchestrated by a single script `scripts/build-packages.sh` (~800 lines). Five distribution formats are currently produced and verified.

Almost all logic and UI live in `packages/`; the `apps/` are thin platform shells that inject platform-specific hooks/managers into shared components.

UI is **Arabic, RTL**. Most strings in code, comments, and commits are Arabic. Keep that style when editing — Arabic comments and labels stay; don't translate them to English.

License is **dual**: GPL-3.0-or-later for desktop + shared packages (`apps/desktop/`, `packages/`); AGPL-3.0-or-later for the web edition (`apps/web/`). The AGPL clause ensures any server that hosts the web version must expose source to its network users.

## Commands

All commands run from the repo root (npm workspaces). Working directory has spaces in it (`/MY SCREPT/`); npm handles this, but be careful with shell expansion.

```bash
npm install                  # installs all workspaces in one go
npm run dev:web              # Vite dev server → http://localhost:5174 (web/PWA)
npm run dev:desktop          # Vite + Electron together
npm run build                # builds both desktop and web
npm run build:desktop        # only desktop
npm run build:linux          # AppImage + .deb (via electron-builder)
npm run build:web            # only web (produces PWA with Workbox sw.js)
npm run lint                 # tsc --noEmit across all workspaces
npm run test:e2e             # tsx scripts/test-search-and-audio.ts (hits real APIs)
npm run test:visual          # Playwright Firefox screenshots → /tmp/quran-{desktop,mobile}.png
npm run clean                # remove all dist/ and node_modules/
```

Capacitor (run from `apps/web/`, requires Android SDK / Xcode locally):

```bash
cd apps/web
npm run cap:android:add      # one-time: scaffolds android/ folder
npm run cap:android:run      # build + sync + run on device/emulator
npm run cap:sync             # rebuild + sync to native projects
```

### Packaging (Linux + Android) — `scripts/build-packages.sh`

A single Bash script orchestrates **all** distribution formats. Outputs land in `release/` at the repo root.

```bash
bash scripts/build-packages.sh           # all = linux + android
bash scripts/build-packages.sh linux     # AppImage + DEB + RPM
bash scripts/build-packages.sh appimage  # AppImage only
bash scripts/build-packages.sh deb       # DEB only
bash scripts/build-packages.sh rpm       # RPM (converted from DEB via alien)
bash scripts/build-packages.sh flatpak   # Flatpak (extracts the AppImage, repackages with org.freedesktop.Platform 24.08)
bash scripts/build-packages.sh apk       # Android APK via gradle in apps/web/android/
bash scripts/build-packages.sh web       # PWA build only (no native packaging)
bash scripts/build-packages.sh icons     # regenerate all icon sizes from apps/desktop/build/icon.png
bash scripts/build-packages.sh check-deps # report missing deps without installing
```

The script auto-detects the distro (apt/dnf/pacman/zypper) and offers to install missing dependencies for the requested target. **Important:** the Android target needs `ANDROID_HOME` set (usually `~/Android/Sdk`) and JDK 17. The Flatpak target needs `flatpak-builder` + `appstreamcli` for AppStream validation.

Final release artifacts (v4.0.0):
- `release/GT-QURANREADER-4.0.0-x86_64.AppImage` (109 MB)
- `release/GT-QURANREADER-4.0.0-amd64.deb` (77 MB)
- `release/GT-QURANREADER-4.0.0-x86_64.rpm` (107 MB)
- `release/GT-QURANREADER-4.0.0.flatpak` (78 MB)
- `release/android/GT-QURANREADER-4.0.0-debug.apk` (4.6 MB, signed with Android debug key)
- `release/android/GT-QURANREADER-4.0.0-unsigned.apk` (4.4 MB, needs `jarsigner` + `zipalign` for Play Store)

Flatpak manifest + AppStream metadata live in `flatpak/`:
- `com.gnutux.GTQuranReader.yml` — extracts the prebuilt AppImage, copies its squashfs to `/app/lib/gt-quranreader/`, then wraps with `launcher.sh` (passes `--no-sandbox` because Electron's chrome-sandbox doesn't work inside Flatpak's sandbox).
- `com.gnutux.GTQuranReader.metainfo.xml` — required by `appstreamcli compose`. Bump `<release version=... date=...>` when releasing.
- `com.gnutux.GTQuranReader.desktop` — desktop entry with `Name[ar]="عارض و قارئ الذكر الحكيم"`. **The icon source name inside the AppImage's squashfs is `@gt-quranreaderdesktop.png`** (Electron's quirky output naming), not the human-readable name — this is hardcoded in the manifest's icon copy loop. Don't include 1024px (Flatpak max is 512×512).

Standalone scripts (no test framework — `tsx` runs them):
- `scripts/test-search-and-audio.ts` — search + audio URL resolution across the real APIs.
- `scripts/test-warsh.ts` / `scripts/test-warsh-basmala.ts` — verifies warsh reciter URLs + basmala MP3 sizes.
- `scripts/visual-check.ts` — basic mobile/desktop screenshots.
- `scripts/visual-check-playing.ts` / `visual-check-dialog.ts` — interactive scenarios.
- `scripts/capture-docs-screenshots.ts` — regenerates `docs/screenshots/*.png` used in README.

## Architecture

### Why a monorepo

Before v4.0 there were two separate repos (Desktop Bash version + Web vanilla JS). They diverged. The current layout makes shared code physically singular:

```
packages/core/    @gt-quranreader/core   ← pure logic, no React, no DOM
packages/ui/      @gt-quranreader/ui     ← React components + framework-agnostic hooks
apps/desktop/     @gt-quranreader/desktop (Electron)
apps/web/         @gt-quranreader/web    (Vite PWA + Capacitor)
```

When you change a `packages/ui` component or `packages/core` function, **both apps pick it up automatically** — there's no copy step.

### Two extension points where apps differ

Shared components in `packages/ui` are platform-agnostic. The two places where Desktop and Web actually diverge:

1. **`ImagePage` accepts `resolveLocalPath?: (page: number) => Promise<string | null>`**. Desktop passes one that hits Electron IPC (`gtQuran.data.getPageImagePath`); Web doesn't pass it (relies on Workbox cache).
2. **`SettingsModal` accepts `DownloadManager: ComponentType` as a prop**. Each app provides its own implementation:
   - Desktop's `DownloadManager` uses Electron IPC + filesystem under `userData/data/`.
   - Web's `DownloadManager` uses IndexedDB (for texts) + `fetch({cache:'force-cache'})` to populate Workbox runtime caches.

If you need a third app-specific behavior, follow this pattern (prop injection) rather than adding `isElectron` checks inside `packages/ui`.

### Platform hooks per app

Each app has its own `src/hooks/useQuranData.ts` and `src/hooks/useVersePlayer.ts`. Same signature, different storage layer:
- Desktop: checks Electron IPC first (`gtQuran.data.hasRiwaya`), falls back to API.
- Web: checks IndexedDB first (`STORE_RIWAYA_TEXTS`), falls back to API, then writes back to IndexedDB.
- **Both apps' `useVersePlayer.stop()` clears React state (`activeVerse`, `isPlaying`, `error`) on top of calling `player.stop()`** — without this, the banner stays and the play button thinks it's "resuming".

The `VersePlayer` class in `packages/core/audio/verse-player.ts` accepts an optional `resolveLocalUrl` option — Desktop passes one (Electron path), Web doesn't (Workbox transparently handles the network MP3 URL).

### Single source of truth files

- **All Quran metadata** (114 surahs with `startPage`, 30 juz, 15 sajda, 4 riwayat) is hardcoded in `packages/core/data/`. These are static reference data and intentionally not fetched.
- **Riwayat ordering**: `RIWAYAT` array in `data/riwayat.ts` is ordered for UI display (Warsh first — North African audience). `DEFAULT_RIWAYA` uses `.find(id === 'warsh')` explicitly so it doesn't depend on array order.
- **Reciter catalog** is in `packages/core/audio/reciter-catalog.ts`. Each reciter has `sources: { everyayah?, mp3quran? }` and optional `basmalaUrl` / `surahFilesIncludeBasmala` / `noBasmala` / `firstAyahOffsetSeconds`. `everyayah` gives per-ayah MP3 (used for verse-level highlighting); `mp3quran` gives full-surah MP3 (legacy fallback). When adding a reciter, populate the `everyayah` folder name (e.g. `Alafasy_128kbps` for Hafs, `warsh/warsh_Ibrahim_Al_Dosary_128kbps` for Warsh — the `warsh/` prefix is part of the folder path). Currently 2 warsh reciters: `ibrahim-aldosary-warsh` (default) and `yassin-aljazaery-warsh`. **Abdul Basit Warsh was removed entirely** — his per-ayah numbering is non-standard (his `002001.mp3` is ~19.5s and contains basmala + الم + ذلك الكتاب as three verses bundled together, which broke alignment for ~50% of long surahs). If you re-add him later, do so behind a custom `surahMap` callback rather than the default offset/numbering scheme.
- **`packages/core/index.ts` is the public barrel.** Apps must import from `'@gt-quranreader/core'` (not `'@core/data/surahs'`). When you add new exports in core, add them to `index.ts`. Same for `packages/ui/src/index.ts`.

### The verse-highlight feature (subtle behavior)

User requirement, faithfully implemented:
1. **Single click on a verse** → toggle highlight (clicking the same verse again clears it).
2. **Double click on a verse** → play that verse's audio + highlight + auto-advance to next verse on `ended`.
3. `VerseElement` uses a 280ms timer to distinguish single vs double click.
4. `VersePlayer` preloads the **next two verses' MP3** into hidden `<audio>` elements to minimize gap (`PRELOAD_COUNT = 2`).
5. `enableVerseHighlight` pref controls only the visual auto-tracking (the `activeVerse` glow as audio progresses). It's `true` by default.
6. `autoNextVerse` (inside-surah) is always `true` when `play()` is called manually — the user explicitly asked for a verse, so chaining is expected. `autoNextSurah` (cross-surah) follows the `autoPlayNext` pref.
7. When the active verse crosses a page boundary, `App.tsx` updates `currentPage` so the page view follows the audio. **This effect uses a `useRef` to track the last verse key (`surah:ayah`) so it doesn't fight against the user manually navigating pages.** Without this guard, every modal selection / search result click gets immediately overwritten.

### Basmala handling

`VersePlayer.playVerse(s, a)` automatically inserts a basmala before verse 1 of any surah, except Al-Fatiha (1) and At-Tawba (9). The basmala source:
1. If the reciter has `basmalaUrl` set → use it (an external override URL, e.g. `everyayah.com/data/bismillah.mp3`).
2. Otherwise → use `001001.mp3` of the same reciter (Fatiha verse 1, which *is* the basmala for most reciters).

When a reciter has `basmalaUrl`, the basmala is also played before Al-Fatiha (because their 001001 isn't a basmala). The skip list becomes `{9}` instead of `{1, 9}`.

The mechanism: `playVerse` sets `pendingAfterBasmala = {s, a}`, plays the basmala URL. `handleEnded` detects the pending and calls `playVerse(s, a, {skipBasmala: true})` to actually play the verse.

`Reciter` also supports two related advanced flags currently unused after the Abdul Basit Warsh removal but kept for future reciters:
- `surahFilesIncludeBasmala: true` — the reciter's per-ayah file at 001 contains the basmala welded onto verse 1, so playback should set `firstAyahOffsetSeconds` to seek past it.
- `noBasmala: true` — never auto-insert a basmala for this reciter.
- `firstAyahOffsetSeconds: number` — seek offset applied to verse 1 of each surah (used to skip leading basmala when it's bundled into the 001 file).

### Preferences + schema versioning

`packages/core/storage/preferences.ts` exports `PREFS_SCHEMA_VERSION` (currently **`6`**). **Bump this by +1 whenever you change `DEFAULT_PREFERENCES` defaults or add fields that should propagate to existing users.** On load:
- If saved `schemaVersion !== current` → discard saved prefs, use defaults, but **keep `bookmarks`** (user data) and write back fresh.
- This is how we automatically migrated users through: `viewMode: 'image'` → `'text'`, `riwaya: 'hafs'` → `'warsh'`, `reciterId: 'abdulbasit-warsh'` → `'ibrahim-aldosary-warsh'` (after his removal), `theme: 'dark'` → `'gold'`, etc. — all without forcing users to manually clear localStorage.

Settings modal also has a manual **"إعادة الإعدادات الافتراضية"** button (calls `usePreferences().reset()`).

Current defaults (as of schema version 6): `riwaya='warsh'`, `reciterId='ibrahim-aldosary-warsh'`, `fontId='AmiriQuran'`, `viewMode='text'`, `theme='gold'`, `enableVerseHighlight=true`.

### Position restoration (lastStoppedAt + highlightFromStop)

`prefs.lastStoppedAt: VerseRef | null` persists across sessions. Two effects in `App.tsx`:
1. On first `loaded === true`, hydrate `highlightedVerse` from `prefs.lastStoppedAt` and set `highlightFromStop = true`.
2. Whenever `player.activeVerse` changes (and is non-null), write it to `prefs.lastStoppedAt`.

The `highlightFromStop: boolean` state distinguishes:
- **`true`** (highlight restored from a previous stop) → pressing ▶ opens the custom `ConfirmDialog` ("متابعة من حيث توقفت" / "بدء السورة من أوّلها").
- **`false`** (user just clicked a verse) → pressing ▶ plays from that verse immediately, no prompt.

Handlers that mutate this flag:
- `handleVerseSingleClick` / `handleVerseDoubleClick` → `setHighlightFromStop(false)` (manual choice).
- `handleFullStop` (the red ■ button) → `setHighlightFromStop(true)` and **keeps** `highlightedVerse` (doesn't clear it like `Esc` does). This way the user can see where they stopped.
- Resume dialog confirm/cancel → `setHighlightFromStop(false)`.

### ConfirmDialog (replaces `window.confirm`)

`packages/ui/src/components/modals/ConfirmDialog.tsx` is a custom in-app dialog matching the theme. Always prefer it over `window.confirm()` so styling stays consistent in fullscreen and across themes (dark/light/sepia).

Used currently for the resume-reading prompt. Props: `title`, `message` (supports `\n`), `confirmLabel`, `cancelLabel`, `icon` (emoji), `variant: 'default' | 'danger'`. Esc cancels, Enter confirms (auto-focused).

### Fullscreen mode (`useFullscreen`)

`packages/ui/src/hooks/useFullscreen.ts` wraps the browser Fullscreen API and adds idle detection:
- `active: boolean` — synced with `document.fullscreenElement` (so `Esc` from the browser updates state too).
- `idle: boolean` — `true` after 3 seconds of no mouse/touch/keyboard activity. Resets on any event.
- `toggle()` requests/exits fullscreen.

CSS in `global.css` reacts to `.app-shell.fullscreen` (hides header/toolbar/page-nav/footer) and `.app-shell.idle` (fades the floating controls).

### Floating controls — auto-extending toolbar

`packages/ui/src/components/controls/FloatingControls.tsx` shows different button counts based on state:
- No active session: `[prev] [☰] [⛶] [▶] [🔍] [next]` (6 buttons).
- Active session (any reading): adds **stop ■** button next to play/pause, becomes 7 buttons.
- The two arrow buttons (`floating-btn-pagenav` class) are hidden on mobile (`max-width: 640px`) when `.app-shell.has-session` is set — auto-advance handles page changes during playback.

The fullscreen button (⛶) is duplicated here on purpose: in fullscreen, the header is hidden so this is the only way out without `Esc`.

### Riwaya change auto-switches reciter

`handleRiwayaChange` in both `App.tsx`s:
1. If the current reciter's `riwaya` matches the new one → just `update('riwaya', id)`.
2. Otherwise → `player.stop()`, clear highlight, and `updateMany({ riwaya, reciterId: firstReciterForNewRiwaya })` atomically. This avoids a state where the player tries to fetch warsh audio with a hafs reciter ID.

### Known data quirks

- `api.alquran.cloud` does **not** return a `numberOfAyahs` field per surah, despite older docs implying so. `packages/core/api/alquran-cloud.ts` falls back to `s.ayahs.length`. If you ever see verses skipping after the first one in any riwaya, this fallback is the place to verify.
- The same API returns surah names prefixed with `سُورَةُ ` (with full diacritics). `alquran-cloud.ts` strips this via `stripSurahPrefix` so the UI can prepend its own `سُورَةُ` consistently.
- The page numbers in `packages/core/data/sajda-verses.ts` were taken from the Madinah mushaf and verified manually; they don't match every print run perfectly.
- The `everyayah.com` warsh folder layout requires the `warsh/` prefix (e.g. `warsh/warsh_Ibrahim_Al_Dosary_128kbps/001001.mp3`) — this is **not** auto-derived from `riwaya === 'warsh'`; it must be hardcoded in the catalog entry's `everyayah` field.
- The `apps/desktop/build/icon.png` is a 1024×1024 gold-on-dark Quran icon. The `build-packages.sh icons` target regenerates 11 derivative sizes for desktop + 10 sizes for PWA from this single source — never edit the smaller PNGs directly, edit the master and regenerate.

### Search engine

`packages/core/search/search-engine.ts` is the single entry point. It tries (in order): verse ref (`2:255`), page ref (`ص 100`), juz ref (`جزء 30`), then famous-verse aliases (`الكرسي` → 2:255), surah-name match (Arabic, English, and aliases), and finally full-text search.

The text matching pipeline goes through `normalizeForSearch()` which strips hamzas, diacritics, tatweel, and unifies ي/ى and ة/ه. A query for `الرحمن` matches `ٱلرَّحْمَٰنِ` (the actual Uthmani spelling). Arabic-Indic digits (٢٥٥) are normalized to Latin (255). When changing normalization, run `scripts/test-search-and-audio.ts` — it covers the common variants.

### Electron specifics

`apps/desktop/electron/` has:
- `main.ts` — window + registers three IPC modules. Sets `app.setName('GT-QURANREADER')` + `process.title` (Linux) + `mainWindow.setIcon()` with a `resolveIconPath()` fallback chain so the icon shows in GNOME/KDE taskbars from `unpacked-resources/` after install.
- `preload.ts` — exposes `window.gtQuran` API via `contextBridge`. **This is the only API the renderer sees.** If you add an IPC handler, you must also add a method here.
- `ipc/data.ts` — reads from `userData/data/{text,images,audio}/`
- `ipc/download.ts` — orchestrates `DownloadJob`s with concurrency 5 + retry 3
- `ipc/storage.ts` — `du`-like aggregation and section deletion

The renderer detects Electron via `window.gtQuran?.app.isElectron` in `apps/desktop/src/platform/runtime.ts`. Don't import from `electron` in renderer code.

**electron-builder caveats** (in `apps/desktop/package.json` build config):
- `npmRebuild: false`, `buildDependenciesFromSource: false`, `nodeGypRebuild: false` — required because the monorepo's hoisted `node_modules/` confuses electron-builder's native rebuild step (it deletes things it shouldn't).
- `electronVersion: "33.3.1"` is hardcoded — electron-builder can't auto-detect it when `electron` lives in the root `node_modules/` instead of `apps/desktop/node_modules/`.
- `artifactName: "${productName}-${version}-${arch}.${ext}"` — required because the scoped package name `@gt-quranreader/desktop` produces invalid DEB control filenames otherwise.
- `author` must be an object `{name, email}`, not a string, because DEB requires a maintainer email.

### Themes + styling

Themes (in order of preference): **`gold` (default)** · `dark` · `light` · `sepia` · `auto` (follows OS). Each toggles by adding/removing a class on `<html>`. CSS variables live in `packages/ui/src/styles/global.css`. When you add a new theme, also extend the theme picker in `SettingsModal` and the input restyle rules (`input[type='number'|'text'|'search']` get `appearance: none` to look right in every theme).

### Web/PWA specifics

`apps/web/vite.config.ts` configures `vite-plugin-pwa` with five Workbox strategies:
- App shell: precache (~38 entries, ~1.5 MB)
- `raw.githubusercontent.com/.../Quran-PNG/...`: CacheFirst, 700 entries, 1y
- `everyayah.com`: CacheFirst, 6300 entries, 1y
- `server8.mp3quran.net`: CacheFirst, 200 entries, 1y
- `api.alquran.cloud`: StaleWhileRevalidate

When you add a new external host, register it here, otherwise it won't work offline.

Capacitor is initialized in `apps/web/src/platform/capacitor-init.ts`. The Android back button handler closes (in order): open modal → search results → active audio → exit app. If you add a new modal-like UI state, hook it into that chain.

`appPlatform` in `apps/web/src/platform/runtime.ts` returns `'web' | 'pwa' | 'android' | 'ios'` (detects Capacitor + PWA standalone mode). The header shows the platform suffix (e.g. `أندرويد`, `سطح المكتب`) — the version label is plain `v4.0` now, no `α`.

### Legacy code

`_legacy/desktop-bash/` (old v3 Bash + Python http.server) and `apps/web/_legacy/` (old vanilla JS web app) are kept for reference only. Don't import from them and don't update them. They are in `.gitignore` only for the top-level `_legacy/` — `apps/web/_legacy/` is checked in for historical reference.

## Project conventions worth knowing

- **Imports use the package barrel** (`@gt-quranreader/core`, `@gt-quranreader/ui`), not deep paths. The barrels are `packages/core/index.ts` and `packages/ui/src/index.ts`.
- **No tests framework** at the moment. End-to-end checks go in `scripts/`, executed with `tsx`. Don't add Jest/Vitest without discussing.
- **No Tailwind.** Styling is plain CSS with CSS variables in `packages/ui/src/styles/global.css`. Themes (`gold` (default) | `dark` | `light` | `sepia` | `auto`) toggle by adding a class to `<html>`. Inputs use `input[type='number'|'text'|'search']` selectors with `appearance: none` so they look consistent across themes — when adding new input types, extend that selector.
- **TypeScript is strict.** `tsc --noEmit` runs in CI/lint; never silence with `// @ts-ignore` without a comment explaining why.
- **Bump `PREFS_SCHEMA_VERSION` when changing defaults.** Document the reason in the comment above the constant. Users get the new defaults automatically without needing to clear localStorage.
- **Don't add unrelated changes** to commits — the user prefers focused commits, often Arabic-prefixed (`fix:` / `feat:` / `refactor:`).
- **Custom dialogs over `confirm()`.** Use `ConfirmDialog` so the UX stays consistent in fullscreen mode and across themes.
