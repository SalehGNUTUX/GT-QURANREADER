# GT-QURANREADER - عارض القرآن الكريم المتكامل 📖

![GT-QURANREADER](https://img.shields.io/badge/Version-3.0-green)
![Platform](https://img.shields.io/badge/Platform-Linux-blue)
![License](https://img.shields.io/badge/License-GPLv2-orange)

<div align="center">

<img width="256" height="256" alt="GT-QURANREADER Logo" src="gt-quranreader.png" />

**عارض قرآن كريم متكامل مع وضع النص، الخطوط القرآنية، قراء متعددين، وتصميم متجاوب لجميع الأجهزة.**

[المميزات](#-المميزات-الرئيسية) • [الجديد](#-ما-الجديد-في-الإصدار-30) • [التثبيت](#-التثبيت-المباشر) • [التشغيل](#-طريقة-التشغيل) • [البناء](#-البناء-من-المصدر)

</div>

## 📜 الرخصة
هذا البرنامج مرخص تحت رخصة **GNU General Public License v2.0**. انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 🆕 ما الجديد في الإصدار 3.0

### 📖 وضع العرض النصي الثوري
- **تبديل فوري** بين وضع الصور ووضع النص
- **5 خطوط قرآنية** مختلفة (عثماني، أميري، ملون، إلخ)
- **عرض نصي منظم** مع ترقيم الآيات والتشكيل
- **تزامن كامل** مع وضع الصور

### 🎵 نظام قراء متعدد
- **5 قراء معتمدين** للاختيار منهم (حالياً القارئ مشاري العفاسي يعمل بشكل كامل)
- **واجهة اختيار القراء** جاهزة للتحديثات القادمة
- **إدارة تفضيلات** تخزين اختيار القارئ

### 🔍 بحث متقدم محسن
- **بحث في النص العربي** مع تمييز النتائج
- **بحث متعدد المستويات** في السور والآيات
- **نتائج ذكية** مع سياق الآيات

## ⚡ التثبيت المباشر

### الطريقة الأسرع (مستحسنة)
```bash
# انسخ المستودع كاملاً مع جميع الملفات المحدثة
git clone https://github.com/SalehGNUTUX/GT-QURANREADER.git
cd GT-QURANREADER

# شغل البرنامج مباشرة
./gt-quranreader.sh
```

### التثبيت مع تحديث الملفات
```bash
# إذا كان لديك نسخة قديمة
cd GT-QURANREADER
git pull origin master

# تأكد من أن الملفات قابلة للتنفيذ
chmod +x gt-quranreader.sh
chmod +x build-appimage-package.sh

# شغل النسخة المحدثة
./gt-quranreader.sh
```

## 🎵 ملاحظة حول القراء المتعددين

**💡 الحالة الحالية:**
- ✅ **مشاري العفاسي** - يعمل بشكل كامل ومستقر
- 🔄 **القراء الآخرون** - الواجهة جاهزة وسيتم تفعيلهم في التحديثات القادمة
- 🎯 **التركيز الحالي** على تجربة المستخدم والاستقرار

الواجهة تدعم اختيار القراء وستتم إضافة المصادر الصوتية للقراء الآخرين قريباً.

## ✨ المميزات الرئيسية

### 🎵 نظام الصوت المتكامل
- **تشغيل متواصل** للصوت عند التنقل بين الصفحات
- **تشغيل تلقائي** للسورة التالية عند الانتهاء
- **اختيار ذكي للسور** في الصفحات المتعددة السور
- **مشغل صوت عائم** في الواجهة

### 🎨 تجربة مستخدم استثنائية
- **الوضع الليلي الافتراضي** - مريح للعين في الإضاءة المنخفضة
- **واجهة عربية كاملة** بتصميم عصري وأنيق
- **تكبير/تصغير النص** بشكل ديناميكي
- **تصميم متجاوب** يعمل على جميع أحجام الشاشات

### 🔍 إمكانيات بحث متقدمة
- بحث متكامل في **السور والآيات والأجزاء**
- **نتائج فورية** مع معاينة النتائج
- دعم خاص **لآيات السجود** والتنقل المباشر
- **بحث في الأسماء العربية والإنجليزية** للسور

### 📖 محتوى شامل
- **604 صفحة** من المصحف الشريف
- **114 سورة** كاملة مع بيانات مفصلة
- **30 جزء** مع التنقل السريع
- **بيانات صوتية** متكاملة للتلاوة

## 🚀 طريقة التشغيل

### التشغيل التقليدي (من المصدر)

#### المتطلبات الأساسية
```bash
# على أنظمة Ubuntu/Debian
sudo apt update
sudo apt install python3 wget curl unzip

# على أنظمة Fedora/RHEL
sudo dnf install python3 wget curl unzip

# على أنظمة Arch Linux
sudo pacman -S python3 wget curl unzip
```

#### خطوات التشغيل
```bash
# 1. انسخ المستودع (إذا لم تكن فعلت)
git clone https://github.com/SalehGNUTUX/GT-QURANREADER.git
cd GT-QURANREADER

# 2. شغل البرنامج مباشرة
./gt-quranreader.sh
```

### التشغيل بـ AppImage (مستقل)

#### الطريقة المباشرة
```bash
# 1. نزل ملف AppImage من صفحة الإصدارات
# 2. اجعله قابلاً للتنفيذ
chmod +x GT-QURANREADER-3.0-x86_64.AppImage

# 3. شغله مباشرة
./GT-QURANREADER-3.0-x86_64.AppImage
```

## 📋 الميزات الجديدة في الواجهة

### 🎛️ أزرار تحكم عائمة جديدة
- **تبديل وضع العرض** (صور/نص)
- **اختيار الخط القرآني** 
- **اختيار القارئ**
- **مشغل الصوت المتقدم**

### 🎨 خطوط قرآنية مدمجة
- **خط عثماني** - الخط الرسمي لمصحف المدينة
- **خط أميري** - واضح ومناسب للقراءة اليومية
- **خط أميري ملون** - مع تشكيل واضح
- **خطوط بديلة** متعددة

## 🖥️ التثبيت في قائمة البرامج

### الطريقة 1: باستخدام gearlever (مستحسن)
```bash
# 1. افتح gearlever
gearlever

# 2. اذهب إلى قسم "تطبيقات المستخدم" (User Applications)
# 3. انقر على "إضافة تطبيق" (Add Application)
# 4. املأ البيانات كما يلي:
#    - الاسم: GT-QURANREADER
#    - الأمر: /المسار/إلى/GT-QURANREADER-3.0-x86_64.AppImage
#    - التعليق: عارض القرآن الكريم المتكامل مع وضع النص
#    - التصنيف: التعليم;
#    - الأيقونة: اختر شعار البرنامج

# 5. احفظ التغييرات
```

### الطريقة 2: يدوياً عبر سكريبت
```bash
# انشئ ملف .desktop في المجلد المناسب
cat > ~/.local/share/applications/gt-quranreader.desktop << EOF
[Desktop Entry]
Type=Application
Name=GT-QURANREADER
Name[ar]=القارئ القرآني
GenericName=Quran Reader
GenericName[ar]=عارض القرآن الكريم
Comment=Complete Quran reading application with text mode and Quranic fonts
Comment[ar]=تطبيق متكامل لقراءة القرآن الكريم مع وضع النص والخطوط القرآنية
Exec=/المسار/إلى/GT-QURANREADER-3.0-x86_64.AppImage
Icon=/المسار/إلى/gt-quranreader.png
Categories=Education;
Terminal=true
StartupNotify=true
Keywords=quran;islam;arabic;text;fonts;recitation;
StartupWMClass=GT-QURANREADER
X-AppImage-Version=3.0
EOF

# اجعل الملف قابلاً للتنفيذ
chmod +x ~/.local/share/applications/gt-quranreader.desktop
```

## 📁 هيكل المشروع المحدث

```
GT-QURANREADER/
├── www/                           # ملفات الواجهة الأمامية
│   ├── index.html                 # الصفحة الرئيسية المحدثة
│   ├── style.css                  # أنماط التصميم المحسنة
│   ├── script.js                  # المنطق البرمجي الجديد
│   ├── fonts/                     # الخطوط القرآنية الجديدة
│   │   ├── UthmanicHafs1 Ver13.otf
│   │   ├── amiri-quran.ttf
│   │   ├── amiri-quran-colored.ttf
│   │   └── ...
│   └── quran_data/                # بيانات القرآن
├── gt-quranreader.sh              # سكريبت التشغيل المحدث
├── build-appimage-package.sh      # سكريبت بناء AppImage
├── gt-quranreader.desktop         # ملف التطبيق
├── gt-quranreader.png             # أيقونة التطبيق
├── GT-QURANREADER-3.0-x86_64.AppImage # نسخة AppImage
├── LICENSE                        # رخصة GPLv2
└── README.md                      # هذا الملف
```

## 🔧 البناء من المصدر

### بناء نسخة AppImage محسنة

```bash
# 1. تثبيت أدوات البناء
sudo apt install fuse libfuse2

# 2. بناء AppImage مع الميزات الجديدة
chmod +x build-appimage-package.sh
./build-appimage-package.sh

# الناتج: GT-QURANREADER-3.0-x86_64.AppImage
```

## ⌨️ اختصارات لوحة المفاتيح

| الاختصار | الوظيفة |
|----------|----------|
| `→` أو `d` | الصفحة السابقة |
| `←` أو `a` | الصفحة التالية |
| `Space` | تشغيل/إيقاف التلاوة |
| `t` أو `ط` | تبديل وضع العرض (صور/نص) |
| `Esc` | إغلاق مشغل الصوت |

## 🐛 الإبلاغ عن المشاكل

إذا وجدت أي مشكلة، يرجى:

1. التحقق من [المشاكل المعروفة](https://github.com/SalehGNUTUX/GT-QURANREADER/issues)
2. فتح [مشكلة جديدة](https://github.com/SalehGNUTUX/GT-QURANREADER/issues/new) مع:
   - وصف المشكلة
   - خطوات إعادة إنتاج المشكلة
   - لقطة شاشة إذا أمكن
   - معلومات النظام (`uname -a`)

## 🤝 المساهمة في التطوير

نرحب بمساهماتكم! للمساهمة:

1. انسخ المستودع (`git fork`)
2. أنشئ فرعاً للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. احفظ التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. ادفع إلى الفرع (`git push origin feature/AmazingFeature`)
5. افتح طلب دمج (`Pull Request`)

## 📞 الدعم والاتصال

- **المطور:** SalehGNUTUX
- **المستودع:** [GT-QURANREADER على GitHub](https://github.com/SalehGNUTUX/GT-QURANREADER)
- **الإصدارات:** [Releases Page](https://github.com/SalehGNUTUX/GT-QURANREADER/releases)
- **الترخيص:** GNU GPL v2.0

## 🙏 الشكر والتقدير

- بيانات القرآن من [Quran-Data](https://github.com/SalehGNUTUX/Quran-Data)
- الخطوط القرآنية المتنوعة
- الأيقونات من [Font Awesome](https://fontawesome.com)
- المجتمع المفتوح المصدر

---

<div align="center">

**"وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ"** - التوبة: 105

**"اللهم أجعل هذا العمل صدقة جارية لي ولوالدي ولأهل بيتي ولكل مسلم ساهم أو دعم أو نشر هذا المشروع"** 🤲

</div>

## 🔄 سجل التحديثات

### الإصدار 3.0 (أحدث)
- ✅ إضافة وضع العرض النصي
- ✅ دعم 5 خطوط قرآنية
- ✅ إضافة واجهة اختيار القراء (مشاري العفاسي يعمل كاملاً)
- ✅ بحث متقدم في النص
- ✅ واجهة مستخدم محسنة

### الإصدار 2.0
- ✅ واجهة ويب متكاملة
- ✅ تشغيل صوتي متقدم
- ✅ بحث في السور والآيات
- ✅ وضع ليلي/نهاري

### الإصدار 1.0
- ✅ عرض صفحات المصحف
- ✅ تنقل أساسي
- ✅ واجهة بسيطة

---

**📖 جرب الميزات الجديدة واستمتع بتجربة قرآنية فريدة!**

**⚡ للتثبيت السريع:**
```bash
git clone https://github.com/SalehGNUTUX/GT-QURANREADER.git
cd GT-QURANREADER && ./gt-quranreader.sh
```
