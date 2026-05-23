# سجل التغييرات

كل التغييرات الملحوظة موثَّقة في هذا الملف. الصيغة مبنية على [Keep a Changelog](https://keepachangelog.com/ar/1.1.0/) ويتبع المشروع [Semantic Versioning](https://semver.org/lang/ar/).

## [4.0.0] — 2026-05-23 (stable)

### 📦 التحزيم — خمس صيغ توزيع جاهزة

- ✨ **سكريبت موحَّد** `scripts/build-packages.sh` (~800 سطر) يبني كل الصيغ.
- ✨ **AppImage** (109 MB) — محمول، يعمل على كل توزيعات Linux.
- ✨ **DEB** (77 MB) — Debian / Ubuntu / Mint.
- ✨ **RPM** (107 MB) — Fedora / RHEL / openSUSE (مُحوَّل من DEB عبر alien).
- ✨ **Flatpak** (78 MB) — مع manifest كامل + AppStream metadata في `flatpak/`.
- ✨ **APK** (4.4–4.6 MB) — Android via Capacitor + gradle.
- ✨ كشف توزيعة تلقائي (apt/dnf/pacman/zypper) لتثبيت المتطلبات.

### 🎨 الواجهة + الهوية البصرية

- ✨ **الوضع الذهبي** سمة افتراضية جديدة (5 سمات الآن).
- ✨ أيقونة قرآنية ذهبية مخصّصة (1024×1024) + 11 مقاساً مشتقاً.
- ✨ عنوان عربي رسمي: **«عارض و قارئ الذكر الحكيم»** في desktop file وكل metadata.
- ✨ تأثير hover ذكي على شعار التطبيق (scale + rotate خفيفان).
- ✨ تباعد سطور أوسع (line-height 2.8) في عرض النص.
- ✨ زرّا تكبير/تصغير عاموديان في الشريط العائم (يحلّان محل البحث في ملء الشاشة).

### 🐛 إصلاحات الصوت

- 🔧 **إزالة عبد الباسط الورشي** — ترقيم الآيات عنده غير قياسي (002001.mp3 يحوي 3 آيات مجمَّعة)، تسبّب في فقدان مزامنة في 50%+ من السور الطويلة.
- 🔧 إصلاح زر الإيقاف التام — يصفّر `activeVerse` + `isPlaying` + `error` في React state.
- 🔧 إصلاح تأخير الصورة عند تجاوز الصفحة أثناء التشغيل.
- 🔧 تظليل سلس بدون smooth scrolling (تأخير محسوس → فوري).

### 🔧 إصلاحات بناء `electron-builder`

- 🔧 `npmRebuild: false` + `buildDependenciesFromSource: false` لمنع حذف node_modules المرفوع.
- 🔧 `electronVersion: "33.3.1"` لكي يجدها في monorepo.
- 🔧 `artifactName: "${productName}-${version}-${arch}.${ext}"` لأن اسم النطاق `@gt-quranreader/desktop` غير صالح في DEB.
- 🔧 `author` ككائن `{name,email}` لأن DEB يحتاج maintainer email.
- 🔧 `setIcon()` صريح + fallback chain لظهور الأيقونة في شريط المهام.

### 📜 الترخيص + التوثيق

- ✨ ترخيص مزدوج موثَّق: **GPL-3.0-or-later** للسطح + النواة، **AGPL-3.0-or-later** لـ apps/web.
- ✨ `CONTRIBUTING.md` كامل بإرشادات المساهمة.
- ✨ `flatpak/com.gnutux.GTQuranReader.metainfo.xml` AppStream metadata صالح (`appstreamcli compose`).
- ✨ تحديث README بجداول الحزم وأحجامها.

### 🗄️ Schema migration

- ⬆️ `PREFS_SCHEMA_VERSION = 6` — هجرة تلقائية من `abdulbasit-warsh` إلى `ibrahim-aldosary-warsh`، ومن `theme: dark` إلى `gold`.

---

## [4.0.0-alpha] — 2026-05-23

### إعادة بناء كاملة 🎉

النسختان السابقتان (Desktop بـ Bash + Web بـ Vanilla JS) كانتا في مستودعَين منفصلَين وتسببتا في divergence مستمر. النسخة 4.0 هي **monorepo موحَّد** بنواة وواجهة مشتركتين.

### المعمارية الجديدة

- ✨ **Monorepo بـ npm workspaces** يضم 4 حزم:
  - `@gt-quranreader/core` — منطق بحت (TS، بدون React/DOM).
  - `@gt-quranreader/ui` — React components + hooks مستقلة عن البيئة.
  - `@gt-quranreader/desktop` — Electron + Vite.
  - `@gt-quranreader/web` — Vite + PWA + Capacitor.
- ✨ نمط **dependency injection** لخصوصيات البيئة (DownloadManager، resolveLocalPath) — لا `isElectron` checks داخل packages المشتركة.

### الميزات الجديدة

#### 📜 الروايات
- ✨ **4 روايات** معتمدة عند أهل السنة: ورش، حفص، قالون، الدوري.
- ✨ تبديل الرواية يبدّل القارئ تلقائياً لأول قارئ متاح فيها.
- ✨ ورش هي الافتراضية (المعتمدة في المغرب العربي).

#### 🎤 القراء
- ✨ **13 قارئاً** عبر `everyayah.com` (آية بآية).
- ✨ قراء ورش الـ 3 (عبد الباسط، إبراهيم الدوسري، ياسين الجزائري).
- ✨ كاتالوج موحَّد `reciter-catalog.ts` يربط معرّفاً مستقراً بمسارات المصادر.
- ✨ بسملة عامة (`bismillah.mp3`) لقارئ عبد الباسط الورشي (ملفه 001001 ليس بسملة).

#### 🎧 الصوت + التظليل
- ✨ **VersePlayer** يدير تتابعاً سلساً للآيات (preload لآيتين قادمتين، فجوة <200ms).
- ✨ **البسملة التلقائية** قبل كل سورة (عدا الفاتحة والتوبة).
- ✨ نقرة واحدة على آية = تظليل (toggle).
- ✨ نقرتان = تشغيل + تتابع.
- ✨ إيقاف تام (■) منفصل عن إيقاف مؤقت (⏸).
- ✨ Banner أثناء القراءة يعرض `سورة X — آية Y / Z`.
- ✨ تتابع الصفحات تلقائي عند تجاوز حدودها.

#### 🔍 البحث الذكي
- ✨ تطبيع عربي قوي يجعل `الرحمن` يطابق `ٱلرَّحْمَٰنِ`.
- ✨ مراجع آيات: `2:255`، `الكرسي`، `آية الكرسي`.
- ✨ مراجع صفحات/أجزاء: `ص 100`، `جزء 30`.
- ✨ بحث في أسماء السور (عربي/إنجليزي/كنى).
- ✨ Arabic-Indic digits (٢٥٥) ⇄ Latin (255).
- ✨ تظليل النتائج بـ word-boundary safe regex.

#### 🎨 الواجهة
- ✨ **6 خطوط قرآنية** (عثماني، أميري، أميري ملوّن، ArbFONTS، نظام Naskh، مسطر).
- ✨ **4 سمات**: داكن 🌙، فاتح ☀️، سيبيا 📜، تلقائي (يتبع النظام).
- ✨ **شريط أدوات موحَّد** (PageInfo + Search + Zoom + Toggle في صف واحد).
- ✨ **شريط عائم** بـ 6-7 أزرار حسب الحالة.
- ✨ **وضع ملء الشاشة** ⛶ مع تلاشٍ تلقائي للأدوات بعد 3 ثوان من الخمول.
- ✨ تصميم متجاوب: 360px → 4K.

#### 📱 الموبايل
- ✨ **Capacitor 6** مدمج في `apps/web/` (نفس الكود → Android/iOS).
- ✨ Hardware back button على Android (إغلاق modal → بحث → صوت → خروج).
- ✨ Status bar داكن على Android.
- ✨ Swipe للتنقل بين الصفحات (RTL-aware).
- ✨ إخفاء أزرار التنقل أثناء القراءة (المتابعة أوتوماتيكية).

#### 💾 التخزين والـ Offline
- ✨ **Web (PWA)**: `vite-plugin-pwa` + 5 استراتيجيات Workbox (precache + CacheFirst للصور/الصوت + StaleWhileRevalidate للـ API).
- ✨ **IndexedDB** لنصوص الروايات (~5MB لكل واحدة).
- ✨ **Desktop**: تنزيل إلى `userData/data/` مع إدارة تنزيل (تقدّم + إلغاء + retry 3 + concurrency 5).
- ✨ **Schema versioning** تلقائي — ترقية الإعدادات بلا يدوية.
- ✨ زر **"إعادة الإعدادات الافتراضية"** يدوي في الإعدادات.
- ✨ حفظ آخر آية + استعادتها بعد إعادة الفتح + حوار مخصّص "متابعة / بدء جديد".

#### 🧩 جودة الكود
- ✨ TypeScript strict في كل الحزم.
- ✨ `tsc --noEmit` في `npm run lint` للحزمتين.
- ✨ `scripts/test-search-and-audio.ts` يختبر البحث + URL resolution + كل الـ APIs الخارجية.
- ✨ `scripts/visual-check.ts` يلتقط لقطات Playwright لاختبار التجاوب.

### الإصلاحات

- 🔧 `numberOfAyahs` غير موجود في API alquran.cloud — fallback لـ `ayahs.length`.
- 🔧 `play() interrupted` تجاهل (طبيعي عند تغيير src أثناء play).
- 🔧 اسم السورة المكرر "سورة سُورَةُ الرعد" — تنظيف البادئة من API.
- 🔧 ترجمة `confirm()` المتصفح إلى `ConfirmDialog` مخصّص.

---

## [3.0.0] — 2025-10-31 (legacy)

النسخة القديمة بـ Bash + Python http.server (Desktop) و Vanilla JS (Web). محفوظة في `_legacy/`.

ميزات v3:
- وضع عرض نصي + 4 خطوط قرآنية.
- 5 قراء (مشاري العفاسي يعمل فعلياً، الباقي واجهة فقط).
- بحث متعدد المستويات في السور والآيات.
- AppImage مستقل.

## [2.0.0] — 2025

- واجهة ويب متكاملة.
- تشغيل صوتي متقدم.
- بحث في السور والآيات.
- وضع ليلي/نهاري.

## [1.0.0] — 2025

- عرض صفحات المصحف.
- تنقل أساسي.
- واجهة بسيطة.
