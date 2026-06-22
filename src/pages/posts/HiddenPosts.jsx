import React, { useEffect } from 'react';
import { EyeOff, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import PostItem from '../../components/posts/PostItem';
import { getHiddenPosts } from '../../store/postSlice';

const HiddenPosts = () => {
  const dispatch = useDispatch();
  const { hiddenPosts, loading, error } = useSelector((state) => state.post);
  const hiddenPostList = Array.isArray(hiddenPosts) ? hiddenPosts : [];

  useEffect(() => {
    dispatch(getHiddenPosts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center">
              <EyeOff className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bài viết đã ẩn
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Xem lại và quản lý những bài viết bạn đã ẩn khỏi bảng tin.
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Đang tải bài viết đã ẩn...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && hiddenPostList.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <EyeOff className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <h2 className="text-lg font-semibold text-gray-800">
              Không có bài viết đã ẩn
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Các bài viết bạn ẩn sẽ được hiển thị ở đây để bạn có thể xem lại hoặc khôi phục.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {!loading &&
            !error &&
            hiddenPostList.map((post) => (
              <PostItem
                key={post._id}
                post={{
                  ...post,
                  isHidden: true,
                }}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default HiddenPosts;
