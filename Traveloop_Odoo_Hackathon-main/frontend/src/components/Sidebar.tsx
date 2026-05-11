import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Compass,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  Shield,
  StickyNote,
  Receipt,
  Search,
  Plus,
  LayoutDashboard,
  Bell,
  HelpCircle,
  Globe,
  Calendar,
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useStore();

  const mainNav = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/trips', label: 'My Trips', icon: Compass },
    { path: '/itinerary/build', label: 'Itinerary', icon: Calendar },
    { path: '/search-cities', label: 'Cities', icon: Globe },
    { path: '/search', label: 'Activities', icon: Search },
    { path: '/community', label: 'Community', icon: Users },
  ];

  const toolsNav = [
    { path: '/packing', label: 'Packing', icon: ClipboardList },
    { path: '/notes', label: 'Notes', icon: StickyNote },
    { path: '/invoice', label: 'Invoice', icon: Receipt },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <nav className="hidden md:flex flex-col h-screen w-[var(--sidebar-width)] fixed left-0 top-0 bg-white border-r border-[#e2e8f0] z-40">
        {/* Brand */}
        <div className="px-6 pt-6 pb-2">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#001b26] flex items-center justify-center">
              <Compass className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[15px] text-[#0b1c30] tracking-tight font-heading">Traveloop</h1>
              <p className="text-[10px] text-[#94a3b8] font-medium">Intelligent Concierge</p>
            </div>
          </Link>
        </div>

        {/* New Trip CTA */}
        <div className="px-4 py-4">
          <button 
            onClick={() => navigate('/trips/new')}
            className="btn-primary w-full justify-center shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            New Trip
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="space-y-0.5">
            {mainNav.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${active ? 'active' : ''}`}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Tools Section */}
          <div className="mt-7 mb-2">
            <span className="section-label">Tools</span>
            <div className="space-y-0.5">
              {toolsNav.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-item ${active ? 'active' : ''}`}
                  >
                    <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
                >
                  <Shield className="w-[18px] h-[18px] flex-shrink-0" />
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-3 pb-4 pt-2 border-t border-[#e2e8f0] space-y-0.5">
          <Link to="/profile" className="nav-item">
            <Settings className="w-[18px] h-[18px] flex-shrink-0" />
            Settings
          </Link>
          <button className="nav-item w-full text-left">
            <HelpCircle className="w-[18px] h-[18px] flex-shrink-0" />
            Support
          </button>
          <button 
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#E8604C] hover:bg-[#fef2f2] transition-all w-full text-left mt-2"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </nav>

      {/* ── Mobile Top Bar ── */}
      <header className="md:hidden fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] flex justify-between items-center h-16 px-5">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#001b26] flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[15px] text-[#0b1c30] font-heading">Traveloop</span>
        </Link>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-[#64748B]">
            <Bell className="w-[18px] h-[18px]" />
          </button>
          <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#e2e8f0]">
            <img src={user?.photo || '/images/user-avatar.jpg'} alt="Profile" className="w-full h-full object-cover" />
          </Link>
        </div>
      </header>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-[#e2e8f0] flex justify-around items-center h-16 pb-safe z-50">
        {mainNav.map(item => {
           const active = isActive(item.path);
           return (
             <Link key={item.path} to={item.path} className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all ${active ? 'text-[#E8604C]' : 'text-[#94a3b8]'}`}>
               <item.icon className="w-5 h-5" />
               <span className="mobile-nav-label">{item.label}</span>
             </Link>
           );
        })}
      </nav>
    </>
  );
}
