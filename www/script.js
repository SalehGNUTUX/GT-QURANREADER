class FontManager {
    constructor() {
        this.availableFonts = {
            'uthmanic': {
                name: 'الخط العثماني',
                family: 'UthmanicHafs',
                description: 'الخط الرسمي لمصحف المدينة المنورة',
                type: 'uthmanic'
            },
            'amiri': {
                name: 'خط أميري',
                family: 'AmiriQuran',
                description: 'خط واضح ومناسب للقراءة',
                type: 'modern'
            },
            'amiri-colored': {
                name: 'خط أميري ملون',
                family: 'AmiriQuranColored',
                description: 'خط ملون مع تشكيل واضح',
                type: 'colored'
            },
            'arbfonts-amiri': {
                name: 'خط أميري Arb',
                family: 'ArbFONTSAmiri',
                description: 'خط أميري بديل',
                type: 'modern'
            }
        };

        this.currentFont = 'uthmanic';
    }

    applyFont(fontKey) {
        const font = this.availableFonts[fontKey];
        if (font) {
            document.documentElement.style.setProperty('--quran-font-family', font.family);
            document.body.classList.remove('font-uthmanic', 'font-colored', 'font-modern');
            document.body.classList.add(`font-${font.type}`);
            this.currentFont = fontKey;
            this.saveFontPreference();
        }
    }

    getFontStyle() {
        const font = this.availableFonts[this.currentFont];
        return {
            fontFamily: font.family,
            lineHeight: font.type === 'uthmanic' ? '2.5' : '2',
            fontSize: font.type === 'uthmanic' ? '28px' : '24px'
        };
    }

    saveFontPreference() {
        localStorage.setItem('quran-font', this.currentFont);
    }

    loadFontPreference() {
        const savedFont = localStorage.getItem('quran-font');
        if (savedFont && this.availableFonts[savedFont]) {
            this.applyFont(savedFont);
        }
    }
}

class AudioManager {
    constructor() {
        this.readers = {
            'alafasy': {
                name: 'مشاري العفاسي',
                style: 'مجود',
                baseUrl: 'https://server8.mp3quran.net/afs/'
            },
            'husary': {
                name: 'محمود خليل الحصري',
                style: 'حدر',
                baseUrl: 'https://server8.mp3quran.net/husr/'
            },
            'minshawi': {
                name: 'محمد صديق المنشاوي',
                style: 'ترتيل',
                baseUrl: 'https://server8.mp3quran.net/minsh/'
            },
            'ajamy': {
                name: 'أبو بكر الشاطري',
                style: 'مجود',
                baseUrl: 'https://server8.mp3quran.net/ajm/'
            },
            'ghamdi': {
                name: 'سعد الغامدي',
                style: 'حدر',
                baseUrl: 'https://server8.mp3quran.net/ghamdi/'
            }
        };
        this.currentReader = 'alafasy';
    }

    getAudioUrl(surahNumber, reader = null) {
        const selectedReader = reader || this.currentReader;
        const readerConfig = this.readers[selectedReader];
        if (!readerConfig) return null;

        return `${readerConfig.baseUrl}${surahNumber.toString().padStart(3, '0')}.mp3`;
    }

    setReader(readerKey) {
        if (this.readers[readerKey]) {
            this.currentReader = readerKey;
            this.saveReaderPreference();
        }
    }

    saveReaderPreference() {
        localStorage.setItem('quran-reader', this.currentReader);
    }

    loadReaderPreference() {
        const savedReader = localStorage.getItem('quran-reader');
        if (savedReader && this.readers[savedReader]) {
            this.currentReader = savedReader;
        }
    }
}

class TextQuranRenderer {
    constructor(quranReader) {
        this.reader = quranReader;
        this.textPageCache = new Map();
    }

