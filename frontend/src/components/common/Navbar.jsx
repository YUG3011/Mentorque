import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, Calendar, Users, Star, BookOpen, LogOut, User, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const sidebarConfig = {
  USER: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/user' },
    { icon: Calendar, label: 'My Availability', path: '/dashboard/user/availability' },
  ],
  MENTOR: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/mentor' },
  ],
  ADMIN: [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard/admin' },
    { icon: Users, label: 'Users', path: '/dashboard/admin/users' },
    { icon: Star, label: 'Mentors', path: '/dashboard/admin/mentors' },
    { icon: BookOpen, label: 'Recommendations', path: '/dashboard/admin/recommendations' },
    { icon: Clock, label: 'Book a Call', path: '/dashboard/admin/book' },
    { icon: Calendar, label: 'Bookings', path: '/dashboard/admin/bookings' },
  ],
};

const roleColors = { USER: '#0ea5e9', MENTOR: '#10b981', ADMIN: '#f59e0b' };
const roleIcons = { USER: '👤', MENTOR: '🎓', ADMIN: '⚡' };

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = sidebarConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎯</div>
        <div>
          <div className="sidebar-logo-text">MentorQue</div>
          <div className="sidebar-logo-sub">Scheduling System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-label">Navigation</div>
        {navItems.map((item) => (
          <button
            key={item.path}
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <item.icon size={18} className="nav-item-icon" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info" style={{ marginBottom: 12 }}>
          <div
            className="user-avatar"
            style={{ background: `linear-gradient(135deg, ${roleColors[user?.role]}, ${roleColors[user?.role]}aa)` }}
          >
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || user?.email}
            </div>
            <div className="user-role">{roleIcons[user?.role]} {user?.role}</div>
          </div>
        </div>

        <button
          id="logout-btn"
          className="nav-item"
          onClick={handleLogout}
          style={{ color: 'var(--danger)', width: '100%' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Navbar;
