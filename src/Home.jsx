import React from 'react';
import Navbar from './components/layout/Navbar';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Phần Hero (Trống, chủ yếu là lời chào) */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Chào mừng đến với <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">UTE Connect</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Mạng xã hội dành riêng cho sinh viên trường Đại học Sư phạm Kỹ thuật TP.HCM. Nơi kết nối, chia sẻ kiến thức và cùng nhau phát triển.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => alert("Chức năng đăng nhập đang được xây dựng")}
              className="px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
            >
              Khám phá ngay
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
