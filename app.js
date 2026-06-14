/************************************************************************
 * FILE TÍNH NĂNG VÀ HIỆU ỨNG (APP ENGINE) - PHIÊN BẢN CẬP NHẬT
 * - Chuẩn hóa chữ chống lỗi hiển thị dấu tiếng Việt
 * - Hiệu ứng tim lấp lánh theo chuột & pháo tim nổ tung
 * - Hiệu ứng tim bay nền chậm rãi lãng mạn
 * - Thanh tìm kiếm thông minh thời gian thực
 * - ĐỔI MÀU NỀN ĐỌC TRUYỆN (Sáng / Tối / Sepia)
 * - TỰ ĐỘNG GHI NHỚ LỊCH SỬ ĐỌC & HIỆN NÚT "ĐỌC TIẾP"
 * - SAO CHÉP LIÊN KẾT CHIA SẺ TRUYỆN / CHƯƠNG CHI TIẾT (DEEP LINK)
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

document.addEventListener("DOMContentLoaded", () => {
    // 1. Kiểm tra tính sẵn sàng của file data.js
    if (typeof NOVEL_DATA === 'undefined') {
        console.error("Không tìm thấy tệp data.js. Vui lòng đảm bảo data.js nằm chung thư mục và đã được nhúng.");
        return;
    }

    // 2. Chuẩn hóa dữ liệu chống lỗi tiếng Việt trước khi render
    const normalizedData = deepNormalize(NOVEL_DATA);
    window.NORMALIZED_NOVEL_DATA = normalizedData;

    // 3. Đổ dữ liệu truyện vào giao diện chính
    document.title = normalizedData.title + " - " + normalizedData.author;
    document.getElementById("nav-brand-title").innerText = normalizedData.title;
    document.getElementById("novel-title").innerText = normalizedData.title;
    document.getElementById("novel-author").innerText = normalizedData.author;
    document.getElementById("novel-status").innerText = normalizedData.status;
    document.getElementById("novel-synopsis").innerText = normalizedData.synopsis;

    // 4. Đổ dữ liệu vào trang giới thiệu (About Page)
    document.getElementById("about-title").innerText = normalizedData.aboutTitle;
    document.getElementById("about-content-inner").innerHTML = normalizedData.aboutContent;

    // 5. Load Lượt Thích từ LocalStorage
    likeCount = parseInt(localStorage.getItem('likeCount_LatCat')) || Math.floor(Math.random() * 80) + 25; 
    isLiked = localStorage.getItem('isLiked_LatCat') === 'true';
    updateLikeButtonUI();

    // 6. Khởi tạo danh sách chương
    renderChapterList();

    // 7. KIỂM TRA ĐƯỜNG DẪN CHIA SẺ (DEEP LINK CHƯƠNG CHI TIẾT)
    const urlParams = new URLSearchParams(window.location.search);
    const chapParam = urlParams.get('chapter');
    if (chapParam !== null) {
        const chapIndex = parseInt(chapParam);
        if (chapIndex >= 0 && chapIndex < normalizedData.chapters.length) {
            openChapter(chapIndex);
        } else {
            showHome();
        }
    } else {
        // Cập nhật hiển thị nút "Đọc tiếp" dựa trên lịch sử lưu trong máy
        updateResumeButton();
    }

    // 8. Chạy các thành phần hiệu ứng lãng mạn
    createFloatingHearts();
    setupCursorHearts(); 
});

// ==========================================
// TÍNH NĂNG MỚI 1: SAO CHÉP LIÊN KẾT CHIA SẺ (DEEP LINK)
// ==========================================
function copyShareLink() {
    let shareUrl = window.location.origin + window.location.pathname;
    
    // Nếu đang ở màn hình đọc chương, tạo link trực tiếp dẫn vào chương đó
    const readerView = document.getElementById("reader-view");
    if (readerView && readerView.style.display === "block") {
        shareUrl += `?chapter=${currentChapterIndex}`;
    }

    navigator.clipboard.writeText(shareUrl).then(() => {
        // Tận dụng hộp thông báo đẩy của hệ thống bảo mật để báo thành công
        showCustomNotification(
            "Liên kết đã được sao chép! ♥", 
            "Hãy gửi liên kết này cho bạn bè để cùng chia sẻ những lát cắt lãng mạn của câu chuyện nhé!"
        );
    }).catch(err => {
        console.error("Lỗi khi sao chép liên kết: ", err);
    });
}

// Hàm hỗ trợ đổi chữ thông báo hệ thống linh hoạt
function showCustomNotification(title, text) {
    const toast = document.getElementById("toast-msg");
    if (!toast) return;
    
    toast.querySelector(".toast-title").innerText = title;
    toast.querySelector(".toast-text").innerText = text;
    toast.classList.add("show");
    
    clearTimeout(window.notificationTimeout);
    window.notificationTimeout = setTimeout(() => {
        toast.classList.remove("show");
        
        // Trả lại chữ thông báo bảo mật mặc định sau khi ẩn đi
        setTimeout(() => {
            toast.querySelector(".toast-title").innerText = "Thông báo từ Lát Cắt";
            toast.querySelector(".toast-text").innerText = "Tác phẩm được đăng độc quyền tại đây. Bạn vui lòng đọc trực tiếp trên trang và không sao chép truyện nhé. Cảm ơn tình yêu thương của bạn!";
        }, 500);
    }, 4000);
}

// ==========================================
// TÍNH NĂNG MỚI 2: TỰ ĐỘNG GHI NHỚ LỊCH SỬ ĐỌC
// ==========================================
function saveReadingHistory(index) {
    localStorage.setItem('last_read_chapter_LatCat', index);
    updateResumeButton();
}

function updateResumeButton() {
    const lastRead = localStorage.getItem('last_read_chapter_LatCat');
    const resumeBtn = document.getElementById("resume-reading-btn");
    
    if (lastRead !== null && resumeBtn) {
        const index = parseInt(lastRead);
        if (index >= 0 && index < window.NORMALIZED_NOVEL_DATA.chapters.length) {
            resumeBtn.style.display = "inline-flex";
            resumeBtn.onclick = () => openChapter(index);
            
            // Cắt bớt chữ tiêu đề chương cho nút gọn gàng
            const fullTitle = window.NORMALIZED_NOVEL_DATA.chapters[index].title;
            const shortTitle = fullTitle.includes(":") ? fullTitle.split(":")[0] : fullTitle;
            resumeBtn.querySelector("span").innerText = `Đọc tiếp: ${shortTitle}`;
        }
    } else if (resumeBtn) {
        resumeBtn.style.display = "none";
    }
}

// ==========================================
// TÍNH NĂNG MỚI 3: ĐỔI MÀU NỀN ĐỌC SÁCH
// ==========================================
function setReaderTheme(themeName) {
    const reader = document.getElementById("reader-view");
    if (!reader) return;

    // Xóa kích hoạt nút cũ, thêm kích hoạt nút mới
    document.querySelectorAll(".theme-dot").forEach(dot => dot.classList.remove("active"));
    const activeDot = document.querySelector(`.theme-${themeName}`);
    if (activeDot) activeDot.classList.add("active");

    // Đổi màu nền và màu chữ tương thích
    if (themeName === 'cream') {
        reader.style.backgroundColor = '#fdf6e3';
        reader.style.color = '#2d2013';
        document.getElementById("reader-chapter-text").style.color = '#2d2013';
        document.getElementById("reader-chapter-title").style.color = '#110c05';
    } else if (themeName === 'sepia') {
        reader.style.backgroundColor = '#f4ecd8';
        reader.style.color = '#4f3824';
        document.getElementById("reader-chapter-text").style.color = '#4f3824';
        document.getElementById("reader-chapter-title").style.color = '#2c1e10';
    } else {
        // Mặc định (Tối lãng mạn)
        reader.style.backgroundColor = 'var(--reader-bg)';
        reader.style.color = 'var(--text-main)';
        document.getElementById("reader-chapter-text").style.color = '#ebdcd5';
        document.getElementById("reader-chapter-title").style.color = 'var(--text-main)';
    }
}

// ==========================================
// CÁC HIỆU ỨNG TIM CHUỘT, TIM NỀN KHÁC (GIỮ NGUYÊN)
// ==========================================
function setupCursorHearts() {
    document.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.15) return; 
        createCursorHeart(e.clientX, e.clientY, false);
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest('.btn, .control-btn, .chapter-card, .logo, .theme-dot')) return;
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

function showHome() {
    hideAllViews();
    const homeView = document.getElementById("home-view");
    homeView.style.display = "block";
    triggerFadeIn(homeView);
    updateResumeButton(); // Cập nhật nút đọc tiếp khi quay về trang chủ
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

function openChapter(index) {
    if (index < 0 || index >= window.NORMALIZED_NOVEL_DATA.chapters.length) return;
    
    currentChapterIndex = index;
    const chapter = window.NORMALIZED_NOVEL_DATA.chapters[index];

    document.getElementById("reader-chapter-title").innerText = chapter.title;
    document.getElementById("reader-chapter-text").innerText = chapter.content;

    document.getElementById("prev-chapter-btn").style.visibility = index === 0 ? "hidden" : "visible";
    document.getElementById("next-chapter-btn").style.visibility = index === window.NORMALIZED_NOVEL_DATA.chapters.length - 1 ? "hidden" : "visible";

    hideAllViews();
    const readerView = document.getElementById("reader-view");
    readerView.style.display = "block";
    triggerFadeIn(readerView);

    // MẶC ĐỊNH RESET LẠI TÔNG MÀU ĐỌC SÁCH BAN ĐẦU
    setReaderTheme('dark');

    // LƯU LẠI LỊCH SỬ ĐỌC
    saveReadingHistory(index);

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navigateChapter(direction) {
    openChapter(currentChapterIndex + direction);
}

function changeFontSize(amount) {
    readerFontSize += amount;
    if (readerFontSize < 14) readerFontSize = 14;
    if (readerFontSize > 32) readerFontSize = 32;
    document.getElementById("reader-chapter-text").style.fontSize = readerFontSize + "px";
}