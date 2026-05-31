import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Clock, Star, Phone, CheckCircle, XCircle, AlertCircle, KeyRound, MessageCircle, ShieldCheck, Copy } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { BottomNav } from '../../components/BottomNav';
import { getAuthHeaders } from '../../context/AuthContext';
import { toast } from 'sonner';
import { RatingModal } from '../../components/RatingModal';


export function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [ratingTarget, setRatingTarget] = useState<{ requestId: string; donorName: string; foodName: string } | null>(null);
  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests/receiver', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (requestId: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        toast.success('Request cancelled');
        fetchRequests();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to cancel');
      }
    } catch (err) {
      toast.error('Failed to cancel request');
    }
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin).then(() => {
      toast.success('PIN copied!');
    }).catch(() => {
      toast.error('Failed to copy PIN');
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: '⏳ Pending Approval', icon: Clock };
      case 'accepted':
        return { color: 'bg-green-100 text-green-700 border-green-200', label: '✅ Accepted — Ready for Pickup!', icon: CheckCircle };
      case 'completed':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', label: '🎉 Completed — Food Received!', icon: CheckCircle };
      case 'rejected':
        return { color: 'bg-red-100 text-red-700 border-red-200', label: '❌ Rejected by Donor', icon: XCircle };
      case 'cancelled':
        return { color: 'bg-gray-100 text-gray-700', label: 'Cancelled', icon: XCircle };
      default:
        return { color: 'bg-gray-100 text-gray-700', label: status, icon: AlertCircle };
    }
  };

  const renderRequestCard = (request: any) => {
    const statusConfig = getStatusConfig(request.status);
    const listing = request.listingId || {};
    const donor = request.donorId || {};

    return (
      <Card key={request._id} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <div className="flex gap-4 p-4">
          <img 
            src={listing.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop'} 
            alt={listing.foodType || 'Food'} 
            className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#1A1A1A] truncate">{listing.foodType || 'Unknown'}</h3>
            <p className="text-sm text-gray-600">{listing.quantity}</p>

            <div className="flex items-center gap-2 my-1">
              <span className="text-sm text-gray-600">{donor.name || 'Anonymous Donor'}</span>
              <Star className="w-3 h-3 fill-[#F4A261] text-[#F4A261]" />
              <span className="text-xs text-gray-600">4.5</span>
            </div>

            <Badge className={`${statusConfig.color} text-xs rounded-full border`}>
              {statusConfig.label}
            </Badge>
            <span className="text-xs text-gray-400 ml-2">{new Date(request.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Pending — allow cancel */}
        {request.status === 'pending' && (
          <div className="bg-yellow-50 border-t border-yellow-100 px-4 py-3 flex items-center justify-between">
            <p className="text-xs text-yellow-700">
              <Clock className="w-3 h-3 inline mr-1" />
              Waiting for donor to accept...
            </p>
            <Button 
              size="sm" variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50 rounded-full text-xs"
              onClick={() => handleCancel(request._id)}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Accepted — show pickup details + PIN */}
        {request.status === 'accepted' && (
          <div className="bg-green-50 border-t border-green-100 px-4 py-3 space-y-3">
            <p className="text-sm text-green-700 font-semibold">🎉 Donor accepted your request! Go pick it up:</p>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-green-700" />
              <span className="text-green-700">Pickup: {listing.pickupWindowStart} - {listing.pickupWindowEnd}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-green-700" />
              <span className="text-green-700">{listing.location}</span>
            </div>
            {donor.phone && donor.phone !== '0000000000' && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-green-700" />
                <span className="text-green-700">{donor.phone}</span>
              </div>
            )}

            {/* Pickup PIN Display */}
            {request.pickupPin && (
              <div className="mt-3 p-4 bg-white rounded-xl border-2 border-green-300 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#2D6A4F]">
                  <ShieldCheck className="w-5 h-5" />
                  Your Pickup PIN
                </div>
                <div className="flex items-center justify-center gap-3 my-2">
                  {request.pickupPin.split('').map((digit: string, i: number) => (
                    <div
                      key={i}
                      className="w-12 h-14 flex items-center justify-center bg-[#EAF4EF] rounded-xl border-2 border-[#2D6A4F]/30 text-2xl font-bold text-[#2D6A4F]"
                    >
                      {digit}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Show this PIN to the donor when you arrive for pickup</p>
                <button
                  onClick={() => handleCopyPin(request.pickupPin)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 font-medium transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copy PIN
                </button>
              </div>
            )}

            {/* Chat button */}
            <button
              onClick={() => navigate(`/chat/${listing._id}/${request._id}`)}
              className="flex items-center gap-2 w-full justify-center py-2 bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat with Donor
            </button>
          </div>
        )}

        {/* Completed — success + rate button */}
        {request.status === 'completed' && (
          <div className="bg-blue-50 border-t border-blue-100 px-4 py-3 space-y-2">
            <p className="text-sm text-blue-700 font-medium">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Food successfully received! Thank you for helping reduce food waste. 🌍
            </p>
            {!ratedIds.has(request._id) && (
              <button
                onClick={() => setRatingTarget({
                  requestId: request._id,
                  donorName: donor.name || 'Donor',
                  foodName: listing.foodType || 'Food'
                })}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#F4A261] hover:bg-[#e89350] text-white rounded-xl text-sm font-medium transition-colors w-full justify-center"
              >
                <Star className="w-4 h-4 fill-white" />
                Rate this Pickup
              </button>
            )}
            {ratedIds.has(request._id) && (
              <p className="text-xs text-green-600 font-medium">⭐ You rated this pickup!</p>
            )}
          </div>
        )}


        {/* Rejected — message */}
        {request.status === 'rejected' && (
          <div className="bg-red-50 border-t border-red-100 px-4 py-3">
            <p className="text-sm text-red-600">
              {request.message || 'Donor declined this request. Try browsing other available listings.'}
            </p>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold">My Requests</h1>
          <div className="ml-auto">
            <span className="text-sm text-gray-500">{requests.length} total</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-6 bg-white rounded-2xl p-1">
            <TabsTrigger value="all" className="rounded-xl">All</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-xl">Pending</TabsTrigger>
            <TabsTrigger value="accepted" className="rounded-xl">Accepted</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl">Done</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {requests.length === 0 ? <p className="text-center text-gray-500 py-8">No requests yet. Browse listings to request food!</p> : requests.map(renderRequestCard)}
          </TabsContent>
          <TabsContent value="pending" className="space-y-4">
            {requests.filter(r => r.status === 'pending').length === 0 ? <p className="text-center text-gray-500 py-8">No pending requests.</p> : requests.filter(r => r.status === 'pending').map(renderRequestCard)}
          </TabsContent>
          <TabsContent value="accepted" className="space-y-4">
            {requests.filter(r => r.status === 'accepted').length === 0 ? <p className="text-center text-gray-500 py-8">No accepted requests yet.</p> : requests.filter(r => r.status === 'accepted').map(renderRequestCard)}
          </TabsContent>
          <TabsContent value="completed" className="space-y-4">
            {requests.filter(r => ['completed', 'rejected', 'cancelled'].includes(r.status)).length === 0 ? <p className="text-center text-gray-500 py-8">No completed/closed requests.</p> : requests.filter(r => ['completed', 'rejected', 'cancelled'].includes(r.status)).map(renderRequestCard)}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav role="receiver" active="requests" />

      {/* Rating Modal */}
      {ratingTarget && (
        <RatingModal
          requestId={ratingTarget.requestId}
          donorName={ratingTarget.donorName}
          foodName={ratingTarget.foodName}
          onClose={() => setRatingTarget(null)}
          onSubmitted={() => setRatedIds((prev) => new Set([...prev, ratingTarget.requestId]))}
        />
      )}
    </div>
  );
}
