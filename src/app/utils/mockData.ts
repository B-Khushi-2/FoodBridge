/**
 * Mock Data Store for FoodBridge Application
 * 
 * This file contains all mock data used throughout the app.
 * In a production environment, this would be replaced with API calls.
 */

export const mockFoodListings = [
  {
    id: 1,
    name: 'Fresh Vegetable Mix',
    category: 'Raw Vegetables',
    quantity: '15 kg',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop',
    expiry: '3h',
    expiryTime: '7:00 PM Today',
    allergens: ['None'],
    suitableFor: ['Human Consumption', 'Cattle'],
    address: '123 Main Street, New York, NY 10001',
    pickupWindow: '4:00 PM - 7:00 PM',
    instructions: 'Please use the back entrance. Ring the bell twice.',
    status: 'Available',
    donor: {
      name: 'Green Valley Restaurant',
      type: 'Restaurant',
      rating: 4.8,
      totalDonations: 42,
      phone: '+1 (555) 123-4567'
    },
    distance: '1.2 km',
    requests: 2
  },
  {
    id: 2,
    name: 'Cooked Rice & Curry',
    category: 'Cooked Meals',
    quantity: '25 portions',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
    expiry: '2h',
    expiryTime: '6:00 PM Today',
    allergens: ['None'],
    suitableFor: ['Human Consumption'],
    address: '456 Oak Avenue, New York, NY 10002',
    pickupWindow: '5:00 PM - 8:00 PM',
    instructions: 'Front door pickup available.',
    status: 'Reserved',
    donor: {
      name: 'Spice Kitchen',
      type: 'Restaurant',
      rating: 4.6,
      totalDonations: 35,
      phone: '+1 (555) 987-6543'
    },
    distance: '2.5 km',
    requests: 1
  },
  {
    id: 3,
    name: 'Fresh Bread Loaves',
    category: 'Bakery',
    quantity: '30 pieces',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    expiry: '6h',
    expiryTime: '11:00 PM Today',
    allergens: ['Gluten'],
    suitableFor: ['Human Consumption'],
    address: '789 Elm Street, New York, NY 10003',
    pickupWindow: '6:00 PM - 10:00 PM',
    instructions: 'Bakery closes at 10 PM.',
    status: 'Available',
    donor: {
      name: 'Corner Bakery',
      type: 'Bakery',
      rating: 4.9,
      totalDonations: 58,
      phone: '+1 (555) 456-7890'
    },
    distance: '0.8 km',
    requests: 0
  },
];

export const mockUsers = {
  donor: {
    name: 'John Doe',
    email: 'john@restaurant.com',
    phone: '+1 (555) 123-4567',
    organization: 'Green Valley Restaurant',
    role: 'donor',
    stats: {
      foodDonated: 42,
      pickupsCompleted: 18,
      mealsEnabled: 90,
      co2Saved: 63
    }
  },
  receiver: {
    name: 'Hope Kitchen NGO',
    email: 'contact@hopekitchen.org',
    phone: '+1 (555) 987-6543',
    organization: 'Hope Kitchen',
    type: 'NGO',
    role: 'receiver',
    stats: {
      pickupsReceived: 28,
      peopleServed: 140,
      cattleFeeds: 12,
      activeDays: 45
    }
  }
};

export const foodCategories = [
  'Cooked Meals',
  'Raw Vegetables',
  'Packaged Food',
  'Bakery',
  'Dairy',
  'Fruits',
  'Grains',
  'Other'
];

export const allergensList = [
  'Gluten',
  'Nuts',
  'Dairy',
  'Eggs',
  'Soy',
  'Shellfish',
  'None'
];

export const suitableForOptions = [
  'Human Consumption',
  'Cattle',
  'Both'
];

/**
 * Helper function to get user data
 */
export function getCurrentUser() {
  const role = localStorage.getItem('userRole') || 'donor';
  const userName = localStorage.getItem('userName') || mockUsers[role as keyof typeof mockUsers].name;
  
  return {
    ...mockUsers[role as keyof typeof mockUsers],
    name: userName
  };
}

/**
 * Helper function to get listing by ID
 */
export function getListingById(id: string | number) {
  return mockFoodListings.find(listing => listing.id === Number(id)) || mockFoodListings[0];
}
