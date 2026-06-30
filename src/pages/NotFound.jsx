import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <Navbar />
      <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-9xl font-black text-indigo-600 dark:text-indigo-400 mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">Trang không tồn tại</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20"
        >
          <Home size={20} />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
