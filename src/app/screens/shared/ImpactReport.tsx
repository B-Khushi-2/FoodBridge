import { useNavigate } from 'react-router';
import { ArrowLeft, TrendingUp, Award, Share2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';

const userRole = sessionStorage.getItem('userRole') || 'donor';

const donorImpact = {
  totalFood: 42,
  mealsEnabled: 90,
  co2Saved: 63,
  pickups: 18,
  monthlyTrend: [8, 12, 15, 18, 22, 28, 32, 38, 42],
  badges: [
    { name: 'Food Hero', description: 'Donated 40+ kg of food', icon: '🏆', unlocked: true },
    { name: 'Green Champion', description: 'Saved 50+ kg CO2', icon: '🌱', unlocked: true },
    { name: 'Community Star', description: '25+ successful pickups', icon: '⭐', unlocked: false },
    { name: 'Zero Waste Warrior', description: '100+ kg donated', icon: '♻️', unlocked: false },
  ]
};

const receiverImpact = {
  pickupsReceived: 28,
  peopleServed: 140,
  cattleFeeds: 12,
  activeDays: 45,
  monthlyTrend: [5, 8, 12, 16, 18, 22, 24, 26, 28],
  badges: [
    { name: 'Community Helper', description: '20+ pickups completed', icon: '🤝', unlocked: true },
    { name: 'Hunger Fighter', description: 'Served 100+ people', icon: '🍱', unlocked: true },
    { name: 'Active Receiver', description: '30+ active days', icon: '📅', unlocked: true },
    { name: 'Impact Maker', description: '50+ pickups', icon: '🎯', unlocked: false },
  ]
};

const impact = userRole === 'donor' ? donorImpact : receiverImpact;

export function ImpactReport() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2D6A4F] to-[#40916C] text-white">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-3xl font-bold mb-2">Your FoodBridge Impact</h1>
          <p className="text-white/80">Making a difference, one meal at a time</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-6 pb-8 space-y-6">
        {/* Main Stats */}
        {userRole === 'donor' ? (
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-2xl p-6 bg-white shadow-lg">
              <div className="text-5xl font-mono font-bold text-[#2D6A4F] mb-2">
                {impact.totalFood}
              </div>
              <div className="text-sm text-gray-600">kg Food Donated</div>
              <Progress value={70} className="mt-3 h-2" />
            </Card>
            <Card className="rounded-2xl p-6 bg-white shadow-lg">
              <div className="text-5xl font-mono font-bold text-[#F4A261] mb-2">
                {donorImpact.mealsEnabled}
              </div>
              <div className="text-sm text-gray-600">Meals Enabled</div>
              <Progress value={60} className="mt-3 h-2" />
            </Card>
            <Card className="rounded-2xl p-6 bg-white shadow-lg">
              <div className="text-5xl font-mono font-bold text-[#40916C] mb-2">
                {donorImpact.co2Saved}
              </div>
              <div className="text-sm text-gray-600">kg CO₂ Saved</div>
              <Progress value={50} className="mt-3 h-2" />
            </Card>
            <Card className="rounded-2xl p-6 bg-white shadow-lg">
              <div className="text-5xl font-mono font-bold text-[#E76F51] mb-2">
                {impact.pickups}
              </div>
              <div className="text-sm text-gray-600">Pickups Completed</div>
              <Progress value={45} className="mt-3 h-2" />
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-2xl p-6 bg-white shadow-lg">
              <div className="text-5xl font-mono font-bold text-[#F4A261] mb-2">
                {impact.pickupsReceived}
              </div>
              <div className="text-sm text-gray-600">Pickups Received</div>
              <Progress value={56} className="mt-3 h-2" />
            </Card>
            <Card className="rounded-2xl p-6 bg-white shadow-lg">
              <div className="text-5xl font-mono font-bold text-[#2D6A4F] mb-2">
                {receiverImpact.peopleServed}
              </div>
              <div className="text-sm text-gray-600">People Served</div>
              <Progress value={70} className="mt-3 h-2" />
            </Card>
            <Card className="rounded-2xl p-6 bg-white shadow-lg">
              <div className="text-5xl font-mono font-bold text-[#E76F51] mb-2">
                {receiverImpact.cattleFeeds}
              </div>
              <div className="text-sm text-gray-600">Cattle Feeds</div>
              <Progress value={24} className="mt-3 h-2" />
            </Card>
            <Card className="rounded-2xl p-6 bg-white shadow-lg">
              <div className="text-5xl font-mono font-bold text-[#40916C] mb-2">
                {receiverImpact.activeDays}
              </div>
              <div className="text-sm text-gray-600">Active Days</div>
              <Progress value={45} className="mt-3 h-2" />
            </Card>
          </div>
        )}

        {/* Monthly Trend */}
        <Card className="rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Monthly Trend</h2>
            <TrendingUp className="w-5 h-5 text-[#40916C]" />
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {impact.monthlyTrend.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center justify-end">
                <div 
                  className="w-full bg-gradient-to-t from-[#2D6A4F] to-[#40916C] rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${(value / Math.max(...impact.monthlyTrend)) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{index + 1}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-4 text-sm text-gray-600">
            {userRole === 'donor' ? 'Food donated' : 'Pickups received'} over the last 9 months
          </div>
        </Card>

        {/* Badge System */}
        <div>
          <h2 className="font-display text-xl font-bold mb-4">Achievement Badges</h2>
          <div className="grid grid-cols-2 gap-4">
            {impact.badges.map((badge, index) => (
              <Card 
                key={index}
                className={`rounded-2xl p-6 text-center ${
                  badge.unlocked 
                    ? 'bg-gradient-to-br from-[#2D6A4F] to-[#40916C] text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <div className="text-5xl mb-3 filter" style={{ filter: badge.unlocked ? 'none' : 'grayscale(100%)' }}>
                  {badge.icon}
                </div>
                <h3 className="font-semibold mb-1">{badge.name}</h3>
                <p className={`text-xs ${badge.unlocked ? 'text-white/80' : 'text-gray-500'}`}>
                  {badge.description}
                </p>
                {badge.unlocked && (
                  <Badge className="mt-3 bg-white/20 text-white border-white/30">
                    ✓ Unlocked
                  </Badge>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Environmental Impact */}
        {userRole === 'donor' && (
          <Card className="rounded-2xl p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">🌍</span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-green-900 mb-2">
                  Environmental Impact
                </h3>
                <p className="text-sm text-green-800 mb-3">
                  Your donations have prevented {donorImpact.co2Saved} kg of CO₂ emissions, 
                  equivalent to planting ~{Math.round(donorImpact.co2Saved / 5)} trees! 🌳
                </p>
                <p className="text-xs text-green-700">
                  Keep going to make an even bigger impact on our planet!
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Share Impact */}
        <Button 
          className="w-full bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-2xl py-6 text-lg shadow-lg"
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share My Impact
        </Button>
      </div>
    </div>
  );
}
