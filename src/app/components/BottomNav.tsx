import { useNavigate, useLocation } from 'react-router';
import { Home, Plus, Package, ClipboardList, User, Search, MapPin } from 'lucide-react';

interface BottomNavProps {
  role: 'donor' | 'receiver';
  active?: string;
}

export function BottomNav({ role, active }: BottomNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const donorTabs = [
    { id: 'home', icon: Home, label: 'Home', path: '/donor/dashboard' },
    { id: 'post', icon: Plus, label: 'Post', path: '/donor/post-listing' },
    { id: 'requests', icon: Package, label: 'Requests', path: '/donor/pickup-requests' },
    { id: 'listings', icon: ClipboardList, label: 'History', path: '/donor/my-listings' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  const receiverTabs = [
    { id: 'home', icon: Home, label: 'Home', path: '/receiver/dashboard' },
    { id: 'browse', icon: Search, label: 'Browse', path: '/receiver/browse' },
    { id: 'map', icon: MapPin, label: 'Map', path: '/receiver/browse?view=map' },
    { id: 'requests', icon: ClipboardList, label: 'My Requests', path: '/receiver/my-requests' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  const tabs = role === 'donor' ? donorTabs : receiverTabs;
  const activeColor = role === 'donor' ? '#2D6A4F' : '#F4A261';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="max-w-4xl mx-auto px-2 py-2">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = active === tab.id || location.pathname === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all min-w-[60px]"
                style={{
                  color: isActive ? activeColor : '#6B7280',
                  backgroundColor: isActive ? `${activeColor}10` : 'transparent',
                }}
              >
                <tab.icon className="w-6 h-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
