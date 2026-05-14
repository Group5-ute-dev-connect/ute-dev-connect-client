import React, { useEffect, useState } from 'react';
import { profileApi } from '../../services/api/profileApi';
import ProfileItem from '../../components/profile/ProfileItem';
import { Users, Search } from 'lucide-react';

const Profiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await profileApi.getProfiles();
        setProfiles(res.data || []);
      } catch (err) {
        console.error('Lỗi tải danh sách profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(profile => 
    profile.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-3 mb-4">
          <Users size={40} className="text-blue-600" />
          Developers Network
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Khám phá và kết nối với các lập trình viên tài năng, sinh viên UTE cùng chung chí hướng.
        </p>
      </div>

      <div className="mb-10 max-w-2xl mx-auto relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc kỹ năng (VD: React, Node.js)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-gray-700 bg-white"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map(profile => (
              <ProfileItem key={profile._id} profile={profile} />
            ))
          ) : (
            <div className="text-center bg-gray-50 py-16 rounded-2xl border border-gray-100">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy lập trình viên nào</h3>
              <p className="text-gray-500">Thử tìm kiếm bằng từ khóa khác xem sao.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profiles;
