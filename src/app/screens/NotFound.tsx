import { useNavigate } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-9xl font-display font-bold text-[#2D6A4F] mb-4">
          404
        </div>
        <h1 className="font-display text-3xl font-bold text-[#1A1A1A] mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
      
      {/* Decorative illustration */}
      <div className="mt-12 opacity-20">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="80" stroke="#2D6A4F" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M70 90 Q100 70 130 90" stroke="#2D6A4F" strokeWidth="2" fill="none" />
          <circle cx="80" cy="85" r="5" fill="#2D6A4F" />
          <circle cx="120" cy="85" r="5" fill="#2D6A4F" />
          <path d="M70 120 Q100 140 130 120" stroke="#2D6A4F" strokeWidth="2" fill="none" />
        </svg>
      </div>
    </div>
  );
}
