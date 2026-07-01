# 💻 UTE Dev Connect - Frontend Client

> **UTE Dev Connect** là mạng xã hội học tập và kết nối dành riêng cho sinh viên và lập trình viên trường Đại học Sư phạm Kỹ thuật TP.HCM (HCMUTE). Giao diện người dùng được xây dựng hiện đại, trực quan, hỗ trợ thiết bị di động và mang lại trải nghiệm mượt mà.

Đây là kho lưu trữ mã nguồn **Frontend Client** (dành cho người dùng và quản trị viên) của dự án. Kho lưu trữ mã nguồn **Backend API** có thể được tìm thấy tại:  
👉 **[UTE Dev Connect Backend Repository](https://github.com/Group5-ute-dev-connect/ute-dev-connect)**

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

Frontend được xây dựng bằng các công nghệ web hiện đại, tập trung vào hiệu năng và trải nghiệm người dùng:

- **Core Library:** [React](https://react.dev/) (Phiên bản 19 mới nhất)
- **Build Tool / Bundler:** [Vite](https://vite.dev/) (Công cụ build cực nhanh cho dự án web hiện đại)
- **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) (Tiện ích CSS thế hệ mới, tối ưu hóa tốc độ biên dịch và hiệu năng)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) & `react-redux` (Quản lý trạng thái ứng dụng tập trung)
- **Routing:** [React Router DOM](https://reactrouter.com/) (Điều hướng trang và quản lý lịch sử)
- **Real-time Synchronization:** [Socket.io Client](https://socket.io/) (Đồng bộ chat, cuộc gọi và thông báo ngay lập tức)
- **P2P Audio/Video Calls:** [PeerJS Client](https://peerjs.com/) (Hỗ trợ gọi trực tuyến sử dụng công nghệ WebRTC)
- **Authentication:** [@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google) (Tích hợp đăng nhập nhanh qua tài khoản Google)
- **Markdown & Code Highlight:** `react-markdown`, `react-syntax-highlighter`, `remark-gfm`, `prismjs` (Hỗ trợ hiển thị văn bản định dạng Markdown và highlight cú pháp mã nguồn)
- **HTTP Client:** [Axios](https://axios-http.com/) (Tương tác với Backend API một cách dễ dàng)
- **Icons & Alerts:** [Lucide React](https://lucide.dev/) (Hệ thống icon tinh tế) & [React Toastify](https://fkhadra.github.io/react-toastify/) (Hiển thị thông báo dạng toast tiện lợi)

---

## 🌟 Các tính năng chính của giao diện (Key Features & UI)

Giao diện người dùng được xây dựng hiện đại, tối ưu hóa trải nghiệm người dùng với các tính năng:

### 1. 🔐 Xác thực & Đăng nhập đa dạng (Auth Flow)
*   **Đăng ký & Đăng nhập sinh viên:** Giao diện đăng ký nhập thông tin MSSV, chuyên ngành, tài khoản GitHub và hỗ trợ luồng xác thực OTP bảo mật gửi qua email.
*   **Đăng nhập Google OAuth2:** Hỗ trợ đăng nhập nhanh bằng một cú nhấp chuột với tài khoản Google thông qua thư viện `@react-oauth/google`.
*   **Phục hồi mật khẩu:** Giao diện từng bước hướng dẫn khôi phục mật khẩu thông qua mã xác thực OTP gửi qua email.

### 2. 📰 Bảng tin thảo luận sinh viên (Interactive Newsfeed)
*   **Soạn thảo bài viết thông minh:** Hỗ trợ viết bài đăng kèm theo mã nguồn (Code Snippets).
*   **Định dạng mã nguồn (Syntax Highlighting):** Đoạn mã được tô màu cú pháp trực quan theo ngôn ngữ lập trình tương ứng (JavaScript, Python, v.v.) nhờ tích hợp thư viện **PrismJS** và **React Syntax Highlighter**.
*   **Bộ lọc Feed linh hoạt:**
    *   Hỗ trợ chuyển đổi nhanh giữa các tab: **Mới nhất (Latest)**, **Bạn bè (Friends)**, và **Xu hướng (Trending)**.
    *   Lọc bài viết theo xu hướng dựa trên các mốc thời gian: `24 giờ`, `7 ngày`, `30 ngày`, và `Tất cả`.
*   **Tương tác thời gian thực:** Nút thích (Like) và khung bình luận (Comment) phản hồi tức thì nhờ Socket.io mà không cần tải lại trang.
*   **Quản lý bài viết cá nhân:** Hộp thoại tùy chọn cho phép Lưu bài viết hoặc Ẩn bài viết khỏi feed chính, quản lý tiện lợi tại trang Lưu trữ/Ẩn bài viết.

### 3. 👥 Nhóm học tập tương tác (Study Groups UI)
*   **Khám phá nhóm:** Giao diện tìm kiếm, bộ lọc nhóm công khai/riêng tư.
*   **Tham gia nhóm linh hoạt:**
    *   **Nhóm Công khai:** Tham gia và xem nội dung thảo luận ngay lập tức.
    *   **Nhóm Riêng tư:** Giao diện hiển thị ổ khóa khóa thông tin bài viết và thành viên đối với người ngoài nhóm. Hỗ trợ luồng gửi yêu cầu tham gia và chờ phê duyệt.
*   **Bảng quản trị nhóm dành cho Admin:**
    *   Giao diện duyệt thành viên đăng ký tham gia nhóm.
    *   Duyệt bài viết thủ công (Post Moderation) trước khi hiển thị lên bảng tin nhóm.
    *   Thiết lập và quản lý danh sách từ cấm riêng của nhóm.

### 4. 🪪 Hồ sơ cá nhân & Tích hợp GitHub (GitHub Integration)
*   **Hồ sơ sinh viên:** Hiển thị avatar, ảnh bìa, MSSV, chuyên ngành, bio giới thiệu, danh sách kỹ năng chuyên môn dạng tag.
*   **Tích hợp GitHub:** Kết nối API GitHub để tải và hiển thị tự động danh sách các public repositories của người dùng, bao gồm thông tin về số sao (stars), lượt fork và ngôn ngữ chính.
*   **Chỉnh sửa hồ sơ:** Trang cập nhật thông tin cá nhân, hỗ trợ kéo thả/chọn tải lên ảnh đại diện và ảnh bìa trực tiếp lên đám mây Cloudinary.
*   **Danh sách sinh viên:** Tìm kiếm và theo dõi (Follow/Unfollow) chéo giữa các sinh viên để mở rộng mạng lưới quan hệ học thuật.

### 5. 💬 Phòng trò chuyện & Gọi Video P2P (Chat & WebRTC Call)
*   **Giao diện Chat trực quan:** Trò chuyện riêng tư giữa các sinh viên.
*   **Trạng thái hoạt động:** Đèn báo trạng thái Online/Offline (chấm xanh) và hiệu ứng hoạt họa ba chấm động khi đối phương đang gõ phím (*Typing Indicator*).
*   **Gọi Video/Audio trực tiếp (WebRTC Call):**
    *   Tích hợp tính năng gọi trực tuyến ngay trên khung chat.
    *   Popup thông báo cuộc gọi đến thời gian thực kèm âm thanh chuông báo và nút bấm Chấp nhận/Từ chối.
    *   Giao diện cuộc gọi tích hợp Webcam cá nhân và camera của đối phương mượt mà, hỗ trợ bật/tắt camera và micrô, kết nối trực tiếp Peer-to-Peer giúp tối ưu hóa đường truyền.
*   **Hệ thống thông báo đẩy (Real-time Notifications):** Khay thông báo nhanh trên Navbar và trang lịch sử thông báo chuyên sâu hiển thị các tương tác thích, bình luận hoặc lời mời nhóm.

### 6. 📊 Bảng quản trị hệ thống dành cho Admin (Admin Dashboard)
*   **Thống kê trực quan:** Trang Dashboard hiển thị số lượng bài viết, nhóm học tập, người dùng hoạt động và biểu đồ tăng trưởng.
*   **Bộ lọc hệ thống & Bật/Tắt AI Moderation:** Cho phép bật/tắt bộ lọc nội dung bằng AI (Mistral AI) và chỉnh sửa AI System Prompt cấu hình luật quét của AI.
*   **Nhật ký hệ thống (System Logs):** Giao diện liệt kê tất cả hoạt động của toàn hệ thống (kết bạn, tạo nhóm, lịch sử đăng bài).
*   **Xem lại bài viết đã bị xóa:** Đối với các bài viết đã bị xóa (Soft Deleted), quản trị viên có thể xem trực tiếp nội dung gốc của bài đăng từ liên kết nhật ký (Bypass Soft-Delete), phục vụ công tác đối chất và thanh tra hành vi vi phạm.

---

## ⚙️ Các bước cài đặt và chạy dự án (Setup Guide)

### 1. Yêu cầu hệ thống (Prerequisites)
Hãy đảm bảo bạn đã cài đặt các công cụ sau trên máy:
- **Node.js** (Khuyến nghị phiên bản LTS v18 trở lên)
- **NPM** (Đi kèm khi cài đặt Node.js)

### 2. Tải mã nguồn về máy
```bash
git clone https://github.com/Group5-ute-dev-connect/ute-dev-connect-client.git
cd ute-dev-connect-client
```
*(Nếu bạn dùng bản fork, hãy đổi link git clone cho phù hợp)*

### 3. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 4. Cấu hình biến môi trường (Environment Variables)
Tạo file `.env` ở thư mục gốc (hoặc sao chép từ `.env.example`):
```bash
cp .env.example .env
```
Mở file `.env` và điền các thông tin cấu hình:
- `VITE_API_URL`: URL API của Backend (mặc định chạy local là `http://localhost:5000/api`)
- `VITE_GOOGLE_CLIENT_ID`: ID Client Google OAuth dùng để đăng nhập nhanh qua Google (lấy từ Google Cloud Console)

### 5. Khởi chạy Ứng dụng ở chế độ Phát triển (Development)
Khởi chạy dự án trên local dev server:
```bash
npm run dev
```
Sau khi khởi chạy thành công, mở trình duyệt và truy cập: `http://localhost:5173` (hoặc cổng hiển thị trên terminal).

### 6. Xây dựng bản Production (Build)
Để build dự án ra thư mục tĩnh (`dist/`) phục vụ deploy lên Vercel, Netlify hoặc VPS:
```bash
npm run build
```
Để chạy thử bản build tĩnh trên local:
```bash
npm run preview
```

---

