import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Upload } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';

import { GoogleLogin } from '@react-oauth/google';

export function SignUpReceiver() {
  const navigate = useNavigate();
  const { registerReceiver, googleLogin, loading, error, setError } = useAuth();
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

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (credentialResponse.credential) {
                  try {
                    await googleLogin(credentialResponse.credential, 'receiver');
                    navigate('/receiver/dashboard');
                  } catch (err) {
                    console.error('Google Sign Up failed:', err);
                  }
                }
              }}
              onError={() => {
                setError('Google Sign Up Failed');
              }}
              useOneTap
              theme="outline"
              shape="pill"
              text="signup_with"
              width="100%"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
