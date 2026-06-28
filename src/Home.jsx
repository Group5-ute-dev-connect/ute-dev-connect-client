import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import PostForm from './components/posts/PostForm';
import { useSelector } from 'react-redux';
import { ArrowRight } from 'lucide-react';

const Home = () => {
  const { token } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <Navbar />
      
      {/* Hero section with modern blurred glowing backgrounds */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Glow blur background filters in dark mode */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none opacity-0 dark:opacity-100" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none opacity-0 dark:opacity-100" />
        
        <div className="text-center max-w-3xl mx-auto py-12 relative z-10">
          <h1 className="text-4xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
            Chào mừng đến với <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 animate-gradient">UTE Connect</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Mạng xã hội dành riêng cho sinh viên trường Đại học Sư phạm Kỹ thuật TP.HCM. Nơi kết nối, chia sẻ kiến thức và cùng nhau phát triển.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {token ? (
              <div className="w-full max-w-2xl text-left bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700/60 shadow-xl shadow-gray-200/10 dark:shadow-none transition-all">
                <PostForm />
                <div className="flex justify-center mt-6">
                  <Link 
                    to="/edit-profile"
                    className="px-8 py-3.5 text-base font-bold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 dark:shadow-indigo-500/10 transition-all hover:scale-[1.02] inline-flex items-center gap-2"
                  >
                    Chỉnh sửa hồ sơ của tôi <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            ) : (
              <Link 
                to="/login"
                className="px-10 py-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 dark:shadow-blue-500/15 transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                Khám phá ngay <ArrowRight size={20} />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
