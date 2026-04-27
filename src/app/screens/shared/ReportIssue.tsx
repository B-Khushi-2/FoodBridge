import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Upload, Send, ShieldCheck, ShieldAlert, ShieldX, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';
import { getAuthHeaders } from '../../context/AuthContext';
import { BottomNav } from '../../components/BottomNav';

interface VerificationResult {
  overallVerdict: string;
  overallConfidence: number;
  isFood: boolean;
  contextMatch: boolean;
  classificationLabels: string[];
  classificationConfidence: number;
  qualityScore: number;
  qualityIssues: string[];
  elaScore: number;
  exifScore: number;
  exifPresent: boolean;
  statsScore: number;
  details: string;
  analyzedAt: string;
  imageResolution: string;
}

interface ReportResult {
  _id: string;
  title: string;
  status: string;
  imageVerification: VerificationResult;
}

export function ReportIssue() {
  const navigate = useNavigate();
  const userRole = sessionStorage.getItem('userRole') || 'receiver';

  const [reportType, setReportType] = useState('food_quality');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReportResult | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a report title');
      return;
    }
    if (!imageBase64) {
      toast.error('Please upload an image for verification');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          reportType,
          title: title.trim(),
          description: description.trim(),
          image: imageBase64,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');
      
      setResult(data.report);
      toast.success('Report submitted & verified!');
      setTitle('');
      setDescription('');
      setImagePreview('');
      setImageBase64('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictInfo = (verdict: string) => {
    if (verdict === 'Verified') return { icon: ShieldCheck, color: 'bg-green-100 text-green-700', barColor: '#40916C' };
    if (verdict === 'Mismatch') return { icon: ShieldAlert, color: 'bg-yellow-100 text-yellow-700', barColor: '#F4A261' };
    return { icon: ShieldX, color: 'bg-red-100 text-red-700', barColor: '#E76F51' };
  };

  const getConfidenceColor = (c: number) => c >= 70 ? '#40916C' : c >= 40 ? '#F4A261' : '#E76F51';

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold text-[#1A1A1A]">📝 Submit Report</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Info Banner */}
        <Card className="rounded-2xl p-4 bg-gradient-to-r from-[#2D6A4F] to-[#40916C] text-white shadow-lg">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 flex-shrink-0 opacity-90" />
            <div>
              <h3 className="font-semibold">AI-Powered Image Verification</h3>
              <p className="text-sm opacity-90">
                Upload an image and our AI will analyze it for food detection, quality, and authenticity.
              </p>
            </div>
          </div>
        </Card>

        {/* Report Form */}
        <Card className="rounded-2xl p-6 shadow-sm">
          <h2 className="font-display text-lg font-bold mb-5">Report Details</h2>
          <div className="space-y-5">
            {/* Report Type */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">Report Type</Label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F]"
              >
                <option value="food_quality">🍎 Food Quality Issue</option>
                <option value="suspicious_listing">⚠️ Suspicious Listing</option>
                <option value="delivery_issue">🚗 Delivery Issue</option>
                <option value="other">📋 Other</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief report title..."
                className="mt-1.5 rounded-xl"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                rows={3}
                className="mt-1.5 rounded-xl"
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">Upload Image</Label>
              <div className="mt-1.5">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      onClick={() => { setImagePreview(''); setImageBase64(''); }}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full p-1.5 hover:bg-white shadow-sm"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#2D6A4F] hover:bg-green-50/30 transition-all">
                    <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">Click to upload image</span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !title.trim() || !imageBase64}
              className="w-full bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl py-6 text-base shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit & Verify
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Verification Result */}
        {result && result.imageVerification && (
          <Card className="rounded-2xl overflow-hidden shadow-md border-0">
            {/* Result Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 border-b border-gray-200">
              <h3 className="font-display text-lg font-bold text-[#1A1A1A] mb-3">Verification Result</h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const info = getVerdictInfo(result.imageVerification.overallVerdict);
                  return (
                    <Badge className={`${info.color} rounded-full px-4 py-1.5 text-sm`}>
                      <info.icon className="w-4 h-4 mr-1.5 inline" />
                      {result.imageVerification.overallVerdict}
                    </Badge>
                  );
                })()}
                <Badge className={`rounded-full px-4 py-1.5 text-sm ${result.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {result.status === 'Approved' ? '✅' : '❌'} {result.status}
                </Badge>
              </div>
            </div>

            {/* Overall Confidence */}
            <div className="p-5 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">Overall Confidence</span>
                  <span className="text-lg font-bold" style={{ color: getConfidenceColor(result.imageVerification.overallConfidence) }}>
                    {result.imageVerification.overallConfidence}%
                  </span>
                </div>
                <Progress 
                  value={result.imageVerification.overallConfidence} 
                  className="h-3 rounded-full" 
                />
              </div>

              {/* Detection Tags */}
              <div className="flex flex-wrap gap-2">
                <Badge className={`rounded-full px-3 py-1 text-xs ${result.imageVerification.isFood ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {result.imageVerification.isFood ? '✅ Food Detected' : '❌ Not Food'}
                </Badge>
                <Badge className={`rounded-full px-3 py-1 text-xs ${result.imageVerification.contextMatch ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {result.imageVerification.contextMatch ? '✅ Context Match' : '❌ Context Mismatch'}
                </Badge>
                {result.imageVerification.exifPresent !== undefined && (
                  <Badge className={`rounded-full px-3 py-1 text-xs ${result.imageVerification.exifPresent ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {result.imageVerification.exifPresent ? '✅ EXIF Present' : '⚠️ No EXIF'}
                  </Badge>
                )}
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Score Breakdown</h4>
                {[
                  { label: '🏷️ Classification', value: result.imageVerification.classificationConfidence },
                  { label: '📷 Quality', value: result.imageVerification.qualityScore },
                  { label: '🔬 ELA (Manipulation)', value: result.imageVerification.elaScore },
                  { label: '📋 EXIF Metadata', value: result.imageVerification.exifScore },
                  { label: '📊 Statistics', value: result.imageVerification.statsScore },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-40 flex-shrink-0">{item.label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700" 
                        style={{ width: `${item.value || 0}%`, backgroundColor: getConfidenceColor(item.value || 0) }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-10 text-right" style={{ color: getConfidenceColor(item.value || 0) }}>
                      {item.value || 0}%
                    </span>
                  </div>
                ))}
              </div>

              {/* Detected Labels */}
              {result.imageVerification.classificationLabels?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Detected Labels</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.imageVerification.classificationLabels.map((label, i) => (
                      <Badge key={i} className="bg-gray-100 text-gray-700 rounded-full text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Summary */}
              {result.imageVerification.details && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">AI Summary</h4>
                  <p className="text-sm text-gray-600">{result.imageVerification.details}</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {(userRole === 'donor' || userRole === 'receiver') && (
        <BottomNav role={userRole as 'donor' | 'receiver'} active="" />
      )}
    </div>
  );
}
