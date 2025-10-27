#!/bin/bash
# GT-QURANREADER - عارض القرآن الكريم
# الإصدار: 2.1 - مع التحميل التلقائي للبيانات

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WWW_DIR="$SCRIPT_DIR/www"
QURAN_DATA_DIR="$WWW_DIR/quran_data"
QURAN_DATA_URL="https://github.com/rn0x/Quran-Data/archive/refs/heads/main.zip"
PORT=8787
APP_NAME="GT-QURANREADER"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# دالة لتحميل بيانات القرآن
download_quran_data() {
    echo -e "${YELLOW}📥 جاري تحميل بيانات القرآن...${NC}"
    
    # إنشاء المجلد المؤقت
    TEMP_DIR=$(mktemp -d)
    
    # تحميل البيانات من GitHub
    if command -v wget &>/dev/null; then
        wget -q "$QURAN_DATA_URL" -O "$TEMP_DIR/quran-data.zip"
    elif command -v curl &>/dev/null; then
        curl -s -L "$QURAN_DATA_URL" -o "$TEMP_DIR/quran-data.zip"
    else
        echo -e "${RED}❌ لم يتم العثور على wget أو curl${NC}"
        return 1
    fi
    
    # فك الضغط
    if command -v unzip &>/dev/null; then
        unzip -q "$TEMP_DIR/quran-data.zip" -d "$TEMP_DIR"
        # نسخ البيانات إلى المكان الصحيح
        mkdir -p "$QURAN_DATA_DIR"
        cp -r "$TEMP_DIR/Quran-Data-main/data" "$QURAN_DATA_DIR/"
        echo -e "${GREEN}✅ تم تحميل بيانات القرآن بنجاح${NC}"
    else
        echo -e "${RED}❌ unzip غير مثبت${NC}"
        return 1
    fi
    
    # تنظيف الملفات المؤقتة
    rm -rf "$TEMP_DIR"
}

# دالة للتحقق من بيانات القرآن
check_quran_data() {
    echo -e "${YELLOW}🔍 التحقق من بيانات القرآن...${NC}"
    
    ESSENTIAL_FILES=(
        "data/mainDataQuran.json"
        "data/pagesQuran.json"
        "data/quran_image/1.png"
    )
    
    for file in "${ESSENTIAL_FILES[@]}"; do
        if [ ! -f "$QURAN_DATA_DIR/$file" ]; then
            echo -e "${YELLOW}⚠️  بيانات القرآن غير مكتملة${NC}"
            return 1
        fi
    done
    
    echo -e "${GREEN}✅ بيانات القرآن جاهزة${NC}"
    return 0
}

# دالة لعرض الشعار
show_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║           📖 $APP_NAME v2.1                            ║"
    echo "║               عارض القرآن الكريم المتكامل              ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# دالة للتحقق من المتطلبات
check_requirements() {
    echo -e "${YELLOW}🔍 التحقق من المتطلبات...${NC}"
    
    local missing_tools=()
    
    # التحقق من الأدوات الأساسية
    for tool in python3; do
        if ! command -v "$tool" &>/dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    # التحقق من أدوات التحميل (تحذير فقط)
    for tool in wget curl unzip; do
        if ! command -v "$tool" &>/dev/null; then
            echo -e "${YELLOW}⚠️  $tool غير مثبت (مطلوب لتحميل البيانات)${NC}"
        fi
    done
    
    if [ ${#missing_tools[@]} -ne 0 ]; then
        echo -e "${RED}❌ الأدوات التالية غير مثبتة: ${missing_tools[*]}${NC}"
        echo -e "${YELLOW}📥 يرجى تثبيتها باستخدام:${NC}"
        echo -e "   Ubuntu/Debian: sudo apt install ${missing_tools[*]}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ جميع المتطلبات الأساسية متوفرة${NC}"
}

# دالة رئيسية
main() {
    show_banner
    check_requirements
    
    # التحقق من بيانات القرآن وتحميلها إذا لزم الأمر
    if ! check_quran_data; then
        echo -e "${YELLOW}📥 بيانات القرآن غير موجودة، جاري التحميل...${NC}"
        if download_quran_data; then
            echo -e "${GREEN}✅ تم إعداد البيانات بنجاح${NC}"
        else
            echo -e "${RED}❌ فشل في تحميل بيانات القرآن${NC}"
            echo -e "${YELLOW}💡 يمكنك تحميلها يدوياً من:${NC}"
            echo -e "   $QURAN_DATA_URL"
            exit 1
        fi
    fi
    
    # العثور على منفذ متاح
    while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null; do
        echo -e "${YELLOW}⚠️  المنفذ $PORT مشغول، جرب منفذ آخر...${NC}"
        PORT=$((PORT + 1))
    done
    
    echo ""
    echo -e "${BLUE}📊 معلومات التشغيل:${NC}"
    echo -e "📂 مجلد التطبيق: $SCRIPT_DIR"
    echo -e "📚 بيانات القرآن: $QURAN_DATA_DIR"
    echo -e "🌐 المنفذ: $PORT"
    echo -e "🖥️  العنوان: http://localhost:$PORT"
    echo ""
    
    # الانتقال لمجلد الواجهة وتشغيل الخادم
    cd "$WWW_DIR"
    
    # فتح المتصفح
    echo -e "${YELLOW}🌐 فتح المتصفح...${NC}"
    if command -v xdg-open &>/dev/null; then
        xdg-open "http://localhost:$PORT" >/dev/null 2>&1 &
    elif command -v open &>/dev/null; then
        open "http://localhost:$PORT" >/dev/null 2>&1 &
    fi
    
    echo -e "${GREEN}🚀 تشغيل خادم القرآن الكريم...${NC}"
    echo -e "${YELLOW}📖 جاري التشغيل على: http://localhost:$PORT${NC}"
    echo -e "${YELLOW}⏹️  لإيقاف الخادم، اضغط Ctrl+C${NC}"
    echo ""
    
    # تشغيل الخادم
    python3 -m http.server $PORT --bind 127.0.0.1
}

# معالجة الإشارات
trap 'echo -e "\n${YELLOW}🛑 إيقاف التطبيق...${NC}"; exit 0' INT TERM

# التشغيل
main "$@"
