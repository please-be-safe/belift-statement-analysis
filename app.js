/************************************************************************
 * FILE TÍNH NĂNG VÀ HIỆU ỨNG (APP ENGINE) - PHIÊN BẢN CẬP NHẬT MỚI
 * - Tự động sửa lỗi hiển thị dấu tiếng Việt bằng NFC Normalize
 * - Vệt trái tim lấp lánh chạy theo chuột & click nổ pháo tim
 * - Chạy hiệu ứng tim bay nền chậm rãi lãng mạn
 * - Thanh tìm kiếm thời gian thực, đọc truyện chuyển chương
 * - Đọc tiếp / Lưu dấu trang tự động (Reading Progress Bookmark)
 * - Đổi màu nền trình đọc bảo vệ mắt (Reading Themes)
 * - Sao chép liên kết chia sẻ thông minh (Deep Linking Share)
 ************************************************************************/

let currentChapterIndex = 0;
let readerFontSize = 19; 
let isLiked = false;
let likeCount = 0;

// Hàm chuẩn hóa đệ quy toàn bộ dữ liệu chữ về dạng Dựng Sẵn (NFC)
function deepNormalize(obj) {
    if (typeof obj === 'string') {
        return obj.normalize('NFC'); 
    } else if (Array.isArray(obj)) {
        return obj.map(item => deepNormalize(item));
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj = {};
        for (let key in obj) {
            newObj[key] = deepNormalize(obj[key]);
        }
        return newObj;
    }
    return obj;
}

// KHỞI CHẠY KHI TRANG TẢI XONG
document.addEventListener("DOMContentLoaded", () => {
    if (typeof NOVEL_DATA === 'undefined') {
        console.error("Không tìm thấy tệp data.js. Vui lòng đảm bảo data.js nằm chung thư mục.");
        return;
    }

    // Chuẩn hóa dữ liệu chống lỗi dấu tiếng Việt
    const normalizedData = deepNormalize(NOVEL_DATA);
    window.NORMALIZED_NOVEL_DATA = normalizedData;

    // Đổ dữ liệu truyện vào giao diện chính
    document.title = normalizedData.title + " - " + normalizedData.author;
    document.getElementById("nav-brand-title").innerText = normalizedData.title;
    document.getElementById("novel-title").innerText = normalizedData.title;
    document.getElementById("novel-author").innerText = normalizedData.author;
    document.getElementById("novel-status").innerText = normalizedData.status;
    document.getElementById("novel-synopsis").innerText = normalizedData.synopsis;

    // Đổ dữ liệu vào trang giới thiệu (About Page)
    document.getElementById("about-title").innerText = normalizedData.aboutTitle;
    document.getElementById("about-content-inner").innerHTML = normalizedData.aboutContent;

    // Load Lượt Thích từ LocalStorage
    likeCount = parseInt(localStorage.getItem('likeCount_LatCat')) || Math.floor(Math.random() * 80) + 25; 
    isLiked = localStorage.getItem('isLiked_LatCat') === 'true';
    updateLikeButtonUI();

    // Khởi tạo danh sách chương và hiệu ứng nền
    renderChapterList();
    createFloatingHearts();
    setupCursorHearts(); 

    // Kiểm tra và khôi phục màu nền Trình đọc đã lưu từ trước
    const savedTheme = localStorage.getItem('readerTheme_LatCat') || 'dark';
    changeReaderTheme(savedTheme);

    // Kiểm tra lưu dấu đọc tiếp để cập nhật nút Trang chủ
    updateContinueReadingButton();

    // KIỂM TRA LIÊN KẾT SÂU (Deep Linking): Nếu link chia sẻ có ?chap=X thì mở thẳng chương đó
    const urlParams = new URLSearchParams(window.location.search);
    const chapParam = urlParams.get('chap');
    if (chapParam !== null) {
        const chapIndex = parseInt(chapParam);
        if (!isNaN(chapIndex) && chapIndex >= 0 && chapIndex < normalizedData.chapters.length) {
            openChapter(chapIndex);
        }
    }
});

// HÀM HIỂN THỊ THÔNG BÁO TIN NHẮN TỰ CẤU TRÚC LẠI NỘI DUNG (Dùng chung toàn trang)
window.triggerNotification = function(title, text) {
    const toast = document.getElementById("toast-msg");
    if (!toast) return;
    
    toast.querySelector(".toast-title").innerText = title;
    toast.querySelector(".toast-text").innerText = text;
    toast.classList.add("show");
    
    clearTimeout(window.notificationTimeout);
    window.notificationTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 4000); 
}

// 1. CHỨC NĂNG SAO CHÉP LIÊN KẾT AN TOÀN (Hỗ trợ cả xem offline file://)
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback cho môi trường không bảo mật hoặc chạy thử local
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Không thể sao chép liên kết: ', err);
        }
        document.body.removeChild(textArea);
        return Promise.resolve();
    }
}

