/************************************************************************
 * FILE DỮ LIỆU TRUYỆN: "LÁT CẮT"
 * - Nơi chứa thông tin truyện, nội dung tất cả các chương
 * - Nơi chứa nội dung hiển thị của trang giới thiệu
 ************************************************************************/

const NOVEL_DATA = {
    // 1. THÔNG TIN CHUNG CỦA TÁC PHẨM
    title: "Lát Cắt",
    author: "Tên Tác Giả",
    status: "Đang tiến hành", // Đang tiến hành, Hoàn thành, Tạm ngưng...
    synopsis: `Những lát cắt vụn vỡ của quá khứ, những mảnh ghép dang dở của tương lai.
    
    Liệu chúng ta có thể tìm lại bóng hình nhau sau muôn vàn trắc trở? Câu chuyện xoay quanh mối tình sâu đậm nhưng cũng đầy thử thách của những tâm hồn khao khát yêu thương.`,

    // 2. NỘI DUNG HIỂN THỊ CỦA TRANG GIỚI THIỆU (ABOUT PAGE)
    aboutTitle: "Về Trang Web & Tác Giả",
    aboutContent: `
        <p>Chào mừng bạn đã ghé thăm thế giới nhỏ của <strong>Lát Cắt</strong>. Đây không chỉ đơn thuần là một website đọc truyện thông thường, mà là một không gian lãng mạn, tinh tế được dựng xây để lưu giữ những rung động chân thật nhất của tình yêu.</p>
        <p>Website được thiết kế dựa trên nguồn cảm hứng từ màu đỏ say đắm của hoa hồng và những hình bóng trái tim biểu trưng cho xúc cảm lứa đôi. Chúng tôi hi vọng mỗi lát cắt câu chuyện tại đây sẽ chạm tới một phần nào đó sâu kín trong tâm hồn bạn.</p>
        
        <div class="about-features">
            <h3>Tính Năng Đặc Biệt</h3>
            <ul>
                <li><strong>Trình đọc truyện tối giản:</strong> Không có quảng cáo quấy nhiễu, tối ưu hóa cỡ chữ để bảo vệ mắt của bạn.</li>
                <li><strong>Hệ thống tìm kiếm thông minh:</strong> Giúp bạn dễ dàng tìm lại chương cũ hoặc câu nói yêu thích chỉ với vài từ khóa.</li>
                <li><strong>Bảo vệ bản quyền:</strong> Nhằm tôn trọng công sức lao động của tác giả, trang web áp dụng các bộ mã bảo vệ để hạn chế vấn đề sao chép bất hợp pháp.</li>
            </ul>
        </div>
    `,

    // 3. DANH SÁCH CHƯƠNG VÀ NỘI DUNG CHI TIẾT
    // Bạn muốn thêm chương 4, chương 5... chỉ cần phẩy và dán thêm theo cấu trúc dưới đây.
    chapters: [
        {
            title: "Chương 1: Lát cắt đầu tiên",
            content: `Có những buổi chiều, thành phố chìm trong một màu đỏ rực như màu hoa hồng nhạt. 

            An đứng lặng bên khung cửa sổ quán cà phê quen thuộc. Trên tay cô là chiếc ly ấm nóng, hơi nước bốc lên nhè nhẹ che mờ đi đôi mắt đang hướng về phía góc phố xa xăm.

            "Đã lâu rồi không gặp."

            Một giọng nói trầm ấm vang lên ngay phía sau lưng. Trái tim cô lỡ mất một nhịp, tựa như có một lát cắt ngọt ngào và đau đớn vừa xẹt qua ký ức.`
        },
        {
            title: "Chương 2: Nhịp đập lạc lối",
            content: `Khoảng cách giữa hai người chỉ vỏn vẹn vài bước chân, nhưng dường như nó chứa đựng cả những năm tháng xa cách đằng đẵng.

            Nam nhìn cô, ánh mắt mang theo sự dịu dàng pha lẫn nét hối tiếc chưa bao giờ nguôi ngoai. Anh đặt nhẹ một bông hồng đỏ lên bàn, cánh hoa vẫn còn đọng lại vài giọt sương mai.

            "Em vẫn giữ chiếc vòng cổ ngày đó chứ?" anh khẽ hỏi, ánh mắt vô tình lướt qua sợi dây chuyền hình trái tim nhỏ nhắn nằm khép mình sau lớp áo len của cô.`
        },
        {
            title: "Chương 3: Gặp lại trong mưa",
            content: `Cơn mưa rào mùa hạ bất chợt đổ xuống, xối xả như muốn gột rửa đi mọi muộn phiền của thế gian.

            Họ đứng trú dưới mái hiên nhỏ, hơi lạnh của gió ẩm không thể làm dịu đi hơi ấm mập mờ đang dần lan tỏa giữa cả hai.

            Mỗi lát cắt của cuộc đời mang họ đi xa, để rồi định mệnh lại khéo léo kéo họ quay trở lại bên nhau, dưới một cơn mưa ấm nồng tình ý.`
        }
    ]
};