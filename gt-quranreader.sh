#!/bin/bash
# GT-QURANREADER - عارض القرآن الكريم المتكامل
# الإصدار: 2.0
# تم التطوير بواسطة: GNUTUX

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WWW_DIR="$SCRIPT_DIR/www"
QURAN_DATA="$SCRIPT_DIR/www/quran_data"
PORT=8787

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║           📖 GT-QURANREADER v2.0                        ║"
echo "║               عارض القرآن الكريم المتكامل              ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${YELLOW}🔍 التحقق من هيكل المشروع...${NC}"
echo ""

if [ ! -d "$WWW_DIR" ]; then
    echo -e "${RED}❌ لم يتم العثور على مجلد www/${NC}"
    exit 1
fi

if [ ! -d "$QURAN_DATA" ]; then
    echo -e "${RED}❌ لم يتم العثور على مجلد quran_data/${NC}"
    exit 1
fi

ESSENTIAL_FILES=(
    "data/mainDataQuran.json"
    "data/pagesQuran.json"
    "data/quran_image/1.png"
)

for file in "${ESSENTIAL_FILES[@]}"; do
    if [ ! -f "$QURAN_DATA/$file" ]; then
        echo -e "${RED}❌ ملف مهم مفقود: $file${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ جميع الملفات والمجلدات موجودة${NC}"
echo ""

echo -e "${BLUE}📊 معلومات النظام:${NC}"
echo -e "📂 مجلد الواجهة: $WWW_DIR"
echo -e "📚 بيانات القرآن: $QURAN_DATA"
echo -e "🌐 المنفذ المحلي: $PORT"
echo -e "🖥️  العنوان: http://localhost:$PORT"
echo ""

echo -e "${YELLOW}🚀 الميزات المتاحة:${NC}"
echo -e "✅ عرض صفحات المصحف كاملة (604 صفحة)"
echo -e "✅ البحث في السور والآيات"
echo -e "✅ التنقل حسب الأجزاء والسور"
echo -e "✅ عرض آيات السجود"
echo -e "✅ التلاوة الصوتية"
echo -e "✅ الوضع الليلي/النهاري"
echo -e "✅ تكبير/تصغير النص"
echo -e "✅ واجهة متجاوبة مع جميع الأجهزة"
echo ""

if ! command -v python3 &>/dev/null; then
    echo -e "${RED}❌ python3 غير مثبت على النظام${NC}"
    exit 1
fi

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  المنفذ $PORT مشغول، جرب منفذ آخر...${NC}"
    PORT=$((PORT + 1))
    echo -e "${GREEN}✅ سيتم استخدام المنفذ: $PORT${NC}"
    echo ""
fi

echo -e "${GREEN}🚀 تشغيل خادم القرآن الكريم...${NC}"
echo -e "${YELLOW}📖 افتح المتصفح واذهب إلى: http://localhost:$PORT${NC}"
echo -e "${YELLOW}⏹️  لإيقاف الخادم، اضغط Ctrl+C${NC}"
echo ""

cd "$WWW_DIR"
python3 -m http.server $PORT --bind 127.0.0.1

echo ""
echo -e "${YELLOW}🛑 تم إيقاف خادم القرآن الكريم${NC}"
echo -e "${GREEN}🙏 جزاك الله خيراً على استخدامك للبرنامج${NC}"
