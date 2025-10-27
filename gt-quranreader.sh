#!/bin/bash
# GT-QURANREADER - عارض القرآن الكريم
# الإصدار: 2.7 - إصلاح مشاكل المسارات والروابط

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WWW_DIR="$SCRIPT_DIR/www"
QURAN_DATA_DIR="$WWW_DIR/quran-data"
QURAN_DATA_LINK="$WWW_DIR/quran_data"  # الرابط الرمزي للموقع
QURAN_DATA_URL="https://github.com/rn0x/Quran-Data/archive/refs/heads/version-2.0.zip"
PORT=8787
APP_NAME="GT-QURANREADER"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# دالة لإنشاء الرابط الرمزي
create_symbolic_link() {
    echo -e "${YELLOW}🔗 إنشاء رابط رمزي للمسارات...${NC}"

    # حذف الرابط القديم إذا كان موجوداً
    if [ -L "$QURAN_DATA_LINK" ]; then
        rm -f "$QURAN_DATA_LINK"
        echo -e "${GREEN}✅ تم إزالة الرابط الرمزي القديم${NC}"
    fi

    # إنشاء الرابط الرمزي الجديد
    if ln -s "$QURAN_DATA_DIR" "$QURAN_DATA_LINK"; then
        echo -e "${GREEN}✅ تم إنشاء الرابط الرمزي: $QURAN_DATA_LINK -> $QURAN_DATA_DIR${NC}"
        return 0
    else
        echo -e "${RED}❌ فشل في إنشاء الرابط الرمزي${NC}"
        return 1
    fi
}

# دالة للتحقق من المنفذ
check_port() {
    local port=$1
    if command -v ss &>/dev/null; then
        ss -tulpn | grep -q ":$port " && return 0
    elif command -v netstat &>/dev/null; then
        netstat -tulpn 2>/dev/null | grep -q ":$port " && return 0
    else
        if python3 -c "import socket; s=socket.socket(); s.bind(('', $port))" 2>/dev/null; then
            return 1
        else
            return 0
        fi
    fi
    return 1
}

# دالة للبحث عن منفذ متاح
find_available_port() {
    local start_port=$1
    local port=$start_port

    while check_port $port; do
        echo -e "${YELLOW}⚠️  المنفذ $port مشغول، جرب منفذ $((port + 1))${NC}"
        port=$((port + 1))
        if [ $port -gt 9000 ]; then
            echo -e "${RED}❌ لم أستطع العثور على منفذ متاح${NC}"
            exit 1
        fi
    done
    echo $port
}

