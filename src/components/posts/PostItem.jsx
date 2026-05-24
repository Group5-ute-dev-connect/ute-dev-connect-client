import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { User, Calendar, MessageSquare, ThumbsUp, Tag, Bookmark } from 'lucide-react';
import { savePost } from '../../store/postSlice';

/**
 * PostItem - Component thẻ bài viết thu gọn
 * Hiển thị: Avatar, tên tác giả, nội dung ngắn, ngày đăng, số likes/comments
 * Tham khảo từ devconnector_2.0/client/src/components/posts/PostItem.js
 */
const PostItem = ({ post }) => {
  const dispatch = useDispatch();

  const { _id, text, name, avatar, user, likes, comments, tags, date, isSaved } = post;
  const handleSavePost = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(savePost(_id));
  }
  // Format ngày tháng theo tiếng Việt
  const formattedDate = new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Cắt nội dung ngắn (hiển thị tối đa 150 ký tự)
  const shortText = text && text.length > 150 ? text.substring(0, 150) + '...' : text;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="p-5">
        {/* Header: Avatar + Tên + Ngày */}
        <div className="flex items-center space-x-3 mb-3">
          {/* Avatar */}
          <Link 
            to={`/profile/${user}`} 
            className="flex-shrink-0"
          >
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm group-hover:ring-blue-200 transition-all duration-300">
              {avatar ? (
                <img 
                  src={avatar} 
                  alt={name} 
                  className="h-11 w-11 rounded-full object-cover" 
                />
              ) : (
                <User className="h-5 w-5 text-blue-600" />
              )}
            </div>
          </Link>
          
          <div className="flex-1 min-w-0">
            {/* Tên tác giả */}
            <Link 
              to={`/profile/${user}`} 
              className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate block"
            >
              {name || 'Người dùng ẩn danh'}
            </Link>
            {/* Ngày đăng */}
            <div className="flex items-center text-xs text-gray-400 mt-0.5">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Nội dung ngắn */}
        <Link to={`/post/${_id}`} className="block">
          <p className="text-gray-700 text-sm leading-relaxed mb-3 hover:text-gray-900 transition-colors">
            {shortText}
          </p>
        </Link>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

       {/* Footer: Likes + Comments + Bookmark */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-gray-400 text-xs">
            <ThumbsUp className="w-3.5 h-3.5 mr-1" />
            <span className="font-medium text-gray-600">
              {likes?.length || 0}
            </span>
          </div>

          <div className="flex items-center text-gray-400 text-xs">
            <MessageSquare className="w-3.5 h-3.5 mr-1" />
            <span className="font-medium text-gray-600">
              {comments?.length || 0}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSavePost}
            className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isSaved
                ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                : 'text-gray-500 hover:text-yellow-700 hover:bg-yellow-50'
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                isSaved ? 'fill-yellow-500 text-yellow-500' : ''
              }`}
            />
            {isSaved ? 'Đã lưu' : 'Lưu'}
          </button>

          <Link
            to={`/post/${_id}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            Xem thêm →
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PostItem;
