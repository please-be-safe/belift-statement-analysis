/************************************************************************
 * HỆ THỐNG BẢO MẬT & CHỐNG SAO CHÉP TỰ ĐỘNG - TIỂU THUYẾT "LÁT CẮT"
 * - Tự động liên kết giao diện thông báo đẩy dạng tin nhắn
 * - Chặn thao tác bôi đen và chuột phải trong trình đọc
 * - Vô hiệu hóa phím tắt sao chép toàn trang (Ctrl+C, Ctrl+A, F12...)
 ************************************************************************/

(function() {
    // 1. TỰ ĐỘNG INJECT CSS BẢO MẬT VÀO TRANG CHỦ
    const securityStyles = document.createElement('style');
    securityStyles.innerHTML = `
        /* HỘP THÔNG BÁO DẠNG TIN NHẮN ĐẨY */
        .toast-msg {
            position: fixed;
            top: -120px; /* Giấu phía trên màn hình */
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 440px;
            background-color: #1a0f11;
            border: 1px solid rgba(255, 51, 61, 0.25);
            border-left: 6px solid #ff333d;
            border-radius: 12px;
            padding: 14px 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            z-index: 99999; /* Luôn nổi bật trên cùng */
            transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            align-items: center;
            gap: 15px;
            pointer-events: none;
        }

        .toast-msg.show {
            top: 25px; /* Trượt xuống khi kích hoạt */
            pointer-events: auto;
        }

        .toast-icon {
            font-size: 2rem;
            color: #ff333d;
            animation: heartbeat-anim 1.2s infinite ease-in-out;
            flex-shrink: 0;
            user-select: none;
        }

        .toast-body {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .toast-title {
            font-weight: 700;
            color: #f5f3f4;
            font-size: 0.95rem;
            font-family: 'Playfair Display', Georgia, serif;
        }

        .toast-text {
            color: #b1a7a6;
            font-size: 0.85rem;
            line-height: 1.45;
            text-align: justify;
        }

        /* LỚP KHÓA LỰA CHỌN VĂN BẢN TRÊN TRÌNH ĐỌC */
        .secure-text {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
        }
    `;
    document.head.appendChild(securityStyles);

    // 2. TỰ ĐỘNG KHỞI TẠO MARKUP HTML THÔNG BÁO VÀ CHẠY CHẶN BẢO MẬT
    document.addEventListener("DOMContentLoaded", () => {
        // Khởi tạo thẻ Div thông báo bản quyền
        const toastDiv = document.createElement('div');
        toastDiv.className = 'toast-msg';
        toastDiv.id = 'toast-msg';
        toastDiv.innerHTML = `
            <div class="toast-icon">♥</div>
            <div class="toast-body">
                <div class="toast-title">Thông báo từ Lát Cắt</div>
                <div class="toast-text">Tác phẩm được đăng độc quyền tại đây. Bạn vui lòng đọc trực tiếp trên trang và không sao chép truyện nhé. Cảm ơn tình yêu thương của bạn!</div>
            </div>
        `;
        document.body.appendChild(toastDiv);

        // Kích hoạt toàn bộ chức năng chặn và giám sát hành vi
        setupTextProtection();
    });

    // 3. ĐIỀU HÀNH HIỆU ỨNG NHẢY BẬT CỦA THÔNG BÁO TIN NHẮN
    let notificationTimeout;
    function showNotification() {
        const toast = document.getElementById("toast-msg");
        if (!toast) return;
        
        toast.classList.add("show");
        
        // Tự động đóng thông báo đẩy sau 4 giây
        clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 4000); 
    }

    // 4. KÍCH HOẠT CÁC BỘ LẮNG NGHE CHẶN HÀNH VI SAO CHÉP
    function setupTextProtection() {
        // Đợi một khoảng thời gian ngắn để đảm bảo giao diện đọc đã dựng xong
        setTimeout(() => {
            const readerElement = document.getElementById("reader-view");
            if (readerElement) {
                // Chặn chuột phải trên trình đọc truyện
                readerElement.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    showNotification();
                });

                // Chặn thao tác bôi đen quét chọn văn bản
                readerElement.addEventListener("selectstart", (e) => {
                    e.preventDefault();
                    showNotification();
                });
            }
        }, 600);

        // Chặn phím tắt sao chép hệ thống trên toàn bộ trang web
        document.addEventListener("keydown", (e) => {
            const isCtrl = e.ctrlKey || e.metaKey; 
            if (
                (isCtrl && (e.key === 'c' || e.key === 'C' || e.key === 'a' || e.key === 'A' || e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) ||
                e.key === 'F12'
            ) {
                e.preventDefault();
                showNotification(); 
                return false;
            }
        });
    }
})();