import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Clock, Star, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { BottomNav } from '../../components/BottomNav';
import { getAuthHeaders } from '../../context/AuthContext';
import { toast } from 'sonner';

export function MyRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);

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

        {/* Accepted — show pickup details */}
        {request.status === 'accepted' && (
          <div className="bg-green-50 border-t border-green-100 px-4 py-3 space-y-2">
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
          </div>
        )}

        {/* Completed — success message */}
        {request.status === 'completed' && (
          <div className="bg-blue-50 border-t border-blue-100 px-4 py-3">
            <p className="text-sm text-blue-700 font-medium">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Food successfully received! Thank you for helping reduce food waste. 🌍
            </p>
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
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold">My Requests</h1>
          <span className="ml-auto text-sm text-gray-500">{requests.length} total</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
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
    </div>
  );
}
