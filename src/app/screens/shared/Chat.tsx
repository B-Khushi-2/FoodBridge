import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Send, Wifi, WifiOff } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { getAuthHeaders, getUser } from '../../context/AuthContext';
import { io, Socket } from 'socket.io-client';

const quickReplies = ['On my way!', 'Ready for pickup', 'Thank you! 🙏', 'Running 10 mins late', 'Arrived!'];

interface Message {
  _id?: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export function Chat() {
  const navigate = useNavigate();
  const { listingId, requestId } = useParams<{ listingId: string; requestId: string }>();
  const roomId = `${listingId}_${requestId}`;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState(false);
  const [otherName, setOtherName] = useState('User');
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const currentUser = getUser();

  // Load history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/chat/${roomId}`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Failed to fetch chat history', err);
      }
    };
    fetchHistory();
  }, [roomId]);

  // Socket.io connection
  useEffect(() => {
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_room', roomId);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('new_message', (msg: Message) => {
      setMessages((prev) => {
        // Avoid duplicates (REST + socket)
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.emit('leave_room', roomId);
      socket.disconnect();
    };
  }, [roomId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!message.trim() || !socketRef.current || !currentUser) return;
    socketRef.current.emit('send_message', {
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: message.trim()
    });
    setMessage('');
  };

  const handleQuickReply = (reply: string) => {
    if (!socketRef.current || !currentUser) return;
    socketRef.current.emit('send_message', {
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: reply
    });
  };

  const isMe = (msg: Message) => msg.senderId === currentUser?.id;

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
                  {otherName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="font-semibold text-[#1A1A1A]">{otherName}</h1>
                  <div className="flex items-center gap-1">
                    {connected ? (
                      <>
                        <Wifi className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Live</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">Connecting...</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Badge className={connected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
              {connected ? '🟢 Real-time' : '⚪ Offline'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Room info */}
      <div className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-6 py-2">
          <p className="text-xs text-amber-700 text-center">
            💬 Messages are saved and synced in real-time for this listing
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm">No messages yet. Say hello! 👋</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={msg._id || idx} className={`flex ${isMe(msg) ? 'justify-end' : 'justify-start'}`}>
              {!isMe(msg) && (
                <div className="w-8 h-8 rounded-full bg-[#F4A261] flex items-center justify-center text-white text-sm font-bold mr-2 self-end">
                  {msg.senderName?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className={`max-w-[70%]`}>
                {!isMe(msg) && (
                  <p className="text-xs text-gray-500 mb-1 px-1">{msg.senderName}</p>
                )}
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    isMe(msg)
                      ? 'bg-[#2D6A4F] text-white rounded-br-sm'
                      : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
                <p className={`text-xs text-gray-400 mt-1 px-2 ${isMe(msg) ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick Replies */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="flex-shrink-0 px-3 py-1.5 bg-[#EAF4EF] hover:bg-[#d1eadb] text-[#2D6A4F] rounded-full text-xs font-medium transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Type a message..."
              className="flex-1 rounded-full"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || !connected}
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
