import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MapPin, Clock, AlertCircle, Star, Phone, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { useListings } from '../../context/ListingsContext';
import { getAuthHeaders } from '../../context/AuthContext';
import { LocationMap } from '../../components/LocationMap';

export function ReceiverListingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getListingById } = useListings();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [pickupETA, setPickupETA] = useState('');
  const [message, setMessage] = useState('');

  const listing = getListingById(Number(id));

  if (!listing) {
    return <div className="p-8 text-center text-gray-500">Listing not found or loading...</div>;
  }

  const handleRequestPickup = async () => {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          listingId: listing._id,
          message: `${message}\nETA: ${pickupETA}`
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to request pickup');
      }
      toast.success('Pickup Request Sent! 🎉');
      setShowRequestDialog(false);
      navigate('/receiver/dashboard'); // Navigating right to the main dash to pick up my-requests if it exists or fallback
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      {/* Hero Image */}
      <div className="relative">
        <img src={listing.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop'} alt={listing.name} className="w-full h-64 object-cover" />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="absolute bottom-4 right-4">
          <Badge className="bg-red-500 text-white px-4 py-2 rounded-full animate-pulse">
            <Clock className="w-4 h-4 mr-1 inline" />
            {listing.expiry} left
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Title */}
        <div>
          <h1 className="font-display text-3xl font-bold text-[#1A1A1A] mb-2">{listing.name}</h1>
          <div className="flex items-center gap-2">
            <Badge className="bg-gray-100 text-gray-700 rounded-full">{listing.category}</Badge>
            <Badge className="bg-[#40916C] text-white rounded-full">{listing.status}</Badge>
          </div>
        </div>

        {/* Quantity */}
        <Card className="rounded-2xl p-6 bg-[#F4A261] text-white">
          <div className="font-mono text-4xl font-bold">{listing.quantity} {listing.unit}</div>
          <div className="text-sm opacity-90 mt-1">Available for Pickup</div>
        </Card>

        {/* Expiry Warning */}
        {listing.expiry === 'Expired' || listing.expiry.includes('2h') || listing.expiry.includes('3h') ? (
          <Card className="rounded-2xl p-6 bg-red-50 border-red-200 animate-pulse">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900">Expiring Very Soon!</h3>
                <p className="text-sm text-red-700">Best before: {listing.expiryTime}</p>
                <p className="text-xs text-red-600 mt-1">Request pickup immediately to avoid waste</p>
              </div>
            </div>
          </Card>
        ) : null}

        {/* Food Details */}
        <Card className="rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold mb-4">Food Details</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Allergen Warnings:</span>
              <div className="flex gap-2 mt-1">
                {listing.allergens.map((allergen: string) => (
                  <Badge key={allergen} className="bg-amber-100 text-amber-700 rounded-full">{allergen}</Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Suitable For:</span>
              <div className="flex gap-2 mt-1">
                {listing.suitableFor.map((item: string) => (
                  <Badge key={item} className="bg-green-100 text-green-700 rounded-full">{item}</Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Donor Info */}
        <Card className="rounded-2xl p-6 bg-white">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#2D6A4F] flex items-center justify-center text-white text-2xl font-bold">
              {listing.donorName.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#1A1A1A] text-lg">{listing.donorName}</h3>
              <p className="text-sm text-gray-600">Verified Donor</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#F4A261] text-[#F4A261]" />
                  <span className="font-semibold">{listing.donorRating}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Pickup Location */}
        <Card className="rounded-2xl p-6">
          <h3 className="font-display text-lg font-bold mb-4">Pickup Location</h3>
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <LocationMap
                location={listing.location}
                editable={false}
                height="220px"
                zoom={15}
              />
            </div>
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
            <Button 
              variant="outline"
              className="w-full rounded-xl border-2 border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white"
              onClick={() => {
                const lat = listing.location?.lat;
                const lng = listing.location?.lng;
                if (lat && lng) {
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                } else {
                  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.address)}`, '_blank');
                }
              }}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          </div>
        </Card>

        {/* Special Instructions */}
        {listing.instructions && (
          <Card className="rounded-2xl p-6 bg-amber-50 border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-2">Special Pickup Instructions</h3>
            <p className="text-amber-800">{listing.instructions}</p>
          </Card>
        )}

        {/* Action Button */}
        <Button 
          onClick={() => setShowRequestDialog(true)}
          className="w-full bg-[#F4A261] hover:bg-[#e89350] text-white rounded-2xl py-6 text-lg shadow-lg"
          disabled={listing.status !== 'Available'}
        >
          {listing.status === 'Available' ? 'Request Pickup' : 'No Longer Available'}
        </Button>
      </div>

      {/* Request Pickup Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Confirm Pickup Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Card className="p-4 bg-[#FAFAF7]">
              <div className="flex gap-3">
                <img src={listing.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop'} alt={listing.name} className="w-16 h-16 rounded-lg object-cover" />
                <div>
                  <h4 className="font-semibold text-sm">{listing.name}</h4>
                  <p className="text-xs text-gray-600">{listing.donorName}</p>
                  <p className="text-xs text-gray-600 mt-1">{listing.quantity} {listing.unit}</p>
                </div>
              </div>
            </Card>

            <div>
              <Label htmlFor="eta">Your Estimated Pickup Time</Label>
              <Input
                id="eta"
                type="time"
                value={pickupETA}
                onChange={(e) => setPickupETA(e.target.value)}
                className="mt-1 rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="message">Message to Donor (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 rounded-xl"
                rows={3}
                placeholder="Any additional information..."
              />
            </div>

            <Button 
              onClick={handleRequestPickup}
              className="w-full bg-[#F4A261] hover:bg-[#e89350] text-white rounded-xl py-6"
            >
              Confirm Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
