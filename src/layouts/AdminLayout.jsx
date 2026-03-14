import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Award,
  BarChart3,
  LogOut,
  Menu,
  X,
  Code2,
  Bell,
  Settings,
  CheckSquare,
  MessageSquare,
  User,
} from "lucide-react";
import { logout } from "../redux/slices/authSlice";
import { toggleSidebar } from "../redux/slices/uiSlice";
import toast from "react-hot-toast";
import NotificationPanel from "../components/shared/NotificationPanel";

// ── Admin Layout ──────────────────────────────────────────────────────────────
const adminLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/internships", icon: BookOpen, label: "Internships" },
  { to: "/admin/submissions", icon: FileText, label: "Submissions" },
  { to: "/admin/certificates", icon: Award, label: "Certificates" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

function SidebarShell({ links, roleLabel, children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { sidebarOpen } = useSelector((s) => s.ui);
  const { unreadCount } = useSelector((s) => s.notifications);
  const [showNotifs, setShowNotifs] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 flex-shrink-0 flex flex-col bg-surface-card border-r border-surface-border overflow-hidden`}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-surface-border">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0 glow">
            <Code2 size={18} className="text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <span className="text-white font-bold text-base">CodingX</span>
              <p className="text-gray-500 text-xs">{roleLabel}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-surface-border">
          {sidebarOpen && (
            <div className="flex items-center gap-3 p-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user?.name}
                </p>
                <p className="text-brand-400 text-xs capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={18} className="flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-surface-border bg-surface-card flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="btn-ghost p-2"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="btn-ghost p-2 relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <NotificationPanel onClose={() => setShowNotifs(false)} />
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return <SidebarShell links={adminLinks} roleLabel="Admin Panel" />;
}

// ── Mentor Layout ─────────────────────────────────────────────────────────────
const mentorLinks = [
  { to: "/mentor", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/mentor/submissions", icon: FileText, label: "Submissions" },
  { to: "/mentor/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/mentor/certificates", icon: Award, label: "Certificates" },
  { to: "/mentor/profile", icon: User, label: "Profile" },
];

export function MentorLayout() {
  return <SidebarShell links={mentorLinks} roleLabel="Mentor Panel" />;
}

// ── Public Layout ─────────────────────────────────────────────────────────────
import { Link } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-surface">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-surface-border bg-surface/80 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center glow">
            <Code2 size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">CodingX</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            to="/internships"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            Programs
          </Link>
          <Link to="/login" className="btn-ghost text-sm">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </nav>
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
