import { useNavigate } from 'react-router';
import { Bell, MapPin, Clock, Salad, Package, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BottomNav } from '../../components/BottomNav';
import { useListings } from '../../context/ListingsContext';

const stats = [
  { icon: Package, value: '28', label: 'Pickups Received', color: 'bg-[#F4A261]' },
  { icon: Users, value: '~140', label: 'People Served', color: 'bg-[#2D6A4F]' },
  { icon: Salad, value: '12', label: 'Cattle Feeds Collected', color: 'bg-[#E76F51]' },
];

const quickFilters = [
  { label: 'Near Me', icon: MapPin },
  { label: 'Expiring Soon', icon: Clock },
  { label: 'Cooked Meals', icon: Salad },
  { label: 'Raw Food', icon: Package },
];

export function ReceiverDashboard() {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem('userName') || 'User';
  const { availableListings } = useListings();

  // Show only up to 3 for the dashboard preview
  const previewListings = availableListings.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-[#1A1A1A]">
              Welcome back, {userName}
            </h1>
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="relative text-gray-600 hover:text-gray-900"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F4A261] text-white text-xs rounded-full flex items-center justify-center">
              5
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Urgency Banner */}
        <Card className="rounded-2xl p-4 bg-gradient-to-r from-[#F4A261] to-[#E76F51] text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⚡</span>
            <div>
              <h3 className="font-semibold">Urgent: Food Expiring Soon</h3>
              <p className="text-sm opacity-90">listings expiring in under 2 hours near you!</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/receiver/browse?filter=expiring')}
            variant="secondary"
            className="mt-2 w-full rounded-xl"
          >
            View Now
          </Button>
        </Card>

        {/* Stats Row */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {stats.map((stat, index) => (
            <Card key={index} className={`${stat.color} text-white p-4 min-w-[140px] rounded-2xl flex-shrink-0 shadow-lg`}>
              <stat.icon className="w-6 h-6 mb-2 opacity-90" />
              <div className="font-mono text-2xl font-bold">{stat.value}</div>
              <div className="text-sm mt-1 opacity-90">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Quick Filters */}
        <div>
          <h2 className="font-display text-lg font-bold mb-3">Quick Filters</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickFilters.map((filter, index) => (
              <Button
                key={index}
                variant="outline"
                className="rounded-full whitespace-nowrap flex-shrink-0"
                onClick={() => navigate('/receiver/browse')}
              >
                <filter.icon className="w-4 h-4 mr-2" />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Available Listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Available Near You</h2>
            <button 
              onClick={() => navigate('/receiver/browse')}
              className="text-[#F4A261] text-sm font-semibold hover:underline"
            >
              See All
            </button>
          </div>
          <div className="space-y-4">
            {previewListings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No listings available near you.</p>
            ) : previewListings.map((listing) => (
              <Card 
                key={listing.id}
                onClick={() => navigate(`/receiver/listing/${listing.id}`)}
                className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex gap-4 p-4">
                  <img src={listing.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop'} alt={listing.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A1A1A] mb-1">{listing.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span>{listing.donorName}</span>
                      <span>★ {listing.donorRating}</span>
                      <span>• {listing.distance}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-gray-100 text-gray-700 text-xs rounded-full">
                        {listing.quantity} {listing.unit}
                      </Badge>
                      <Badge className={`${listing.expiry === 'Expired' || listing.expiry.includes('2h') || listing.expiry.includes('3h') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} text-xs rounded-full`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {listing.expiry} left
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-[#F4A261] hover:bg-[#e89350] text-white rounded-full self-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/receiver/listing/${listing.id}`);
                    }}
                  >
                    Request
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Map View Toggle */}
        <Button 
          onClick={() => navigate('/receiver/browse?view=map')}
          className="w-full bg-white border-2 border-[#F4A261] text-[#F4A261] hover:bg-[#F4A261] hover:text-white rounded-2xl py-6 shadow-sm"
        >
          <MapPin className="w-5 h-5 mr-2" />
          View on Map
        </Button>
      </div>

      <BottomNav role="receiver" active="home" />
    </div>
  );
}
