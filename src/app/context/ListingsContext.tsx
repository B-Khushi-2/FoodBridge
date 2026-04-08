import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { getAuthHeaders } from './AuthContext';

export interface ImageAnalysis {
  isFood: boolean;
  freshness: number;
  confidence: number;
  labels: string[];
  verdict: 'approved' | 'suspected' | 'rejected';
  reason: string;
  score: number;
}

export interface Listing {
  id: number;
  _id?: string;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  image?: string;
  video?: string;
  expiry: string;
  expiryTime: string;
  allergens: string[];
  suitableFor: string[];
  address: string;
  location: { lat: number; lng: number };
  pickupWindow: string;
  instructions: string;
  status: 'Available' | 'Reserved' | 'Completed' | 'Expired';
  packDate: string;
  donorName: string;
  donorId?: string;
  donorRating: number;
  distance?: string;
  requests: number;
  createdAt: Date;
  imageAnalysis?: ImageAnalysis;
}

interface ListingsContextType {
  listings: Listing[];
  availableListings: Listing[];
  myDonorListings: Listing[];
  addListing: (listing: Omit<Listing, 'id' | 'createdAt' | 'status' | 'requests'>) => void;
  updateListing: (id: number, updates: Partial<Listing>) => void;
  deleteListing: (id: number) => void;
  getListingById: (id: number) => Listing | undefined;
  refreshListings: () => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

// Convert API listing to frontend Listing format
function apiToListing(apiListing: any): Listing {
  const expiryDate = new Date(apiListing.expiryTime);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const diffHours = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
  const diffMins = Math.max(0, Math.round(diffMs / (1000 * 60)));

  let expiryString: string;
  if (diffMs <= 0 || apiListing.status === 'expired') expiryString = 'Expired';
  else if (diffMins < 60) expiryString = `${diffMins}m`;
  else if (diffHours < 48) expiryString = `${diffHours}h`;
  else expiryString = `${Math.round(diffHours / 24)}d`;

  const statusMap: Record<string, 'Available' | 'Reserved' | 'Completed' | 'Expired'> = {
    'available': 'Available',
    'claimed': 'Reserved',
    'completed': 'Completed',
    'expired': 'Expired'
  };

  // Extract donor ID string properly (it may be an object or string)
  let donorIdStr: string | undefined;
  let donorNameStr = 'Anonymous Donor';
  if (apiListing.donorId && typeof apiListing.donorId === 'object') {
    donorIdStr = apiListing.donorId._id?.toString();
    donorNameStr = apiListing.donorId.name || donorNameStr;
  } else if (apiListing.donorId) {
    donorIdStr = apiListing.donorId.toString();
  }

  return {
    id: apiListing._id ? parseInt(apiListing._id.slice(-8), 16) : Date.now(),
    _id: apiListing._id,
    name: apiListing.foodType,
    category: apiListing.foodType,
    quantity: apiListing.quantity?.split(' ')[0] || apiListing.quantity,
    unit: apiListing.quantity?.split(' ')[1] || 'kg',
    image: apiListing.image || '',
    expiry: expiryString,
    expiryTime: expiryDate.toLocaleString(),
    allergens: apiListing.allergens || ['None'],
    suitableFor: apiListing.suitableFor || ['Human Consumption'],
    address: apiListing.location,
    location: {
      lat: apiListing.coordinates?.lat || 28.6139,
      lng: apiListing.coordinates?.lng || 77.2090
    },
    pickupWindow: `${apiListing.pickupWindowStart || ''} - ${apiListing.pickupWindowEnd || ''}`,
    instructions: apiListing.description || '',
    status: statusMap[apiListing.status] || 'Available',
    packDate: apiListing.createdAt,
    donorName: donorNameStr,
    donorId: donorIdStr,
    donorRating: 4.5,
    distance: '~2 km',
    requests: 0,
    createdAt: new Date(apiListing.createdAt),
    imageAnalysis: apiListing.imageAnalysis || undefined
  };
}

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAllListings = useCallback(async () => {
    try {
      const res = await fetch('/api/food/all');
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings.map(apiToListing));
        return;
      }
      // Fallback
      const res2 = await fetch('/api/food');
      if (res2.ok) {
        const data = await res2.json();
        setListings(data.listings.map(apiToListing));
      }
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    }
  }, []);

  // Poll every 15 seconds + fetch on mount + refetch on window focus
  useEffect(() => {
    fetchAllListings();
    pollRef.current = setInterval(fetchAllListings, 15000);

    const handleFocus = () => fetchAllListings();
    window.addEventListener('focus', handleFocus);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchAllListings]);

  // Derived: only available listings (for receivers — excludes rejected images and non-available)
  const availableListings = listings.filter(l =>
    l.status === 'Available' &&
    (!l.imageAnalysis || l.imageAnalysis.verdict !== 'rejected')
  );

  // Derived: current user's donor listings (all statuses)
  const userId = sessionStorage.getItem('userId');
  const myDonorListings = listings.filter(l => {
    if (!userId || !l.donorId) return false;
    return l.donorId === userId;
  });

  const addListing = async (listing: Omit<Listing, 'id' | 'createdAt' | 'status' | 'requests'>) => {
    const [pickupStart, pickupEnd] = listing.pickupWindow.split(' - ');
    const res = await fetch('/api/food', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        foodType: listing.name || listing.category,
        quantity: `${listing.quantity} ${listing.unit}`,
        description: listing.instructions,
        expiryTime: listing.expiryTime,
        location: listing.address,
        coordinates: listing.location,
        pickupWindowStart: pickupStart?.trim() || '',
        pickupWindowEnd: pickupEnd?.trim() || '',
        image: listing.image,
        allergens: listing.allergens,
        suitableFor: listing.suitableFor,
        imageAnalysis: listing.imageAnalysis
      })
    });
    if (res.ok) {
      await fetchAllListings();
    } else {
      const data = await res.json();
      throw new Error(data.error || 'Failed to add listing');
    }
  };

  const updateListing = (_id: number, _updates: Partial<Listing>) => {
    console.warn("updateListing not backed by API yet.");
  };

  const deleteListing = async (id: number) => {
    const listing = listings.find(l => l.id === id);
    if (listing?._id) {
      const res = await fetch(`/api/food/${listing._id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) await fetchAllListings();
    }
  };

  const getListingById = (id: number) => listings.find(listing => listing.id === id);

  const refreshListings = () => { fetchAllListings(); };

  return (
    <ListingsContext.Provider value={{
      listings,
      availableListings,
      myDonorListings,
      addListing, updateListing, deleteListing, getListingById, refreshListings
    }}>
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within ListingsProvider');
  }
  return context;
}
