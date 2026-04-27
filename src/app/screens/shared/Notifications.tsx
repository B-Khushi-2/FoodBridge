import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Bell, BellOff } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { getAuthHeaders } from '../../context/AuthContext';

interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

function getNotificationStyle(type: string) {
  switch (type) {
    case 'request_received':
      return { icon: '📦', color: 'bg-orange-100 border-orange-200', iconColor: 'text-orange-700' };
    case 'request_accepted':
      return { icon: '✅', color: 'bg-green-100 border-green-200', iconColor: 'text-green-700' };
    case 'request_rejected':
      return { icon: '❌', color: 'bg-red-100 border-red-200', iconColor: 'text-red-700' };
    case 'request_completed':
      return { icon: '🎉', color: 'bg-blue-100 border-blue-200', iconColor: 'text-blue-700' };
    case 'listing_expired':
      return { icon: '⚠️', color: 'bg-amber-100 border-amber-200', iconColor: 'text-amber-700' };
    case 'new_listing':
      return { icon: '🍱', color: 'bg-emerald-100 border-emerald-200', iconColor: 'text-emerald-700' };
    case 'report_verified':
      return { icon: '🔬', color: 'bg-purple-100 border-purple-200', iconColor: 'text-purple-700' };
    default:
      return { icon: 'ℹ️', color: 'bg-gray-100 border-gray-200', iconColor: 'text-gray-700' };
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function groupNotifications(notifications: NotificationItem[]) {
  const today: NotificationItem[] = [];
  const yesterday: NotificationItem[] = [];
  const earlier: NotificationItem[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    if (d >= todayStart) today.push(n);
    else if (d >= yesterdayStart) yesterday.push(n);
    else earlier.push(n);
  }

  return { Today: today, Yesterday: yesterday, Earlier: earlier };
}

export function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const grouped = groupNotifications(notifications);

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
            {unreadCount > 0 && (
              <span className="bg-[#F4A261] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-[#2D6A4F] font-semibold hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No notifications yet</p>
            <p className="text-gray-400 text-sm mt-1">
              You'll get notified when someone interacts with your listings or requests.
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([group, items]) =>
            items.length > 0 && (
              <div key={group}>
                <h2 className="text-sm font-semibold text-gray-500 mb-3">{group}</h2>
                <div className="space-y-3">
                  {items.map((notification) => {
                    const style = getNotificationStyle(notification.type);
                    return (
                      <Card
                        key={notification._id}
                        onClick={() => {
                          if (!notification.read) markRead(notification._id);
                        }}
                        className={`rounded-2xl p-4 border-2 cursor-pointer hover:shadow-md transition-shadow ${
                          !notification.read ? style.color : 'bg-white border-gray-100'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full ${style.color} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-xl">{style.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className={`font-semibold text-sm ${style.iconColor}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-[#F4A261] rounded-full flex-shrink-0 mt-1.5"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                            <span className="text-xs text-gray-500">
                              {timeAgo(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