    async renderTextPage(pageNumber) {
        // التحقق من التخزين المؤقت أولاً
        if (this.textPageCache.has(pageNumber)) {
            return this.textPageCache.get(pageNumber);
        }

        try {
            const pageData = this.reader.pagesData.find(p => p.page === pageNumber);
            if (!pageData) {
                console.error('بيانات الصفحة غير متوفرة:', pageNumber);
                return '<div class="error">بيانات الصفحة غير متوفرة</div>';
            }

            let html = '';
            const surahsInPage = this.getSurahsInPage(pageNumber);

            for (const surah of surahsInPage) {
                html += await this.renderSurahSection(surah, pageNumber);
            }

            // التخزين المؤقت للنتيجة
            this.textPageCache.set(pageNumber, html);
            return html;

        } catch (error) {
            console.error('خطأ في عرض الصفحة النصية:', error);
            return '<div class="error">حدث خطأ في تحميل النص</div>';
        }
    }

    getSurahsInPage(pageNumber) {
        const surahs = new Set();

        if (!this.reader.pagesData || !this.reader.surahsData) {
            return [];
        }

        // البحث عن السور في الصفحة الحالية
        this.reader.surahsData.forEach(surah => {
            const versesInPage = surah.verses.filter(verse => verse.page === pageNumber);
            if (versesInPage.length > 0) {
                surahs.add(surah.number);
            }
        });

        return Array.from(surahs).sort((a, b) => a - b).map(surahNum => {
            return this.reader.surahsData.find(s => s.number === surahNum);
        });
    }

    async renderSurahSection(surah, pageNumber) {
        if (!surah) return '';

        const versesInPage = surah.verses.filter(verse => verse.page === pageNumber);
        if (versesInPage.length === 0) return '';

        let html = `
        <div class="surah-separator">
        <div class="surah-name">سورة ${surah.name.ar}</div>
        <div class="surah-details">${surah.revelation_place.ar} | آيات: ${surah.verses_count}</div>
        </div>
        <div class="surah-verses">
        `;

        versesInPage.forEach(verse => {
            html += this.renderVerse(verse, surah);
        });

        html += '</div>';
        return html;
    }

    renderVerse(verse, surah) {
        return `
        <span class="verse">
        <span class="verse-text">${verse.text.ar}</span>
        <span class="verse-number">${verse.number}</span>
        </span>
        `;
    }

    clearCache() {
        this.textPageCache.clear();
    }
}

class AdvancedSearch {
    constructor(quranData) {
        this.data = quranData;
    }

    async search(query, options = {}) {
        const results = [];
        const searchTypes = options.types || ['arabic'];
        const lowerQuery = query.toLowerCase();

        if (!this.data || !this.data.surahs) {
            console.error('بيانات القرآن غير متوفرة للبحث');
            return results;
        }

        for (const surah of this.data.surahs) {
            // البحث في اسم السورة
            if (surah.name.ar.includes(query) ||
                surah.name.en.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'surah',
                    surah: surah.number,
                    text: `سورة ${surah.name.ar}`,
                    page: surah.verses[0]?.page || 1,
                    matchType: 'surah_name'
                });
                }

                // البحث في الآيات
                for (const verse of surah.verses) {
                    if (this.matchesQuery(verse, query, searchTypes)) {
                        results.push({
                            type: 'verse',
                            surah: surah.number,
                            verse: verse.number,
                            text: `سورة ${surah.name.ar} - الآية ${verse.number}: ${this.highlightMatch(verse.text.ar, query)}`,
                                     page: verse.page,
                                     matchType: 'verse_text'
                        });
                    }
                }
        }

        return this.sortResults(results, query);
    }

    matchesQuery(verse, query, types) {
        if (types.includes('arabic') && verse.text.ar.includes(query)) {
            return true;
        }

        if (types.includes('translation') && verse.text.en &&
            verse.text.en.toLowerCase().includes(query.toLowerCase())) {
            return true;
            }

            return false;
    }

    highlightMatch(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    sortResults(results, query) {
        return results.sort((a, b) => {
            // إعطاء أولوية لأسماء السور
            if (a.matchType === 'surah_name' && b.matchType !== 'surah_name') return -1;
            if (b.matchType === 'surah_name' && a.matchType !== 'surah_name') return 1;

            // ثم الترتيب حسب رقم السورة والآية
            if (a.surah !== b.surah) return a.surah - b.surah;
            if (a.type === 'verse' && b.type === 'verse') return a.verse - b.verse;

            return 0;
        });
    }
}

