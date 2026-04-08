import { useNavigate } from 'react-router';
import { ArrowLeft, Check } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const notifications = [
  {
    id: 1,
    type: 'success',
    icon: '✓',
    color: 'bg-green-100 border-green-200',
    iconColor: 'text-green-700',
    title: 'Your listing was accepted',
    message: 'HopeKitchen NGO has accepted your "Fresh Vegetable Mix" listing',
    time: '2 hours ago',
    unread: true
  },
  {
    id: 2,
    type: 'request',
    icon: '📦',
    color: 'bg-orange-100 border-orange-200',
    iconColor: 'text-orange-700',
    title: 'New pickup request',
    message: 'Shelter Community wants to pick up "Cooked Rice & Curry"',
    time: '4 hours ago',
    unread: true
  },
  {
    id: 3,
    type: 'urgent',
    icon: '⚠️',
    color: 'bg-red-100 border-red-200',
    iconColor: 'text-red-700',
    title: 'Listing expiring soon',
    message: 'Your "Fresh Bread" listing will expire in 1 hour',
    time: '5 hours ago',
    unread: true
  },
  {
    id: 4,
    type: 'available',
    icon: '🍱',
    color: 'bg-blue-100 border-blue-200',
    iconColor: 'text-blue-700',
    title: 'New food available near you',
    message: 'Green Valley Restaurant posted "Fresh Salad Mix" 1.2 km away',
    time: '8 hours ago',
    unread: false
  },
  {
    id: 5,
    type: 'success',
    icon: '✓',
    color: 'bg-green-100 border-green-200',
    iconColor: 'text-green-700',
    title: 'Pickup completed',
    message: 'Thank you for completing the pickup from Corner Bakery!',
    time: 'Yesterday',
    unread: false
  },
  {
    id: 6,
    type: 'info',
    icon: 'ℹ️',
    color: 'bg-gray-100 border-gray-200',
    iconColor: 'text-gray-700',
    title: 'Impact milestone reached',
    message: 'Congratulations! You\'ve helped feed 100+ people this month',
    time: '2 days ago',
    unread: false
  },
];

const groupedNotifications = {
  'Today': notifications.filter(n => n.time.includes('hour')),
  'Yesterday': notifications.filter(n => n.time === 'Yesterday'),
  'Earlier': notifications.filter(n => n.time.includes('days')),
};

export function Notifications() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF7] pb-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="font-display text-xl font-bold">Notifications</h1>
          </div>
          <button className="text-sm text-[#2D6A4F] font-semibold hover:underline">
            Mark all read
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {Object.entries(groupedNotifications).map(([group, items]) => (
          items.length > 0 && (
            <div key={group}>
              <h2 className="text-sm font-semibold text-gray-500 mb-3">{group}</h2>
              <div className="space-y-3">
                {items.map((notification) => (
                  <Card 
                    key={notification.id}
                    className={`rounded-2xl p-4 border-2 cursor-pointer hover:shadow-md transition-shadow ${
                      notification.unread ? notification.color : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full ${notification.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xl">{notification.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className={`font-semibold text-sm ${notification.iconColor}`}>
                            {notification.title}
                          </h3>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-[#F4A261] rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
