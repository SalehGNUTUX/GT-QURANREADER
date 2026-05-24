# سجل التغييرات

كل التغييرات الملحوظة موثَّقة في هذا الملف. الصيغة مبنية على [Keep a Changelog](https://keepachangelog.com/ar/1.1.0/) ويتبع المشروع [Semantic Versioning](https://semver.org/lang/ar/).

## [4.0.1] — 2026-05-24 (تحسينات تجربة + إصلاحات حرجة)

### 🐛 إصلاح حرج: نسخ سطح المكتب لم تكن تستخدم API المحلي

- 🔥 **bug صامت في Electron preload**: ESM يُجمَّع كـ `import` بدل `require`، فيفشل preload صامتاً ولا يُحقَن `window.gtQuran`.
- النتيجة (في كل النسخ المنشورة قبل v4.0.1): قسم الإعدادات يعرض "ميزة سطح المكتب فقط"، التنزيل المحلي للنصوص/الصوت/الصور لا يعمل، الصور تعود من الشبكة دائماً.
- **الحل**: تحويل `tsconfig` إلى CommonJS + إزالة `"type": "module"` من `apps/desktop/package.json` + استبدال `import.meta.url` بـ `__dirname` العمومي.

### 🎯 ميزات جديدة

#### 📑 علامة موضع قراءة منفصلة
- **`prefs.lastReadAt`** جديد — مستقل تماماً عن `lastStoppedAt` للصوت.
- زر ذكي inline يتبدّل بين 3 حالات: 🔖 احفظ / 📖 اذهب / 🗑️ إزالة.
- المنطق:
  - آية مظللة جديدة → 🔖 (يستبدل العلامة بالجديدة)
  - النقر على الآية المحفوظة → 🗑️
  - بدون تظليل + توجد علامة → 📖
- علامة بصرية دائمة على الآية المحفوظة (🔖 + خلفية ذهبية متدرّجة).

#### 📖 آخر صفحة قراءة (تلقائية، مستقلة عن الاستماع)
- **`prefs.lastReadPage`** — يُحدَّث فقط عند التنقّل اليدوي (ليس بفعل الصوت).
- على الإقلاع: `currentPage = lastReadPage` (يتجاوز موضع الصوت).
- يحلّ مشكلة: الصوت يأخذك لصفحة 30، تغلق التطبيق، تعود فتجد نفسك في صفحة 5 (آخر قراءة فعلية).

#### 🎚️ ⋯ قائمة "المزيد" متوسّعة
- ☰ السور
- 🔍 البحث
- 📜 الرواية (مع عرض الاسم الحالي)
- 🎤 القارئ (مع عرض الاسم الحالي)
- 🔤 الخط القرآني (مع `FontPickerModal` جديد بمعاينات حية)
- 🔖/📖/🗑️ كل خيارات العلامة (متاحة دائماً)
- ＋／－ تكبير/تصغير الخط
- 🔊 **شريط مرن للتحكم بمستوى الصوت 0-100%** + أزرار 🔉/🔊 + نسبة %

#### 🤏 إيماءات اللمس (مع تشخيص بصري)
- **`usePinchZoom`** جديد: بقرص بإصبعين يكبّر/يصغّر الخط (5% خطوات).
- **`useSwipe`** محسَّن: عتبة 30px، listening على document مرحلة capture، يبعث `gtqr:swipe-fired` events.
- **`GestureDebugOverlay`** للتشخيص: أضف `?debug=gestures` إلى URL → overlay شفّاف يعرض كل touch event + dx/dy/dt + هل أُطلق callback فعلياً.

#### 🅰 أزرار شريط عائم محسَّنة
- **زر زوم واحد** (خخ — خاء كبيرة وأخرى صغيرة) يفتح popover منبثقة بـ ＋／－ فوق الشريط.
- **زر تنقل واحد على الموبايل** (📄) يفتح popover بـ ‹/› — احتياط للسحب.
- اللوحات تختفي تلقائياً عند: الخمول · النقر خارجها · النقر على الزر.

#### ℹ️ قسم "حول" في الإعدادات
- اسم البرنامج + الإصدار + الوصف
- معلومات المطور + الترخيص + مصادر البيانات
- 4 أزرار: 🐙 المستودع · 📦 الإصدارات · 🐛 المشاكل · 📝 سجل التغييرات
- 🤲 دعاء ختامي

### 🎨 تحسينات UI

- **آيتان متناوبتان** في أعلى الصفحة الرئيسية (At-Taghabun 64:17 + Al-Qamar 54:17) — crossfade كل 10 ثوان بخط Amiri Quran.
- **الوضع الذهبي + صورة المصحف**: تطبيق `invert` تلقائياً (الحبر يصبح أبيض).
- **سيبيا أكثر دفئاً وعمقاً** (`#c9b78f` بدل `#e8dcc0`).
- **شعار جديد** يحوي العبارة العربية + الاسم الإنجليزي داخله.
- **تباعد سطور 2.8** في وضع النص.
- **التمرير عند تغيير الصفحة** يصعد فقط لـ `.app-main` (يُبقي toolbar مرئياً).
- **scrollIntoView** على الآية المحفوظة عند 📖 (تظهر وسط الشاشة).

### 📦 تحسينات قسم الإعدادات

- **جدول حجم البيانات الكامل** في Web/APK: nameof cache · count · approxBytes · زر حذف منفرد.
- **حساب حجم Cache بـ blob.size** كاحتياط لـ `content-length` المفقود.
- **`navigator.storage.persist()`** يُطلب تلقائياً (يمنع Android من حذف cache WebView).
- **`fetchAllConcurrent` يستخدم Cache API صريحاً** (`caches.open()` + `cache.put()`) — يعمل في APK دون SW.
- **حوارات تأكيد ConfirmDialog** بدل `window.confirm` لـ:
  - ♻️ إعادة الإعدادات
  - 🗑️ حذف كل البيانات
  - 🗑️ حذف cache فردي
  - 🖼️ تنزيل صور المصاحف (تحذير الحجم)
- **بانر حالة التنزيل**: ✅ أخضر بنجاح، ⛔ رمادي إلغاء، ⚠️ أحمر خطأ — auto-dismiss بعد 3.5s.
- **ورش في أعلى قائمة قرّاء التنزيل**.

### 📱 تحسينات الموبايل

- **تخطيط مدمج** لـ Settings modal (95vh، عناوين أصغر، شبكات عمودَين).
- **زر العلامة يختفي** على الموبايل أثناء الصوت (مساحة للأزرار، الميزة في ⋯).
- **زر `📄` احتياطي** للتنقل بين الصفحات.
- **swipe yميناً/يساراً** يتبدّل بين الصفحات.
- **pinch بإصبعين** يكبّر/يصغّر الخط.

### 🛠️ تحسينات تقنية + DX

- **`PREFS_SCHEMA_VERSION 6 → 9`** بهجرة تلقائية (lastReadAt + lastReadPage + volume).
- **`VersePlayer.setVolume()`** جديد — يضبط الـ audio العنصر الحالي + كل preload audios.
- **`overscroll-behavior-x: contain`** على `.app-shell` يمنع تداخل gesture الـ back في Android Chrome.
- **TS strict** نظيف عبر كل packages/apps.

### 🐛 إصلاحات أخرى

- 🔧 SW مُعطَّل في dev — كان يخدم كود قديم بعد كل تحديث (يعارض HMR).
- 🔧 useSwipe يستمع على `document` (مرحلة capture) لاستقبال الأحداث رغم أي listener داخلي.
- 🔧 usePinchZoom يُسجّل touchmove non-passive **ديناميكياً عند 2 أصابع فقط** (لا يتدخّل في single-touch swipe).
- 🔧 ScrollToTop يستخدم `.app-main.scrollIntoView({block:'start'})` بدل `window.scrollTo` (يُبقي toolbar).
- 🔧 ConfirmDialog متّسق مع كل السمات (gold/dark/light/sepia/auto).
- 🔧 Capacitor sync يعمل قبل بناء APK تلقائياً.
- 🔧 splash images من 8.5 MB إلى 2.7 MB (optipng + 8-bit color).

### 📋 الحزم الجديدة

نفس البنية، أحجام محسَّنة:
- `release/GT-QURANREADER-4.0.1-x86_64.AppImage` (109 MB)
- `release/GT-QURANREADER-4.0.1-amd64.deb` (77 MB)
- `release/GT-QURANREADER-4.0.1-x86_64.rpm` (107 MB)
- `release/GT-QURANREADER-4.0.1.flatpak` (78 MB)
- `release/android/GT-QURANREADER-4.0.1-release.apk` (7.4 MB) ← **الموصى به**
- `release/android/GT-QURANREADER-4.0.1-debug.apk` (14 MB)
- `release/android/GT-QURANREADER-4.0.1-unsigned.apk` (7.3 MB)
- 🌐 PWA الرئيسية (من المستودع): **https://salehgnutux.github.io/GT-QURANREADER/app/**
- 🌐 PWA الاحتياطية (مرآة Surge): https://gt-quranreader.surge.sh/

---

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
