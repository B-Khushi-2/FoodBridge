import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, QrCode, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { getAuthHeaders } from '../../context/AuthContext';
import { toast } from 'sonner';

export function QRScanner() {
  const navigate = useNavigate();
  const [tokenInput, setTokenInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resultMsg, setResultMsg] = useState('');

  const handleVerify = async () => {
    const raw = tokenInput.trim();
    if (!raw) return;

    setStatus('loading');
    try {
      // Support both raw token and JSON payload (from QR scan)
      let qrToken = raw;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.token) qrToken = parsed.token;
      } catch {}

      const res = await fetch('/api/requests/verify-qr', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ qrToken })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setResultMsg('✅ Pickup verified! Food has been marked as collected.');
        toast.success('Pickup verified successfully!');
      } else {
        setStatus('error');
        setResultMsg(data.error || 'Invalid or expired QR code.');
        toast.error(data.error || 'Verification failed');
      }
    } catch (err) {
      setStatus('error');
      setResultMsg('Network error. Please try again.');
      toast.error('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold">QR Pickup Verification</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-10 space-y-6">
        {/* QR Icon Banner */}
        <div className="text-center">
          <div className="w-24 h-24 bg-[#EAF4EF] rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-12 h-12 text-[#2D6A4F]" />
          </div>
          <h2 className="text-xl font-bold text-[#1A1A1A]">Verify Pickup</h2>
          <p className="text-sm text-gray-500 mt-2">
            Enter or paste the QR token from your accepted request to confirm pickup.
          </p>
        </div>

        {/* Input card */}
        <Card className="rounded-2xl p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">QR Token / Payload</label>
            <Input
              value={tokenInput}
              onChange={(e) => { setTokenInput(e.target.value); setStatus('idle'); }}
              placeholder="Paste QR token here..."
              className="rounded-xl font-mono text-sm"
            />
          </div>
          <Button
            onClick={handleVerify}
            disabled={!tokenInput.trim() || status === 'loading'}
            className="w-full bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl py-3 font-semibold"
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Verify Pickup
              </span>
            )}
          </Button>
        </Card>

        {/* Result */}
        {status === 'success' && (
          <Card className="rounded-2xl p-5 bg-green-50 border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800">Pickup Confirmed!</p>
                <p className="text-sm text-green-700 mt-1">{resultMsg}</p>
                <Button
                  className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm"
                  onClick={() => navigate(-1)}
                >
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        )}

        {status === 'error' && (
          <Card className="rounded-2xl p-5 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700">Verification Failed</p>
                <p className="text-sm text-red-600 mt-1">{resultMsg}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Info box */}
        <Card className="rounded-2xl p-4 bg-blue-50 border-blue-100">
          <p className="text-xs text-blue-700">
            💡 <strong>How to find your QR token:</strong> Go to <em>My Requests</em> → open an accepted request → copy the QR code token shown there and paste it above.
          </p>
        </Card>
      </div>
    </div>
  );
}