// Sao chép link trang chủ giới thiệu truyện
function shareNovel() {
    const cleanUrl = window.location.origin + window.location.pathname;
    copyToClipboard(cleanUrl).then(() => {
        window.triggerNotification("Đã sao chép liên kết", "Đã sao chép liên kết giới thiệu tiểu thuyết 'Lát Cắt' thành công! Gửi ngay cho bạn bè nhé! ♥");
    });
}

// Sao chép link trực tiếp đến chương đang đọc
function shareChapter() {
    const cleanUrl = window.location.origin + window.location.pathname + "?chap=" + currentChapterIndex;
    copyToClipboard(cleanUrl).then(() => {
        window.triggerNotification("Liên kết chương đọc", "Đã sao chép liên kết dẫn thẳng đến chương này thành công! ♥");
    });
}

// 2. CHỨC NĂNG LƯU DẤU TRANG / ĐỌC TIẾP TỰ ĐỘNG
function updateContinueReadingButton() {
    const lastReadIndex = localStorage.getItem('lastRead_LatCat');
    const startBtn = document.getElementById("start-reading-btn");
    
    if (lastReadIndex !== null && startBtn) {
        const index = parseInt(lastReadIndex);
        if (index >= 0 && index < window.NORMALIZED_NOVEL_DATA.chapters.length) {
            startBtn.innerText = `Đọc Tiếp (Chương ${index + 1})`;
            startBtn.style.backgroundColor = "var(--accent-red)";
        }
    }
}

function continueReading() {
    const lastReadIndex = localStorage.getItem('lastRead_LatCat');
    if (lastReadIndex !== null) {
        openChapter(parseInt(lastReadIndex));
    } else {
        openChapter(0); // Nếu chưa đọc bao giờ, mặc định mở chương 1
    }
}

// 3. THAY ĐỔI MÀU NỀN TRÌNH ĐỌC TRUYỆN (READING THEMES)
function changeReaderTheme(themeName) {
    const reader = document.getElementById("reader-view");
    if (!reader) return;

    // Gỡ bỏ class màu nền cũ
    reader.classList.remove('theme-dark', 'theme-sepia', 'theme-cream');
    
    // Thêm class màu nền mới
    reader.classList.add('theme-' + themeName);

    // Lưu lựa chọn vào máy người đọc
    localStorage.setItem('readerTheme_LatCat', themeName);

    // Cập nhật trạng thái hiển thị vòng tròn được chọn
    document.querySelectorAll('.theme-dot').forEach(dot => {
        dot.classList.remove('active');
    });
    const activeDot = document.getElementById('theme-dot-' + themeName);
    if (activeDot) activeDot.classList.add('active');
}

// 4. HIỆU ỨNG TƯƠNG TÁC TIM THEO CHUỘT
function setupCursorHearts() {
    document.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.15) return; 
        createCursorHeart(e.clientX, e.clientY, false);
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('#like-btn') || e.target.closest('.theme-dot') || e.target.closest('.control-btn')) return;
        for (let i = 0; i < 6; i++) {
            createCursorHeart(e.clientX, e.clientY, true);
        }
    });
}

function createCursorHeart(x, y, isBurst = false) {
    const heart = document.createElement('div');
    heart.className = 'cursor-heart';
    const heartShapes = ['♥', '♡', '❤️', '💕', '💖'];
    heart.innerText = heartShapes[Math.floor(Math.random() * heartShapes.length)];
    
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    
    const tx = isBurst ? (Math.random() * 160 - 80) : (Math.random() * 60 - 30);
    const ty = isBurst ? (Math.random() * 160 - 80) : -(Math.random() * 80 + 20);
    const rot = Math.random() * 360;
    
    heart.style.setProperty('--tx', `${tx}px`);
    heart.style.setProperty('--ty', `${ty}px`);
    heart.style.setProperty('--rot', `${rot}deg`);
    
    if (isBurst) {
        heart.style.fontSize = (Math.random() * 16 + 10) + 'px';
        heart.style.color = ['#ff333d', '#ff4d6d', '#ff758f', '#ff1a25'][Math.floor(Math.random() * 4)];
    } else {
        heart.style.fontSize = (Math.random() * 12 + 6) + 'px';
        heart.style.color = 'var(--accent-red)';
    }
    
    document.body.appendChild(heart);
    setTimeout(() => { heart.remove(); }, 1000);
}

function triggerButtonBurst(buttonElement) {
    const rect = buttonElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    for (let i = 0; i < 12; i++) {
        createCursorHeart(centerX, centerY, true);
    }
}

// 5. HIỆU ỨNG TIM NỀN BAY
function createFloatingHearts() {
    const bg = document.getElementById("hearts-bg");
    const heartIcons = ["♥", "♡", "❤️"];
    setInterval(() => {
        if (document.hidden) return;
        const heart = document.createElement("div");
        heart.className = "floating-heart";
        heart.innerText = heartIcons[Math.floor(Math.random() * heartIcons.length)];
        heart.style.left = Math.random() * 100 + "vw";
        const size = Math.random() * 22 + 10;
        heart.style.fontSize = size + "px";
        const duration = Math.random() * 8 + 6;
        heart.style.animationDuration = duration + "s";
        bg.appendChild(heart);
        setTimeout(() => heart.remove(), duration * 1000);
    }, 1200);
}

