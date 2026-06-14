/************************************************************************
 * HỆ THỐNG BẢO MẬT & CHỐNG SAO CHÉP TỰ ĐỘNG - TIỂU THUYẾT "LÁT CẮT"
 ************************************************************************/

(function() {
    const securityStyles = document.createElement('style');
    securityStyles.innerHTML = `
        .toast-msg {
            position: fixed;
            top: -120px;
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
            z-index: 99999;
            transition: top 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            display: flex;
            align-items: center;
            gap: 15px;
            pointer-events: none;
        }
        .toast-msg.show {
            top: 25px;
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
        .secure-text {
            user-select: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
        }
    `;
    document.head.appendChild(securityStyles);

    document.addEventListener("DOMContentLoaded", () => {
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
        setupTextProtection();
    });

    let notificationTimeout;
    function showNotification() {
        const toast = document.getElementById("toast-msg");
        if (!toast) return;
        toast.classList.add("show");
        clearTimeout(notificationTimeout);
        notificationTimeout = setTimeout(() => {
            toast.classList.remove("show");
        }, 4000); 
    }

    function setupTextProtection() {
        setTimeout(() => {
            const readerElement = document.getElementById("reader-view");
            if (readerElement) {
                readerElement.addEventListener("contextmenu", (e) => {
                    e.preventDefault();
                    showNotification();
                });
                readerElement.addEventListener("selectstart", (e) => {
                    e.preventDefault();
                    showNotification();
                });
            }
        }, 600);

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