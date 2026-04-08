import { useNavigate } from 'react-router';
import { ArrowLeft, MoreVertical, Clock } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { BottomNav } from '../../components/BottomNav';
import { useListings } from '../../context/ListingsContext';

export function MyListings() {
  const navigate = useNavigate();
  const { myDonorListings: myListings } = useListings();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-[#40916C] text-white';
      case 'Reserved': return 'bg-[#F4A261] text-white';
      case 'Completed': return 'bg-gray-400 text-white';
      case 'Expired': return 'bg-red-500 text-white';
      default: return 'bg-gray-200';
    }
  };

  const filterListings = (status: string) => {
    if (status === 'all') return myListings;
    if (status === 'active') return myListings.filter(l => l.status === 'Available');
    if (status === 'reserved') return myListings.filter(l => l.status === 'Reserved');
    if (status === 'completed') return myListings.filter(l => l.status === 'Completed');
    if (status === 'expired') return myListings.filter(l => l.status === 'Expired');
    return myListings;
  };

  const ListingCard = ({ listing }: { listing: typeof myListings[0] }) => (
    <Card 
      onClick={() => navigate(`/donor/listing/${listing.id}`)}
      className="rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex gap-4 p-4">
        {listing.image ? (
          <img src={listing.image} alt={listing.name} className="w-24 h-24 rounded-xl object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-xl bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center px-2">No image</span>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-[#1A1A1A]">{listing.name}</h3>
              <p className="text-sm text-gray-600">{listing.category}</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                // TODO: Add menu options (edit, delete, mark as completed, etc.)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-600">{listing.quantity} {listing.unit}</span>
            {listing.status !== 'Completed' && listing.expiry !== 'Expired' && (
              <Badge className="bg-red-100 text-red-700 rounded-full text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {listing.expiry}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(listing.status)} rounded-full`}>
              {listing.status}
            </Badge>
            {listing.requests > 0 && (
              <span className="text-xs text-gray-600">{listing.requests} request(s)</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold">My Listings</h1>
          <div className="ml-auto text-sm text-gray-600">
            {myListings.length} {myListings.length === 1 ? 'listing' : 'listings'}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {myListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-display text-xl font-bold mb-2">No listings yet</h3>
            <p className="text-gray-600 mb-6">Start posting food to help those in need</p>
            <button
              onClick={() => navigate('/donor/post-listing')}
              className="bg-[#2D6A4F] hover:bg-[#235a41] text-white px-8 py-3 rounded-xl font-semibold"
            >
              Post Your First Listing
            </button>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-5 mb-6 bg-white rounded-2xl p-1">
              <TabsTrigger value="all" className="rounded-xl">All</TabsTrigger>
              <TabsTrigger value="active" className="rounded-xl">Active</TabsTrigger>
              <TabsTrigger value="reserved" className="rounded-xl">Reserved</TabsTrigger>
              <TabsTrigger value="completed" className="rounded-xl">Completed</TabsTrigger>
              <TabsTrigger value="expired" className="rounded-xl">Expired</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filterListings('all').length === 0 ? (
                <div className="text-center py-8 text-gray-500">No listings</div>
              ) : (
                filterListings('all').map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              )}
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              {filterListings('active').length === 0 ? (
                <div className="text-center py-8 text-gray-500">No active listings</div>
              ) : (
                filterListings('active').map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              )}
            </TabsContent>

            <TabsContent value="reserved" className="space-y-4">
              {filterListings('reserved').length === 0 ? (
                <div className="text-center py-8 text-gray-500">No reserved listings</div>
              ) : (
                filterListings('reserved').map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {filterListings('completed').length === 0 ? (
                <div className="text-center py-8 text-gray-500">No completed listings</div>
              ) : (
                filterListings('completed').map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              )}
            </TabsContent>

            <TabsContent value="expired" className="space-y-4">
              {filterListings('expired').length === 0 ? (
                <div className="text-center py-8 text-gray-500">No expired listings</div>
              ) : (
                filterListings('expired').map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <BottomNav role="donor" active="listings" />
    </div>
  );
}
