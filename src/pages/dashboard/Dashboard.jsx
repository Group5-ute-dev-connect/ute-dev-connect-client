import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPosts } from '../../store/postSlice';
import PostItem from '../../components/posts/PostItem';
import PostForm from '../../components/posts/PostForm';
import Navbar from '../../components/layout/Navbar';
import { Search, Loader2, Newspaper, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Dashboard - Trang Bảng tin (Newsfeed)
 * 
 * Mục 1: PostItem component + Loading state (icon xoay)
 * Mục 2: useEffect gọi API GET /api/posts
 * Mục 3: Ô Input + Form lọc bài viết
 * 
 * Tham khảo: devconnector_2.0/client/src/components/posts/Posts.js
 */
const Dashboard = () => {
  const dispatch = useDispatch();
  const { posts, loading, loadingMore, error, page, hasMore } = useSelector((state) => state.post);
  const { token } = useSelector((state) => state.auth);

  // State cho ô lọc bài viết
  const [filterText, setFilterText] = useState('');

  // Mục 2: useEffect gọi API GET /api/posts khi component mount (trang 1)
  useEffect(() => {
    dispatch(getPosts({ page: 1, limit: 5 }));
  }, [dispatch]);

  // Intersection Observer cho Infinite Scroll (Lazy Loading)
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Chỉ tải thêm khi user cuộn xuống cuối, còn dữ liệu, không đang tải, và không đang dùng bộ lọc
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore && !filterText.trim()) {
          dispatch(getPosts({ page: page + 1, limit: 5 }));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, hasMore, loading, loadingMore, page, dispatch, filterText]);

  // Mục 3: Lọc bài viết theo từ khóa (lọc theo text, name, tags)
  const filteredPosts = posts.filter((post) => {
    if (!filterText.trim()) return true;
    const keyword = filterText.toLowerCase();
    const matchText = post.text?.toLowerCase().includes(keyword);
    const matchName = post.name?.toLowerCase().includes(keyword);
    const matchTags = post.tags?.some((tag) =>
      tag.toLowerCase().includes(keyword)
    );
    return matchText || matchName || matchTags;
  });

  // Handler cho form lọc
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    // Lọc đã được xử lý realtime qua filteredPosts
  };

  // Handler refresh
  const handleRefresh = () => {
    dispatch(getPosts({ page: 1, limit: 5 }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Newspaper className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Bảng tin
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Cập nhật mới nhất từ cộng đồng UTE Connect
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                title="Tải lại bài viết"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mục 3: Form lọc bài viết */}
          <div className="mb-6">
            <form onSubmit={handleFilterSubmit} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="filter-posts-input"
                  type="text"
                  placeholder='Lọc bài viết... VD: gõ "Java" để tìm bài liên quan đến Java'
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                />
                {filterText && (
                  <button
                    type="button"
                    onClick={() => setFilterText('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors">
                      Xóa
                    </span>
                  </button>
                )}
              </div>
              {filterText && (
                <p className="mt-2 text-xs text-gray-500 pl-1">
                  Tìm thấy <span className="font-semibold text-blue-600">{filteredPosts.length}</span> bài viết
                  {filteredPosts.length !== posts.length && (
                    <span> / {posts.length} tổng bài viết</span>
                  )}
                </p>
              )}
            </form>
          </div>

          {/* Form tạo bài viết (chỉ hiện khi đã đăng nhập) */}
          {token && (
            <div className="mb-6">
              <PostForm />
            </div>
          )}

          {/* Mục 1: Trạng thái Loading với icon xoay */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-gray-100"></div>
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin absolute top-0 left-0" />
              </div>
              <p className="mt-4 text-gray-500 text-sm font-medium animate-pulse">
                Đang tải bài viết...
              </p>
            </div>
          ) : error ? (
            /* Trạng thái lỗi */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>
              <p className="text-gray-700 font-medium mb-1">Không thể tải bài viết</p>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition-all"
              >
                Thử lại
              </button>
            </div>
          ) : filteredPosts.length === 0 ? (
            /* Không có bài viết */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Newspaper className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium mb-1">
                {filterText ? 'Không tìm thấy bài viết' : 'Chưa có bài viết nào'}
              </p>
              <p className="text-sm text-gray-500">
                {filterText
                  ? `Không có bài viết nào khớp với "${filterText}". Hãy thử từ khóa khác.`
                  : 'Hãy là người đầu tiên chia sẻ bài viết!'}
              </p>
            </div>
          ) : (
            /* Danh sách bài viết */
            <div className="grid gap-4">
              {filteredPosts.map((post) => (
                <PostItem key={post._id} post={post} />
              ))}
              
              {/* Vùng theo dõi scroll (Intersection Observer Target) */}
              <div ref={observerTarget} className="h-4 w-full"></div>
              
              {/* Spinner khi đang tải thêm bài viết (loadingMore) */}
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    <span className="text-sm text-gray-500 mt-2">Đang tải thêm...</span>
                  </div>
                </div>
              )}
              
              {/* Thông báo hết bài viết */}
              {!hasMore && posts.length > 0 && !filterText.trim() && (
                <div className="text-center text-gray-400 text-sm py-6">
                  — Đã tải hết bài viết —
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
