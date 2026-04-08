import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login, loading, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'donor') {
        navigate('/donor/dashboard');
      } else {
        navigate('/receiver/dashboard');
      }
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
              Sign in with Google
            </Button>
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
