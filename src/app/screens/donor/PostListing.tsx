import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Calendar, Clock, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { MediaUpload } from '../../components/MediaUpload';
import { SimpleLocationPicker } from '../../components/SimpleLocationPicker';
import { useListings } from '../../context/ListingsContext';

const categories = ['Cooked Meals', 'Raw Vegetables', 'Packaged Food', 'Bakery', 'Dairy', 'Other'];
const allergens = ['Gluten', 'Nuts', 'Dairy', 'None'];
const suitableFor = ['Human Consumption', 'Cattle', 'Both'];

export function PostListing() {
  const navigate = useNavigate();
  const { addListing } = useListings();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    foodName: '',
    category: '',
    quantity: '',
    unit: 'kg',
    packDate: '',
    expiry: '',
    allergens: [] as string[],
    address: '',
    location: { lat: 28.6139, lng: 77.2090 }, // Default Delhi
    pickupFrom: '',
    pickupTo: '',
    instructions: '',
    suitableFor: [] as string[],
    visibility: 'public',
    image: '',
    video: '',
    imageAnalysis: null as any
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const analyzeImage = async (dataUrl: string) => {
    if (!dataUrl) { setAnalysisResult(null); return; }
    setAnalyzing(true);
    try {
      const res = await fetch('/api/analyze/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data.analysis);
        setFormData(prev => ({ ...prev, imageAnalysis: data.analysis }));
        if (data.analysis.verdict === 'rejected') {
          toast.error('⚠️ Image rejected: ' + data.analysis.reason);
        } else if (data.analysis.verdict === 'suspected') {
          toast.warning('⚠️ Image flagged: ' + data.analysis.reason);
        } else {
          toast.success('✅ Food image verified!');
        }
      }
    } catch (err) {
      console.error('Image analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleSelection = (field: 'allergens' | 'suitableFor', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    // Calculate expiry time string
    const expiryDate = new Date(formData.expiry);
    const now = new Date();
    const diffHours = Math.round((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    const expiryString = diffHours > 0 ? `${diffHours}h` : 'Expired';

    try {
      // Create the listing
      // Block submission if image was rejected
      if (analysisResult?.verdict === 'rejected') {
        toast.error('Cannot submit: Image was flagged as non-food. Please upload a valid food photo.');
        return;
      }

      await addListing({
        name: formData.foodName,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        image: formData.image,
        video: formData.video,
        expiry: expiryString,
        expiryTime: expiryDate.toISOString(),
        allergens: formData.allergens,
        suitableFor: formData.suitableFor,
        address: formData.address,
        location: formData.location,
        pickupWindow: `${formData.pickupFrom} - ${formData.pickupTo}`,
        instructions: formData.instructions,
        packDate: formData.packDate,
        donorName: sessionStorage.getItem('userName') || 'Anonymous Donor',
        donorRating: 4.5,
        imageAnalysis: formData.imageAnalysis
      } as any);

      toast.success('Listing Posted Successfully! 🎉');
      navigate('/donor/dashboard');
    } catch (err: any) {
      toast.error('Failed to post listing: ' + (err.message || String(err)));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold">Post Food Listing</h1>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step >= num ? 'bg-[#2D6A4F] text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {num}
              </div>
              {num < 3 && (
                <div className={`flex-1 h-1 mx-2 ${step > num ? 'bg-[#2D6A4F]' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Food Details */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold mb-6">Food Details</h2>
            
            <div>
              <Label htmlFor="foodName">Food Name *</Label>
              <Input
                id="foodName"
                value={formData.foodName}
                onChange={(e) => setFormData({...formData, foodName: e.target.value})}
                className="mt-1 rounded-xl"
                placeholder="e.g., Fresh Vegetable Mix"
              />
            </div>

            <div>
              <Label>Category *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    onClick={() => setFormData({...formData, category: cat})}
                    className={`cursor-pointer px-4 py-2 rounded-full ${
                      formData.category === cat
                        ? 'bg-[#2D6A4F] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="mt-1 rounded-xl"
                  placeholder="15"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                  <SelectTrigger className="mt-1 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="portions">portions</SelectItem>
                    <SelectItem value="packets">packets</SelectItem>
                    <SelectItem value="liters">liters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <MediaUpload
              onImageSelect={(dataUrl) => {
                setFormData({...formData, image: dataUrl});
                if (dataUrl) {
                  analyzeImage(dataUrl);
                } else {
                  // Image removed — clear analysis so user can try again
                  setAnalysisResult(null);
                  setFormData(prev => ({ ...prev, imageAnalysis: null }));
                }
              }}
              onVideoSelect={(dataUrl) => setFormData({...formData, video: dataUrl})}
              currentImage={formData.image}
              currentVideo={formData.video}
              allowVideo={true}
            />

            {/* Image Analysis Result */}
            {analyzing && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-700 text-sm font-medium">Analyzing food image...</span>
              </div>
            )}
            {analysisResult && !analyzing && (
              <div className={`rounded-xl p-5 border-2 ${
                analysisResult.verdict === 'approved' ? 'bg-green-50 border-green-200' :
                analysisResult.verdict === 'suspected' ? 'bg-amber-50 border-amber-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  {analysisResult.verdict === 'approved' && <ShieldCheck className="w-6 h-6 text-green-600" />}
                  {analysisResult.verdict === 'suspected' && <ShieldAlert className="w-6 h-6 text-amber-600" />}
                  {analysisResult.verdict === 'rejected' && <ShieldX className="w-6 h-6 text-red-600" />}
                  <div>
                    <span className={`text-sm font-bold ${
                      analysisResult.verdict === 'approved' ? 'text-green-700' :
                      analysisResult.verdict === 'suspected' ? 'text-amber-700' :
                      'text-red-700'
                    }`}>
                      {analysisResult.verdict === 'approved' ? '🍽️ Food Authenticity Verified' :
                       analysisResult.verdict === 'suspected' ? '⚠️ Possible Quality Concern Detected' :
                       '🚫 Non-Food Content Detected'}
                    </span>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {analysisResult.verdict === 'approved' ? 'AI analysis confirms this is a genuine food image' :
                       analysisResult.verdict === 'suspected' ? 'Image may show spoiled or low-quality food — listing will be flagged' :
                       'This image does not contain recognizable food items'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mb-4 italic">{analysisResult.reason}</p>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 font-medium">🥗 Food Quality Score</span>
                      <span className="font-mono font-bold">{Math.round(analysisResult.freshness * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full transition-all duration-500" style={{
                        width: `${analysisResult.freshness * 100}%`,
                        backgroundColor: analysisResult.freshness > 0.6 ? '#40916C' : analysisResult.freshness > 0.35 ? '#F4A261' : '#E76F51'
                      }}></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {analysisResult.freshness > 0.7 ? 'Excellent — food appears fresh and safe' :
                       analysisResult.freshness > 0.4 ? 'Acceptable — food appears usable' :
                       'Low — possible spoilage or staleness detected'}
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 font-medium">🤖 AI Confidence</span>
                      <span className="font-mono font-bold">{Math.round(analysisResult.confidence * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-[#2D6A4F] transition-all duration-500" style={{ width: `${analysisResult.confidence * 100}%` }}></div>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {analysisResult.confidence > 0.7 ? 'High confidence in analysis results' :
                       analysisResult.confidence > 0.4 ? 'Moderate — manual review recommended' :
                       'Low — image may be unclear or unusual'}
                    </p>
                  </div>
                </div>
                {analysisResult.labels && analysisResult.labels.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500 font-medium">Detected: </span>
                    {analysisResult.labels.filter((l: string) => !['heuristic-analysis','analysis-error'].includes(l)).map((label: string) => (
                      <Badge key={label} className="bg-white/80 text-gray-600 text-xs rounded-full border mr-1 mb-1">{label}</Badge>
                    ))}
                  </div>
                )}
                {analysisResult.verdict === 'rejected' && (
                  <div className="bg-red-100 rounded-lg p-3 mt-2">
                    <p className="text-xs text-red-700 font-semibold">⛔ Submission blocked — Only genuine food photos are accepted. Please re-upload a clear image of the food you're donating.</p>
                  </div>
                )}
                {analysisResult.verdict === 'suspected' && (
                  <div className="bg-amber-100 rounded-lg p-3 mt-2">
                    <p className="text-xs text-amber-700 font-medium">⚠️ This listing will be published with a quality warning badge visible to receivers. Consider re-uploading a clearer photo.</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packDate">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Preparation Date *
                </Label>
                <Input
                  id="packDate"
                  type="date"
                  value={formData.packDate}
                  onChange={(e) => setFormData({...formData, packDate: e.target.value})}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="expiry">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Best Before *
                </Label>
                <Input
                  id="expiry"
                  type="datetime-local"
                  value={formData.expiry}
                  onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            <div>
              <Label>Allergen Information</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allergens.map((allergen) => (
                  <Badge
                    key={allergen}
                    onClick={() => toggleSelection('allergens', allergen)}
                    className={`cursor-pointer px-4 py-2 rounded-full ${
                      formData.allergens.includes(allergen)
                        ? 'bg-[#E76F51] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Block proceeding if image was rejected */}
            {analysisResult?.verdict === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <ShieldX className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-700">Submission Blocked — Non-Food Image Detected</p>
                  <p className="text-sm text-red-600 mt-1">Only genuine food photos are accepted. Please remove the current image and upload a clear image of the food you're donating.</p>
                </div>
              </div>
            )}

            <Button 
              onClick={() => {
                if (analysisResult?.verdict === 'rejected') {
                  toast.error('Please upload a valid food image before continuing.');
                  return;
                }
                setStep(2);
              }}
              disabled={analysisResult?.verdict === 'rejected' || analyzing}
              className={`w-full rounded-xl py-6 ${
                analysisResult?.verdict === 'rejected' || analyzing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#2D6A4F] hover:bg-[#235a41] text-white'
              }`}
            >
              {analyzing ? 'Analyzing Image...' : 
               analysisResult?.verdict === 'rejected' ? '⛔ Upload a Valid Food Image to Continue' : 
               'Continue to Pickup Details'}
            </Button>
          </div>
        )}

        {/* Step 2: Pickup Details */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold mb-6">Pickup Details</h2>
            
            <div>
              <Label htmlFor="address">
                <MapPin className="w-4 h-4 inline mr-1" />
                Pickup Address *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="mt-1 rounded-xl"
                placeholder="Enter full address or search on map below"
              />
              <div className="mt-3">
                <SimpleLocationPicker
                  location={formData.location}
                  onLocationSelect={(loc, geocodedAddress) => setFormData(prev => ({
                    ...prev,
                    location: loc,
                    address: geocodedAddress || prev.address
                  }))}
                  editable={true}
                  height="250px"
                />
              </div>
            </div>

            <div>
              <Label>Available Pickup Window *</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="pickupFrom" className="text-sm text-gray-600">From</Label>
                  <Input
                    id="pickupFrom"
                    type="time"
                    value={formData.pickupFrom}
                    onChange={(e) => setFormData({...formData, pickupFrom: e.target.value})}
                    className="mt-1 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="pickupTo" className="text-sm text-gray-600">To</Label>
                  <Input
                    id="pickupTo"
                    type="time"
                    value={formData.pickupTo}
                    onChange={(e) => setFormData({...formData, pickupTo: e.target.value})}
                    className="mt-1 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                className="mt-1 rounded-xl"
                rows={4}
                placeholder="Any special notes for pickup..."
              />
            </div>

            <div>
              <Label>Suitable For *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {suitableFor.map((option) => (
                  <Badge
                    key={option}
                    onClick={() => toggleSelection('suitableFor', option)}
                    className={`cursor-pointer px-4 py-2 rounded-full ${
                      formData.suitableFor.includes(option)
                        ? 'bg-[#2D6A4F] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 rounded-xl py-6"
              >
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                className="flex-1 bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl py-6"
              >
                Continue to Review
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Post */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-bold mb-6">Review & Post</h2>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
              {formData.image && (
                <div>
                  <img src={formData.image} alt="Food preview" className="w-full h-48 object-cover rounded-xl" />
                </div>
              )}
              
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-1">Food Name</h3>
                <p className="text-[#1A1A1A]">{formData.foodName || 'Not specified'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-1">Category</h3>
                  <p className="text-[#1A1A1A]">{formData.category || 'Not specified'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-1">Quantity</h3>
                  <p className="text-[#1A1A1A]">{formData.quantity} {formData.unit}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-1">Allergens</h3>
                <p className="text-[#1A1A1A]">{formData.allergens.join(', ') || 'None specified'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-1">Pickup Address</h3>
                <p className="text-[#1A1A1A]">{formData.address || 'Not specified'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-1">Pickup Window</h3>
                <p className="text-[#1A1A1A]">{formData.pickupFrom} - {formData.pickupTo}</p>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-600 mb-1">Suitable For</h3>
                <p className="text-[#1A1A1A]">{formData.suitableFor.join(', ') || 'Not specified'}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <Label className="font-semibold mb-3 block">Visibility</Label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                    className="w-5 h-5 text-[#2D6A4F]"
                  />
                  <div>
                    <div className="font-medium">Post Publicly</div>
                    <div className="text-sm text-gray-600">All receivers can see this listing</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    value="specific"
                    checked={formData.visibility === 'specific'}
                    onChange={(e) => setFormData({...formData, visibility: e.target.value})}
                    className="w-5 h-5 text-[#2D6A4F]"
                  />
                  <div>
                    <div className="font-medium">Send to Specific NGO</div>
                    <div className="text-sm text-gray-600">Choose a receiver organization</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1 rounded-xl py-6"
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1 bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl py-6"
              >
                Post Listing
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}