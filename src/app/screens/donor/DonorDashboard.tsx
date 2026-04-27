import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Bell, Plus, ClipboardList, Package, BarChart3, Clock, Salad, Recycle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BottomNav } from '../../components/BottomNav';
import { useListings } from '../../context/ListingsContext';
import { getAuthHeaders } from '../../context/AuthContext';

export function DonorDashboard() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem('userName') || 'User';
  const { myDonorListings, refreshListings } = useListings();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications/unread-count', { headers: getAuthHeaders() });
        if (res.ok) { const d = await res.json(); setUnreadCount(d.count); }
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, []);

  // My listings by status
  const activeListings = myDonorListings.filter(l => l.status === 'Available' || l.status === 'Reserved').slice(0, 5);
  const expiredListings = myDonorListings.filter(l => l.status === 'Expired');

  // Calculate stats from real data
  const totalFoodDonated = myDonorListings.reduce((sum, l) => sum + parseFloat(l.quantity || '0'), 0);
  const completedPickups = myDonorListings.filter(l => l.status === 'Completed').length;
  const estimatedMeals = Math.round(totalFoodDonated * 2.5); // Rough estimate

  const stats = [
    { icon: Salad, value: totalFoodDonated.toFixed(0), unit: 'kg', label: 'Food Donated', color: 'bg-[#2D6A4F]' },
    { icon: Recycle, value: completedPickups.toString(), label: 'Pickups Completed', color: 'bg-[#F4A261]' },
    { icon: Package, value: `~${estimatedMeals}`, label: 'Meals Enabled', color: 'bg-[#E76F51]' },
  ];

  const activities = [
    { text: 'New feature: Track your impact in real-time', time: '1h ago', type: 'info' },
    { text: `You have ${myDonorListings.length} total listings`, time: '2h ago', type: 'success' },
    ...(expiredListings.length > 0 ? [{ text: `${expiredListings.length} listing(s) expired`, time: 'recently', type: 'info' as const }] : []),
    { text: 'Welcome to FoodBridge!', time: '3h ago', type: 'success' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-[#1A1A1A]">
              Good Morning, {userName} 👋
            </h1>
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="relative text-gray-600 hover:text-gray-900"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E76F51] text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Row */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {stats.map((stat, index) => (
            <Card key={index} className={`${stat.color} text-white p-4 min-w-[140px] rounded-2xl flex-shrink-0 shadow-lg`}>
              <stat.icon className="w-6 h-6 mb-2 opacity-90" />
              <div className="font-mono text-2xl font-bold">{stat.value}</div>
              {stat.unit && <div className="text-xs opacity-80">{stat.unit}</div>}
              <div className="text-sm mt-1 opacity-90">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => navigate('/donor/post-listing')}
            className="bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-2xl h-20 text-base shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Post New Listing
          </Button>
          <Button 
            onClick={() => navigate('/donor/my-listings')}
            variant="outline"
            className="rounded-2xl h-20 text-base shadow-sm border-2"
          >
            <ClipboardList className="w-5 h-5 mr-2" />
            My Active Listings
          </Button>
          <Button 
            onClick={() => navigate('/donor/pickup-requests')}
            variant="outline"
            className="rounded-2xl h-20 text-base shadow-sm border-2"
          >
            <Package className="w-5 h-5 mr-2" />
            Pickup Requests
          </Button>
          <Button 
            onClick={() => navigate('/impact')}
            variant="outline"
            className="rounded-2xl h-20 text-base shadow-sm border-2"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            My Impact
          </Button>
        </div>

        {/* Active Listings Preview */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Active Listings</h2>
            <button 
              onClick={() => navigate('/donor/my-listings')}
              className="text-[#2D6A4F] text-sm font-semibold hover:underline"
            >
              See All
            </button>
          </div>
          {activeListings.length === 0 ? (
            <Card className="rounded-2xl p-8 text-center">
              <p className="text-gray-600 mb-4">No active listings yet</p>
              <Button 
                onClick={() => navigate('/donor/post-listing')}
                className="bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post Your First Listing
              </Button>
            </Card>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {activeListings.map((listing) => (
                <Card 
                  key={listing.id}
                  onClick={() => navigate(`/donor/listing/${listing.id}`)}
                  className="min-w-[280px] flex-shrink-0 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {listing.image ? (
                    <img src={listing.image} alt={listing.name} className="w-full h-40 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-[#1A1A1A] mb-2">{listing.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">{listing.quantity} {listing.unit}</span>
                      {listing.expiry !== 'Expired' && (
                        <Badge className={`${parseInt(listing.expiry) <= 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} rounded-full`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {listing.expiry}
                        </Badge>
                      )}
                    </div>
                    <Badge className={listing.status === 'Available' ? 'bg-[#40916C] text-white' : 'bg-[#F4A261] text-white'}>
                      {listing.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div>
          <h2 className="font-display text-xl font-bold mb-4">Recent Activity</h2>
          <Card className="rounded-2xl p-4 shadow-sm">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className={`flex gap-3 pb-4 ${index !== activities.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className={`w-1 rounded-full ${activity.type === 'success' ? 'bg-[#40916C]' : 'bg-[#F4A261]'}`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-[#1A1A1A]">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <BottomNav role="donor" active="home" />
    </div>
  );
}