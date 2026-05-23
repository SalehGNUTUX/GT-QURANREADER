<div align="center">

# 📖 GT-QURANREADER v4.0.0

**عارض و قارئ الذكر الحكيم — الإصدار المستقر الأول**

![Version](https://img.shields.io/badge/version-4.0.0-brightgreen)
![Release Date](https://img.shields.io/badge/release-2026--05--23-blue)
![Packages](https://img.shields.io/badge/packages-AppImage%20%7C%20DEB%20%7C%20RPM%20%7C%20Flatpak%20%7C%20APK-success)
![License](https://img.shields.io/badge/license-GPL--3.0%20%7C%20AGPL--3.0%20(web)-orange)

</div>

---

## 🎉 الإصدار المستقر الأول

النسختان السابقتان (Desktop بـ Bash + Web بـ Vanilla JS) كانتا في مستودعَين منفصلَين وأدّتا إلى divergence مستمر. النسخة 4.0.0 هي **إعادة بناء كاملة** في monorepo موحَّد مع **5 صيغ توزيع** جاهزة.

---

## 📦 ملفات التنزيل

| الصيغة | الملف | الحجم | ملاحظات |
|---|---|---|---|
| 🐧 **AppImage** | `GT-QURANREADER-4.0.0-x86_64.AppImage` | 109 MB | محمول، يعمل على كل توزيعات Linux |
| 📦 **DEB** | `GT-QURANREADER-4.0.0-amd64.deb` | 77 MB | Debian · Ubuntu · Mint · Pop!_OS |
| 📦 **RPM** | `GT-QURANREADER-4.0.0-x86_64.rpm` | 107 MB | Fedora · RHEL · openSUSE · CentOS |
| 📦 **Flatpak** | `GT-QURANREADER-4.0.0.flatpak` | 77 MB | كل توزيعات Linux (يحتاج `org.freedesktop.Platform 24.08`) |
| 📱 **APK Release** | `android/GT-QURANREADER-4.0.0-release.apk` | 7.4 MB | **موصى به** — موقَّع، قابل للتثبيت مباشرة |
| 📱 APK Debug | `android/GT-QURANREADER-4.0.0-debug.apk` | 14 MB | للاختبار + التطوير |
| 📱 APK Unsigned | `android/GT-QURANREADER-4.0.0-unsigned.apk` | 7.3 MB | للنشر على Play Store بمفتاحك الخاص |

---

## 🛠️ التثبيت

### 🐧 Linux

#### AppImage (الأبسط — لا يحتاج صلاحيات root)
```bash
chmod +x GT-QURANREADER-4.0.0-x86_64.AppImage
./GT-QURANREADER-4.0.0-x86_64.AppImage
```

#### DEB (Debian/Ubuntu/Mint)
```bash
sudo dpkg -i GT-QURANREADER-4.0.0-amd64.deb
sudo apt-get install -f   # إن وجدت تبعيات ناقصة
```

#### RPM (Fedora/RHEL/openSUSE)
```bash
sudo dnf install ./GT-QURANREADER-4.0.0-x86_64.rpm
# أو
sudo rpm -ivh GT-QURANREADER-4.0.0-x86_64.rpm
```

#### Flatpak
```bash
flatpak install --user GT-QURANREADER-4.0.0.flatpak
flatpak run com.gnutux.GTQuranReader
```

### 📱 Android

#### تثبيت مباشر (موصى به)
1. نزّل `GT-QURANREADER-4.0.0-release.apk` على الهاتف.
2. فعِّل "تثبيت من مصادر غير معروفة" في إعدادات الأمان.
3. افتح الملف عبر مدير الملفات وأكِّد التثبيت.

#### عبر ADB من الحاسوب
```bash
adb install -r GT-QURANREADER-4.0.0-release.apk
```

> **ملاحظة:** الـ APK موقَّع بمفتاح Android Debug للتثبيت المباشر فقط. للنشر على Google Play Store، استخدم `GT-QURANREADER-4.0.0-unsigned.apk` ووقِّعه بمفتاحك:
> ```bash
> jarsigner -keystore my-key.jks app-release-unsigned.apk my-alias
> zipalign -v 4 app-release-unsigned.apk app-release-signed.apk
> ```

---

## ✨ ما الجديد في v4.0.0

### 📜 4 روايات معتمدة عند أهل السنة
- **ورش عن نافع** (الافتراضية — المعتمدة في المغرب العربي)
- حفص عن عاصم (الأكثر انتشاراً عالمياً)
- قالون عن نافع
- الدوري عن أبي عمرو

### 🎤 13+ قارئاً
- أبرزهم: مشاري العفاسي · الحصري · المنشاوي · عبد الباسط · الغامدي · ياسر الدوسري · إبراهيم الدوسري (ورش) · ياسين الجزائري (ورش)
- صوت **آية بآية** عبر `everyayah.com` → يدعم التظليل المتزامن

### 🎧 تظليل آية متزامن مع التلاوة
- **نقرة واحدة** على آية → تظليل بصري (toggle)
- **نقرتان** → تشغيل صوتها + تتابع تلقائي
- **شريط عائم** بـ ⏸ pause + ■ stop منفصلين
- استعادة آخر آية تم الوقوف عندها + حوار "متابعة من حيث توقفت / بدء السورة"

### 🔍 بحث ذكي يفهم العربية كاملة
| الإدخال | المُخرج |
|---|---|
| `الرحمن` / `الرحمان` / `الرحمٰن` | 157 نتيجة (تطبيع كامل للهمزات/التشكيل/التطويل) |
| `2:255` | البقرة آية 255 → الصفحة 42 |
| `الكرسي` / `قلب القرآن` | كنى الآيات والسور الشهيرة |
| `ص 100` / `جزء 30` | مرجع صفحة/جزء |
| `٢٥٥` ⇄ `255` | تطبيع تلقائي للأرقام |

### 🎨 6 خطوط قرآنية + 5 سمات
- خطوط: عثماني · أميري · أميري ملوّن · ArbFONTS · النظام · مسطر
- سمات: **ذهبي 🏺 (الافتراضية)** · ليلي 🌙 · نهاري ☀️ · سيبيا 📜 · تلقائي

### 💾 العمل أوفلاين
- **PWA/Web**: Workbox مع 5 استراتيجيات (precache + CacheFirst + StaleWhileRevalidate)
- **Desktop**: تنزيل النص/الصوت/الصور إلى `userData/data/` مع شاشة إدارة + تقدّم + إلغاء
- **IndexedDB** لتخزين النصوص الكبيرة في Web

### 🖥️ تصميم متجاوب
- يعمل من 360px (هاتف) إلى 4K
- **وضع ملء الشاشة** ⛶ مع تلاشٍ تلقائي بعد 3 ثوان من الخمول
- **Swipe** للتنقل بين الصفحات على الهاتف
- على Android: hardware back button (يغلق modals → بحث → صوت → خروج)

---

## 🏗️ البنية المعمارية

```
GT-QURANREADER/                Monorepo (npm workspaces)
├── packages/
│   ├── core/                  منطق بحت (لا React، لا DOM)
│   └── ui/                    React components مشتركة
└── apps/
    ├── desktop/               قشرة Electron 33
    └── web/                   قشرة Vite PWA + Capacitor (Android/iOS)
```

**>90% من الكود مشترك** عبر `packages/` بين النسختين.

---

## 🔐 التحقق من سلامة الملفات (SHA-256)

```
137220d6c09204efdd705faee3dc22b43611b61f7bb33f999b5948953246f27d  GT-QURANREADER-4.0.0-x86_64.AppImage
accb748784af32c3edf72ca9708b19d376608cfceb63bac1030025264ebf80d5  GT-QURANREADER-4.0.0-amd64.deb
be3f26dde10b5a74c855e891784e77189881dc36ede5b9a2400bbc3e17d79991  GT-QURANREADER-4.0.0-x86_64.rpm
707b23861a7d0cff1e23dfa2a200d55d5bb1959841e1a18e64a1c43b73043af3  GT-QURANREADER-4.0.0.flatpak
a0fbea289c21efd1ecef7855f0fa7c0e7531ab0ae18bc54efee035ad28f3d043  android/GT-QURANREADER-4.0.0-debug.apk
d6d442e491c0358bea1fbbb6ec05cdfe1433d03b023338752a6154f917d9700a  android/GT-QURANREADER-4.0.0-release.apk
1d7b05b4d3d60ac8c9db84e402e36b2c930d70b2f49f71794209115ddd1f10f5  android/GT-QURANREADER-4.0.0-unsigned.apk
```

للتحقق:
```bash
sha256sum -c SHA256SUMS
```

---

## 🌐 متطلبات التشغيل

| المنصة | الحد الأدنى |
|---|---|
| Linux | x86_64 · glibc ≥ 2.31 (Ubuntu 20.04+) |
| Android | API 22+ (Android 5.1 Lollipop) |
| Flatpak | `org.freedesktop.Platform 24.08` |
| ذاكرة وصول عشوائي | 1 GB |
| تخزين | 200 MB (Linux) · 50 MB (Android) |

---

## 🐛 قيود معروفة

- **APK غير موقَّع** للنشر على Play Store — استخدم `unsigned.apk` ووقِّعه بمفتاحك.
- **عبد الباسط الورشي** أُزيل من قائمة القرّاء — ترقيم الآيات في تسجيلاته على `everyayah.com` غير قياسي (002001.mp3 يحوي 3 آيات مجمَّعة).
- **iOS**: لم تُولَّد حزمة `.ipa` (تتطلب macOS + Xcode + Apple Developer Account).
- **Windows**: غير مدعوم في هذا الإصدار (مخطط لـ v4.1).

---

## 📜 الترخيص

**ترخيص مزدوج:**
- **سطح المكتب + النواة المشتركة** (`apps/desktop/`, `packages/core/`, `packages/ui/`): **GNU GPL v3.0 أو أحدث**.
- **نسخة الويب/PWA** (`apps/web/`): **GNU AGPL v3.0 أو أحدث**.

الـ AGPL تضمن أن أي خادم يستضيف هذه النسخة يجب أن يجعل الكود المصدري متاحاً للمستخدمين عبر الشبكة.

---

## 🙏 شكر خاص

- نص القرآن: [api.alquran.cloud](https://alquran.cloud/api)
- صور المصاحف: [SalehGNUTUX/Quran-PNG](https://github.com/SalehGNUTUX/Quran-PNG)
- صوت لكل آية: [everyayah.com](https://everyayah.com/)
- ملف البسملة: `everyayah.com/data/bismillah.mp3`
- خطوط: مجمع الملك فهد لطباعة المصحف · مشروع Amiri

---

## 📬 الإبلاغ عن المشاكل

- 🐛 [GitHub Issues](https://github.com/SalehGNUTUX/GT-QURANREADER/issues)
- 📂 [سجل التغييرات الكامل](CHANGELOG.md)
- 📖 [التوثيق](README.md)

---

<div align="center">

**"وَنَزَّلْنَا عَلَيْكَ ٱلْكِتَٰبَ تِبْيَٰنًۭا لِّكُلِّ شَىْءٍۢ"** — النحل 89

🤲 _اللهم اجعل هذا العمل صدقة جارية_

تم التطوير بواسطة [SalehGNUTUX](https://github.com/SalehGNUTUX)

</div>
