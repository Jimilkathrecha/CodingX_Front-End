import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import {
  LayoutDashboard, BookOpen, CheckSquare, FileText,
  Award, User, Bell, LogOut, Menu, X, Code2, ChevronRight
} from 'lucide-react';
import { logout } from '../redux/slices/authSlice';
import { toggleSidebar } from '../redux/slices/uiSlice';
import toast from 'react-hot-toast';
import NotificationPanel from '../components/shared/NotificationPanel';

const navLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/internship', icon: BookOpen, label: 'My Program' },
  { to: '/dashboard/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/dashboard/submissions', icon: FileText, label: 'Submissions' },
  { to: '/dashboard/certificates', icon: Award, label: 'Certificates' },
  { to: '/dashboard/profile', icon: User, label: 'Profile' },
];

export default function StudentLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const { sidebarOpen } = useSelector(s => s.ui);
  const { unreadCount } = useSelector(s => s.notifications);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0 lg:w-16'} transition-all duration-300 flex-shrink-0 flex flex-col bg-surface-card border-r border-surface-border overflow-hidden`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-border">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0 glow">
            <Code2 size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <span className="text-white font-bold text-base">CodingX</span>
              <p className="text-gray-500 text-xs">Student Portal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navLinks.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-surface-border">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-2">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          )}
          <button
            onClick={handleLogout}
            className="sidebar-link w-full mt-1 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-surface-border bg-surface-card flex-shrink-0">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="btn-ghost p-2"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-3">
            {/* Points */}
            <div className="badge-brand px-3 py-1.5">
              ⚡ {user?.points || 0} pts
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="btn-ghost p-2 relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}