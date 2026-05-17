import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // If on a dashboard page, don't show this global navbar (handled by DashboardLayout)
  if (location.pathname.includes('/dashboard') || location.pathname.includes('/doctor-panel') || location.pathname.includes('/records') || location.pathname.includes('/medicines') || location.pathname.includes('/telemedicine') || location.pathname.includes('/symptom-checker')) {
    return null;
  }

  return (
    <nav className="fixed top-0 w-full z-50 px-2 sm:px-4 py-3 md:py-4 md:px-8 animate-enter">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <div className="bg-primary/10 p-1.5 sm:p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold font-heading text-slate-900 tracking-tight hidden xs:block">HealthSync</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-6">
            {user ? (
              <>
                <Link to={user.role === 'doctor' ? "/doctor-panel" : "/dashboard"} className="text-slate-600 hover:text-primary transition-colors font-bold text-sm hidden md:block">
                  Go to Dashboard
                </Link>
                <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-100 py-2 px-3 sm:py-2.5 sm:px-5 rounded-full border border-slate-200/50">
                  <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                  <span className="text-xs sm:text-sm font-bold text-slate-800 hidden sm:inline">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 sm:space-x-2 text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 py-2 px-3 sm:py-2.5 sm:px-5 rounded-full transition-colors font-bold text-xs sm:text-sm"
                >
                  <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-slate-900 transition-colors font-bold text-sm sm:text-base px-2 sm:px-4">
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-slate-900 hover:bg-primary text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all duration-300 font-bold text-sm sm:text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                >
                  Sign Up
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
