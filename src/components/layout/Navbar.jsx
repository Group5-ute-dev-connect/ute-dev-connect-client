import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { User, LogOut } from 'lucide-react';
import { logout } from '../../store/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md transform group-hover:scale-105 transition-transform duration-200">
                <span className="text-white font-bold text-lg tracking-tighter">UTE</span>
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">
                Connect
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link 
              to="/profiles" 
              className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Cộng đồng
            </Link>
            {token ? (
              <>
                <Link 
                  to="/edit-profile" 
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all"
                >
                  <User size={18} />
                  <span className="hidden md:inline">Hồ sơ của tôi</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium transition-all"
                >
                  <LogOut size={18} />
                  <span className="hidden md:inline">Đăng xuất</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-md text-sm font-medium transition-colors hidden sm:block"
                >
                  Đăng ký
                </Link>
                <Link 
                  to="/auth/forgot-password" 
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm shadow-blue-500/30 transition-all hover:shadow-md hover:shadow-blue-500/40"
                >
                  Quên mật khẩu
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
