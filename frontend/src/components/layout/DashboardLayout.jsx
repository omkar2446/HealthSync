import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, LayoutDashboard, FileText, PlusCircle, Video, HeartPulse, User as UserIcon, LogOut, Menu, X } from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const patientNavItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Symptom Checker', path: '/symptom-checker', icon: HeartPulse },
    { name: 'Telemedicine', path: '/telemedicine', icon: Video },
    { name: 'Medicines', path: '/medicines', icon: PlusCircle },
    { name: 'Medical Records', path: '/records', icon: FileText },
  ];

  const doctorNavItems = [
    { name: 'Overview', path: '/doctor-panel', icon: LayoutDashboard },
    { name: 'Telemedicine', path: '/telemedicine', icon: Video },
  ];

  const adminNavItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
  ];

  const navItems = user?.role === 'doctor' ? doctorNavItems : user?.role === 'admin' ? adminNavItems : patientNavItems;
  const menuTitle = user?.role === 'doctor' ? 'Doctor Menu' : user?.role === 'admin' ? 'Admin Menu' : 'Patient Menu';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-dark text-white flex flex-col shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-12">
            <Link to="/" className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-secondary" />
              <span className="text-2xl font-bold font-heading text-white tracking-tight">HealthSync</span>
            </Link>
            <button className="lg:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-7 h-7" />
            </button>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">{menuTitle}</p>
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center space-x-4 px-5 py-3.5 rounded-2xl transition-all duration-300 font-medium ${isActive ? 'bg-primary/20 text-secondary border border-primary/30 shadow-[0_0_20px_rgba(79,70,229,0.15)]' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-secondary' : 'text-slate-500'}`} />
                    <span className="tracking-wide">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center space-x-4 mb-6 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
            <div className="bg-primary/20 p-2.5 rounded-xl">
              <UserIcon className="h-5 w-5 text-secondary" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize truncate mt-0.5">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 py-4 rounded-2xl transition-colors font-bold border border-rose-500/20 shadow-sm"
          >
            <LogOut className="h-5 w-5" />
            <span className="tracking-wide">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-slate-50/50 w-full">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] pointer-events-none" />
        
        {/* Top Header */}
        <header className="h-20 lg:h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-4 lg:px-10 flex items-center justify-between z-10 sticky top-0 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 lg:gap-0">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-7 h-7" />
            </button>
            <h1 className="text-2xl lg:text-3xl font-extrabold font-heading text-slate-900 tracking-tight truncate">
              {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-10 relative z-0">
          <div className="max-w-6xl mx-auto animate-enter w-full pb-20 lg:pb-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
