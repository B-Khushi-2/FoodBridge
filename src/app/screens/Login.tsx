import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';


export function Login() {
  const navigate = useNavigate();
  const { login, googleLogin, loading, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuthSuccess = (user: any) => {
    if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user.role === 'donor') {
      navigate('/donor/dashboard');
    } else {
      navigate('/receiver/dashboard');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      handleAuthSuccess(user);
    } catch (err) {
      // error is set in context
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      const user = await googleLogin(response.credential);
      handleAuthSuccess(user);
    } catch (err) {
      // error is set in context
    }
  };


  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
      {/* Top wave illustration */}
      <div className="bg-[#2D6A4F] h-48 rounded-b-[3rem] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
            <path d="M0,100 Q100,50 200,100 T400,100 L400,200 L0,200 Z" fill="white" />
          </svg>
        </div>
      </div>

      <div className="flex-1 -mt-20 px-6">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
          {/* Back button */}
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-[#1A1A1A] mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to continue to FoodBridge</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="mt-1 rounded-xl"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="mt-1 rounded-xl"
                placeholder="••••••••"
              />
            </div>

            <div className="text-right">
              <button type="button" className="text-sm text-[#2D6A4F] hover:underline">
                Forgot Password?
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl py-6 text-lg"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                useOneTap
                theme="outline"
                shape="pill"
                width="100%"
              />
            </div>

          </form>

          <div className="text-center mt-6">
            <button 
              onClick={() => navigate('/role-selection')}
              className="text-sm text-gray-600 hover:text-[#2D6A4F]"
            >
              New here? <span className="font-semibold">Choose your role</span>
            </button>
          </div>

          <div className="text-center mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500"><strong>Admin:</strong> admin@foodbridge.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
