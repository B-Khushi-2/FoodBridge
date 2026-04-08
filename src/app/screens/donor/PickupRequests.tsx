import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Phone, Star, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { BottomNav } from '../../components/BottomNav';
import { getAuthHeaders } from '../../context/AuthContext';
import { toast } from 'sonner';

export function PickupRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/requests/donor', { headers: getAuthHeaders() });
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
    const interval = setInterval(fetchRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update request');
      
      if (status === 'accepted') toast.success('✅ Request accepted! Receiver has been notified.');
      else if (status === 'rejected') toast.info('Request declined.');
      else if (status === 'completed') toast.success('🎉 Marked as completed! Food has been picked up.');
      
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update request status');
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold">Pickup Requests</h1>
          {pendingCount > 0 && (
            <Badge className="bg-yellow-100 text-yellow-700 rounded-full ml-auto">{pendingCount} pending</Badge>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500">No requests yet</h3>
            <p className="text-sm text-gray-400 mt-1">When receivers request your listings, they'll appear here.</p>
          </div>
        ) : (
          requests.map((request) => {
            const receiver = request.receiverId || {};
            const listing = request.listingId || {};
            return (
              <Card key={request._id} className="rounded-2xl overflow-hidden shadow-sm">
                {/* Header with receiver info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#F4A261] flex items-center justify-center text-white text-lg font-bold">
                        {receiver.name ? receiver.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1A1A1A]">{receiver.name || 'Unknown Receiver'}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Star className="w-3 h-3 fill-[#F4A261] text-[#F4A261]" />
                          <span className="text-xs text-gray-600">4.8</span>
                          {receiver.address && <span className="text-xs text-gray-400">• {receiver.address}</span>}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(request.createdAt).toLocaleString()}</span>
                  </div>

                  {/* Requested listing info */}
                  <div className="bg-[#FAFAF7] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      {listing.image && (
                        <img src={listing.image} alt={listing.foodType} className="w-14 h-14 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{listing.foodType || 'Food Item'}</h4>
                        <p className="text-xs text-gray-600">{listing.quantity}</p>
                      </div>
                      <Badge className={`rounded-full text-xs ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        request.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {request.status}
                      </Badge>
                    </div>
                    {request.message && (
                      <p className="text-xs italic text-gray-500 mt-2 border-t border-gray-100 pt-2">
                        💬 "{request.message}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons based on status */}
                {request.status === 'pending' && (
                  <div className="border-t border-gray-100 px-5 py-3 flex gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleAction(request._id, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                    <Button 
                      className="flex-1 bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl"
                      onClick={() => handleAction(request._id, 'accepted')}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                  </div>
                )}

                {request.status === 'accepted' && (
                  <div className="border-t border-green-100 bg-green-50 px-5 py-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700 font-medium">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Accepted — Waiting for pickup
                      </span>
                      <Button 
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs"
                        onClick={() => handleAction(request._id, 'completed')}
                      >
                        ✅ Mark Picked Up
                      </Button>
                    </div>
                    {receiver.phone && receiver.phone !== '0000000000' && (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Phone className="w-4 h-4" />
                        <span>{receiver.phone}</span>
                      </div>
                    )}
                  </div>
                )}

                {request.status === 'completed' && (
                  <div className="border-t border-blue-100 bg-blue-50 px-5 py-3">
                    <p className="text-sm text-blue-700 font-medium">
                      🎉 Food successfully picked up! Thank you for your donation.
                    </p>
                  </div>
                )}

                {request.status === 'rejected' && (
                  <div className="border-t border-red-100 bg-red-50 px-5 py-3">
                    <p className="text-sm text-red-600">
                      Request was declined. {request.message && `Reason: ${request.message}`}
                    </p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      <BottomNav role="donor" active="requests" />
    </div>
  );
}
