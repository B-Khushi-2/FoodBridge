import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Leaf } from 'lucide-react';

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/role-selection');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#2D6A4F] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Subtle grain texture overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]"></div>
      
      {/* Logo icon - fork + leaf merged */}
      <div className="relative mb-8 animate-fade-in">
        <div className="relative">
          <Leaf className="w-24 h-24 text-white" strokeWidth={1.5} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="8" y1="6" x2="8" y2="10" />
              <line x1="12" y1="6" x2="12" y2="10" />
              <line x1="16" y1="6" x2="16" y2="10" />
            </svg>
          </div>
        </div>
      </div>

      {/* App name */}
      <h1 className="font-display text-5xl font-bold text-white mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        FoodBridge
      </h1>

      {/* Tagline */}
      <p className="text-white/80 text-lg text-center max-w-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
        Surplus food. Real people. Zero waste.
      </p>
    </div>
  );
}
