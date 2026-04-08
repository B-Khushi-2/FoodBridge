import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Send, Phone, Video } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const mockMessages = [
  {
    id: 1,
    sender: 'other',
    text: 'Hi! I would like to pick up the vegetables today.',
    time: '10:30 AM'
  },
  {
    id: 2,
    sender: 'me',
    text: 'Great! What time works best for you?',
    time: '10:32 AM'
  },
  {
    id: 3,
    sender: 'other',
    text: 'Would 5:00 PM be okay?',
    time: '10:33 AM'
  },
  {
    id: 4,
    sender: 'me',
    text: 'Perfect! Please use the back entrance and ring the bell twice.',
    time: '10:35 AM'
  },
  {
    id: 5,
    sender: 'other',
    text: 'Thank you! See you at 5 PM.',
    time: '10:36 AM'
  },
];

const quickReplies = ['On my way', 'Ready for pickup', 'Thank you!', 'Running 10 mins late'];

export function Chat() {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const listingInfo = {
    foodName: 'Fresh Vegetable Mix',
    quantity: '15 kg',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=150&fit=crop'
  };

  const handleSend = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: 'me',
          text: message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setMessage('');
    }
  };

  const handleQuickReply = (reply: string) => {
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: 'me',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2D6A4F] flex items-center justify-center text-white font-semibold">
                  G
                </div>
                <div>
                  <h1 className="font-semibold text-[#1A1A1A]">Green Valley Restaurant</h1>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Phone className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Video className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Listing Context */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <Card className="rounded-xl p-3 bg-white border-amber-200">
            <div className="flex gap-3 items-center">
              <img 
                src={listingInfo.image} 
                alt={listingInfo.foodName} 
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-[#1A1A1A]">{listingInfo.foodName}</h3>
                <p className="text-xs text-gray-600">{listingInfo.quantity}</p>
              </div>
              <Badge className="bg-[#40916C] text-white text-xs">Active</Badge>
            </div>
          </Card>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${msg.sender === 'me' ? 'order-2' : 'order-1'}`}>
                <div 
                  className={`rounded-2xl px-4 py-3 ${
                    msg.sender === 'me' 
                      ? 'bg-[#2D6A4F] text-white rounded-br-sm' 
                      : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <p className={`text-xs text-gray-500 mt-1 px-2 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Replies */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="flex-shrink-0 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 safe-area-bottom">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="flex-1 rounded-full"
            />
            <Button 
              onClick={handleSend}
              disabled={!message.trim()}
              className="bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-full w-12 h-12 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