# دالة لتحميل بيانات القرآن
download_quran_data() {
    echo -e "${YELLOW}📥 جاري تحميل بيانات القرآن...${NC}"

    TEMP_DIR=$(mktemp -d)
    echo -e "${BLUE}📁 المجلد المؤقت: $TEMP_DIR${NC}"

    echo -e "${YELLOW}⬇️  جاري التحميل من $QURAN_DATA_URL${NC}"
    if command -v wget &>/dev/null; then
        echo -e "${YELLOW}🔽 استخدام wget لتنزيل...${NC}"
        if ! wget --progress=bar:force "$QURAN_DATA_URL" -O "$TEMP_DIR/quran-data.zip"; then
            echo -e "${RED}❌ فشل في تحميل البيانات${NC}"
            return 1
        fi
    elif command -v curl &>/dev/null; then
        echo -e "${YELLOW}🔽 استخدام curl لتنزيل...${NC}"
        if ! curl -L --progress-bar "$QURAN_DATA_URL" -o "$TEMP_DIR/quran-data.zip"; then
            echo -e "${RED}❌ فشل في تحميل البيانات${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ لم يتم العثور على wget أو curl${NC}"
        return 1
    fi

    echo -e "${YELLOW}🗜  فك الضغط...${NC}"
    if command -v unzip &>/dev/null; then
        if ! unzip -q "$TEMP_DIR/quran-data.zip" -d "$TEMP_DIR"; then
            echo -e "${RED}❌ فشل في فك الضغط${NC}"
            return 1
        fi

        EXTRACTED_DIR=""
        POSSIBLE_DIRS=(
            "$TEMP_DIR/Quran-Data-version-2.0"
            "$TEMP_DIR/Quran-Data-main"
            "$TEMP_DIR/quran-data-version-2.0"
            "$TEMP_DIR/version-2.0"
            "$TEMP_DIR/main"
        )

        for dir in "${POSSIBLE_DIRS[@]}"; do
            if [ -d "$dir" ]; then
                EXTRACTED_DIR="$dir"
                echo -e "${GREEN}✅ وجدت البيانات في: $EXTRACTED_DIR${NC}"
                break
            fi
        done

        if [ -z "$EXTRACTED_DIR" ]; then
            echo -e "${RED}❌ لم أستطع العثور على البيانات بعد فك الضغط${NC}"
            return 1
        fi

        echo -e "${YELLOW}📁 إنشاء هيكل البيانات...${NC}"
        mkdir -p "$QURAN_DATA_DIR"

        echo -e "${YELLOW}📄 جاري نسخ الملفات...${NC}"

        if cp -r "$EXTRACTED_DIR"/* "$QURAN_DATA_DIR"/ 2>/dev/null; then
            echo -e "${GREEN}✅ تم نسخ جميع الملفات بنجاح${NC}"
        else
            echo -e "${YELLOW}⚠️  محاولة نسخ الملفات بشكل منفرد...${NC}"
            for item in "$EXTRACTED_DIR"/*; do
                if [ -e "$item" ]; then
                    cp -r "$item" "$QURAN_DATA_DIR"/ 2>/dev/null && \
                    echo -e "${GREEN}✅ تم نسخ $(basename "$item")${NC}"
                fi
            done
        fi

        # التحقق من الملفات الأساسية
        echo -e "${YELLOW}🔍 التحقق من الملفات الأساسية...${NC}"

        # التحقق من وجود الصور
        if [ -d "$QURAN_DATA_DIR/quran_image" ]; then
            IMAGE_COUNT=$(find "$QURAN_DATA_DIR/quran_image" -name "*.png" -o -name "*.jpg" | wc -l)
            echo -e "${GREEN}✅ تم العثور على $IMAGE_COUNT صورة${NC}"
        else
            echo -e "${YELLOW}⚠️  لم يتم العثور على مجلد الصور${NC}"
        fi

        # التحقق من ملفات JSON
        JSON_COUNT=$(find "$QURAN_DATA_DIR" -name "*.json" | wc -l)
        echo -e "${GREEN}✅ تم العثور على $JSON_COUNT ملف JSON${NC}"

        DATA_SIZE=$(du -sh "$QURAN_DATA_DIR" 2>/dev/null | cut -f1 || echo "0")
        FILE_COUNT=$(find "$QURAN_DATA_DIR" -type f 2>/dev/null | wc -l || echo "0")
        echo -e "${BLUE}📊 حجم البيانات: $DATA_SIZE${NC}"
        echo -e "${BLUE}📊 عدد الملفات: $FILE_COUNT${NC}"

        if [ "$FILE_COUNT" -gt 0 ]; then
            echo -e "${GREEN}✅ البيانات جاهزة للاستخدام${NC}"
        else
            echo -e "${RED}❌ لم يتم نسخ أي ملفات${NC}"
            return 1
        fi

    else
        echo -e "${RED}❌ unzip غير مثبت${NC}"
        return 1
    fi

    echo -e "${YELLOW}🧹 تنظيف الملفات المؤقتة...${NC}"
    rm -rf "$TEMP_DIR"
    echo -e "${GREEN}✅ اكتمل تحميل البيانات${NC}"
    return 0
}

# دالة للتحقق من بيانات القرآن
check_quran_data() {
    if [ -d "$QURAN_DATA_DIR" ]; then
        FILE_COUNT=$(find "$QURAN_DATA_DIR" -type f 2>/dev/null | wc -l)
        if [ "$FILE_COUNT" -gt 0 ]; then
            return 0
        else
            echo -e "${YELLOW}⚠️  المجلد موجود لكنه فارغ${NC}"
            return 1
        fi
    else
        return 1
    fi
}

# دالة لعرض البانر
show_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║           📖 $APP_NAME - Auto Fetcher                   ║"
    echo "║               Fetch quran-data if missing                ║"
    echo "║                                                          ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# دالة للتحقق من المتطلبات
check_requirements() {
    echo -e "${YELLOW}🔍 التحقق من المتطلبات...${NC}"

    if ! command -v python3 &>/dev/null; then
        echo -e "${RED}❌ python3 غير مثبت${NC}"
        exit 1
    fi

    for tool in wget curl unzip; do
        if ! command -v "$tool" &>/dev/null; then
            echo -e "${YELLOW}⚠️  $tool غير مثبت (مطلوب لتحميل البيانات)${NC}"
        fi
    done

    echo -e "${GREEN}✅ جميع المتطلبات الأساسية متوفرة${NC}"
}

# دالة للتحقق من هيكل الموقع
check_www_structure() {
    echo -e "${YELLOW}🔍 التحقق من هيكل الموقع...${NC}"

    if [ ! -d "$WWW_DIR" ]; then
        echo -e "${RED}❌ مجلد www غير موجود${NC}"
        return 1
    fi

    if [ ! -f "$WWW_DIR/index.html" ]; then
        echo -e "${YELLOW}⚠️  ملف index.html غير موجود في www/${NC}"
    fi

    echo -e "${GREEN}✅ هيكل الموقع صحيح${NC}"
}

# دالة لقتل العملية التي تشغل المنفذ
kill_port_process() {
    local port=$1
    local pid=""

    if command -v ss &>/dev/null; then
        pid=$(ss -tulpn | grep ":$port " | awk '{print $7}' | cut -d= -f2 | cut -d, -f1 | head -1)
    elif command -v netstat &>/dev/null; then
        pid=$(netstat -tulpn 2>/dev/null | grep ":$port " | awk '{print $7}' | cut -d/ -f1 | head -1)
    fi

    if [ -n "$pid" ] && [ "$pid" != "-" ]; then
        echo -e "${YELLOW}🛑 قتل العملية $pid التي تشغل المنفذ $port${NC}"
        kill -9 "$pid" 2>/dev/null
        sleep 2
    fi
}

# الدالة الرئيسية
main() {
    show_banner
    check_requirements
    check_www_structure

    if ! check_quran_data; then
        echo -e "${YELLOW}⚠️  $QURAN_DATA_DIR غير موجود أو غير مكتمل. سنحاول تنزيله...${NC}"
        echo -e "${YELLOW}➡ محاولة تنزيل الأرشيف ZIP من المصدر: $QURAN_DATA_URL${NC}"

        if download_quran_data; then
            echo -e "${GREEN}✅ تم تنزيل quran-data وفك الضغط ووضعه في: $QURAN_DATA_DIR${NC}"
        else
            echo -e "${RED}❌ فشل في تحميل بيانات القرآن${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ $QURAN_DATA_DIR موجود وجاهز.${NC}"
    fi

    # إنشاء الرابط الرمزي
    if ! create_symbolic_link; then
        echo -e "${RED}❌ فشل في إنشاء الرابط الرمزي، قد لا تعمل بعض الصفحات${NC}"
    fi

    # البحث عن منفذ متاح
    echo -e "${YELLOW}🔍 البحث عن منفذ متاح...${NC}"
    PORT=$(find_available_port $PORT)

    if [ $PORT -ne 8787 ]; then
        kill_port_process 8787
        if ! check_port 8787; then
            PORT=8787
            echo -e "${GREEN}✅ المنفذ 8787 متاح الآن${NC}"
        fi
    fi

    echo ""
    echo -e "${GREEN}🚀 تشغيل الخادم...${NC}"
    echo -e "${YELLOW}🌐 افتح المتصفح: http://localhost:$PORT${NC}"
    echo -e "${YELLOW}⏹️  لإيقاف الخادم اضغط Ctrl+C${NC}"
    echo ""

    # عرض معلومات المسارات للمستخدم
    echo -e "${BLUE}📁 معلومات المسارات:${NC}"
    echo -e "   📂 البيانات الفعلية: $QURAN_DATA_DIR"
    echo -e "   🔗 الرابط الرمزي: $QURAN_DATA_LINK"
    echo -e "   🌐 المسار في المتصفح: /quran_data/"

    cd "$WWW_DIR"

    # فتح المتصفح بعد تأخير بسيط
    (
        sleep 3
        if command -v xdg-open &>/dev/null; then
            xdg-open "http://localhost:$PORT" >/dev/null 2>&1
        elif command -v gnome-open &>/dev/null; then
            gnome-open "http://localhost:$PORT" >/dev/null 2>&1
        fi
    ) &

    # تشغيل الخادم
    echo -e "${BLUE}📍 مجلد الخادم: $WWW_DIR${NC}"
    echo -e "${BLUE}📍 المنفذ: $PORT${NC}"
    python3 -m http.server "$PORT" --bind 127.0.0.1
}

# معالجة الإشارات
trap 'echo -e "\n${YELLOW}🛑 إيقاف التطبيق...${NC}"; exit 0' INT TERM

main "$@"
