# دليل المساهمة

شكراً لاهتمامك بـ GT-QURANREADER. هذا الدليل يوضّح كيفية المساهمة بشكل فعّال.

## البدء

```bash
git clone https://github.com/SalehGNUTUX/GT-QURANREADER.git
cd GT-QURANREADER
npm install
npm run dev:web              # أو dev:desktop
```

## بنية المستودع باختصار

```
packages/core/   ← منطق بحت (TS، بدون React/DOM)
packages/ui/     ← React components + hooks مشتركة
apps/desktop/    ← Electron + Vite
apps/web/        ← Vite + PWA + Capacitor
```

اطّلع على `CLAUDE.md` للتفاصيل التقنية الكاملة (مفيد للذكاء الاصطناعي والمطورين الجدد).

## مبادئ معمارية

### 1. الكود المشترك في `packages/`
- أي منطق غير مرتبط بـ Electron أو IndexedDB أو Workbox يجب أن يكون في `packages/core/` أو `packages/ui/`.
- لا تستورد من `electron` أو `@capacitor/*` داخل `packages/`.

### 2. خصوصيات البيئة عبر prop injection
- لا تكتب `if (isElectron)` داخل `packages/ui/`.
- بدلاً من ذلك، استقبل callback اختياري:
  ```tsx
  // ✅ صحيح
  <ImagePage resolveLocalPath={resolveLocalImagePath} />
  // ❌ غير صحيح
  <ImagePage /> // يحوي داخلياً if (isElectron) ...
  ```

### 3. Imports عبر package barrel
- استخدم `import { X } from '@gt-quranreader/core'` وليس `import { X } from '@core/data/surahs'`.
- عند إضافة exports جديدة في core، أضِفها لـ `packages/core/index.ts`.

### 4. TypeScript strict
- كل الحزم تستخدم `strict: true`.
- لا `// @ts-ignore` بدون تعليق يشرح السبب.
- `tsc --noEmit` يجب أن يمر في كلا التطبيقين.

## دورة التطوير

### تشغيل dev mode
```bash
npm run dev:web         # http://localhost:5174 — أسرع للتطوير
npm run dev:desktop     # Electron + Vite معاً
```

### Type check
```bash
npm run lint            # tsc --noEmit في كل workspaces
```

### اختبار end-to-end
```bash
node_modules/.bin/tsx scripts/test-search-and-audio.ts
```
هذا يضرب الـ APIs الحقيقية (`alquran.cloud`، `everyayah.com`، صور `Quran-PNG`).

### اختبار بصري (Playwright Firefox)
```bash
node_modules/.bin/tsx scripts/visual-check.ts
# اللقطات في /tmp/quran-{desktop,mobile}.png
```

## أسلوب الـ Commits

- استخدم البادئات (Conventional Commits): `feat:` / `fix:` / `refactor:` / `docs:` / `style:` / `test:` / `chore:`.
- الرسائل عربية أو إنجليزية مقبولة — كن منسجماً.
- ركّز على **السبب** لا الوصف: `fix: عبد الباسط الورشي لا يحوي بسملة في الفاتحة` بدل `fix: تحديث ملف`.

## إضافة قارئ جديد

1. حدّد المجلد في `everyayah.com/data/<folder>/` وتأكد من `001001.mp3`.
2. أضِف entry في `packages/core/audio/reciter-catalog.ts`:
   ```ts
   {
     id: 'unique-id',
     name: { ar: '...', en: '...' },
     style: 'مرتل' | 'مجود' | 'حدر',
     riwaya: 'hafs' | 'warsh' | 'qaloon' | 'aldoori',
     sources: { everyayah: '<folder>' },
     // اختياري: basmalaUrl إذا الـ 001001 ليس بسملة فعلياً
   }
   ```
3. شغّل `scripts/test-search-and-audio.ts` للتحقق من URL يعطي 200.

## إضافة رواية جديدة

1. تأكد أن `api.alquran.cloud` يدعمها (انظر [editions API](https://alquran.cloud/api)).
2. أضِف entry في `packages/core/data/riwayat.ts`:
   ```ts
   {
     id: '...',
     name: { ar: '...', en: '...' },
     fullName: { ar: '...', en: '...' },
     apiSlug: 'quran-...',
     defaultFont: '...',
   }
   ```
3. أضِف على الأقل قارئاً واحداً لها في `reciter-catalog.ts`.

## إضافة خط جديد

1. ضع ملف `.otf` أو `.ttf` في `apps/desktop/public/fonts/` **و** `apps/web/public/fonts/`.
2. أضِف `@font-face` في `packages/ui/src/fonts/fonts.css`.
3. أضِف entry في `packages/ui/src/fonts/font-catalog.ts`.

## إضافة host خارجي للـ PWA cache

عند استخدام مصدر بعيد جديد، سجّله في `apps/web/vite.config.ts` → `workbox.runtimeCaching`، وإلا لن يعمل offline.

## ترقية schema التفضيلات

إذا غيّرت القيم الافتراضية أو أضفت حقولاً جديدة في `UserPreferences`:
1. زِد `PREFS_SCHEMA_VERSION` في `packages/core/storage/preferences.ts` بـ +1.
2. وثّق التغيير في الـ comment فوق الثابت.
3. سيُجبَر التطبيق تلقائياً على إعادة الافتراضيات لكل المستخدمين عند التحديث (مع الاحتفاظ بـ bookmarks).

## مزامنة Capacitor

بعد أي تعديل في `apps/web/src/`:
```bash
cd apps/web
npm run cap:sync     # build + cap sync (نسخ dist إلى android/ و ios/)
```

## الإبلاغ عن المشاكل

افتح issue على [GitHub Issues](https://github.com/SalehGNUTUX/GT-QURANREADER/issues) مع:
- وصف المشكلة (الواقع vs المتوقع).
- خطوات إعادة الإنتاج.
- لقطة شاشة إن أمكن.
- المنصة (PWA / Linux / Android / iOS) ومعلومات النظام.

## الترخيص

المشروع يستخدم ترخيصاً مزدوجاً:
- **GPL-3.0-or-later** للنواة (`packages/`) ونسخة سطح المكتب (`apps/desktop/`).
- **AGPL-3.0-or-later** لنسخة الويب (`apps/web/`) — تضمن أن أي خادم يستضيف هذه النسخة يجعل الكود متاحاً للمستخدمين.

عند إرسال PR، أنت توافق على نشر مساهمتك تحت نفس الترخيص المطابق للمجلد الذي تعدّله.
