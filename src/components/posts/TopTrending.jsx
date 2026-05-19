import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Flame,
  Loader2,
  MessageCircle,
  ThumbsUp,
  Trophy,
  User
} from 'lucide-react';
import { postApi } from '../../services/api/postApi';

const TopTrending = () => {
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopTrending = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await postApi.getTopTrending();

        const postsData = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : [];

        setTrendingPosts(postsData.slice(0, 10));
      } catch (err) {
        console.error('Lỗi khi tải Top Trending:', err);
        setError(
          err.response?.data?.message ||
            'Không thể tải danh sách bài viết nổi bật.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTopTrending();
  }, []);

  const formatDate = (date) => {
    if (!date) return 'Không rõ ngày';

    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const shortenText = (text) => {
    if (!text) return 'Bài viết chưa có nội dung.';
    return text.length > 95 ? `${text.slice(0, 95)}...` : text;
  };

  if (loading) {
    return (
      <section className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-bold text-gray-900">Top Trending</h2>
        </div>

        <div className="flex items-center justify-center py-8 text-sm text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-500" />
          Đang tải bài viết nổi bật...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mb-6 rounded-3xl border border-red-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </section>
    );
  }

  if (trendingPosts.length === 0) {
    return (
      <section className="mb-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-bold text-gray-900">Top Trending</h2>
        </div>
        <p className="text-sm text-gray-500">Chưa có bài viết nổi bật.</p>
      </section>
    );
  }

  return (
    <section className="mb-6 rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-blue-50 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Flame className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">Top Trending</h2>
              <p className="text-sm text-gray-500">
                10 bài viết nổi bật nhất trong cộng đồng
              </p>
            </div>
          </div>
        </div>

        <span className="hidden rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-600 shadow-sm sm:inline-flex">
          Cuộn ngang →
        </span>
      </div>

      <div className="flex overflow-x-auto snap-x gap-4 no-scrollbar pb-2">
        {trendingPosts.map((post, index) => {
          const likeCount = post.likesCount ?? post.likes?.length ?? 0;
          const commentCount = post.commentsCount ?? post.comments?.length ?? 0;

          return (
            <article
              key={post._id || index}
              className="snap-center min-w-[250px] max-w-[250px] rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-sm font-bold text-white">
                    {index + 1}
                  </div>

                  {index < 3 && <Trophy className="h-4 w-4 text-yellow-500" />}
                </div>

                <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-600">
                  Trending
                </span>
              </div>

              <div className="mb-3 flex items-center gap-2">
                {post.avatar ? (
                  <img
                    src={post.avatar}
                    alt={post.name || 'Avatar'}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <User className="h-4 w-4" />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {post.name || 'Người dùng ẩn danh'}
                  </p>

                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.date)}
                  </p>
                </div>
              </div>

              <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-700">
                {shortenText(post.text)}
              </p>

              <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {likeCount}
                </span>

                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {commentCount}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default TopTrending;