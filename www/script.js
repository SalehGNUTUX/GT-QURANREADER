class QuranReader {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 604;
        this.currentAudio = null;
        this.isPlaying = false;
        this.zoomLevel = 100;
        this.currentAudioSurah = null;

        this.initializeElements();
        this.loadInitialData();
        this.setupEventListeners();
        this.setupScrollHandler();
    }

    initializeElements() {
        // العناصر الأساسية
        this.quranImg = document.getElementById('quran-img');
        this.pageNumber = document.getElementById('page-number');
        this.surahInfo = document.getElementById('surah-info');
        this.juzInfo = document.getElementById('juz-info');
        this.audioPlayer = document.getElementById('quran-audio');

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
        this.audioPlayer.addEventListener('ended', () => this.stopAudio());
        this.audioPlayer.addEventListener('play', () => this.onAudioPlay());
        this.audioPlayer.addEventListener('pause', () => this.onAudioPause());

        // التحكم في التكبير
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.resetZoomBtn.addEventListener('click', () => this.resetZoom());

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

            this.updatePageInfo();
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
        }
    }

    async updatePage() {
        // تحديث الصورة
        this.quranImg.src = `quran_data/data/quran_image/${this.currentPage}.png`;
        this.pageNumber.textContent = `الصفحة: ${this.currentPage}`;

        // تحديث معلومات الصفحة
        this.updatePageInfo();

        // فقط أوقف الصوت إذا كانت السورة تغيرت
        const currentSurah = this.getCurrentSurah();
        if (this.currentAudioSurah !== currentSurah) {
            this.stopAudio();
            this.currentAudioSurah = currentSurah;
        }
    }

    updatePageInfo() {
        if (!this.pagesData) return;

        const pageInfo = this.pagesData.find(page => page.page === this.currentPage);
        if (pageInfo) {
            this.surahInfo.textContent = `السورة: ${pageInfo.start.name.ar} - ${pageInfo.end.name.ar}`;
            this.juzInfo.textContent = `الجزء: ${pageInfo.start.juz || this.calculateJuz(this.currentPage)}`;
        }
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

    async toggleAudio() {
        if (this.isPlaying) {
            this.stopAudio();
        } else {
            await this.playCurrentPageAudio();
        }
    }

    async playCurrentPageAudio() {
        try {
            const pageInfo = this.pagesData.find(page => page.page === this.currentPage);
            if (!pageInfo) return;

            const surahNumber = pageInfo.start.surah_number;
            const audioData = await this.getSurahAudio(surahNumber);

            if (audioData && audioData.length > 0) {
                this.currentAudio = audioData[0].link;
                this.audioPlayer.src = this.currentAudio;
                this.showAudioPlayer();
                this.audioInfo.textContent = `سورة ${pageInfo.start.name.ar} - الصفحة ${this.currentPage}`;

                await this.audioPlayer.play();
                this.currentAudioSurah = surahNumber;
            }
        } catch (error) {
            console.error('خطأ في تشغيل الصوت:', error);
            alert('تعذر تشغيل التلاوة. يرجى المحاولة لاحقاً.');
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
            const results = await this.searchInQuran(query);
            this.displaySearchResults(results);
        } catch (error) {
            console.error('خطأ في البحث:', error);
            alert('حدث خطأ أثناء البحث');
        }
    }

    async searchInQuran(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        this.surahsData.forEach(surah => {
            // البحث في أسماء السور
            if (surah.name.ar.includes(query) ||
                surah.name.en.toLowerCase().includes(lowerQuery) ||
                surah.name.transliteration.toLowerCase().includes(lowerQuery)) {
                results.push({
                    type: 'surah',
                    surah: surah.number,
                    text: `سورة ${surah.name.ar}`,
                    page: surah.verses[0]?.page || 1
                });
                }

                // البحث في الآيات
                surah.verses.forEach(verse => {
                    if (verse.text.ar.includes(query)) {
                        results.push({
                            type: 'verse',
                            surah: surah.number,
                            verse: verse.number,
                            text: `سورة ${surah.name.ar} - الآية ${verse.number}: ${verse.text.ar.substring(0, 50)}...`,
                                     page: verse.page
                        });
                    }
                });
        });

        return results.slice(0, 20);
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

    async getSurahAudio(surahNumber) {
        try {
            const response = await fetch(`quran_data/data/json/audio/audio_surah_${surahNumber}.json`);
            return await response.json();
        } catch (error) {
            console.error('خطأ في جلب بيانات الصوت:', error);
            return null;
        }
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new QuranReader();
});
