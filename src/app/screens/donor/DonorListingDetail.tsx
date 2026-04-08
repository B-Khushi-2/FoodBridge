import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MapPin, Clock, AlertCircle, Edit, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useListings } from '../../context/ListingsContext';
import { toast } from 'sonner';
import { SimpleLocationPicker } from '../../components/SimpleLocationPicker';

export function DonorListingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { listings, updateListing, deleteListing } = useListings();

  const listing = listings.find(l => l.id === Number(id));

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-2">Listing not found</h2>
          <p className="text-gray-600 mb-6">This listing may have been removed</p>
          <Button onClick={() => navigate('/donor/my-listings')}>
            Back to My Listings
          </Button>
        </div>
      </div>
    );
  }

  const handleMarkComplete = () => {
    updateListing(listing.id, { status: 'Completed' });
    toast.success('Listing marked as completed!');
    navigate('/donor/my-listings');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this listing?')) {
      deleteListing(listing.id);
      toast.success('Listing deleted successfully');
      navigate('/donor/my-listings');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-[#40916C] text-white';
      case 'Reserved': return 'bg-[#F4A261] text-white';
      case 'Completed': return 'bg-gray-400 text-white';
      case 'Expired': return 'bg-red-500 text-white';
      default: return 'bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      {/* Hero Image */}
      <div className="relative">
        {listing.image ? (
          <img src={listing.image} alt={listing.name} className="w-full h-64 object-cover" />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
            <span className="text-gray-400 text-lg">No image</span>
          </div>
        )}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        {listing.status !== 'Completed' && listing.expiry !== 'Expired' && (
          <div className="absolute bottom-4 right-4">
            <Badge className="bg-red-500 text-white px-4 py-2 rounded-full">
              <Clock className="w-4 h-4 mr-1 inline" />
              Expires in {listing.expiry}
            </Badge>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Title & Status */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="font-display text-3xl font-bold text-[#1A1A1A]">{listing.name}</h1>
            {listing.status === 'Available' && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => toast.info('Edit feature coming soon!')}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-gray-100 text-gray-700 rounded-full">{listing.category}</Badge>
            <Badge className={`${getStatusColor(listing.status)} rounded-full`}>{listing.status}</Badge>
          </div>
        </div>

        {/* Quantity */}
        <Card className="rounded-2xl p-6 bg-[#2D6A4F] text-white">
          <div className="font-mono text-4xl font-bold">{listing.quantity} {listing.unit}</div>
          <div className="text-sm opacity-90 mt-1">Total Quantity Available</div>
        </Card>

        {/* Expiry Countdown */}
        {listing.status !== 'Completed' && (
          <Card className="rounded-2xl p-6 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Best Before</h3>
                <p className="text-sm text-red-700">{listing.expiryTime}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Details */}
        <Card className="rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold mb-4">Food Details</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Pack Date:</span>
              <p className="text-[#1A1A1A]">{new Date(listing.packDate).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Allergens:</span>
              <p className="text-[#1A1A1A]">{listing.allergens.join(', ') || 'None specified'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Suitable For:</span>
              <div className="flex gap-2 mt-1 flex-wrap">
                {listing.suitableFor.map((item) => (
                  <Badge key={item} className="bg-green-100 text-green-700 rounded-full">{item}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Video Preview */}
        {listing.video && (
          <Card className="rounded-2xl p-6">
            <h3 className="font-display text-lg font-bold mb-4">Video Preview</h3>
            <video src={listing.video} controls className="w-full rounded-xl" />
          </Card>
        )}

        {/* Pickup Location */}
        <Card className="rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold mb-4">Pickup Location</h3>
          <div className="space-y-4">
            <SimpleLocationPicker
              location={listing.location}
              editable={false}
              height="200px"
            />
            <div className="flex gap-3">
              <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <p className="text-[#1A1A1A]">{listing.address}</p>
            </div>
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Pickup Window</p>
                <p className="text-[#1A1A1A] font-medium">{listing.pickupWindow}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Special Instructions */}
        {listing.instructions && (
          <Card className="rounded-2xl p-6 bg-amber-50 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">Special Instructions</h3>
            <p className="text-amber-800">{listing.instructions}</p>
          </Card>
        )}

        {/* Requests Status */}
        <Card className="rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold mb-4">
            Requests Received ({listing.requests})
          </h3>
          {listing.requests === 0 ? (
            <p className="text-gray-600 text-center py-4">No requests yet</p>
          ) : (
            <p className="text-gray-600 text-center py-4">
              {listing.requests} {listing.requests === 1 ? 'organization has' : 'organizations have'} requested this food
            </p>
          )}
        </Card>

        {/* Actions */}
        {listing.status === 'Available' && (
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={handleDelete}
              className="flex-1 rounded-xl py-6 border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Listing
            </Button>
            <Button 
              onClick={handleMarkComplete}
              className="flex-1 bg-[#40916C] hover:bg-[#358a5c] text-white rounded-xl py-6"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark as Complete
            </Button>
          </div>
        )}

        {listing.status === 'Completed' && (
          <Card className="rounded-2xl p-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Listing Completed</h3>
                <p className="text-sm text-green-700">This food has been successfully distributed</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
