import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Users, Package, ClipboardList, BarChart3, Trash2, RefreshCw, AlertTriangle, ShieldCheck, Loader2, TrendingUp, Star } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { getAuthHeaders } from '../../context/AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';


interface Stats {
  totalUsers: number;
  totalDonors: number;
  totalReceivers: number;
  totalListings: number;
  availableListings: number;
  claimedListings: number;
  expiredListings: number;
  totalRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  rejectedRequests: number;
  completedRequests: number;
}

const flashcardCSS = `
  .stat-card { perspective: 600px; cursor: pointer; }
  .stat-card-inner { position: relative; width: 140px; height: 120px; transition: transform 0.5s; transform-style: preserve-3d; }
  .stat-card:hover .stat-card-inner { transform: rotateY(180deg); }
  .stat-card-front, .stat-card-back {
    position: absolute; width: 100%; height: 100%; backface-visibility: hidden;
    border-radius: 16px; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .stat-card-back { transform: rotateY(180deg); }
`;

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [reverifying, setReverifying] = useState<string | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('analytics');
  const [tabsRef] = useState<{ select?: (v: string) => void }>({});
  const [currentTab, setCurrentTab] = useState('analytics');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [foodCategories, setFoodCategories] = useState<any[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [wasteRate, setWasteRate] = useState(0);
  const [topDonors, setTopDonors] = useState<any[]>([]);


  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { headers: getAuthHeaders() });
      if (res.ok) { const d = await res.json(); setStats(d.stats); }
    } catch {}
  };
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', { headers: getAuthHeaders() });
      if (res.ok) { const d = await res.json(); setUsers(d.users); }
    } catch {}
  };
  const fetchListings = async () => {
    try {
      const res = await fetch('/api/admin/listings', { headers: getAuthHeaders() });
      if (res.ok) { const d = await res.json(); setListings(d.listings); }
    } catch {}
  };
  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/requests', { headers: getAuthHeaders() });
      if (res.ok) { const d = await res.json(); setRequests(d.requests); }
    } catch {}
  };
  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports/admin', { headers: getAuthHeaders() });
      if (res.ok) { const d = await res.json(); setReports(d.reports); }
    } catch {}
  };
  const fetchCharts = async () => {
    try {
      const [catRes, ratRes] = await Promise.all([
        fetch('/api/admin/analytics/food-categories', { headers: getAuthHeaders() }),
        fetch('/api/admin/analytics/ratings', { headers: getAuthHeaders() })
      ]);
      if (catRes.ok) {
        const d = await catRes.json();
        setFoodCategories(d.categories.map((c: any) => ({ name: c._id, total: c.count, completed: c.completed, expired: c.expired })));
        setMonthlyTrend(d.monthly.map((m: any) => ({ name: `${m._id.month}/${m._id.year}`, total: m.total, completed: m.completed, expired: m.expired })));
        setWasteRate(d.wasteRate);
      }
      if (ratRes.ok) {
        const d = await ratRes.json();
        setTopDonors(d.summary);
      }
    } catch {}
  };


  useEffect(() => {
    fetchStats(); fetchUsers(); fetchListings(); fetchRequests(); fetchCharts();

    pollRef.current = setInterval(() => {
      fetchStats();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'listings') fetchListings();
      if (activeTab === 'requests') fetchRequests();
      if (activeTab === 'reports') fetchReports();
    }, 15000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeTab]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setCurrentTab(val);
    fetchStats();
    if (val === 'users') fetchUsers();
    if (val === 'listings') fetchListings();
    if (val === 'requests') fetchRequests();
    if (val === 'reports') fetchReports();
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, { method: 'DELETE', headers: getAuthHeaders() });
      toast.success('User deleted'); fetchUsers(); fetchStats();
    } catch { toast.error('Failed to delete user'); }
  };
  const handleDeleteListing = async (id: string) => {
    try {
      await fetch(`/api/admin/listings/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      toast.success('Listing deleted'); fetchListings(); fetchStats();
    } catch { toast.error('Failed to delete listing'); }
  };
  const handleReverify = async (reportId: string) => {
    setReverifying(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}/reverify`, { method: 'POST', headers: getAuthHeaders() });
      if (res.ok) {
        const d = await res.json();
        setReports(prev => prev.map(r => r._id === reportId ? d.report : r));
        toast.success('Re-verification complete');
      } else {
        toast.error('Re-verify failed');
      }
    } catch { toast.error('Re-verify failed'); }
    finally { setReverifying(null); }
  };
  const handleLogout = () => { sessionStorage.clear(); navigate('/'); };

  const getRoleBadgeColor = (role: string) => {
    if (role === 'donor') return 'bg-[#2D6A4F] text-white';
    if (role === 'receiver') return 'bg-[#F4A261] text-white';
    if (role === 'admin') return 'bg-[#E76F51] text-white';
    return 'bg-gray-200';
  };
  const getStatusColor = (status: string) => {
    if (status === 'available') return 'bg-[#40916C] text-white';
    if (status === 'claimed') return 'bg-[#F4A261] text-white';
    if (status === 'expired') return 'bg-red-500 text-white';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'accepted') return 'bg-green-100 text-green-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    if (status === 'completed') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-200';
  };

  // Flashcard component
  const FlashCard = ({ label, value, icon: Icon, color, back, tab }: any) => (
    <div className="stat-card flex-shrink-0" onClick={() => { handleTabChange(tab); }}>
      <div className="stat-card-inner">
        <div className={`stat-card-front ${color} text-white`}>
          <Icon className="w-6 h-6 mb-1 opacity-90" />
          <div className="font-mono text-2xl font-bold">{value}</div>
          <div className="text-xs mt-1 opacity-90 text-center leading-tight">{label}</div>
        </div>
        <div className={`stat-card-back ${color} text-white`}>
          <div className="text-xs text-center opacity-90 font-medium leading-snug">{back}</div>
          <div className="text-xs mt-2 opacity-70">Tap to view →</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      <style>{flashcardCSS}</style>

      {/* Header */}
      <div className="bg-[#2D6A4F] text-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-white/80 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="font-display text-xl font-bold">🛡️ Admin Panel</h1>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/30 hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <Tabs value={currentTab} className="w-full" onValueChange={handleTabChange}>
          <TabsList className="w-full grid grid-cols-5 mb-6 bg-white rounded-2xl p-1">
            <TabsTrigger value="analytics" className="rounded-xl"><BarChart3 className="w-4 h-4 mr-1" /> Stats</TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl"><Users className="w-4 h-4 mr-1" /> Users</TabsTrigger>
            <TabsTrigger value="listings" className="rounded-xl"><Package className="w-4 h-4 mr-1" /> Food</TabsTrigger>
            <TabsTrigger value="requests" className="rounded-xl"><ClipboardList className="w-4 h-4 mr-1" /> Requests</TabsTrigger>
            <TabsTrigger value="reports" className="rounded-xl"><ShieldCheck className="w-4 h-4 mr-1" /> Reports</TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {stats ? (
              <div className="space-y-8">
                {/* Flashcards */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">👥 Users</p>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <FlashCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-[#2D6A4F]" back="All registered accounts" tab="users" />
                    <FlashCard label="Donors" value={stats.totalDonors} icon={Users} color="bg-[#40916C]" back="Active food donors" tab="users" />
                    <FlashCard label="Receivers" value={stats.totalReceivers} icon={Users} color="bg-[#F4A261]" back="NGOs & receivers" tab="users" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📦 Listings</p>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <FlashCard label="Total" value={stats.totalListings} icon={Package} color="bg-[#E76F51]" back="All food listings" tab="listings" />
                    <FlashCard label="Available" value={stats.availableListings} icon={Package} color="bg-[#2D6A4F]" back="Ready for pickup" tab="listings" />
                    <FlashCard label="Claimed" value={stats.claimedListings} icon={Package} color="bg-[#F4A261]" back="Accepted by receivers" tab="listings" />
                    <FlashCard label="Expired" value={stats.expiredListings} icon={AlertTriangle} color="bg-red-500" back="Unclaimed past deadline" tab="listings" />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">📋 Requests</p>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    <FlashCard label="Total" value={stats.totalRequests} icon={ClipboardList} color="bg-[#264653]" back="All pickup requests" tab="requests" />
                    <FlashCard label="Pending" value={stats.pendingRequests} icon={ClipboardList} color="bg-[#E9C46A]" back="Awaiting response" tab="requests" />
                    <FlashCard label="Completed" value={stats.completedRequests} icon={ClipboardList} color="bg-[#40916C]" back="Successfully donated" tab="requests" />
                    <FlashCard label="Rejected" value={stats.rejectedRequests} icon={ClipboardList} color="bg-red-400" back="Declined or expired" tab="requests" />
                  </div>
                </div>

                {/* Food Category Chart */}
                {foodCategories.length > 0 && (
                  <Card className="rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-[#2D6A4F]" />
                      <h3 className="font-semibold text-[#1A1A1A]">Top Food Categories Donated</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={foodCategories} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(val: number, name: string) => [val, name.charAt(0).toUpperCase() + name.slice(1)]}
                        />
                        <Bar dataKey="total" fill="#2D6A4F" radius={[6, 6, 0, 0]} name="Total" />
                        <Bar dataKey="completed" fill="#40916C" radius={[6, 6, 0, 0]} name="Completed" />
                        <Bar dataKey="expired" fill="#E76F51" radius={[6, 6, 0, 0]} name="Expired" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-red-50 text-red-600 text-xs">Food Waste Rate: {wasteRate}%</Badge>
                    </div>
                  </Card>
                )}

                {/* Monthly Trend Chart */}
                {monthlyTrend.length > 0 && (
                  <Card className="rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 className="w-5 h-5 text-[#F4A261]" />
                      <h3 className="font-semibold text-[#1A1A1A]">Monthly Listing Trend</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart data={monthlyTrend} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Line type="monotone" dataKey="total" stroke="#2D6A4F" strokeWidth={2} dot={{ r: 4 }} name="Total" />
                        <Line type="monotone" dataKey="completed" stroke="#40916C" strokeWidth={2} dot={{ r: 4 }} name="Completed" />
                        <Line type="monotone" dataKey="expired" stroke="#E76F51" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 4 }} name="Expired" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* Top Donors by Rating */}
                {topDonors.length > 0 && (
                  <Card className="rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="w-5 h-5 text-[#F4A261] fill-[#F4A261]" />
                      <h3 className="font-semibold text-[#1A1A1A]">Top Rated Donors</h3>
                    </div>
                    <div className="space-y-3">
                      {topDonors.map((donor: any, i: number) => (
                        <div key={donor._id} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#F4A261] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{i + 1}</span>
                          <span className="flex-1 text-sm font-medium text-[#1A1A1A] truncate">{donor.name}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-[#F4A261] text-[#F4A261]" />
                            <span className="text-sm font-semibold text-[#1A1A1A]">{donor.averageRating}</span>
                            <span className="text-xs text-gray-400">({donor.totalRatings})</span>
                          </div>
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#F4A261] rounded-full" style={{ width: `${(donor.averageRating / 5) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {foodCategories.length === 0 && topDonors.length === 0 && (
                  <Card className="rounded-2xl p-6 text-center text-gray-400 shadow-sm">
                    <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Charts will appear once donations and ratings are recorded.</p>
                  </Card>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">Loading stats...</div>
            )}
          </TabsContent>


          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{users.length} users</p>
              <Button size="sm" variant="outline" className="rounded-full" onClick={fetchUsers}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            </div>
            {users.map((user) => (
              <Card key={user._id} className="rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#2D6A4F] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#1A1A1A]">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge className={`${getRoleBadgeColor(user.role)} rounded-full text-xs`}>{user.role}</Badge>
                        {user.phone && <span className="text-xs text-gray-500">📞 {user.phone}</span>}
                      </div>
                      {user.address && <p className="text-xs text-gray-500 mt-1">📍 {user.address}</p>}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        <span>📅 Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        {user.role === 'donor' && (<><span>📦 {user.listingCount || 0} listings</span><span>✅ {user.donationCount || 0} donated</span></>)}
                        {user.role === 'receiver' && <span>📋 {user.requestCount || 0} requests</span>}
                      </div>
                    </div>
                  </div>
                  {user.role !== 'admin' && (
                    <Button size="sm" variant="outline" className="rounded-full border-red-200 text-red-600 hover:bg-red-50 flex-shrink-0" onClick={() => handleDeleteUser(user._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
            {users.length === 0 && <div className="text-center py-8 text-gray-500">No users yet</div>}
          </TabsContent>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{listings.length} listings</p>
              <Button size="sm" variant="outline" className="rounded-full" onClick={fetchListings}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            </div>
            {listings.map((listing) => (
              <Card key={listing._id} className="rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    {listing.image && (
                      <img src={listing.image} alt={listing.foodType} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-[#1A1A1A]">{listing.foodType}</h3>
                        <Badge className={`${getStatusColor(listing.status)} rounded-full text-xs`}>{listing.status}</Badge>
                        {listing.imageAnalysis?.verdict && (
                          <Badge className={`rounded-full text-xs ${
                            listing.imageAnalysis.verdict === 'approved' ? 'bg-green-100 text-green-700' :
                            listing.imageAnalysis.verdict === 'suspected' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {listing.imageAnalysis.verdict === 'approved' ? '✅ Verified' :
                             listing.imageAnalysis.verdict === 'suspected' ? '⚠️ Flagged' : '❌ Rejected'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Qty: {listing.quantity}</p>
                      <p className="text-sm text-gray-600">📍 {listing.location}</p>
                      <p className="text-sm text-gray-600">👤 {listing.donorId?.name || 'Unknown'} ({listing.donorId?.email || ''})</p>
                      <p className="text-sm text-gray-600">🕐 Pickup: {listing.pickupWindowStart} – {listing.pickupWindowEnd}</p>
                      <p className="text-xs text-gray-400 mt-1">Expiry: {new Date(listing.expiryTime).toLocaleString()}</p>
                      {listing.imageAnalysis?.freshness !== undefined && (
                        <p className="text-xs text-gray-400">🔬 Freshness: {Math.round(listing.imageAnalysis.freshness * 100)}% | Confidence: {Math.round(listing.imageAnalysis.confidence * 100)}%</p>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-full border-red-200 text-red-600 hover:bg-red-50 flex-shrink-0 ml-2" onClick={() => handleDeleteListing(listing._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
            {listings.length === 0 && <div className="text-center py-8 text-gray-500">No listings yet</div>}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{requests.length} requests</p>
              <Button size="sm" variant="outline" className="rounded-full" onClick={fetchRequests}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            </div>
            {requests.map((req) => (
              <Card key={req._id} className="rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-[#1A1A1A]">{req.listingId?.foodType || 'Unknown'}</h3>
                  <Badge className={`${getStatusColor(req.status)} rounded-full text-xs`}>{req.status}</Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📤 Donor: {req.donorId?.name || 'Unknown'} ({req.donorId?.email || ''})</p>
                  <p>📥 Receiver: {req.receiverId?.name || 'Unknown'} ({req.receiverId?.email || ''})</p>
                  {req.message && <p>💬 {req.message}</p>}
                  <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleString()}</p>
                </div>
              </Card>
            ))}
            {requests.length === 0 && <div className="text-center py-8 text-gray-500">No requests yet</div>}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{reports.length} report(s)</p>
              <Button size="sm" variant="outline" className="rounded-full" onClick={fetchReports}>
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
            </div>
            {reports.map((report) => {
              const v = report.imageVerification || {};
              const isExpanded = expandedReport === report._id;
              const getVColor = (verdict: string) => {
                if (verdict === 'Verified') return 'bg-green-100 text-green-700';
                if (verdict === 'Mismatch') return 'bg-yellow-100 text-yellow-700';
                return 'bg-red-100 text-red-700';
              };
              const cColor = (c: number) => c >= 70 ? '#40916C' : c >= 40 ? '#F4A261' : '#E76F51';
              return (
                <Card key={report._id} className="rounded-2xl overflow-hidden shadow-sm">
                  {/* Clickable main row */}
                  <div
                    className="flex items-center p-4 gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedReport(isExpanded ? null : report._id)}
                  >
                    {/* Image thumbnail */}
                    <div className="flex-shrink-0">
                      {report.image ? (
                        <img src={report.image} alt="Report" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No img</div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-[#1A1A1A] text-sm">{report.title}</h3>
                        <Badge className={`rounded-full text-xs ${report.status === 'Approved' ? 'bg-green-100 text-green-700' : report.status === 'Not Valid' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        👤 {report.reporterId?.name || 'Unknown'} ({report.reporterId?.role}) · 📁 {report.reportType?.replace('_', ' ')} · 📅 {new Date(report.createdAt).toLocaleString()}
                      </p>
                      {report.description && <p className="text-xs text-gray-500 mt-1 truncate">{report.description}</p>}
                    </div>
                    {/* Verdict + Re-verify */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <Badge className={`rounded-full text-xs ${getVColor(v.overallVerdict || 'Pending')}`}>
                        {v.overallVerdict || 'Pending'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${v.overallConfidence || 0}%`, backgroundColor: cColor(v.overallConfidence || 0) }} />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: cColor(v.overallConfidence || 0) }}>{v.overallConfidence || 0}%</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs h-7 px-3"
                        disabled={reverifying === report._id}
                        onClick={(e) => { e.stopPropagation(); handleReverify(report._id); }}
                      >
                        {reverifying === report._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><RefreshCw className="w-3 h-3 mr-1" /> Re-verify</>}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && v.overallVerdict && v.overallVerdict !== 'Pending' && (
                    <div className="px-5 pb-5 pt-2 bg-gray-50 border-t border-gray-100 space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700">Verification Breakdown</h4>
                      {/* Score bars */}
                      <div className="space-y-2">
                        {[
                          { label: '🔬 ELA (Manipulation)', value: v.elaScore },
                          { label: '🏷️ Classification', value: v.classificationConfidence },
                          { label: '📷 Quality', value: v.qualityScore },
                          { label: '📋 EXIF Metadata', value: v.exifScore },
                          { label: '📊 Statistics', value: v.statsScore },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 w-36 flex-shrink-0">{item.label}</span>
                            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.value || 0}%`, backgroundColor: cColor(item.value || 0) }} />
                            </div>
                            <span className="text-xs font-semibold w-9 text-right" style={{ color: cColor(item.value || 0) }}>{item.value || 0}%</span>
                          </div>
                        ))}
                      </div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        <Badge className={`rounded-full text-xs ${v.isFood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {v.isFood ? '✅ Food Detected' : '❌ Not Food'}
                        </Badge>
                        <Badge className={`rounded-full text-xs ${v.contextMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {v.contextMatch ? '✅ Context Match' : '❌ Context Mismatch'}
                        </Badge>
                        <Badge className={`rounded-full text-xs ${v.exifPresent ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {v.exifPresent ? '✅ EXIF Present' : '⚠️ No EXIF'}
                        </Badge>
                        {v.imageResolution && <Badge className="rounded-full text-xs bg-gray-100 text-gray-700">📐 {v.imageResolution}</Badge>}
                      </div>
                      {/* Labels */}
                      {v.classificationLabels?.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-gray-600">Detected Labels: </span>
                          <span className="text-xs text-gray-500">{v.classificationLabels.join(', ')}</span>
                        </div>
                      )}
                      {v.qualityIssues?.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-gray-600">Quality Issues: </span>
                          <span className="text-xs text-gray-500">{v.qualityIssues.join(', ')}</span>
                        </div>
                      )}
                      {v.details && (
                        <div className="bg-white rounded-xl p-3">
                          <span className="text-xs font-semibold text-gray-600">AI Summary: </span>
                          <span className="text-xs text-gray-500">{v.details}</span>
                        </div>
                      )}
                      {v.analyzedAt && (
                        <p className="text-xs text-gray-400 italic">Analyzed: {new Date(v.analyzedAt).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
            {reports.length === 0 && <div className="text-center py-8 text-gray-500">No reports submitted yet</div>}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
