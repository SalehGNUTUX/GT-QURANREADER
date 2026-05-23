#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
#  GT-QURANREADER v4.0 — سكريبت البناء والتحزيم الشامل (monorepo)
#  يبني: AppImage · DEB · RPM · Flatpak · APK (Android)
#  يدعم: Ubuntu/Debian · Fedora/RHEL · Arch Linux · openSUSE
#  المطور: SalehGNUTUX
#  الرخص: GPL-3.0-or-later (Desktop)  ·  AGPL-3.0-or-later (Web)
#
#  الاستخدام:
#    ./scripts/build-packages.sh [هدف]
#
#  الأهداف:
#    all          ← كل الحزم (Linux + Android)          [افتراضي]
#    linux        ← AppImage + DEB + RPM
#    appimage     ← AppImage فقط
#    deb          ← حزمة DEB فقط
#    rpm          ← حزمة RPM (من DEB موجود)
#    flatpak      ← حزمة Flatpak
#    apk          ← APK أندرويد (من apps/web/android/)
#    web          ← بناء PWA فقط (apps/web/dist/)
#    desktop-build ← بناء Electron فقط (بدون تحزيم)
#    icons        ← (إعادة) توليد مقاسات الأيقونة
#    check-deps   ← فحص المتطلبات فقط (بدون تثبيت)
#    install-deps ← تثبيت المتطلبات المفقودة فقط
# ══════════════════════════════════════════════════════════════════════════════
set -uo pipefail

# ─── المسارات الأساسية (monorepo) ─────────────────────────────────────────────
cd "$(dirname "$0")/.."
ROOT_DIR="$(pwd)"
RELEASE_DIR="$ROOT_DIR/release"

DESKTOP_DIR="$ROOT_DIR/apps/desktop"
WEB_DIR="$ROOT_DIR/apps/web"

DESKTOP_DIST="$DESKTOP_DIR/dist"
DESKTOP_RELEASE="$DESKTOP_DIR/release"
WEB_DIST="$WEB_DIR/dist"
WEB_ANDROID="$WEB_DIR/android"

ICONS_DIR="$DESKTOP_DIR/build/icons"
ICON_SRC="$DESKTOP_DIR/build/icon.png"

APP_NAME="gt-quranreader"
APP_DISPLAY="GT-QURANREADER"
VERSION="$(node -pe "require('./package.json').version" 2>/dev/null || echo "4.0.0")"
ARCH="$(uname -m)"

BUILT=()
FAILED=()
PKGS_INSTALLED=()

mkdir -p "$RELEASE_DIR"

# ─── ألوان الطرفية ───────────────────────────────────────────────────────────
if [ -t 1 ]; then
  GRN='\033[0;32m' RED='\033[0;31m' YLW='\033[1;33m'
  BLU='\033[0;34m' CYN='\033[0;36m' GRY='\033[0;37m' NC='\033[0m'
else
  GRN='' RED='' YLW='' BLU='' CYN='' GRY='' NC=''
fi

ok()    { echo -e "${GRN}  ✅ $*${NC}"; }
err()   { echo -e "${RED}  ❌ $*${NC}"; }
inf()   { echo -e "${BLU}  ℹ  $*${NC}"; }
wrn()   { echo -e "${YLW}  ⚠  $*${NC}"; }
step()  { echo -e "${CYN}▶ $*${NC}"; }
found() { printf "  ${GRN}✓${NC}  %-28s ${GRY}%s${NC}\n" "$1" "$2"; }
miss()  { printf "  ${YLW}✗${NC}  %-28s ${YLW}%s${NC}\n" "$1" "$2"; }

echo ""
echo -e "${BLU}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLU}  ${APP_DISPLAY} ${VERSION} — بناء تلقائي للحزم${NC}"
echo -e "${BLU}  المعمارية: ${ARCH}  |  المطور: SalehGNUTUX${NC}"
echo -e "${BLU}══════════════════════════════════════════════════════════════${NC}"
echo ""

