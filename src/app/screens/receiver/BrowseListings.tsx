import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Search, SlidersHorizontal, MapPin, Clock, List, Map as MapIcon } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { Slider } from '../../components/ui/slider';
import { BottomNav } from '../../components/BottomNav';
import { useListings } from '../../context/ListingsContext';
import { LocationMap } from '../../components/LocationMap';

export function BrowseListings() {
  const { availableListings } = useListings();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [distanceRange, setDistanceRange] = useState([5]);

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-3">
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="font-display text-xl font-bold">Browse Listings</h1>
          </div>
          
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food type, donor, area..."
                className="pl-10 rounded-xl"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl">
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle className="font-display text-xl">Filters</SheetTitle>
                </SheetHeader>
                <div className="space-y-6 py-6">
                  <div>
                    <label className="font-semibold mb-3 block">Distance Radius</label>
                    <div className="flex items-center gap-4">
                      <Slider 
                        value={distanceRange} 
                        onValueChange={setDistanceRange}
                        max={20}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="font-mono text-sm w-16">{distanceRange[0]} km</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="font-semibold mb-3 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {['Cooked Meals', 'Raw Vegetables', 'Bakery', 'Dairy', 'Packaged'].map((cat) => (
                        <Badge key={cat} className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 hover:bg-[#F4A261] hover:text-white rounded-full">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold mb-3 block">Suitable For</label>
                    <div className="flex gap-2">
                      {['Human Consumption', 'Cattle', 'Both'].map((option) => (
                        <Badge key={option} className="cursor-pointer px-4 py-2 bg-gray-100 text-gray-700 hover:bg-[#F4A261] hover:text-white rounded-full">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-[#F4A261] hover:bg-[#e89350] text-white rounded-xl py-6">
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-4">
        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="rounded-full flex-1"
          >
            <List className="w-4 h-4 mr-2" />
            List View
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
            className="rounded-full flex-1"
          >
            <MapIcon className="w-4 h-4 mr-2" />
            Map View
          </Button>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-600 mb-4">{availableListings.length} listings found</p>

        {/* Listings */}
        {viewMode === 'list' ? (
          <div className="space-y-4">
            {availableListings.map((listing) => (
              <Card 
                key={listing.id}
                onClick={() => navigate(`/receiver/listing/${listing.id}`)}
                className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex gap-4 p-4">
                  <img src={listing.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop'} alt={listing.name} className="w-28 h-28 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1A1A1A] mb-1 truncate">{listing.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="truncate">{listing.donorName}</span>
                      <span>★ {listing.donorRating}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{listing.distance}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-gray-100 text-gray-700 text-xs rounded-full">
                        {listing.quantity} {listing.unit}
                      </Badge>
                      <Badge className={`${listing.expiry === 'Expired' || listing.expiry.includes('2h') || listing.expiry.includes('3h') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} text-xs rounded-full`}>
                        <Clock className="w-3 h-3 mr-1" />
                        {listing.expiry}
                      </Badge>
                      {listing.imageAnalysis?.verdict && (
                        <Badge className={`text-xs rounded-full ${
                          listing.imageAnalysis.verdict === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          listing.imageAnalysis.verdict === 'suspected' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {listing.imageAnalysis.verdict === 'approved' ? `✅ Fresh ${Math.round(listing.imageAnalysis.freshness * 100)}%` :
                           listing.imageAnalysis.verdict === 'suspected' ? '⚠️ Quality Review' :
                           '❌ Unverified'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl overflow-hidden">
            <LocationMap
              height="500px"
              zoom={12}
              markers={availableListings
                .filter(l => l.location && l.location.lat && l.location.lng)
                .map(l => ({
                  lat: l.location.lat,
                  lng: l.location.lng,
                  popup: `<div style="min-width:160px"><strong>${l.name}</strong><br/>${l.quantity} ${l.unit}<br/>📍 ${l.address}<br/><em>${l.expiry} left</em></div>`
                }))}
            />
          </Card>
        )}
      </div>

      <BottomNav role="receiver" active="browse" />
    </div>
  );
}
