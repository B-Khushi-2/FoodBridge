import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';

export function SignUpReceiver() {
  const navigate = useNavigate();
  const { registerReceiver, loading, error, setError } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    orgType: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await registerReceiver({
        orgName: formData.fullName,
        orgType: formData.orgType,
        phone: formData.phone,
        city: formData.city,
        password: formData.password,
        email: formData.email
      });
      navigate('/receiver/dashboard');
    } catch (err) {
      // error is set in context
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold">Create Receiver Account</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Profile Type Badge */}
          <div className="flex justify-center">
            <Badge className="bg-[#F4A261] text-white px-4 py-2 text-sm">
              Food Receiver Account
            </Badge>
          </div>

          {/* Avatar Upload */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 bg-[#F4A261] text-white p-2 rounded-full hover:bg-[#e89350] transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Name / Organization *</Label>
              <Input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="mt-1 rounded-xl"
                placeholder="NGO or Individual Name"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="mt-1 rounded-xl"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label htmlFor="orgType">Organization Type *</Label>
              <Select value={formData.orgType} onValueChange={(value) => setFormData({...formData, orgType: value})}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngo">NGO</SelectItem>
                  <SelectItem value="shelter">Shelter</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="cattle">Cattle Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-1 rounded-xl"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <Label htmlFor="city">City / Area *</Label>
              <Input
                id="city"
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="mt-1 rounded-xl"
                placeholder="New York, NY"
              />
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="mt-1 rounded-xl"
                placeholder="••••••••"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="mt-1 rounded-xl"
                placeholder="••••••••"
              />
            </div>

            {/* Verification Document */}
            <div>
              <Label htmlFor="document">Verification Document (Optional)</Label>
              <div className="mt-1 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#F4A261] transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Upload verification document</p>
                <p className="text-xs text-gray-400 mt-1">Helps donors trust you</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#F4A261] hover:bg-[#e89350] text-white rounded-xl py-6 text-lg disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Receiver Account'}
          </Button>

          {/* Social Sign In */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#FAFAF7] text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button 
            type="button"
            variant="outline"
            className="w-full rounded-xl py-6"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </Button>
        </form>
      </div>
    </div>
  );
}