# ══════════════════════════════════════════════════════════════════════════════
#  كشف التوزيعة
# ══════════════════════════════════════════════════════════════════════════════
detect_distro() {
  local ID="" ID_LIKE=""
  if [ -f /etc/os-release ]; then
    ID=$(grep -oP '(?<=^ID=)[^\n]+' /etc/os-release | tr -d '"' | tr '[:upper:]' '[:lower:]')
    ID_LIKE=$(grep -oP '(?<=^ID_LIKE=)[^\n]+' /etc/os-release | tr -d '"' | tr '[:upper:]' '[:lower:]')
  fi
  case "$ID" in
    ubuntu|debian|linuxmint|pop|elementary|zorin|kali|mxlinux|neon) echo "debian" ;;
    fedora|rhel|centos|rocky|almalinux|nobara) echo "fedora" ;;
    arch|manjaro|endeavouros|garuda|artix) echo "arch" ;;
    opensuse*|suse*) echo "suse" ;;
    *)
      case "$ID_LIKE" in
        *debian*|*ubuntu*) echo "debian" ;;
        *fedora*|*rhel*)   echo "fedora" ;;
        *arch*)            echo "arch"   ;;
        *suse*)            echo "suse"   ;;
        *)
          if   [ -f /etc/debian_version ];  then echo "debian"
          elif [ -f /etc/fedora-release ];  then echo "fedora"
          elif [ -f /etc/redhat-release ];  then echo "fedora"
          elif [ -f /etc/arch-release ];    then echo "arch"
          elif [ -f /etc/SUSE-brand ];      then echo "suse"
          else echo "unknown"
          fi ;;
      esac ;;
  esac
}

DISTRO="$(detect_distro)"
OS_NAME=$(grep -oP '(?<=^PRETTY_NAME=)[^\n]+' /etc/os-release 2>/dev/null | tr -d '"' || echo "$DISTRO")
inf "التوزيعة: ${OS_NAME} (عائلة: ${DISTRO})"

SUDO=""
command -v sudo &>/dev/null && SUDO="sudo"

# ══════════════════════════════════════════════════════════════════════════════
#  أدوات الفحص الذكي
# ══════════════════════════════════════════════════════════════════════════════
has_cmd() { command -v "$1" &>/dev/null; }

pkg_installed() {
  local PKG="$1"
  case "$DISTRO" in
    debian) dpkg -s "$PKG" &>/dev/null 2>&1 ;;
    fedora) rpm -q "$PKG" &>/dev/null 2>&1 ;;
    arch)   pacman -Q "$PKG" &>/dev/null 2>&1 ;;
    suse)   rpm -q "$PKG" &>/dev/null 2>&1 ;;
    *)      return 1 ;;
  esac
}

# Node.js ≥20 (المشروع يتطلب ذلك)
node_ok() {
  has_cmd node || return 1
  local VER
  VER=$(node -e "process.exit(parseInt(process.version.slice(1)) >= 20 ? 0 : 1)" 2>/dev/null; echo $?)
  [ "$VER" = "0" ]
}

declare -A TOOL_STATUS=()
declare -a TO_INSTALL=()

check_tool() {
  local LABEL="$1" CMD="$2" PKG="$3" EXTRA="${4:-}"
  if has_cmd "$CMD" || { [ -n "$EXTRA" ] && has_cmd "$EXTRA"; }; then
    found "$LABEL" "$(command -v "$CMD" 2>/dev/null || command -v "$EXTRA" 2>/dev/null)"
    TOOL_STATUS["$CMD"]="ok"
    return 0
  fi
  if pkg_installed "$PKG"; then
    found "$LABEL" "(مثبّت — قد يحتاج reload)"
    TOOL_STATUS["$CMD"]="ok"
    return 0
  fi
  miss "$LABEL" "مفقود → سيُثبَّت: $PKG"
  TOOL_STATUS["$CMD"]="missing"
  TO_INSTALL+=("$PKG")
  return 1
}

check_node() {
  if node_ok; then
    local VER; VER=$(node --version 2>/dev/null)
    found "Node.js ≥20" "$VER"
    TOOL_STATUS["node"]="ok"; return 0
  elif has_cmd node; then
    local VER; VER=$(node --version 2>/dev/null)
    miss "Node.js ≥20" "إصدار قديم ($VER) — يُحتاج ≥20"
    TOOL_STATUS["node"]="old"; return 1
  else
    miss "Node.js ≥20" "مفقود"
    TOOL_STATUS["node"]="missing"; return 1
  fi
}

# AppImage تحتاج libfuse2 — الاسم يختلف على Ubuntu 24+
check_fuse() {
  if ldconfig -p 2>/dev/null | grep -q "libfuse.so.2"; then
    found "libfuse2" "(مكتبة موجودة)"
    TOOL_STATUS["libfuse"]="ok"; return 0
  fi
  if pkg_installed "libfuse2t64" 2>/dev/null || pkg_installed "libfuse2" 2>/dev/null; then
    found "libfuse2" "(مثبّت)"
    TOOL_STATUS["libfuse"]="ok"; return 0
  fi
  miss "libfuse2" "مطلوب لـ AppImage"
  TOOL_STATUS["libfuse"]="missing"
  if apt-cache show libfuse2t64 &>/dev/null 2>&1; then
    TO_INSTALL+=("libfuse2t64")
  elif apt-cache show libfuse2 &>/dev/null 2>&1; then
    TO_INSTALL+=("libfuse2")
  fi
}

