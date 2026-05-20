import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Search,
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Plus,
  Bookmark,
  TrendingUp,
} from 'lucide-react';

export default function Community() {
  const { communityPosts, likePost } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [activeTab, setActiveTab] = useState('trending');

  const filteredPosts = communityPosts.filter((post) => {
    const matchSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = !filter || post.destination.toLowerCase().includes(filter.toLowerCase());
    return matchSearch && matchFilter;
  });

  const destinations = [...new Set(communityPosts.map((p) => p.destination))];
  const tabs = ['trending', 'latest', 'following'];

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">Community</h1>
          <p className="text-[#64748B] text-sm mt-1">Discover stories, tips, and hidden gems from fellow travelers.</p>
        </div>
        <button className="btn-primary self-start text-sm">
          <Plus className="w-4 h-4" /> Share Experience
        </button>
      </div>

      {/* Community Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#001b26] to-[#0d313f] p-6 lg:p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <img src="/images/dest-paris.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-white font-heading mb-2">Join the Conversation</h2>
          <p className="text-white/50 text-sm max-w-xl mb-4">
            Share your travel experiences, discover hidden gems, and get inspired by fellow explorers from around the world.
          </p>
          <div className="flex items-center gap-6 text-white/80 text-sm">
            <span><strong className="text-white">12.4K</strong> Members</span>
            <span><strong className="text-white">3.2K</strong> Posts</span>
            <span><strong className="text-white">89</strong> Countries</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiences..."
            className="input-field pl-9 pr-4 py-2.5 text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-auto py-2.5 text-sm"
        >
          <option value="">All Destinations</option>
          {destinations.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
              activeTab === tab
                ? 'bg-[#001b26] text-white'
                : 'bg-white text-[#64748B] border border-[#e2e8f0] hover:bg-[#f1f5f9]'
            }`}
          >
            {tab === 'trending' && <TrendingUp className="w-3.5 h-3.5 inline mr-1.5" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="card p-5 card-interactive">
            <div className="flex items-start gap-3.5">
              <img
                src={post.avatar}
                alt={post.author}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-[#e2e8f0]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-[#0b1c30] text-sm">{post.author}</span>
                  <span className="text-[#94a3b8] text-xs">{post.date}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#E8604C] mb-2">
                  <MapPin className="w-3 h-3" />
                  {post.destination}
                </div>
                <h3 className="font-bold text-[#0b1c30] text-base mb-1 font-heading">{post.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed mb-4">{post.content}</p>
                
                {/* Engagement Actions */}
                <div className="flex items-center gap-5 pt-3 border-t border-[#f1f5f9]">
                  <button
                    onClick={() => likePost(post.id)}
                    className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#E8604C] transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#001b26] transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Comment
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#001b26] transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                  <button className="ml-auto text-[#94a3b8] hover:text-[#E8604C] transition-colors">
                    <Bookmark className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
