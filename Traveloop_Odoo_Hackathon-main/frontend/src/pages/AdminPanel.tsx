import {
  Users,
  Wallet,
  TrendingUp,
  Globe,
  Bell,
  Search,
  ChevronRight,
  MoreVertical,
  Landmark,
  Mountain,
  Compass,
} from 'lucide-react';

export default function AdminPanel() {

  const stats = [
    { label: 'TOTAL USERS', value: '124,502', change: '+12.5% this month', icon: Users, color: '#001b26', bg: 'white' },
    { label: 'AVG TRIP BUDGET', value: '$3,450', change: '+4.2% vs last year', icon: Wallet, color: '#001b26', bg: 'white' },
    { label: 'ACTIVE TRIPS NOW', value: '1,893', sub: 'Across 42 countries', icon: Globe, color: 'white', bg: '#E8604C' },
  ];

  const chartData = [
    { month: 'Jan', value: 30 },
    { month: 'Feb', value: 45 },
    { month: 'Mar', value: 55 },
    { month: 'Apr', value: 50 },
    { month: 'May', value: 75 },
    { month: 'Jun', value: 90 },
  ];
  const maxVal = Math.max(...chartData.map(d => d.value));

  const topDestinations = [
    { name: 'Kyoto, Japan', bookings: '4,230', icon: Landmark },
    { name: 'Patagonia, Chile', bookings: '3,105', icon: Mountain },
    { name: 'Amalfi Coast, Italy', bookings: '2,890', icon: Compass },
  ];

  const recentUsers = [
    { name: 'Jane Smith', role: 'Traveler', status: 'Active' },
    { name: 'Mike Johnson', role: 'Concierge Agent', status: 'Active' },
    { name: 'Anna Lee', role: 'Traveler', status: 'Pending' },
  ];

  const logs = [
    { title: 'API Rate Limit Warning', desc: 'Flight data API approaching 90% of daily quota.', time: '10:42 AM', severity: 'error' },
    { title: 'New Agent Onboarded', desc: 'Agent ID #4492 successfully completed training module.', time: '09:15 AM', severity: 'info' },
    { title: 'Routine Backup Complete', desc: 'Database cluster US-East-1 backup verified.', time: '02:00 AM', severity: 'muted' },
  ];

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">Overview</h1>
          <p className="text-[#64748B] text-sm mt-1">Welcome back, Admin. Here is today's summary.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-xl bg-white border border-[#e2e8f0] flex items-center justify-center text-[#64748B] hover:bg-[#f1f5f9] transition-colors relative">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#E8604C] rounded-full" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#001b26] flex items-center justify-center text-white text-xs font-bold">AD</div>
        </div>
      </div>

      <div className="border-b border-[#e2e8f0] mb-8" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`card p-5 ${stat.bg === '#E8604C' ? 'bg-[#E8604C] border-[#E8604C]' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className={`text-[10px] font-semibold tracking-widest uppercase ${
                stat.bg === '#E8604C' ? 'text-white/70' : 'text-[#94a3b8]'
              }`}>
                {stat.label}
              </p>
              <stat.icon className={`w-5 h-5 ${stat.bg === '#E8604C' ? 'text-white/60' : 'text-[#94a3b8]'}`} />
            </div>
            <p className={`text-3xl font-bold font-heading ${
              stat.bg === '#E8604C' ? 'text-white' : 'text-[#0b1c30]'
            }`}>
              {stat.value}
            </p>
            {stat.change && (
              <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                stat.bg === '#E8604C' ? 'bg-white/20 text-white' : 'bg-[#ecfdf5] text-[#059669]'
              }`}>
                <TrendingUp className="w-3 h-3" /> {stat.change}
              </span>
            )}
            {stat.sub && (
              <p className="text-sm text-white/70 mt-1">{stat.sub}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#0b1c30] font-heading">User Registration Trends</h3>
            <button className="badge bg-[#f1f5f9] text-[#64748B]">Last 6 Months</button>
          </div>
          <div className="flex items-end justify-between h-52 gap-3">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center">
                  <div
                    className="w-8 sm:w-12 rounded-t-lg transition-all duration-700 hover:opacity-80"
                    style={{
                      height: `${(d.value / maxVal) * 180}px`,
                      backgroundColor: i >= 4 ? '#E8604C' : '#001b26',
                    }}
                  />
                </div>
                <span className="text-xs text-[#94a3b8]">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0b1c30] font-heading">Top Destinations</h3>
            <button className="text-xs text-[#64748B] hover:text-[#0b1c30]">View All</button>
          </div>
          <div className="space-y-4">
            {topDestinations.map((dest) => (
              <button key={dest.name} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#f8fafc] transition-colors text-left">
                <div className="w-10 h-10 rounded-xl bg-[#f1f5f9] flex items-center justify-center text-[#64748B]">
                  <dest.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#0b1c30]">{dest.name}</p>
                  <p className="text-xs text-[#94a3b8]">{dest.bookings} bookings</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94a3b8]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0b1c30] font-heading">Recent User Registrations</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
              <input placeholder="Search users..." className="input-field text-xs pl-8 py-2 w-36" />
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f1f5f9]">
                <th className="text-left pb-3 text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase">User</th>
                <th className="text-left pb-3 text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase">Role</th>
                <th className="text-left pb-3 text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.name} className="border-b border-[#f1f5f9] last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#E8604C]/10 flex items-center justify-center text-[#E8604C] text-xs font-bold">
                        {u.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-[#0b1c30]">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-[#64748B]">{u.role}</td>
                  <td className="py-3">
                    <span className={`badge ${
                      u.status === 'Active' ? 'badge-success' : 'badge-error'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {u.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Logs */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0b1c30] font-heading">System Logs</h3>
            <button className="text-[#94a3b8] hover:text-[#64748B]">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  log.severity === 'error' ? 'bg-[#E8604C]' : log.severity === 'info' ? 'bg-[#001b26]' : 'bg-[#94a3b8]'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-[#0b1c30]">{log.title}</p>
                    <span className="text-xs text-[#94a3b8] flex-shrink-0">{log.time}</span>
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-0.5">{log.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2.5 rounded-xl bg-[#f1f5f9] text-sm font-medium text-[#64748B] hover:bg-[#e2e8f0] hover:text-[#0b1c30] transition-all">
            View Full Logs
          </button>
        </div>
      </div>
    </div>
  );
}
