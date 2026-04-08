import { useNavigate } from 'react-router';
import { ArrowLeft, Edit, ChevronRight, Bell, MapPin, Shield, HelpCircle, LogOut, Award } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { BottomNav } from '../../components/BottomNav';
import { useAuth } from '../../context/AuthContext';

export function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const userName = user?.name || sessionStorage.getItem('userName') || 'User';
  const userRole = user?.role || sessionStorage.getItem('userRole') || 'donor';

  const stats = userRole === 'donor' 
    ? [
        { label: 'Food Donated', value: '42 kg' },
        { label: 'Pickups', value: '18' },
        { label: 'Meals Enabled', value: '~90' },
      ]
    : [
        { label: 'Pickups Received', value: '28' },
        { label: 'People Served', value: '~140' },
        { label: 'Active Requests', value: '3' },
      ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-display text-xl font-bold">Profile</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Profile Header */}
        <Card className="rounded-2xl p-6 bg-gradient-to-br from-[#2D6A4F] to-[#40916C] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                <span className="text-3xl font-bold">{userName.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-bold mb-1">{userName}</h2>
                <Badge className={`${userRole === 'donor' ? 'bg-white/20' : 'bg-[#F4A261]'} text-white border-white/30`}>
                  {userRole === 'donor' ? '🍽️ Food Donor' : '🤝 Food Receiver'}
                </Badge>
              </div>
              <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                <Edit className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-mono text-xl font-bold">{stat.value}</div>
                  <div className="text-xs opacity-90 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Account Settings */}
        <div>
          <h3 className="font-semibold text-gray-600 mb-3 px-2">Account</h3>
          <Card className="rounded-2xl overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Edit className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Edit Profile</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Change Password</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="font-semibold text-gray-600 mb-3 px-2">Preferences</h3>
          <Card className="rounded-2xl overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Notification Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Location Preferences</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Trust & Impact */}
        <div>
          <h3 className="font-semibold text-gray-600 mb-3 px-2">Trust & Safety</h3>
          <Card className="rounded-2xl overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <div className="font-medium">Verification Badge</div>
                  <div className="text-xs text-gray-500">Get verified to build trust</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button 
              onClick={() => navigate('/impact')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-gray-600" />
                <span className="font-medium">My Impact Report</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Help & Support */}
        <div>
          <h3 className="font-semibold text-gray-600 mb-3 px-2">Help & Support</h3>
          <Card className="rounded-2xl overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Help Center</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 text-red-600 hover:bg-red-50 rounded-2xl transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>

      <BottomNav role={userRole as 'donor' | 'receiver'} active="profile" />
    </div>
  );
}
