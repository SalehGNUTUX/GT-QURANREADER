# GT-QURANREADER - عارض القرآن الكريم المتكامل 📖

![GT-QURANREADER](https://img.shields.io/badge/Version-3.0-green)
![Platform](https://img.shields.io/badge/Platform-Linux-blue)
![License](https://img.shields.io/badge/License-GPLv2-orange)

<div align="center">

https://github.com/SalehGNUTUX/GT-QURANREADER/raw/main/gt-quranreader.png
**عارض قرآن كريم متكامل مع واجهة عربية بديعة، ميزات صوتية متقدمة، وتصميم متجاوب لجميع الأجهزة.**

[المميزات](#-المميزات-الرئيسية) • [التشغيل](#-طريقة-التشغيل) • [التثبيت](#-التثبيت-في-قائمة-البرامج) • [البناء](#-البناء-من-المصدر)

</div>

## 📜 الرخصة
هذا البرنامج مرخص تحت رخصة **GNU General Public License v2.0**. انظر ملف [LICENSE](LICENSE) للتفاصيل.

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
# 1. انسخ المستودع
git clone https://github.com/SalehGNUTUX/GT-QURANREADER.git
cd GT-QURANREADER

# 2. اجعل سكريبت التشغيل قابل للتنفيذ
chmod +x gt-quranreader.sh

# 3. شغل البرنامج
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

#### التثبيت في قائمة البرامج

**الطريقة 1: باستخدام gearlever (مستحسن)**
```bash
# 1. افتح gearlever
gearlever

# 2. اذهب إلى قسم "تطبيقات المستخدم" (User Applications)
# 3. انقر على "إضافة تطبيق" (Add Application)
# 4. املأ البيانات كما يلي:
#    - الاسم: GT-QURANREADER
#    - الأمر: /المسار/إلى/GT-QURANREADER-3.0-x86_64.AppImage
#    - التعليق: عارض القرآن الكريم المتكامل
#    - التصنيف: التعليم;المراجع;
#    - الأيقونة: اختر شعار البرنامج

# 5. احفظ التغييرات
```

**الطريقة 2: يدوياً عبر سكريبت**
```bash
# انشئ ملف .desktop في المجلد المناسب
cat > ~/.local/share/applications/gt-quranreader.desktop << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=GT-QURANREADER
Comment=عارض القرآن الكريم المتكامل
Exec=/المسار/إلى/GT-QURANREADER-3.0-x86_64.AppImage
Icon=/المسار/إلى/شعار-البرنامج.png
Categories=Education;Reference;
Terminal=false
StartupWMClass=GT-QURANREADER
EOF

# اجعل الملف قابلاً للتنفيذ
chmod +x ~/.local/share/applications/gt-quranreader.desktop
```

**الطريقة 3: باستخدام أدوات مساعدة**
```bash
# باستخدام appimaged (تثبيت تلقائي)
wget https://github.com/AppImage/appimaged/releases/download/continuous/appimaged-x86_64.AppImage
chmod +x appimaged-x86_64.AppImage
./appimaged-x86_64.AppImage

# باستخدام AppImageLauncher
sudo apt install appimagelauncher
```

## 📁 هيكل المشروع

```
GT-QURANREADER/
├── www/                           # ملفات الواجهة الأمامية
│   ├── index.html                 # الصفحة الرئيسية
│   ├── style.css                  # أنماط التصميم
│   ├── script.js                  # المنطق البرمجي
│   └── quran-data/                # بيانات القرآن (يتم تحميلها تلقائياً)
├── gt-quranreader.sh              # سكريبت التشغيل الرئيسي
├── GT-QURANREADER.AppImage        # نسخة AppImage
├── LICENSE                        # رخصة GPLv2
└── README.md                      # هذا الملف
```

## 🔧 البناء من المصدر

### بناء نسخة AppImage

```bash
# 1. تثبيت أدوات البناء
sudo apt install fuse libfuse2

# 2. بناء AppImage
./build-appimage.sh

# أو باستخدام linuxdeploy
wget https://github.com/linuxdeploy/linuxdeploy/releases/download/continuous/linuxdeploy-x86_64.AppImage
chmod +x linuxdeploy-x86_64.AppImage
./linuxdeploy-x86_64.AppImage --appdir AppDir --output appimage
```

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
- الأيقونات من [Font Awesome](https://fontawesome.com)
- المجتمع المفتوح المصدر

---

<div align="center">

**"وَقُلِ اعْمَلُوا فَسَيَرَى اللَّهُ عَمَلَكُمْ وَرَسُولُهُ وَالْمُؤْمِنُونَ"** - التوبة: 105

</div>
```

هذا الملف README.md شامل ويغطي:

1. **الرخصة GPLv2** بشكل واضح
2. **طريقة التشغيل التقليدية** مع أوامر لكل التوزيعات
3. **تشغيل AppImage** بثلاث طرق مختلفة
4. **التثبيت في قائمة البرامج** باستخدام gearlever وبطرق يدوية
5. **هيكل المشروع** بشكل واضح
6. **تعليمات البناء** من المصدر
7. **دليل المساهمة** والدعم
