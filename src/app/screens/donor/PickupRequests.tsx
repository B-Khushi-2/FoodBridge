import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Phone, Star, CheckCircle, XCircle, Clock, Package, MessageCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { BottomNav } from '../../components/BottomNav';
import { getAuthHeaders } from '../../context/AuthContext';
import { toast } from 'sonner';

export function PickupRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<any[]>([]);
  const [pinInputs, setPinInputs] = useState<Record<string, string[]>>({});
  const [verifying, setVerifying] = useState<string | null>(null);
  const pinRefs = useRef<Record<string, (HTMLInputElement | null)[]>>({});

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
      
      if (status === 'accepted') toast.success('✅ Request accepted! Receiver has been notified with a pickup PIN.');
      else if (status === 'rejected') toast.info('Request declined.');
      else if (status === 'completed') toast.success('🎉 Marked as completed! Food has been picked up.');
      
      fetchRequests();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update request status');
    }
  };

  const handlePinDigit = (requestId: string, index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const current = pinInputs[requestId] || ['', '', '', ''];
    const updated = [...current];
    updated[index] = value;
    setPinInputs({ ...pinInputs, [requestId]: updated });

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = pinRefs.current[requestId]?.[index + 1];
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (requestId: string, index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      const current = pinInputs[requestId] || ['', '', '', ''];
      if (!current[index] && index > 0) {
        const prevInput = pinRefs.current[requestId]?.[index - 1];
        prevInput?.focus();
      }
    }
  };

  const handlePinPaste = (requestId: string, e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      const digits = pasted.split('');
      setPinInputs({ ...pinInputs, [requestId]: digits });
      // Focus last input
      const lastInput = pinRefs.current[requestId]?.[3];
      lastInput?.focus();
    }
  };

  const handleVerifyPin = async (requestId: string) => {
    const digits = pinInputs[requestId] || [];
    const pin = digits.join('');
    if (pin.length !== 4) {
      toast.error('Please enter the complete 4-digit PIN');
      return;
    }

    setVerifying(requestId);
    try {
      const res = await fetch('/api/requests/verify-pin', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ requestId, pin })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('🎉 ' + (data.message || 'Pickup confirmed!'));
        setPinInputs({ ...pinInputs, [requestId]: ['', '', '', ''] });
        fetchRequests();
      } else {
        toast.error(data.error || 'Verification failed');
        // Clear and refocus first digit
        setPinInputs({ ...pinInputs, [requestId]: ['', '', '', ''] });
        pinRefs.current[requestId]?.[0]?.focus();
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setVerifying(null);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold">Pickup Requests</h1>
          {pendingCount > 0 && (
            <Badge className="bg-yellow-100 text-yellow-700 rounded-full ml-auto">{pendingCount} pending</Badge>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
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
            const currentPin = pinInputs[request._id] || ['', '', '', ''];

            // Ensure refs array exists
            if (!pinRefs.current[request._id]) {
              pinRefs.current[request._id] = [null, null, null, null];
            }

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
                  <div className="border-t border-green-100 bg-green-50 px-5 py-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700 font-medium">
                        <CheckCircle className="w-4 h-4 inline mr-1" />
                        Accepted — Waiting for pickup
                      </span>
                    </div>

                    {/* PIN Verification Section */}
                    <div className="bg-white rounded-xl border border-green-200 p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#2D6A4F]">
                        <KeyRound className="w-4 h-4" />
                        Verify Pickup with PIN
                      </div>
                      <p className="text-xs text-gray-500">
                        Ask the receiver for their 4-digit pickup PIN and enter it below to confirm handover.
                      </p>

                      {/* 4-digit PIN input boxes */}
                      <div className="flex items-center justify-center gap-3">
                        {[0, 1, 2, 3].map((i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              if (!pinRefs.current[request._id]) pinRefs.current[request._id] = [null, null, null, null];
                              pinRefs.current[request._id][i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={currentPin[i]}
                            onChange={(e) => handlePinDigit(request._id, i, e.target.value)}
                            onKeyDown={(e) => handlePinKeyDown(request._id, i, e)}
                            onPaste={(e) => handlePinPaste(request._id, e)}
                            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/20 outline-none transition-all bg-gray-50 focus:bg-white"
                            disabled={verifying === request._id}
                          />
                        ))}
                      </div>

                      <Button
                        onClick={() => handleVerifyPin(request._id)}
                        disabled={currentPin.join('').length !== 4 || verifying === request._id}
                        className="w-full bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl py-2.5 font-semibold text-sm"
                      >
                        {verifying === request._id ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Verifying...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Confirm Pickup
                          </span>
                        )}
                      </Button>
                    </div>

                    {/* Fallback manual completion */}
                    <button
                      className="text-xs text-gray-400 hover:text-gray-600 underline w-full text-center transition-colors"
                      onClick={() => handleAction(request._id, 'completed')}
                    >
                      Or mark as picked up without PIN
                    </button>

                    {receiver.phone && receiver.phone !== '0000000000' && (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <Phone className="w-4 h-4" />
                        <span>{receiver.phone}</span>
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/chat/${listing._id}/${request._id}`)}
                      className="flex items-center gap-2 w-full justify-center py-2 bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl text-sm font-medium transition-colors mt-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat with Receiver
                    </button>
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
