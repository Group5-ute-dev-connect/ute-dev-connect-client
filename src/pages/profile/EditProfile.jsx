import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, MapPin, GraduationCap, Code, Globe, Save, ArrowLeft, Link, Video, MessageSquare, Users, Camera } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import { profileApi } from '../../services/api/profileApi';

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    status: '',
    faculty: '',
    classCode: '',
    company: '',
    website: '',
    location: '',
    skills: '',
    bio: '',
    githubusername: '',
    youtube: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    instagram: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
    
    const fetchProfile = async () => {
      try {
        // Mặc định gọi role là 'user', nếu là admin thì đổi thành 'admin'
        // Bạn có thể lưu role vào localStorage: localStorage.setItem('role', 'admin')
        const role = localStorage.getItem('role') || 'user'; 
        const res = await profileApi.getProfile(role);
        
        // Nếu API trả về dữ liệu profile (tuỳ cấu trúc BE của bạn, có thể nằm trong res.data hoặc res.data.profile)
        if (res.data) {
           const profile = res.data.profile || res.data;
           setFormData(prev => ({
             ...prev,
             status: profile.status || '',
             faculty: profile.faculty || '',
             classCode: profile.classCode || '',
             company: profile.company || '',
             website: profile.website || '',
             location: profile.location || '',
             skills: profile.skills ? profile.skills.join(', ') : '',
             bio: profile.bio || '',
             githubusername: profile.githubusername || '',
             youtube: profile.social?.youtube || '',
             twitter: profile.social?.twitter || '',
             facebook: profile.social?.facebook || '',
             linkedin: profile.social?.linkedin || '',
             instagram: profile.social?.instagram || '',
           }));
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/register');
          return;
        }
        console.log("Lỗi tải profile hoặc profile chưa được tạo:", err);
      }
    };
    
    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.status) errors.status = 'Vui lòng chọn trạng thái.';
    if (!formData.faculty) errors.faculty = 'Vui lòng chọn khoa.';
    if (!formData.skills.trim()) errors.skills = 'Vui lòng nhập ít nhất một kỹ năng.';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      await profileApi.editProfile(formData);
      setSuccessMsg('Cập nhật hồ sơ thành công!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/register');
        return;
      }
      setErrorMsg(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Có lỗi xảy ra, vui lòng thử lại.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'Sinh viên', label: 'Sinh viên' },
    { value: 'Thực tập sinh', label: 'Thực tập sinh' },
    { value: 'Junior Developer', label: 'Junior Developer' },
    { value: 'Middle Developer', label: 'Middle Developer' },
    { value: 'Senior Developer', label: 'Senior Developer' },
    { value: 'Giảng viên', label: 'Giảng viên' },
    { value: 'Khác', label: 'Khác' },
  ];

  const facultyOptions = [
    { value: 'Công nghệ thông tin', label: 'Công nghệ thông tin' },
    { value: 'Điện - Điện tử', label: 'Điện - Điện tử' },
    { value: 'Cơ khí', label: 'Cơ khí' },
    { value: 'Kinh tế', label: 'Kinh tế' },
    { value: 'Đào tạo chất lượng cao', label: 'Đào tạo chất lượng cao' },
    { value: 'Khác', label: 'Khác' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pb-12 font-sans">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 transform -skew-y-3 origin-top-left -z-10 shadow-2xl"></div>
      
      <div className="max-w-4xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 text-white">
          <div className="animate-fade-in-down">
            <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-md">Tạo / Cập nhật Hồ sơ</h1>
            <p className="mt-2 text-blue-100 text-lg font-medium">Hãy chia sẻ thông tin để kết nối với cộng đồng UTE Dev Connect</p>
          </div>
          <button onClick={() => navigate(-1)} className="hidden sm:flex items-center space-x-2 text-white hover:text-blue-200 transition-colors bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 hover:bg-white/20">
            <ArrowLeft size={20} />
            <span className="font-medium">Quay lại</span>
          </button>
        </div>

        {errorMsg && <div className="mb-6 animate-fade-in"><Alert type="error" message={errorMsg} /></div>}
        {successMsg && <div className="mb-6 animate-fade-in"><Alert type="success" message={successMsg} /></div>}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          {/* Section 1: Thông tin cơ bản */}
          <div className="bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-white/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
              <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 shadow-sm">
                <User size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Thông tin cơ bản</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Trạng thái / Vai trò" 
                name="status"
                options={statusOptions}
                value={formData.status}
                onChange={handleChange}
                error={formErrors.status}
                icon={Briefcase}
                required
              />
              
              <Select 
                label="Khoa" 
                name="faculty"
                options={facultyOptions}
                value={formData.faculty}
                onChange={handleChange}
                error={formErrors.faculty}
                icon={GraduationCap}
                required
              />

              <Input 
                label="Mã lớp" 
                name="classCode"
                value={formData.classCode}
                onChange={handleChange}
                placeholder="VD: 221101A"
                icon={GraduationCap}
              />

              <Input 
                label="Công ty / Nơi thực tập" 
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="VD: VNG, FPT Software..."
                icon={Briefcase}
              />

              <div className="md:col-span-2">
                <Input 
                  label="Nơi ở hiện tại" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="VD: TP. Thủ Đức, TP.HCM"
                  icon={MapPin}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Kỹ năng & Giới thiệu */}
          <div className="bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-white/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
              <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 shadow-sm">
                <Code size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Kỹ năng & Giới thiệu</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <Input 
                  label="Kỹ năng chuyên môn" 
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="VD: HTML, CSS, JavaScript, React, Node.js"
                  error={formErrors.skills}
                  icon={Code}
                  required
                />
                <p className="text-sm text-gray-500 mt-1 ml-1 flex items-center">
                  <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                  Sử dụng dấu phẩy để phân cách các kỹ năng
                </p>
              </div>

              <Input 
                label="Username GitHub" 
                name="githubusername"
                value={formData.githubusername}
                onChange={handleChange}
                placeholder="VD: quockhanh-dev"
                icon={Link}
              />

              <Textarea 
                label="Giới thiệu bản thân" 
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Hãy chia sẻ một chút về bản thân, mục tiêu nghề nghiệp, dự án bạn tâm đắc..."
                icon={User}
                rows={4}
              />
            </div>
          </div>

          {/* Section 3: Mạng xã hội */}
          <div className="bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-white/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-300">
            <div className="flex items-center space-x-3 mb-6 border-b border-gray-100 pb-4">
              <div className="bg-pink-100 p-2.5 rounded-xl text-pink-600 shadow-sm">
                <Globe size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Liên kết mạng xã hội</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Website cá nhân" 
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
                icon={Globe}
              />
              <Input 
                label="LinkedIn" 
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="URL trang LinkedIn"
                icon={Briefcase}
              />
              <Input 
                label="Facebook" 
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="URL trang Facebook"
                icon={Users}
              />
              <Input 
                label="Twitter / X" 
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="URL trang Twitter"
                icon={MessageSquare}
              />
              <Input 
                label="YouTube" 
                name="youtube"
                value={formData.youtube}
                onChange={handleChange}
                placeholder="URL kênh YouTube"
                icon={Video}
              />
              <Input 
                label="Instagram" 
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="URL Instagram"
                icon={Camera}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 pb-12">
            <Button type="submit" isLoading={loading} className="px-10 py-3.5 text-lg font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center space-x-2 rounded-xl transition-all hover:-translate-y-0.5">
              <Save size={20} className="mr-2" />
              <span>Lưu Hồ Sơ</span>
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfile;
