# GT-QURANREADER — Desktop (Electron)

نسخة سطح المكتب من GT-QURANREADER، مبنية بـ Electron 33 + React 18 + Vite 6 + TypeScript strict.

## التشغيل

من **جذر المستودع**:

```bash
npm install                 # تثبيت كل التبعيات (workspaces)
npm run dev:desktop         # Vite + Electron معاً (HMR + DevTools)
```

أو من هذا المجلد:

```bash
cd apps/desktop
npm run dev:electron
```

## البناء

```bash
npm run build               # tsc + vite build + tsc electron
npm run build:linux         # AppImage + .deb في release/
```

الناتج:
- `dist/` — renderer (HTML + JS + CSS).
- `dist-electron/` — main process المُجمَّع.
- `release/` — AppImage و .deb.

## البنية

```
apps/desktop/
├── electron/                  ← Main process (Node)
│   ├── main.ts               (window + IPC registration)
│   ├── preload.ts            (contextBridge → window.gtQuran)
│   ├── ipc/
│   │   ├── data.ts           (قراءة من userData/data/)
│   │   ├── download.ts       (jobs مع concurrency 5 + retry 3)
│   │   └── storage.ts        (du-like aggregation + delete)
│   ├── services/
│   │   ├── data-manager.ts   (paths في userData)
│   │   └── downloader.ts     (HTTP get مع timeout + retry)
│   └── tsconfig.json
│
├── src/                       ← Renderer (React)
│   ├── App.tsx
│   ├── main.tsx
│   ├── platform/runtime.ts    (يكشف window.gtQuran)
│   ├── hooks/
│   │   ├── useQuranData.ts    (Electron IPC أولاً، API fallback)
│   │   └── useVersePlayer.ts  (يمرّر resolveLocalUrl لـ VersePlayer)
│   └── components/settings/
│       └── DownloadManager.tsx (UI + IPC)
│
├── public/fonts/              ← 4 خطوط قرآنية تُحزَّم في AppImage
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## IPC API المُعرَّضة في `window.gtQuran`

| المسار | الغرض |
|---|---|
| `data.hasRiwaya(id)` | هل النص مُنزَّل محلياً؟ |
| `data.getRiwayaText(id)` | قراءة نص الرواية كاملاً |
| `data.getVerseAudioPath(reciter, surah, ayah)` | مسار `file://` للملف المحلي |
| `data.getPageImagePath(page)` | مسار `file://` لصورة الصفحة |
| `download.start(job)` | بدء job تنزيل (text/audio/images) |
| `download.cancel(jobId)` | إلغاء job |
| `download.onProgress(cb)` | الاستماع لتحديثات progress |
| `storage.list()` | حجم كل قسم (text/audio/images) |
| `storage.delete(section)` | حذف قسم |
| `storage.getPath()` | عرض مسار `userData/data/` |

كل الـ APIs محصورة بـ `contextBridge` — الـ renderer لا يستورد من `electron` مباشرة.

## مكان البيانات المحلية

```
~/.config/GT-QURANREADER/data/
├── text/<riwaya>.json          (~5MB لكل رواية)
├── images/<NNN>.png            (604 صفحة، ~50-100MB)
└── audio/<reciter>/<NNN>AAA.mp3  (6240 ملف لكل قارئ، ~100-300MB)
```

## التحزيم

```bash
npm --workspace=apps/desktop run build:linux
```

ينتج في `apps/desktop/release/`:
- `GT-QURANREADER-4.0.0.AppImage` (مستقل، ~120MB)
- `gt-quranreader_4.0.0_amd64.deb` (لـ Debian/Ubuntu)

### معلومات الحزمة (electron-builder)

```json
{
  "appId": "com.gnutux.gt-quranreader",
  "productName": "GT-QURANREADER",
  "linux": {
    "target": ["AppImage", "deb"],
    "category": "Education"
  }
}
```

## التشغيل من AppImage

```bash
chmod +x GT-QURANREADER-4.0.0.AppImage
./GT-QURANREADER-4.0.0.AppImage
```

## ملاحظات للمطورين

- **Node integration معطّل**، **sandbox: false** للسماح بـ `import` من preload في Electron 30+.
- **`autoHideMenuBar: true`** — القائمة مخفية افتراضياً (Alt لإظهارها).
- **External URLs** يفتحها النظام (`shell.openExternal`)، لا داخل النافذة.
- **DevTools** تفتح تلقائياً في `NODE_ENV=development` (mode: detach).

## استكشاف الأخطاء

| المشكلة | الحل |
|---|---|
| "Audio error for X:Y" | تحقق من اتصال الإنترنت أو نزّل القارئ من DownloadManager |
| "Could not resolve audio" | القارئ لا يدعم رواية الـ riwaya الحالية — بدّل القارئ |
| AppImage لا يفتح | `chmod +x` + تحقق من FUSE: `sudo apt install fuse libfuse2` |
| البيانات لا تُحفظ | تحقق من صلاحيات `~/.config/GT-QURANREADER/` |

## الترخيص

GPL-3.0-or-later — راجع `LICENSE` في جذر المستودع.
