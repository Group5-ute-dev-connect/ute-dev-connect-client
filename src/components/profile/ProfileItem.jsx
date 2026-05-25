import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, MapPin, Briefcase, Users } from 'lucide-react';

const ProfileItem = ({ profile }) => {
  const { user, status, company, location, skills } = profile;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex-shrink-0">
        <img 
          src={user?.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'} 
          alt={user?.name} 
          className="w-24 h-24 rounded-full object-cover border-4 border-blue-50"
        />
      </div>
      
      <div className="flex-grow text-center md:text-left">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{user?.name}</h3>
        <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 mb-2">
          <Briefcase size={16} className="text-blue-500" />
          {status} {company && <span>tại {company}</span>}
        </p>
        
        {location && (
          <p className="text-gray-500 flex items-center justify-center md:justify-start gap-2 text-sm mb-2">
            <MapPin size={16} className="text-red-400" />
            {location}
          </p>
        )}

        <div className="flex justify-center md:justify-start gap-4 mb-4 text-sm">
          <span className="text-gray-700 flex items-center gap-1">
            <Users size={16} className="text-blue-500" />
            <span className="font-semibold">{user?.followers?.length || 0}</span> người theo dõi
          </span>
          <span className="text-gray-700">
            <span className="font-semibold">{user?.following?.length || 0}</span> đang theo dõi
          </span>
        </div>
        
        <Link 
          to={`/profile/${user?._id}`}
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Xem Hồ Sơ
        </Link>
      </div>

      <div className="hidden md:block w-px h-24 bg-gray-100"></div>

      <div className="flex-shrink-0 md:w-1/3 w-full">
        <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider text-center md:text-left">Kỹ năng nổi bật</h4>
        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
          {skills?.slice(0, 5).map((skill, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full flex items-center gap-1 border border-blue-100"
            >
              <CheckCircle size={14} />
              {skill}
            </span>
          ))}
          {skills?.length > 5 && (
            <span className="px-3 py-1 bg-gray-50 text-gray-500 text-sm font-medium rounded-full border border-gray-200">
              +{skills.length - 5}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileItem;
