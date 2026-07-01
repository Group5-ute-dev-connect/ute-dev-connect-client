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

