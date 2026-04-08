import { useNavigate } from 'react-router';
import { Heart, Utensils, HandHeart } from 'lucide-react';
import { Button } from '../components/ui/button';

export function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF7] to-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Heading */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl font-bold text-[#1A1A1A]">
            I want to...
          </h1>
        </div>

        {/* Role Cards */}
        <div className="space-y-4">
          {/* Donor Card */}
          <button
            onClick={() => navigate('/signup-donor')}
            className="w-full bg-[#2D6A4F] hover:bg-[#235a41] transition-all duration-300 rounded-2xl p-8 text-left group shadow-lg hover:shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <div className="relative">
                  <Utensils className="w-8 h-8 text-white" />
                  <Heart className="w-4 h-4 text-white absolute -top-1 -right-1" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-bold text-white mb-2">
                  Donate Food
                </h2>
                <p className="text-white/80 text-sm">
                  Share surplus food from your restaurant, event, or home with those who need it
                </p>
              </div>
            </div>
          </button>

          {/* Receiver Card */}
          <button
            onClick={() => navigate('/signup-receiver')}
            className="w-full bg-[#F4A261] hover:bg-[#e89350] transition-all duration-300 rounded-2xl p-8 text-left group shadow-lg hover:shadow-xl"
          >
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <HandHeart className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-bold text-white mb-2">
                  Receive Food
                </h2>
                <p className="text-white/80 text-sm">
                  Connect with donors to collect food for your organization, shelter, or community
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Login link */}
        <div className="text-center pt-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-[#6B7280] text-sm hover:text-[#2D6A4F] transition-colors"
          >
            Already have an account? <span className="font-semibold">Sign In</span>
          </button>
        </div>
      </div>
    </div>
  );
}