class QuranReader {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 604;
        this.currentAudio = null;
        this.isPlaying = false;
        this.zoomLevel = 100;
        this.currentAudioSurah = null;
        this.availableSurahsInPage = [];
        this.autoPlayNext = true;
        this.isTextMode = false;

        this.fontManager = new FontManager();
        this.audioManager = new AudioManager();
        this.textRenderer = null;
        this.searchEngine = null;

        this.initializeElements();
        this.loadInitialData();
        this.setupEventListeners();
        this.setupScrollHandler();
        this.setDefaultTheme();
    }

    initializeElements() {
        // العناصر الأساسية
        this.quranImg = document.getElementById('quran-img');
        this.pageNumber = document.getElementById('page-number');
        this.surahInfo = document.getElementById('surah-info');
        this.juzInfo = document.getElementById('juz-info');
        this.audioPlayer = document.getElementById('quran-audio');

        // عناصر العرض النصي
        this.textDisplay = document.getElementById('text-display');
        this.textSurahName = document.getElementById('text-surah-name');
        this.textPageInfo = document.getElementById('text-page-info');
        this.quranTextContent = document.getElementById('quran-text-content');

        // العناصر الجديدة لاختيار السورة
        this.surahSelector = document.getElementById('surah-selector');
        this.surahSelectionList = document.getElementById('surah-selection-list');

        // عناصر التحكم في النص
        this.zoomInBtn = document.getElementById('zoom-in');
        this.zoomOutBtn = document.getElementById('zoom-out');
        this.resetZoomBtn = document.getElementById('reset-zoom');
        this.zoomLevelDisplay = document.getElementById('zoom-level');

        // الأزرار العائمة
        this.prevBtn = document.getElementById('prev-page-btn');
        this.nextBtn = document.getElementById('next-page-btn');
        this.themeBtn = document.getElementById('toggle-theme');
        this.audioBtn = document.getElementById('audio-toggle');
        this.scrollTopBtn = document.getElementById('scroll-to-top');
        this.displayModeBtn = document.getElementById('toggle-display-mode');
        this.fontSelectorBtn = document.getElementById('font-selector-btn');
        this.readerSelectorBtn = document.getElementById('reader-selector-btn');

        // مشغل الصوت العائم
        this.audioFloating = document.querySelector('.audio-player-floating');
        this.closeAudioBtn = document.getElementById('close-audio');
        this.audioInfo = document.getElementById('audio-info');

        // البحث
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchResults = document.getElementById('search-results');

        // التنقل السريع
        this.navSurah = document.getElementById('nav-surah');
        this.navJuz = document.getElementById('nav-juz');
        this.navSajda = document.getElementById('nav-sajda');

        // النوافذ المنبثقة
        this.surahModal = document.getElementById('surah-list');
        this.juzModal = document.getElementById('juz-list');
        this.fontSelector = document.getElementById('font-selector');
        this.readerSelector = document.getElementById('reader-selector');
    }

    setDefaultTheme() {
        // تفعيل الوضع الليلي افتراضيًا
        document.body.classList.add('dark-mode');
        const icon = this.themeBtn.querySelector('i');
        icon.className = 'fas fa-sun';
        this.themeBtn.title = 'الوضع النهاري';
    }

    setupEventListeners() {
        // التنقل بين الصفحات
        this.prevBtn.addEventListener('click', () => this.previousPage());
        this.nextBtn.addEventListener('click', () => this.nextPage());

        // تبديل الوضع
        this.themeBtn.addEventListener('click', () => this.toggleTheme());

        // التحكم الصوتي
        this.audioBtn.addEventListener('click', () => this.toggleAudio());
        this.closeAudioBtn.addEventListener('click', () => this.hideAudioPlayer());
        this.audioPlayer.addEventListener('ended', () => this.onAudioEnded());
        this.audioPlayer.addEventListener('play', () => this.onAudioPlay());
        this.audioPlayer.addEventListener('pause', () => this.onAudioPause());

        // التحكم في التكبير
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.resetZoomBtn.addEventListener('click', () => this.resetZoom());

        // تبديل وضع العرض
        this.displayModeBtn.addEventListener('click', () => this.toggleDisplayMode());

        // اختيار الخط والقارئ
        this.fontSelectorBtn.addEventListener('click', () => this.showFontSelector());
        this.readerSelectorBtn.addEventListener('click', () => this.showReaderSelector());

        // الصعود للأعلى
        this.scrollTopBtn.addEventListener('click', () => this.scrollToTop());

        // البحث
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });

            // التنقل السريع
            this.navSurah.addEventListener('click', () => this.showSurahList());
            this.navJuz.addEventListener('click', () => this.showJuzList());
            this.navSajda.addEventListener('click', () => this.showSajdaVerses());

            // إغلاق النوافذ
            document.querySelectorAll('.close').forEach(closeBtn => {
                closeBtn.addEventListener('click', (e) => {
                    e.target.closest('.modal').style.display = 'none';
                });
            });

            // إغلاق النوافذ بالنقر خارجها
            window.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    e.target.style.display = 'none';
                }
            });

            // اختصار لوحة المفاتيح
            document.addEventListener('keydown', (e) => {
                if (e.target === this.searchInput) return;

                if (e.key === 'ArrowRight' || e.key === 'd') this.previousPage();
                if (e.key === 'ArrowLeft' || e.key === 'a') this.nextPage();
                if (e.key === ' ') {
                    e.preventDefault();
                    this.toggleAudio();
                }
                if (e.key === 'Escape') this.hideAudioPlayer();
                if (e.key === 't' || e.key === 'ط') this.toggleDisplayMode();
            });
    }

    setupScrollHandler() {
        window.addEventListener('scroll', () => {
            this.toggleScrollTopButton();
        });
    }

    toggleScrollTopButton() {
        if (window.pageYOffset > 300) {
            this.scrollTopBtn.classList.add('show');
        } else {
            this.scrollTopBtn.classList.remove('show');
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    zoomIn() {
        if (this.zoomLevel < 150) {
            this.zoomLevel += 10;
            this.applyZoom();
        }
    }

    zoomOut() {
        if (this.zoomLevel > 70) {
            this.zoomLevel -= 10;
            this.applyZoom();
        }
    }

    resetZoom() {
        this.zoomLevel = 100;
        this.applyZoom();
    }

    applyZoom() {
        document.body.style.fontSize = `${this.zoomLevel}%`;
        this.zoomLevelDisplay.textContent = `${this.zoomLevel}%`;
    }

    async loadInitialData() {
        try {
            // تحميل بيانات الصفحات
            const response = await fetch('quran_data/data/pagesQuran.json');
            this.pagesData = await response.json();

            // تحميل بيانات السور
            const surahResponse = await fetch('quran_data/data/mainDataQuran.json');
            this.surahsData = await surahResponse.json();

            // تهيئة الأنظمة المساعدة
            this.textRenderer = new TextQuranRenderer(this);
            this.searchEngine = new AdvancedSearch({ surahs: this.surahsData });

            // تحميل التفضيلات
            this.fontManager.loadFontPreference();
            this.audioManager.loadReaderPreference();

            this.updatePageInfo();
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
        }
    }

    async updatePage() {
        // تحديث الصورة في وضع الصور
        this.quranImg.src = `quran_data/data/quran_image/${this.currentPage}.png`;
        this.pageNumber.textContent = `الصفحة: ${this.currentPage}`;

        // تحديث معلومات الصفحة
        this.updatePageInfo();

        // تحديث قائمة السور المتاحة في الصفحة
        this.updateAvailableSurahs();

        // إذا كان في وضع النص، تحديث العرض النصي
        if (this.isTextMode) {
            await this.updateTextDisplay();
        }
    }

    async updateTextDisplay() {
        try {
            this.quranTextContent.innerHTML = '<div class="loading">جاري تحميل النص...</div>';
            const textContent = await this.textRenderer.renderTextPage(this.currentPage);
            this.quranTextContent.innerHTML = textContent;
        } catch (error) {
            console.error('خطأ في تحديث العرض النصي:', error);
            this.quranTextContent.innerHTML = '<div class="error">حدث خطأ في تحميل النص</div>';
        }
    }

    updatePageInfo() {
        if (!this.pagesData) return;

        const pageInfo = this.pagesData.find(page => page.page === this.currentPage);
        if (pageInfo) {
            let surahText = `السورة: ${pageInfo.start.name.ar}`;

            // إذا كانت الصفحة تحتوي على أكثر من سورة
            if (pageInfo.end && pageInfo.end.surah_number !== pageInfo.start.surah_number) {
                surahText += ` - ${pageInfo.end.name.ar}`;
            }

            this.surahInfo.textContent = surahText;
            this.juzInfo.textContent = `الجزء: ${pageInfo.start.juz || this.calculateJuz(this.currentPage)}`;

            // تحديث معلومات الصفحة النصية
            if (this.isTextMode) {
                this.textSurahName.textContent = surahText;
                this.textPageInfo.textContent = `الصفحة ${this.currentPage} - الجزء ${pageInfo.start.juz || this.calculateJuz(this.currentPage)}`;
            }
        }
    }

    updateAvailableSurahs() {
        if (!this.pagesData || !this.surahsData) return;

        const pageInfo = this.pagesData.find(page => page.page === this.currentPage);
        if (!pageInfo) return;

        this.availableSurahsInPage = [];

        // الطريقة الصحيحة: البحث عن جميع السور التي تظهر في هذه الصفحة
        const surahsInPage = new Set();

        // إضافة السورة الأولى
        if (pageInfo.start && pageInfo.start.surah_number) {
            surahsInPage.add(pageInfo.start.surah_number);
        }

        // إضافة السورة الأخيرة إذا كانت مختلفة
        if (pageInfo.end && pageInfo.end.surah_number && pageInfo.end.surah_number !== pageInfo.start.surah_number) {
            surahsInPage.add(pageInfo.end.surah_number);
        }

        // البحث عن السور الإضافية في الصفحة
        this.surahsData.forEach(surah => {
            surah.verses.forEach(verse => {
                if (verse.page === this.currentPage) {
                    surahsInPage.add(surah.number);
                }
            });
        });

        // تحويل إلى مصفوفة وترتيبها حسب رقم السورة
        this.availableSurahsInPage = Array.from(surahsInPage)
        .sort((a, b) => a - b)
        .map(surahNum => {
            const surah = this.surahsData.find(s => s.number === surahNum);
            return {
                number: surahNum,
                name: surah ? surah.name.ar : `سورة ${surahNum}`,
                verses_count: surah ? surah.verses_count : 0,
                revelation_place: surah ? surah.revelation_place.ar : 'مكية',
                verses_in_page: this.getVersesInPage(surahNum, this.currentPage)
            };
        });
    }

    getVersesInPage(surahNumber, pageNumber) {
        if (!this.surahsData) return [];

        const surah = this.surahsData.find(s => s.number === surahNumber);
        if (!surah) return [];

        return surah.verses.filter(verse => verse.page === pageNumber)
        .map(verse => verse.number);
    }

    getCurrentSurah() {
        if (!this.pagesData) return null;
        const pageInfo = this.pagesData.find(page => page.page === this.currentPage);
        return pageInfo ? pageInfo.start.surah_number : null;
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePage();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePage();
        }
    }

    goToPage(pageNum) {
        if (pageNum >= 1 && pageNum <= this.totalPages) {
            this.currentPage = pageNum;
            this.updatePage();
        }
    }

    toggleDisplayMode() {
        this.isTextMode = !this.isTextMode;

        if (this.isTextMode) {
            // الانتقال إلى وضع النص
            document.querySelector('.quran-page').style.display = 'none';
            this.textDisplay.style.display = 'block';
            this.displayModeBtn.innerHTML = '<i class="fas fa-image"></i>';
            this.displayModeBtn.title = 'تبديل إلى الصور';
            this.updateTextDisplay();
        } else {
            // الانتقال إلى وضع الصور
            this.textDisplay.style.display = 'none';
            document.querySelector('.quran-page').style.display = 'block';
            this.displayModeBtn.innerHTML = '<i class="fas fa-font"></i>';
            this.displayModeBtn.title = 'تبديل إلى النص';
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const icon = this.themeBtn.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.className = 'fas fa-sun';
            this.themeBtn.title = 'الوضع النهاري';
        } else {
            icon.className = 'fas fa-moon';
            this.themeBtn.title = 'الوضع الليلي';
        }
    }

    showFontSelector() {
        document.getElementById('font-selector').style.display = 'flex';

        // إضافة مستمعي الأحداث لخيارات الخط
        document.querySelectorAll('.font-option').forEach(option => {
            option.addEventListener('click', () => {
                const fontKey = option.dataset.font;
                this.fontManager.applyFont(fontKey);
                if (this.isTextMode) {
                    this.updateTextDisplay();
                }
                document.getElementById('font-selector').style.display = 'none';
            });
        });
    }

    showReaderSelector() {
        const readersList = document.getElementById('readers-list');
        readersList.innerHTML = '';

        Object.entries(this.audioManager.readers).forEach(([key, reader]) => {
            const readerItem = document.createElement('div');
            readerItem.className = 'reader-item';
            if (key === this.audioManager.currentReader) {
                readerItem.classList.add('selected');
            }
            readerItem.innerHTML = `
            <div class="reader-name">${reader.name}</div>
            <div class="reader-style">${reader.style}</div>
            `;
            readerItem.addEventListener('click', () => {
                this.audioManager.setReader(key);
                document.getElementById('reader-selector').style.display = 'none';

                // إذا كان الصوت مشغلاً، إعادة تشغيله مع القارئ الجديد
                if (this.isPlaying && this.currentAudioSurah) {
                    this.stopAudio();
                    this.playSurahAudio(this.currentAudioSurah);
                }
            });
            readersList.appendChild(readerItem);
        });

        document.getElementById('reader-selector').style.display = 'flex';
    }

    async toggleAudio() {
        if (this.isPlaying) {
            this.stopAudio();
        } else {
            // إذا كانت الصفحة تحتوي على سورة واحدة فقط
            if (this.availableSurahsInPage.length === 1) {
                await this.playSurahAudio(this.availableSurahsInPage[0].number);
            }
            // إذا كانت الصفحة تحتوي على أكثر من سورة
            else if (this.availableSurahsInPage.length > 1) {
                this.showSurahSelection();
            }
            // إذا لم توجد سور معروفة
            else {
                await this.playCurrentPageAudio();
            }
        }
    }

    showSurahSelection() {
        if (this.availableSurahsInPage.length === 0) return;

        const selectionHTML = this.availableSurahsInPage.map(surah => {
            const versesInfo = surah.verses_in_page && surah.verses_in_page.length > 0
            ? ` | الآيات: ${surah.verses_in_page[0]} - ${surah.verses_in_page[surah.verses_in_page.length - 1]}`
            : '';

            return `
            <div class="surah-audio-item" data-surah="${surah.number}">
            <div class="surah-audio-info">
            <div class="surah-audio-name">${surah.number}. ${surah.name}</div>
            <div class="surah-audio-details">${surah.revelation_place} | آيات: ${surah.verses_count}${versesInfo}</div>
            </div>
            <div class="play-audio-icon">
            <i class="fas fa-play"></i>
            </div>
            </div>
            `;
        }).join('');

        this.surahSelectionList.innerHTML = selectionHTML;
        this.surahSelector.style.display = 'flex';

        // إضافة مستمعي الأحداث لعناصر الاختيار
        this.surahSelectionList.querySelectorAll('.surah-audio-item').forEach(item => {
            item.addEventListener('click', async () => {
                const surahNum = parseInt(item.dataset.surah);
                this.surahSelector.style.display = 'none';
                await this.playSurahAudio(surahNum);
            });
        });
    }

    async playSurahAudio(surahNumber) {
        try {
            const audioUrl = this.audioManager.getAudioUrl(surahNumber);

            if (audioUrl) {
                this.currentAudio = audioUrl;
                this.audioPlayer.src = this.currentAudio;
                this.showAudioPlayer();

                const surah = this.surahsData.find(s => s.number === surahNumber);
                const reader = this.audioManager.readers[this.audioManager.currentReader];
                this.audioInfo.textContent = `سورة ${surah.name.ar} - القارئ: ${reader.name}`;

                await this.audioPlayer.play();
                this.currentAudioSurah = surahNumber;
            } else {
                alert('تعذر العثور على التلاوة لهذه السورة');
            }
        } catch (error) {
            console.error('خطأ في تشغيل الصوت:', error);
            alert('تعذر تشغيل التلاوة. يرجى المحاولة لاحقاً.');
        }
    }

    async playCurrentPageAudio() {
        try {
            const pageInfo = this.pagesData.find(page => page.page === this.currentPage);
            if (!pageInfo) return;

            const surahNumber = pageInfo.start.surah_number;
            if (surahNumber) {
                await this.playSurahAudio(surahNumber);
            }
        } catch (error) {
            console.error('خطأ في تشغيل الصوت:', error);
        }
    }

    showAudioPlayer() {
        this.audioFloating.classList.add('show');
    }

    hideAudioPlayer() {
        this.audioFloating.classList.remove('show');
        this.stopAudio();
    }

    onAudioPlay() {
        this.isPlaying = true;
        this.audioBtn.classList.add('playing');
        this.audioBtn.innerHTML = '<i class="fas fa-stop"></i>';
        this.audioBtn.title = 'إيقاف التلاوة';
    }

    onAudioPause() {
        this.audioBtn.classList.remove('playing');
        this.audioBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.audioBtn.title = 'تشغيل التلاوة';
    }

    onAudioEnded() {
        // عندما تنتهي السورة، تشغيل السورة التالية تلقائياً
        if (this.autoPlayNext && this.currentAudioSurah) {
            this.playNextSurah();
        } else {
            this.stopAudio();
        }
    }

    async playNextSurah() {
        const currentSurahNumber = this.currentAudioSurah;

        // البحث عن السورة التالية
        const nextSurahNumber = currentSurahNumber + 1;

        if (nextSurahNumber <= 114) { // هناك 114 سورة فقط
            // البحث عن الصفحة الأولى للسورة التالية
            const nextSurah = this.surahsData.find(s => s.number === nextSurahNumber);
            if (nextSurah && nextSurah.verses.length > 0) {
                const firstVersePage = nextSurah.verses[0].page;

                // الانتقال إلى صفحة السورة التالية
                this.currentPage = firstVersePage;
                this.updatePage();

                // تشغيل السورة التالية
                await this.playSurahAudio(nextSurahNumber);
            }
        } else {
            // إذا كانت هذه آخر سورة، نوقف التشغيل
            this.stopAudio();
            alert('تم الانتهاء من القرآن الكريم');
        }
    }

    stopAudio() {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
        this.isPlaying = false;
        this.audioBtn.classList.remove('playing');
        this.audioBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.audioBtn.title = 'تشغيل التلاوة';
    }

    async performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) {
            alert('الرجاء إدخال نص للبحث');
            return;
        }

        try {
            const results = await this.searchEngine.search(query);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('خطأ في البحث:', error);
            alert('حدث خطأ أثناء البحث');
        }
    }

    displaySearchResults(results) {
        if (results.length === 0) {
            this.searchResults.innerHTML = '<div class="search-result-item">لم يتم العثور على نتائج</div>';
        } else {
            this.searchResults.innerHTML = results.map(result => `
            <div class="search-result-item" data-page="${result.page}">
            <div class="result-surah">${result.text}</div>
            <div class="result-verse">الصفحة: ${result.page}</div>
            </div>
            `).join('');

            this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const page = parseInt(item.dataset.page);
                    this.goToPage(page);
                    this.searchResults.style.display = 'none';
                });
            });
        }

        this.searchResults.style.display = 'block';
    }

    showSurahList() {
        if (!this.surahsData) return;

        const surahListContent = this.surahsData.map(surah => `
        <div class="surah-item" data-surah="${surah.number}">
        <div class="surah-name">${surah.number}. ${surah.name.ar} (${surah.name.en})</div>
        <div class="surah-details">آيات: ${surah.verses_count} | ${surah.revelation_place.ar}</div>
        </div>
        `).join('');

        document.getElementById('surah-list-content').innerHTML = surahListContent;
        this.surahModal.style.display = 'flex';

        document.querySelectorAll('#surah-list-content .surah-item').forEach(item => {
            item.addEventListener('click', () => {
                const surahNum = parseInt(item.dataset.surah);
                this.goToSurah(surahNum);
                this.surahModal.style.display = 'none';
            });
        });
    }

    showJuzList() {
        const juzListContent = Array.from({length: 30}, (_, i) => {
            const juzNum = i + 1;
            const startPage = (juzNum - 1) * 20 + 1;
            return `
            <div class="juz-item" data-juz="${juzNum}">
            <div class="surah-name">الجزء ${juzNum}</div>
            <div class="surah-details">الصفحات: ${startPage} - ${startPage + 19}</div>
            </div>
            `;
        }).join('');

        document.getElementById('juz-list-content').innerHTML = juzListContent;
        this.juzModal.style.display = 'flex';

        document.querySelectorAll('#juz-list-content .juz-item').forEach(item => {
            item.addEventListener('click', () => {
                const juzNum = parseInt(item.dataset.juz);
                const startPage = (juzNum - 1) * 20 + 1;
                this.goToPage(startPage);
                this.juzModal.style.display = 'none';
            });
        });
    }

    async showSajdaVerses() {
        try {
            const sajdaVerses = [];
            this.surahsData.forEach(surah => {
                surah.verses.forEach(verse => {
                    if (verse.sajda) {
                        sajdaVerses.push({
                            surah: surah.number,
                            verse: verse.number,
                            text: verse.text.ar,
                            page: verse.page
                        });
                    }
                });
            });

            const resultsHTML = sajdaVerses.map(verse => `
            <div class="search-result-item" data-page="${verse.page}">
            <div class="result-surah">سورة ${this.getSurahName(verse.surah)} - الآية ${verse.verse}</div>
            <div class="result-verse">${verse.text.substring(0, 70)}...</div>
            <div class="surah-details">الصفحة: ${verse.page}</div>
            </div>
            `).join('');

            this.searchResults.innerHTML = resultsHTML;
            this.searchResults.style.display = 'block';

            this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const page = parseInt(item.dataset.page);
                    this.goToPage(page);
                    this.searchResults.style.display = 'none';
                });
            });

        } catch (error) {
            console.error('خطأ في عرض آيات السجود:', error);
        }
    }

    goToSurah(surahNumber) {
        if (!this.surahsData) return;

        const surah = this.surahsData.find(s => s.number === surahNumber);
        if (surah && surah.verses.length > 0) {
            const firstVersePage = surah.verses[0].page;
            this.goToPage(firstVersePage);
        }
    }

    getSurahName(surahNumber) {
        const surah = this.surahsData.find(s => s.number === surahNumber);
        return surah ? surah.name.ar : `سورة ${surahNumber}`;
    }

    calculateJuz(page) {
        const juz = Math.ceil(page / 20);
        return juz > 30 ? 30 : juz;
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new QuranReader();
});
