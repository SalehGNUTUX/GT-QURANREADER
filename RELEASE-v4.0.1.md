<div align="center">

# 📖 GT-QURANREADER v4.0.1

**عارض و قارئ الذكر الحكيم — تحسينات تجربة + إصلاحات حرجة**

![Version](https://img.shields.io/badge/version-4.0.1-brightgreen)
![Release Date](https://img.shields.io/badge/release-2026--05--24-blue)
![Packages](https://img.shields.io/badge/packages-AppImage%20%7C%20DEB%20%7C%20RPM%20%7C%20Flatpak%20%7C%20APK%20%7C%20PWA-success)
![License](https://img.shields.io/badge/license-GPL--3.0%20%7C%20AGPL--3.0%20(web)-orange)

</div>

---

## 🔥 إصلاح حرج

إصدار v4.0.0 كان يعاني من **bug صامت في Electron preload** يجعل قسم الإعدادات يعرض "نسخة سطح المكتب فقط" — والتنزيل المحلي للنصوص/الصوت/الصور **لا يعمل**.

**v4.0.1 يُصلح ذلك بالكامل** — استخدِم هذا الإصدار بدل v4.0.0.

---

## ✨ الميزات الجديدة

### 📑 علامة موضع قراءة منفصلة عن الاستماع
- علامة بصرية دائمة على الآية المحفوظة (🔖 + خلفية ذهبية).
- زر ذكي يتبدّل بين: 🔖 احفظ · 📖 اذهب · 🗑️ إزالة (حسب السياق).
- **`lastReadAt`** و **`lastReadPage`** مستقلان تماماً عن `lastStoppedAt` للصوت — يحلّان مشكلة: الصوت يأخذك لصفحة أخرى ثم تفقد موضع القراءة.

### 🎚️ قائمة "المزيد" ⋯ متوسّعة
كل الأدوات في مكان واحد:
- ☰ السور · 🔍 البحث
- 📜 الرواية · 🎤 القارئ · 🔤 **الخط** (مع معاينة حية)
- 🔖/📖/🗑️ كل خيارات العلامة
- ＋／－ تكبير/تصغير الخط
- 🔊 **شريط مرن للتحكم بمستوى الصوت 0-100%**

### 🤏 إيماءات اللمس على الهاتف
- **اسحب يميناً/يساراً** → تبدّل بين الصفحات
- **اقرص بإصبعين** → تكبير/تصغير الخط (5% خطوات)
- **زر 📄 احتياطي** لو لم تعمل الإيماءات

### 🅰 شريط عائم محسَّن
- زر زوم واحد (خخ) يفتح ＋／－ منبثقة فوق الشريط
- زر تنقل واحد (📄) على الموبايل لو السحب لا يعمل
- جميع اللوحات تختفي تلقائياً عند الخمول/النقر خارجها

### ℹ️ قسم "حول" في الإعدادات
معلومات المشروع + روابط (المستودع، الإصدارات، الإبلاغ عن المشاكل، سجل التغييرات).

### 📦 جدول بيانات التخزين الكامل
- جدول يعرض: القسم · عدد الملفات · الحجم · زر حذف منفرد
- يعمل في **Web + APK + Desktop** (Cache API صريح، لا يحتاج SW)
- حساب الحجم بـ `blob.size` كاحتياط

### 🎨 تحسينات بصرية
- **آيتان متناوبتان** في الصفحة الرئيسية (التغابن 64:17 + القمر 54:17)
- **الوضع الذهبي + صورة المصحف**: الحبر يُقلَب لأبيض
- **سيبيا أكثر دفئاً** (أقل سطوعاً، مريح للعين)
- **شعار جديد** يحوي العبارة العربية + الاسم الإنجليزي
- **حوارات تأكيد ConfirmDialog** بدل `window.confirm()` (متّسقة مع كل السمات)

---

## 📦 ملفات التنزيل

| الصيغة | الملف | الحجم | ملاحظات |
|---|---|---|---|
| 🐧 **AppImage** | `GT-QURANREADER-4.0.1-x86_64.AppImage` | 109 MB | محمول، يعمل على كل توزيعات GNU/Linux |
| 📦 **DEB** | `GT-QURANREADER-4.0.1-amd64.deb` | 77 MB | Debian · Ubuntu · Mint · Pop!_OS |
| 📦 **RPM** | `GT-QURANREADER-4.0.1-x86_64.rpm` | 107 MB | Fedora · RHEL · openSUSE |
| 📦 **Flatpak** | `GT-QURANREADER-4.0.1.flatpak` | 78 MB | كل توزيعات GNU/Linux |
| 📱 **APK Release** | `android/GT-QURANREADER-4.0.1-release.apk` | 7.4 MB | **موصى به** — موقَّع، قابل للتثبيت مباشرة |
| 📱 APK Debug | `android/GT-QURANREADER-4.0.1-debug.apk` | 14 MB | للاختبار + التطوير |
| 📱 APK Unsigned | `android/GT-QURANREADER-4.0.1-unsigned.apk` | 7.3 MB | للنشر على Play Store بمفتاحك الخاص |
| 🌐 **PWA Live (رئيسي)** | https://salehgnutux.github.io/GT-QURANREADER/app/ | 2.4 MB shell | يعمل في المتصفح + قابل للتثبيت كتطبيق |
| 🌐 **PWA (احتياطي)** | https://gt-quranreader.surge.sh/ | 2.4 MB shell | نسخة مرآة على Surge |

---

## 🛠️ التثبيت

### 🐧 GNU/Linux

```bash
# AppImage (محمول)
chmod +x GT-QURANREADER-4.0.1-x86_64.AppImage
./GT-QURANREADER-4.0.1-x86_64.AppImage

# DEB (Debian/Ubuntu/Mint)
sudo dpkg -i GT-QURANREADER-4.0.1-amd64.deb

# RPM (Fedora/RHEL/openSUSE)
sudo dnf install ./GT-QURANREADER-4.0.1-x86_64.rpm

# Flatpak
flatpak install --user GT-QURANREADER-4.0.1.flatpak
flatpak run com.gnutux.GTQuranReader
```

### 📱 Android

```bash
# الأسهل: انقل APK إلى الهاتف وافتحه
# أو عبر ADB:
adb install -r GT-QURANREADER-4.0.1-release.apk
```

### 🌐 المتصفح

**الرابط الأساسي** (يأتي من المستودع):
👉 **https://salehgnutux.github.io/GT-QURANREADER/app/**

**رابط احتياطي** (في حال تعطّل GitHub Pages):
- https://gt-quranreader.surge.sh/

كلاهما:
- يعمل في أي متصفح حديث
- "تثبيت" من Chrome لتحويله إلى تطبيق
- يعمل أوفلاين بعد الزيارة الأولى (Workbox)

---

## ✨ ما الذي يقدّمه v4.0 (للقادمين الجدد)

- **4 روايات** معتمدة عند أهل السنة (ورش · حفص · قالون · الدوري)
- **13+ قارئاً** عبر `everyayah.com` — صوت آية بآية
- **تظليل آية متزامن** مع التلاوة
- **بحث عربي ذكي** (الرحمن = ٱلرَّحْمَٰنِ، 2:255، ص 100، إلخ)
- **5 سمات بصرية**: ذهبي · ليلي · نهاري · سيبيا · تلقائي
- **6 خطوط قرآنية**: عثماني · أميري · أميري ملوّن · ArbFONTS · النظام · مسطر
- **يعمل أوفلاين** بعد التنزيل (PWA + Desktop)
- **مفتوح المصدر** GPL-3.0 / AGPL-3.0

---

## 🐛 قيود معروفة

- **APK غير موقَّع** للنشر على Play Store — استخدم `unsigned.apk` ووقِّعه بمفتاحك (`jarsigner` + `zipalign`).
- **iOS**: لم تُولَّد حزمة `.ipa` (تتطلب macOS + Xcode + Apple Developer Account).
- **Windows**: غير مدعوم في هذا الإصدار (مخطط لـ v5).

---

## 📜 الترخيص

- **سطح المكتب + النواة المشتركة**: **GNU GPL v3.0 أو أحدث**
- **نسخة الويب/PWA**: **GNU AGPL v3.0 أو أحدث** (network copyleft)

---

## 📬 الإبلاغ + المساهمة

- 🐛 [GitHub Issues](https://github.com/SalehGNUTUX/GT-QURANREADER/issues)
- 📂 [CHANGELOG.md الكامل](CHANGELOG.md)
- 🤝 [CONTRIBUTING.md](CONTRIBUTING.md)

---

<div align="center">

﴿ **إِن تُقۡرِضُواْ ٱللَّهَ قَرۡضًا حَسَنٗا يُضَٰعِفۡهُ لَكُمۡ وَيَغۡفِرۡ لَكُمۡۚ وَٱللَّهُ شَكُورٌ حَلِيمٌ** ﴾ — التغابن 17

🤲 _اللهم اجعل هذا العمل صدقة جارية_

تم التطوير بواسطة [SalehGNUTUX](https://github.com/SalehGNUTUX)

</div>