check_rpm_tools() {
  if has_cmd rpmbuild; then
    found "rpmbuild" "$(command -v rpmbuild)"
    TOOL_STATUS["rpmbuild"]="ok"
  elif has_cmd alien; then
    found "alien (DEB→RPM)" "$(command -v alien)"
    TOOL_STATUS["rpmbuild"]="ok"
  else
    miss "rpmbuild / alien" "مطلوب لبناء RPM"
    TOOL_STATUS["rpmbuild"]="missing"
    case "$DISTRO" in
      debian) TO_INSTALL+=("rpm" "alien") ;;
      fedora) TO_INSTALL+=("rpm-build") ;;
      arch)   TO_INSTALL+=("rpm-tools") ;;
      suse)   TO_INSTALL+=("rpm-build") ;;
    esac
  fi
}

run_checks() {
  local TARGET="${1:-all}"
  TO_INSTALL=()
  step "فحص المتطلبات المطلوبة لـ: $TARGET"
  echo ""

  check_node
  if [ "${TOOL_STATUS[node]:-missing}" != "ok" ]; then
    case "$DISTRO" in
      debian|fedora|arch|suse) TO_INSTALL+=("nodejs") ;;
    esac
  fi
  check_tool "npm" "npm" "npm"
  check_tool "ImageMagick (convert)" "convert" "imagemagick" ""

  case "$TARGET" in
    all|linux|appimage)
      [ "$DISTRO" = debian ] && check_fuse ;;
  esac

  case "$TARGET" in
    all|linux|deb)
      case "$DISTRO" in
        debian)
          check_tool "fakeroot" "fakeroot" "fakeroot"
          check_tool "dpkg-deb" "dpkg-deb" "dpkg-dev"
          ;;
      esac ;;
  esac

  case "$TARGET" in
    all|linux|rpm)
      check_rpm_tools
      case "$DISTRO" in
        debian)
          has_cmd dpkg-deb || check_tool "dpkg-deb" "dpkg-deb" "dpkg-dev"
          has_cmd fakeroot  || check_tool "fakeroot" "fakeroot" "fakeroot"
          ;;
      esac ;;
  esac

  case "$TARGET" in
    all|flatpak)
      check_tool "flatpak-builder" "flatpak-builder" "flatpak-builder"
      check_tool "flatpak" "flatpak" "flatpak"
      ;;
  esac

  case "$TARGET" in
    all|apk)
      check_tool "Java (JDK 17+)" "java" \
        "$([ "$DISTRO" = debian ] && echo 'default-jdk-headless' || echo 'java-17-openjdk')"
      ;;
  esac

  check_tool "wget" "wget" "wget"
  check_tool "curl" "curl" "curl"

  echo ""
  if [ ${#TO_INSTALL[@]} -eq 0 ]; then
    ok "جميع المتطلبات جاهزة"
    return 0
  else
    wrn "${#TO_INSTALL[@]} حزمة مفقودة: ${TO_INSTALL[*]}"
    return 1
  fi
}

install_missing() {
  [ ${#TO_INSTALL[@]} -eq 0 ] && return 0
  local UNIQUE_PKGS=()
  declare -A SEEN=()
  for P in "${TO_INSTALL[@]}"; do
    [ -z "${SEEN[$P]:-}" ] && UNIQUE_PKGS+=("$P") && SEEN["$P"]=1
  done
  step "تثبيت ${#UNIQUE_PKGS[@]} حزمة: ${UNIQUE_PKGS[*]}"
  case "$DISTRO" in
    debian)
      $SUDO apt-get update -qq 2>/dev/null || true
      $SUDO apt-get install -y --no-install-recommends "${UNIQUE_PKGS[@]}" 2>&1 | \
        grep -E "(Setting up|already|error|E:)" || true ;;
    fedora)
      $SUDO dnf install -y "${UNIQUE_PKGS[@]}" 2>&1 | grep -E "(Installing|already|error)" || true ;;
    arch)
      $SUDO pacman -S --noconfirm --needed "${UNIQUE_PKGS[@]}" 2>&1 | \
        grep -E "(installing|already|error)" || true ;;
    suse)
      $SUDO zypper install -y --no-confirm "${UNIQUE_PKGS[@]}" 2>&1 | \
        grep -E "(Installing|already|error)" || true ;;
    *) err "توزيعة غير مدعومة — ثبّت يدوياً: ${UNIQUE_PKGS[*]}"; return 1 ;;
  esac
  local STILL_MISSING=()
  for PKG in "${UNIQUE_PKGS[@]}"; do
    pkg_installed "$PKG" 2>/dev/null || STILL_MISSING+=("$PKG")
  done
  if [ ${#STILL_MISSING[@]} -gt 0 ]; then
    wrn "لم يُثبَّت: ${STILL_MISSING[*]}"
  else
    ok "تم تثبيت كل الحزم"
    PKGS_INSTALLED+=("${UNIQUE_PKGS[@]}")
  fi
}

ensure_deps() {
  local TARGET="${1:-all}"
  run_checks "$TARGET"
  local NEEDS_INSTALL=$?
  [ $NEEDS_INSTALL -ne 0 ] && install_missing
  echo ""
}

# ══════════════════════════════════════════════════════════════════════════════
#  توليد الأيقونات
# ══════════════════════════════════════════════════════════════════════════════
generate_icons() {
  if [ ! -f "$ICON_SRC" ]; then
    err "الأيقونة غير موجودة: $ICON_SRC"
    return 1
  fi
  local NEED_REGEN=false
  if [ ! -f "$ICONS_DIR/512x512.png" ]; then
    NEED_REGEN=true
  elif [ "$ICON_SRC" -nt "$ICONS_DIR/512x512.png" ]; then
    NEED_REGEN=true
    inf "الأيقونة المصدر أُحدِّثت — إعادة توليد المقاسات..."
  fi
  if [ "$NEED_REGEN" = false ]; then
    found "أيقونات" "$(ls "$ICONS_DIR"/*.png 2>/dev/null | wc -l) مقاس موجود"
    return 0
  fi
  step "توليد مقاسات الأيقونة..."
  mkdir -p "$ICONS_DIR"
  if has_cmd convert; then
    for SIZE in 16 24 32 48 64 96 128 256 512 1024; do
      convert "$ICON_SRC" -resize ${SIZE}x${SIZE}^ \
        -gravity center -extent ${SIZE}x${SIZE} \
        "$ICONS_DIR/${SIZE}x${SIZE}.png" 2>/dev/null && \
        printf "  ${GRN}✓${NC} ${SIZE}×${SIZE}\n"
    done
    ok "تم توليد الأيقونات → $ICONS_DIR"
  else
    wrn "ImageMagick غير متوفر — نسخ الأيقونة الأصلية بدلاً من تحجيمها"
    for SIZE in 16 32 48 64 128 256 512; do
      cp "$ICON_SRC" "$ICONS_DIR/${SIZE}x${SIZE}.png"
    done
  fi
}

# ══════════════════════════════════════════════════════════════════════════════
#  بناء node_modules + الحزم (monorepo workspaces)
# ══════════════════════════════════════════════════════════════════════════════
install_deps_npm() {
  if [ ! -d "$ROOT_DIR/node_modules" ] || [ "$ROOT_DIR/package.json" -nt "$ROOT_DIR/node_modules/.package-lock.json" ] 2>/dev/null; then
    inf "تثبيت تبعيات الـ monorepo..."
    npm install --prefer-offline 2>&1 | tail -3
  else
    found "node_modules" "جاهزة"
  fi
}

build_desktop_renderer() {
  step "بناء renderer لسطح المكتب..."
  install_deps_npm

  local NEEDS_BUILD=true
  if [ -f "$DESKTOP_DIST/index.html" ]; then
    local NEWER
    NEWER=$(find "$DESKTOP_DIR/src" "$DESKTOP_DIR/electron" "$ROOT_DIR/packages" \
      "$DESKTOP_DIR/index.html" "$DESKTOP_DIR/vite.config.ts" \
      -newer "$DESKTOP_DIST/index.html" 2>/dev/null | head -1)
    if [ -z "$NEWER" ]; then
      found "apps/desktop/dist/" "محدَّث — لا حاجة لإعادة البناء"
      NEEDS_BUILD=false
    fi
  fi

  if [ "$NEEDS_BUILD" = true ]; then
    npm --workspace=apps/desktop run build 2>&1 | grep -E "(✓|error|warning|built in)" || true
    if [ ! -d "$DESKTOP_DIST" ]; then
      err "فشل بناء renderer (apps/desktop/dist/ غير موجود)"
      exit 1
    fi
    ok "تم بناء renderer → $DESKTOP_DIST"
  fi
}

build_web() {
  step "بناء PWA (apps/web)..."
  install_deps_npm
  local NEEDS_BUILD=true
  if [ -f "$WEB_DIST/index.html" ]; then
    local NEWER
    NEWER=$(find "$WEB_DIR/src" "$ROOT_DIR/packages" "$WEB_DIR/vite.config.ts" \
      -newer "$WEB_DIST/index.html" 2>/dev/null | head -1)
    [ -z "$NEWER" ] && { found "apps/web/dist/" "محدَّث"; NEEDS_BUILD=false; }
  fi
  if [ "$NEEDS_BUILD" = true ]; then
    npm --workspace=apps/web run build 2>&1 | grep -E "(✓|error|warning|built in|precache)" || true
    [ ! -d "$WEB_DIST" ] && { err "فشل بناء Web"; exit 1; }
    ok "تم بناء Web → $WEB_DIST"
  fi
}

# ══════════════════════════════════════════════════════════════════════════════
#  بناء AppImage + DEB عبر electron-builder
# ══════════════════════════════════════════════════════════════════════════════
build_electron_packages() {
  local TARGETS="${1:-AppImage deb}"
  step "بناء حزم Electron: $TARGETS"
  cd "$DESKTOP_DIR"

  npx electron-builder --linux $TARGETS 2>&1 | grep -E "(building|built|error|packaging|•|⨯)" || true
  cd "$ROOT_DIR"

  # انقل الحزم إلى الـ release الجذر
  for T in $TARGETS; do
    local EXT="${T,,}"
    [ "$EXT" = "appimage" ] && EXT="AppImage"
    local PKG
    PKG=$(find "$DESKTOP_RELEASE" -maxdepth 1 -name "*.${EXT}" 2>/dev/null | head -1)
    if [ -n "$PKG" ]; then
      cp "$PKG" "$RELEASE_DIR/"
      ok "${EXT}: $(basename "$PKG") ($(du -sh "$PKG" | cut -f1))"
      BUILT+=("$EXT: $(basename "$PKG")")
    else
      err "${EXT}: فشل البناء"
      FAILED+=("$EXT")
    fi
  done
}

# ══════════════════════════════════════════════════════════════════════════════
#  بناء RPM (من DEB)
# ══════════════════════════════════════════════════════════════════════════════
build_rpm() {
  step "بناء حزمة RPM..."

  local DEB
  DEB=$(find "$RELEASE_DIR" -maxdepth 1 -name "*.deb" | head -1)
  if [ -z "$DEB" ]; then
    inf "لا يوجد DEB — بناؤه أولاً..."
    build_electron_packages "deb"
    DEB=$(find "$RELEASE_DIR" -maxdepth 1 -name "*.deb" | head -1)
    [ -z "$DEB" ] && { err "فشل بناء DEB"; FAILED+=("RPM"); return 1; }
  fi

  if has_cmd rpmbuild && has_cmd dpkg-deb; then
    inf "استخدام rpmbuild..."
    local WORK=/tmp/gt-qr-rpm-build
    rm -rf "$WORK"
    mkdir -p "$WORK"/{SOURCES,SPECS,BUILD,BUILDROOT,RPMS,SRPMS}

    local PKG_DIR="$WORK/pkg"
    mkdir -p "$PKG_DIR"
    dpkg-deb -x "$DEB" "$PKG_DIR" 2>/dev/null || { err "dpkg-deb فشل"; FAILED+=("RPM"); return 1; }

    tar czf "$WORK/SOURCES/${APP_NAME}-${VERSION}.tar.gz" \
      -C "$PKG_DIR" --transform "s|^\./|${APP_NAME}-${VERSION}/|" . 2>/dev/null

    cat > "$WORK/SPECS/${APP_NAME}.spec" << SPEC
Name:           ${APP_NAME}
Version:        ${VERSION}
Release:        1
Summary:        ${APP_DISPLAY} - Quran Reader (4 riwayat + verse highlighting)
License:        GPL-3.0-or-later
URL:            https://github.com/SalehGNUTUX/GT-QURANREADER
BuildArch:      x86_64
AutoReqProv:    no
Source0:        ${APP_NAME}-${VERSION}.tar.gz

%description
${APP_DISPLAY} ${VERSION} — عارض القرآن الكريم
4 روايات (ورش/حفص/قالون/الدوري)، 13+ قارئاً، تظليل آية متزامن مع التلاوة،
بحث ذكي بتطبيع عربي كامل، يعمل دون اتصال بعد التنزيل.
Built with Electron + React + TypeScript.

%prep
%setup -q -c

%install
cp -a "${APP_NAME}-${VERSION}/." %{buildroot}/

%files
%defattr(-,root,root,-)
/opt/${APP_DISPLAY}
%dir /usr/share/applications
/usr/share/applications/${APP_NAME}.desktop
/usr/share/icons
/usr/share/doc

%post
update-desktop-database /usr/share/applications/ 2>/dev/null || true
gtk-update-icon-cache -f -t /usr/share/icons/hicolor/ 2>/dev/null || true

%postun
update-desktop-database /usr/share/applications/ 2>/dev/null || true

%changelog
* $(LC_ALL=C date "+%a %b %d %Y") SalehGNUTUX <gnutux.arabic@gmail.com> - ${VERSION}-1
- ${APP_DISPLAY} ${VERSION} — Electron + React build
SPEC

    rpmbuild --define "_topdir $WORK" -bb "$WORK/SPECS/${APP_NAME}.spec" 2>&1 | tail -5

    local RPM_FILE
    RPM_FILE=$(find "$WORK/RPMS" -name "*.rpm" 2>/dev/null | head -1)
    if [ -n "$RPM_FILE" ]; then
      local DEST="$RELEASE_DIR/${APP_DISPLAY}-${VERSION}-${ARCH}.rpm"
      cp "$RPM_FILE" "$DEST"
      rm -rf "$WORK"
      ok "RPM: $(basename "$DEST") ($(du -sh "$DEST" | cut -f1))"
      BUILT+=("RPM: $(basename "$DEST")")
      return 0
    fi
    wrn "rpmbuild لم ينجح — محاولة alien..."
  fi

  if has_cmd alien; then
    inf "استخدام alien (DEB→RPM)..."
    local TMP_DIR
    TMP_DIR=$(mktemp -d /tmp/gt-qr-alien-XXXX)
    cp "$DEB" "$TMP_DIR/"
    cd "$TMP_DIR"
    fakeroot alien --to-rpm --scripts "$(basename "$DEB")" 2>&1 | tail -3
    local RPM_FILE
    RPM_FILE=$(find "$TMP_DIR" -name "*.rpm" 2>/dev/null | head -1)
    cd "$ROOT_DIR"
    if [ -n "$RPM_FILE" ]; then
      local DEST="$RELEASE_DIR/${APP_DISPLAY}-${VERSION}-${ARCH}.rpm"
      cp "$RPM_FILE" "$DEST"
      rm -rf "$TMP_DIR"
      ok "RPM: $(basename "$DEST")"
      BUILT+=("RPM: $(basename "$DEST")")
      return 0
    fi
    rm -rf "$TMP_DIR"
  fi

  err "تعذّر بناء RPM — ثبّت: rpmbuild (rpm-build) أو alien"
  FAILED+=("RPM")
}

# ══════════════════════════════════════════════════════════════════════════════
#  بناء Flatpak
# ══════════════════════════════════════════════════════════════════════════════
build_flatpak() {
  step "بناء حزمة Flatpak..."

  if ! has_cmd flatpak-builder; then
    err "flatpak-builder غير موجود"
    inf "Debian/Ubuntu: sudo apt install flatpak-builder"
    inf "Fedora:        sudo dnf install flatpak-builder"
    FAILED+=("Flatpak"); return 1
  fi

  local FLATPAK_MANIFEST="$ROOT_DIR/flatpak/com.gnutux.GTQuranReader.yml"
  if [ ! -f "$FLATPAK_MANIFEST" ]; then
    wrn "ملف manifest غير موجود: $FLATPAK_MANIFEST"
    inf "أنشئه أولاً قبل بناء Flatpak. مثال يستخدم AppImage موجوداً:"
    inf "  راجع scripts/flatpak-from-appimage.md"
    FAILED+=("Flatpak"); return 1
  fi

  local FLATPAK_OUT="$RELEASE_DIR/${APP_DISPLAY}-${VERSION}.flatpak"
  local FLATPAK_BUILD="$RELEASE_DIR/flatpak-build"
  local FLATPAK_REPO="$RELEASE_DIR/flatpak-repo"
  mkdir -p "$FLATPAK_BUILD" "$FLATPAK_REPO"

  flatpak-builder --force-clean --repo="$FLATPAK_REPO" "$FLATPAK_BUILD" "$FLATPAK_MANIFEST" 2>&1 | tail -10
  flatpak build-bundle "$FLATPAK_REPO" "$FLATPAK_OUT" com.gnutux.GTQuranReader 2>&1 | tail -5

  if [ -f "$FLATPAK_OUT" ]; then
    ok "Flatpak: $(basename "$FLATPAK_OUT") ($(du -sh "$FLATPAK_OUT" | cut -f1))"
    BUILT+=("Flatpak: $(basename "$FLATPAK_OUT")")
  else
    err "فشل بناء Flatpak"
    FAILED+=("Flatpak")
  fi
}

# ══════════════════════════════════════════════════════════════════════════════
#  بناء APK أندرويد (من apps/web/android/)
# ══════════════════════════════════════════════════════════════════════════════
build_apk() {
  step "بناء APK أندرويد..."

  if [ ! -d "$WEB_ANDROID" ]; then
    wrn "مجلد apps/web/android/ غير موجود — إنشاؤه عبر Capacitor..."
    cd "$WEB_DIR"
    npx cap add android 2>&1 | tail -5 || { err "فشل cap add android"; FAILED+=("APK"); return 1; }
    cd "$ROOT_DIR"
  fi

  local SDK_DIR="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
  if [ ! -d "$SDK_DIR" ]; then
    wrn "Android SDK غير موجود في $SDK_DIR"
    inf "ثبّت Android Studio أو SDK command-line tools:"
    inf "  https://developer.android.com/studio#command-tools"
    inf "  export ANDROID_HOME=\$HOME/Android/Sdk"
    FAILED+=("APK"); return 1
  fi
  export ANDROID_HOME="$SDK_DIR"
  export ANDROID_SDK_ROOT="$SDK_DIR"

  # مزامنة Capacitor (يستلزم build مسبق)
  cd "$WEB_DIR"
  inf "مزامنة Capacitor..."
  npx cap sync android 2>&1 | grep -E "(Sync|error|update)" || true

  chmod +x "$WEB_ANDROID/gradlew"
  cd "$WEB_ANDROID"

  inf "بناء Release APK..."
  if ./gradlew assembleRelease 2>&1 | tail -8; then
    # نقبل أيضاً app-release-unsigned.apk (يحتاج توقيع لاحقاً قبل النشر على Play Store)
    local APK_FILE
    APK_FILE=$(find "app/build/outputs/apk/release" -name "*.apk" 2>/dev/null | head -1)
    if [ -n "$APK_FILE" ]; then
      cd "$ROOT_DIR"
      mkdir -p "$RELEASE_DIR/android"
      local SUFFIX=""
      [[ "$APK_FILE" == *unsigned* ]] && SUFFIX="-unsigned"
      local DEST="$RELEASE_DIR/android/${APP_DISPLAY}-${VERSION}${SUFFIX}.apk"
      cp "$APK_FILE" "$DEST"
      ok "APK: $(basename "$DEST") ($(du -sh "$DEST" | cut -f1))"
      BUILT+=("APK: $(basename "$DEST")")
      return 0
    fi
  fi

  inf "Release فشل — محاولة Debug APK..."
  ./gradlew assembleDebug 2>&1 | tail -5
  local APK_FILE
  APK_FILE=$(find "app/build/outputs/apk/debug" -name "*.apk" 2>/dev/null | head -1)
  cd "$ROOT_DIR"
  if [ -n "$APK_FILE" ]; then
    mkdir -p "$RELEASE_DIR/android"
    cp "$APK_FILE" "$RELEASE_DIR/android/${APP_DISPLAY}-${VERSION}-debug.apk"
    ok "APK (debug): ${APP_DISPLAY}-${VERSION}-debug.apk"
    BUILT+=("APK-debug: ${APP_DISPLAY}-${VERSION}-debug.apk")
  else
    err "فشل بناء APK"
    FAILED+=("APK")
  fi
}

# ══════════════════════════════════════════════════════════════════════════════
#  التقرير النهائي
# ══════════════════════════════════════════════════════════════════════════════
print_report() {
  echo ""
  echo -e "${BLU}══════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLU}  تقرير البناء النهائي${NC}"
  echo -e "${BLU}══════════════════════════════════════════════════════════════${NC}"

  if [ ${#PKGS_INSTALLED[@]} -gt 0 ]; then
    echo -e "${CYN}  ↓ حزم جديدة ثُبِّتت: ${PKGS_INSTALLED[*]}${NC}"
  fi

  if [ ${#BUILT[@]} -gt 0 ]; then
    echo -e "${GRN}  ✅ تم بنجاح:${NC}"
    for b in "${BUILT[@]}"; do echo "     • $b"; done
  fi

  if [ ${#FAILED[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}  ❌ فشل:${NC}"
    for f in "${FAILED[@]}"; do echo "     • $f"; done
  fi

  echo ""
  echo -e "${GRY}  📁 ملفات الإصدار في: $RELEASE_DIR${NC}"
  find "$RELEASE_DIR" -maxdepth 2 \
    \( -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" \
       -o -name "*.apk" -o -name "*.flatpak" \) \
    2>/dev/null | sort | while read -r F; do
      printf "     ${GRN}%-8s${NC}  %s\n" "$(du -sh "$F" | cut -f1)" "$(basename "$F")"
    done

  echo ""
  echo -e "${YLW}  📋 التثبيت:${NC}"
  echo "     AppImage → chmod +x *.AppImage && ./*.AppImage"
  echo "     DEB      → sudo dpkg -i *.deb"
  echo "     RPM      → sudo rpm -i *.rpm  (أو: sudo dnf localinstall)"
  echo "     Flatpak  → flatpak install --user *.flatpak"
  echo "     APK      → adb install release/android/*.apk"
  echo ""
  echo -e "${BLU}══════════════════════════════════════════════════════════════${NC}"
}

# ══════════════════════════════════════════════════════════════════════════════
#  نقطة الدخول الرئيسية
# ══════════════════════════════════════════════════════════════════════════════
TARGET="${1:-all}"

case "$TARGET" in
  check-deps)   run_checks "all" ;;
  install-deps) run_checks "all"; install_missing ;;
  icons)        generate_icons ;;

  desktop-build)
    ensure_deps "build"
    build_desktop_renderer ;;

  web)
    ensure_deps "build"
    build_web
    print_report ;;

  appimage)
    ensure_deps "appimage"
    generate_icons
    build_desktop_renderer
    build_electron_packages "AppImage"
    print_report ;;

  deb)
    ensure_deps "deb"
    generate_icons
    build_desktop_renderer
    build_electron_packages "deb"
    print_report ;;

  rpm)
    ensure_deps "rpm"
    generate_icons
    build_desktop_renderer
    build_rpm
    print_report ;;

  flatpak)
    ensure_deps "flatpak"
    build_desktop_renderer
    build_flatpak
    print_report ;;

  apk)
    ensure_deps "apk"
    build_web
    build_apk
    print_report ;;

  linux)
    ensure_deps "linux"
    generate_icons
    build_desktop_renderer
    build_electron_packages "AppImage deb"
    build_rpm
    print_report ;;

  all)
    ensure_deps "all"
    generate_icons
    build_desktop_renderer
    build_web
    build_electron_packages "AppImage deb"
    build_rpm
    build_apk
    print_report ;;

  -h|--help|help)
    echo ""
    echo -e "${BLU}الاستخدام: $0 [هدف]${NC}"
    echo ""
    echo -e "${YLW}أهداف Linux:${NC}"
    echo "  linux        ← AppImage + DEB + RPM"
    echo "  appimage     ← AppImage فقط"
    echo "  deb          ← حزمة DEB (Ubuntu/Debian)"
    echo "  rpm          ← حزمة RPM (Fedora/RHEL)"
    echo "  flatpak      ← حزمة Flatpak"
    echo ""
    echo -e "${YLW}أهداف Web/Mobile:${NC}"
    echo "  web          ← بناء PWA (apps/web/dist/)"
    echo "  apk          ← APK أندرويد (يحتاج Android SDK)"
    echo ""
    echo -e "${YLW}متنوع:${NC}"
    echo "  all              ← كل الحزم (Linux + Web + Android)"
    echo "  desktop-build    ← بناء Electron فقط"
    echo "  icons            ← (إعادة) توليد مقاسات الأيقونة"
    echo "  check-deps       ← فحص المتطلبات (بدون تثبيت)"
    echo "  install-deps     ← تثبيت المتطلبات المفقودة فقط"
    echo ""
    echo -e "${GRY}الرخص: GPL-3.0 (Desktop) | AGPL-3.0 (Web)${NC}"
    echo "" ;;

  *)
    err "هدف غير معروف: $TARGET"
    echo "شغّل: $0 --help"
    exit 1 ;;
esac
