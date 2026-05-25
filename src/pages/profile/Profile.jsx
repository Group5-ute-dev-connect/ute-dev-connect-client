import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { profileApi } from '../../services/api/profileApi';
import { postApi } from '../../services/api/postApi';
import { createOrGetConversation } from '../../store/chatSlice';
import PostItem from '../../components/posts/PostItem';
import FollowModal from '../../components/profile/FollowModal';
import { MapPin, Briefcase, GraduationCap, Globe, Code, Video, MessageCircle, Users, Camera, Link as LinkIcon, MessageSquare, User, UserPlus, UserMinus } from 'lucide-react';

// Helper to decode token
const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const userPayload = token ? parseJwt(token) : null;
  const loggedInUserId = userPayload ? userPayload.id : null;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'followers' });

  const handleMessage = async () => {
    if (!profile?.user?._id) return;
    try {
      await dispatch(createOrGetConversation(profile.user._id)).unwrap();
      navigate('/chat');
    } catch (err) {
      console.error('Lỗi khi mở phòng chat:', err);
      navigate('/chat');
    }
  };

  const handleFollow = async () => {
    if (!loggedInUserId) {
      alert('Vui lòng đăng nhập để theo dõi người dùng này.');
      return;
    }
    try {
      const res = await profileApi.followUser(profile.user._id);
      setProfile(prev => ({
        ...prev,
        user: {
          ...prev.user,
          followers: res.data.followers
        }
      }));
    } catch (err) {
      console.error('Lỗi khi follow:', err);
      alert(err.response?.data?.msg || 'Có lỗi xảy ra khi theo dõi.');
    }
  };

  const handleUnfollow = async () => {
    if (!loggedInUserId) return;
    try {
      const res = await profileApi.unfollowUser(profile.user._id);
      setProfile(prev => ({
        ...prev,
        user: {
          ...prev.user,
          followers: res.data.followers
        }
      }));
    } catch (err) {
      console.error('Lỗi khi unfollow:', err);
      alert(err.response?.data?.msg || 'Có lỗi xảy ra khi bỏ theo dõi.');
    }
  };

  const fetchProfileAndPosts = async () => {
    try {
      setLoading(true);
      setPostsLoading(true);
      const res = await profileApi.getProfileById(id);
      setProfile(res.data);

      // Fetch posts and filter for this user
      try {
        const postsRes = await postApi.getAllPosts();
        
        // postRes.data is the body which looks like { success: true, data: [...] }
        const postsArray = postsRes?.data?.data || postsRes?.data;
        
        if (Array.isArray(postsArray)) {
          const userPosts = postsArray.filter(
            (post) => post.user === res.data.user?._id
          );
          setPosts(userPosts);
        }
      } catch (postErr) {
        console.error('Lỗi tải bài viết của người dùng:', postErr);
      }
    } catch (err) {
      console.error('Lỗi tải profile:', err);
      setError('Không tìm thấy hồ sơ người dùng này.');
    } finally {
      setLoading(false);
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPosts();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">{error || 'Hồ sơ không tồn tại.'}</p>
        <Link to="/profiles" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition">
          Trở về trang Khám phá
        </Link>
      </div>
    );
  }

  const { user, status, company, location, website, social, bio, skills, faculty, classCode } = profile;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in">
      {/* Cover Image & Basic Info Header */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden mb-8">
        {/* Cover Image Placeholder */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 w-full object-cover"></div>
        
        <div className="px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end -mt-16 md:-mt-20 mb-6">
            <img 
              src={user?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
              alt={user?.name} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg bg-white object-cover"
            />
            <div className="mt-4 md:mt-0 flex gap-3">
              {loggedInUserId === user?._id ? (
                <Link to="/edit-profile" className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2">
                  <User size={18} />
                  Chỉnh sửa hồ sơ
                </Link>
              ) : (
                <>
                  <button 
                    onClick={handleMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2"
                  >
                    <MessageSquare size={18} />
                    Nhắn tin
                  </button>
                  {user?.followers?.some(f => f.user === loggedInUserId) ? (
                    <button 
                      onClick={handleUnfollow}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2"
                    >
                      <UserMinus size={18} />
                      Bỏ theo dõi
                    </button>
                  ) : (
                    <button 
                      onClick={handleFollow}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center gap-2"
                    >
                      <UserPlus size={18} />
                      Theo dõi
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-gray-900">{user?.name}</h1>
            <p className="text-xl text-gray-600 mt-1 font-medium">{status} {company && `tại ${company}`}</p>
            
            <div className="flex justify-center md:justify-start gap-4 mt-3">
              <button 
                onClick={() => setModalConfig({ isOpen: true, type: 'followers' })} 
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {user?.followers?.length || 0} <span className="text-gray-500 font-normal">người theo dõi</span>
              </button>
              <button 
                onClick={() => setModalConfig({ isOpen: true, type: 'following' })} 
                className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {user?.following?.length || 0} <span className="text-gray-500 font-normal">đang theo dõi</span>
              </button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-gray-500 text-sm">
              {location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} />
                  <span>{location}</span>
                </div>
              )}
              {faculty && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap size={16} />
                  <span>{faculty} {classCode ? `(${classCode})` : ''}</span>
                </div>
              )}
              {website && (
                <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                  <Globe size={16} />
                  <span>Website</span>
                </a>
              )}
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
              {profile.githubusername && (
                <a href={`https://github.com/${profile.githubusername}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900">
                  <Code size={24} />
                </a>
              )}
              {social?.youtube && <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-red-600"><Video size={24} /></a>}
              {social?.twitter && <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-400"><MessageCircle size={24} /></a>}
              {social?.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600"><Users size={24} /></a>}
              {social?.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-700"><Briefcase size={24} /></a>}
              {social?.instagram && <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-600"><Camera size={24} /></a>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Bio & Skills */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              Giới thiệu
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm">
              {bio || 'Chưa có thông tin giới thiệu.'}
            </p>
          </div>

          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Kỹ năng</h2>
            <div className="flex flex-wrap gap-2">
              {skills?.map((skill, index) => (
                <span key={index} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Posts (Tường nhà) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Bài viết của {user?.name}</h2>
            <p className="text-gray-500 text-sm">Hoạt động và chia sẻ gần đây</p>
          </div>

          {/* Real user posts or loader or placeholder */}
          {postsLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostItem key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có bài viết nào</h3>
              <p className="text-gray-500">{user?.name} chưa đăng bài viết nào trên tường nhà.</p>
            </div>
          )}
        </div>
      </div>

      <FollowModal 
        isOpen={modalConfig.isOpen} 
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} 
        type={modalConfig.type} 
        userId={user?._id}
        loggedInUserId={loggedInUserId}
        currentFollowing={user?.following}
        onFollowToggle={() => fetchProfileAndPosts()}
      />
    </div>
  );
};

export default Profile;
