# GT-QURANREADER — Web (PWA + Capacitor)

نسخة الويب من GT-QURANREADER. نفس الحزمة تخدم **4 توزيعات**:

| التوزيع | الأمر | الناتج |
|---|---|---|
| متصفح dev | `npm run dev` | http://localhost:5174 |
| PWA إنتاج | `npm run build` | `dist/` ينشر على GitHub Pages |
| Android APK | `npm run cap:android:run` | `android/app/build/outputs/apk/` |
| iOS app | `npm run cap:ios:run` | يحتاج macOS + Xcode |

## التشغيل

```bash
# من جذر المستودع
npm install
npm run dev:web              # http://localhost:5174

# أو من هذا المجلد
cd apps/web
npm run dev
```

## البنية

```
apps/web/
├── capacitor.config.ts        ← إعدادات Android/iOS
├── vite.config.ts             ← مع vite-plugin-pwa + Workbox
├── public/
│   ├── fonts/                 (4 خطوط — تُدمج في PWA)
│   └── icons/                 (أيقونات PWA متعددة الأحجام)
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── platform/
│   │   ├── runtime.ts         (detect web/pwa/android/ios)
│   │   └── capacitor-init.ts  (StatusBar + Back button)
│   ├── storage/indexeddb.ts   (لنصوص الروايات)
│   ├── hooks/
│   │   ├── useQuranData.ts    (IndexedDB أولاً، API fallback)
│   │   └── useVersePlayer.ts  (Workbox-aware)
│   └── components/settings/
│       └── DownloadManager.tsx (fetch+cache:force-cache)
└── _legacy/                   (vanilla JS v3.x — مرجع)
```

## استراتيجيات Workbox (PWA cache)

في `vite.config.ts`:

| الموارد | الاستراتيجية | الحد |
|---|---|---|
| App shell (JS/CSS/HTML/fonts/icons) | Precache | كل شيء |
| `raw.githubusercontent.com/.../Quran-PNG/...` (الصور) | CacheFirst | 700 صورة، سنة |
| `everyayah.com` (صوت آية) | CacheFirst | 6300 ملف، سنة |
| `server8.mp3quran.net` (سور كاملة) | CacheFirst | 200 ملف |
| `api.alquran.cloud` (النص) | StaleWhileRevalidate | 90 يوم |

عند إضافة host خارجي جديد، **يجب** تسجيله في `runtimeCaching` وإلا لن يعمل offline.

## التهيئة للموبايل (مرة واحدة)

### Android
**المتطلبات:** Android Studio + Android SDK 33+ + JDK 17 + `ANDROID_HOME`.

```bash
npm run cap:android:add         # ينشئ apps/web/android/
npm run cap:android:open        # يفتحه في Android Studio
npm run cap:android:run         # build + sync + run على جهاز/محاكي
```

الـ APK في: `apps/web/android/app/build/outputs/apk/debug/app-debug.apk`

### iOS
**المتطلبات:** macOS + Xcode 15+ + CocoaPods.

```bash
npm run cap:ios:add
npm run cap:ios:run
```

### مزامنة بعد كل تعديل

```bash
npm run cap:sync                # build + cap sync (يحدّث android/ + ios/)
```

## كاشف البيئة (`appPlatform`)

في `src/platform/runtime.ts`:

```ts
appPlatform: 'web' | 'pwa' | 'android' | 'ios'
```

يظهر في الترويسة كـ `v4.0 α — أندرويد` مثلاً.

## ميزات Capacitor المفعّلة

- **Status Bar** (`@capacitor/status-bar`): خلفية `#1a1a2e` + style dark.
- **App lifecycle** (`@capacitor/app`): Hardware back button → يغلق modal → بحث → صوت → خروج (بهذا الترتيب).
- **Filesystem** (`@capacitor/filesystem`): متاح لكن لم يُستخدم بعد (Workbox cache كافٍ).

## النشر على GitHub Pages

```bash
npm run build
# انشر apps/web/dist/ على فرع gh-pages
# (يمكن استخدام GitHub Actions، انظر .github/workflows)
```

ضمن `dist/` ستجد:
- `index.html` + assets
- `sw.js` + `workbox-*.js` (Service Worker)
- `manifest.webmanifest` (PWA)
- `fonts/` و `icons/`
- Precache يحوي ~38 ملفاً (~1.5MB)

## أحجام البناء

```
dist/index.html                   0.89 kB
dist/manifest.webmanifest         0.51 kB
dist/assets/index.css            13 kB → 3.3 kB gzipped
dist/assets/index.js            210 kB → 67 kB gzipped
dist/sw.js + workbox.js          (~3 KB)
precache total                   ~1.5 MB
```

## استكشاف الأخطاء

| المشكلة | الحل |
|---|---|
| `npm run cap:android:add` يفشل | تحقق من `ANDROID_HOME` و JDK 17 |
| لا يعمل offline في Web | افتح DevTools → Application → Service Workers، تحقق من `sw.js` مُسجَّل |
| iOS APK يفشل في pod install | `cd ios/App && pod install --repo-update` |
| Cache قديم يمنع المزايا الجديدة | Settings → "إعادة الإعدادات الافتراضية"، أو Ctrl+Shift+R |

## الترخيص

**AGPL-3.0-or-later** — راجع `apps/web/LICENSE`. هذا الترخيص يضمن أن أي خادم يستضيف هذه النسخة يجب أن يُتيح الكود المصدري للمستخدمين عبر الشبكة (network copyleft).