// 6. TẠO DANH SÁCH CHƯƠNG
function renderChapterList() {
    const container = document.getElementById("chapters-list-container");
    container.innerHTML = "";

    window.NORMALIZED_NOVEL_DATA.chapters.forEach((chapter, index) => {
        const card = document.createElement("div");
        card.className = "chapter-card";
        card.id = `chapter-card-${index}`;
        card.onclick = () => openChapter(index);

        const titleSpan = document.createElement("span");
        titleSpan.innerText = chapter.title;

        card.appendChild(titleSpan);
        container.appendChild(card);
    });
}

// 7. TÌM KIẾM CHƯƠNG (REAL-TIME SEARCH)
function searchChapters() {
    const query = document.getElementById("search-input").value.toLowerCase().trim().normalize('NFC');
    let hasResults = false;

    window.NORMALIZED_NOVEL_DATA.chapters.forEach((chapter, index) => {
        const card = document.getElementById(`chapter-card-${index}`);
        if (!card) return;

        const titleMatch = chapter.title.toLowerCase().includes(query);
        const contentMatch = chapter.content.toLowerCase().includes(query);

        if (titleMatch || contentMatch) {
            card.style.display = "flex";
            hasResults = true;
        } else {
            card.style.display = "none";
        }
    });

    document.getElementById("no-results-msg").style.display = hasResults ? "none" : "block";
}

// 8. ĐIỀU HƯỚNG SWITCH TRANG
function showHome() {
    hideAllViews();
    const homeView = document.getElementById("home-view");
    homeView.style.display = "block";
    triggerFadeIn(homeView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showAbout() {
    hideAllViews();
    const aboutView = document.getElementById("about-view");
    aboutView.style.display = "block";
    triggerFadeIn(aboutView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideAllViews() {
    document.getElementById("home-view").style.display = "none";
    document.getElementById("about-view").style.display = "none";
    document.getElementById("reader-view").style.display = "none";
}

function triggerFadeIn(element) {
    element.classList.remove("fade-in");
    void element.offsetWidth; 
    element.classList.add("fade-in");
}

// 9. TRÌNH ĐỌC TRUYỆN VÀ LƯU DẤU VỊ TRÍ ĐỌC
function openChapter(index) {
    if (index < 0 || index >= window.NORMALIZED_NOVEL_DATA.chapters.length) return;
    
    currentChapterIndex = index;
    const chapter = window.NORMALIZED_NOVEL_DATA.chapters[index];

    // Ghi nhận dấu đọc trang tự động vào máy người đọc
    localStorage.setItem('lastRead_LatCat', index);
    updateContinueReadingButton();

    document.getElementById("reader-chapter-title").innerText = chapter.title;
    document.getElementById("reader-chapter-text").innerText = chapter.content;

    document.getElementById("prev-chapter-btn").style.visibility = index === 0 ? "hidden" : "visible";
    document.getElementById("next-chapter-btn").style.visibility = index === window.NORMALIZED_NOVEL_DATA.chapters.length - 1 ? "hidden" : "visible";

    hideAllViews();
    const readerView = document.getElementById("reader-view");
    readerView.style.display = "block";
    triggerFadeIn(readerView);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateChapter(direction) {
    openChapter(currentChapterIndex + direction);
}

// 10. ĐIỀU CHỈNH CỠ CHỮ
function changeFontSize(amount) {
    readerFontSize += amount;
    if (readerFontSize < 14) readerFontSize = 14;
    if (readerFontSize > 32) readerFontSize = 32;
    document.getElementById("reader-chapter-text").style.fontSize = readerFontSize + "px";
}

// 11. THÍCH TRUYỆN
function toggleLike() {
    const btn = document.getElementById("like-btn");
    if (isLiked) {
        likeCount--;
        isLiked = false;
        window.triggerNotification("Bỏ yêu thích", "Cảm ơn bạn đã luôn quan tâm theo dõi câu chuyện! ♥");
    } else {
        likeCount++;
        isLiked = true;
        triggerButtonBurst(btn);
        window.triggerNotification("Đã yêu thích truyện", "Cảm ơn bạn rất nhiều vì sự ủng hộ ấm áp dành cho truyện 'Lát Cắt'! ♥");
    }
    localStorage.setItem('likeCount_LatCat', likeCount);
    localStorage.setItem('isLiked_LatCat', isLiked);
    updateLikeButtonUI();
}

function updateLikeButtonUI() {
    const likeBtn = document.getElementById("like-btn");
    const likeText = document.getElementById("like-text");
    likeText.innerText = `Yêu thích (${likeCount})`;
    if (isLiked) {
        likeBtn.classList.add("liked");
    } else {
        likeBtn.classList.remove("liked");
    }
}