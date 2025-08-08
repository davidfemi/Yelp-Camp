import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import { 
  Campground, 
  User, 
  Review,
  Product,
  CartItem,
  Booking
} from '../types';

const API_URL = 'https://yelpcamp-vvv2.onrender.com';

// Helper function to make authenticated requests using session-based authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include session cookies for authentication
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`API Error ${response.status}:`, errorData);
    throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
  }

  return response.json();
};

// Campgrounds API
export const campgroundsAPI = {
  // Get all campgrounds
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/api/campgrounds${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Get campground by ID
  getById: async (id: string) => {
    return apiRequest(`/api/campgrounds/${id}`);
  },

  // Create new campground (authenticated)
  create: async (campgroundData: any) => {
    return apiRequest('/api/campgrounds', {
      method: 'POST',
      body: JSON.stringify(campgroundData),
    });
  },
};

// Products API
export const productsAPI = {
  // Get all products
  getAll: async (params?: { category?: string; inStock?: boolean }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.category) queryParams.append('category', params.category);
    if (params?.inStock !== undefined) queryParams.append('inStock', params.inStock.toString());

    const queryString = queryParams.toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint);
  },

  // Get product by ID
  getById: async (id: string) => {
    return apiRequest(`/api/products/${id}`);
  },
};

// Reviews API
export const reviewsAPI = {
  // Create review for campground
  create: async (campgroundId: string, reviewData: { rating: number; body: string }) => {
    return apiRequest(`/api/campgrounds/${campgroundId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Delete review
  delete: async (campgroundId: string, reviewId: string) => {
    return apiRequest(`/api/campgrounds/${campgroundId}/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
};

// Bookings API
export const bookingsAPI = {
  // Create booking
  create: async (campgroundId: string, bookingData: { 
    days: number; 
    checkInDate?: string; 
    checkOutDate?: string; 
    guests?: number; 
    specialRequests?: string; 
  }) => {
    return apiRequest(`/api/bookings`, {
      method: 'POST',
      body: JSON.stringify({
        campgroundId,
        ...bookingData,
      }),
    });
  },

  // Get user's bookings
  getUserBookings: async () => {
    return apiRequest('/api/bookings');
  },

  // Get booking by ID
  getBookingById: async (bookingId: string) => {
    return apiRequest(`/api/bookings/${bookingId}`);
  },
};

// Orders API
export const ordersAPI = {
  // Create order
  create: async (orderData: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: any;
  }) => {
    return apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Get user's orders
  getUserOrders: async () => {
    return apiRequest('/api/orders');
  },

  // Get order by ID
  getOrderById: async (orderId: string) => {
    return apiRequest(`/api/orders/${orderId}`);
  },
};

// Stats API
export const statsAPI = {
  // Get general stats
  getStats: async () => {
    return apiRequest('/api/stats');
  },
};

// Cart Storage (AsyncStorage)
export const cartStorage = {
  // Get cart from AsyncStorage
  getCart: async (): Promise<CartItem[]> => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  },

  // Save cart to AsyncStorage
  saveCart: async (cartItems: CartItem[]): Promise<void> => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },

  // Clear cart from AsyncStorage
  clearCart: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  },
};

export default {
  campgroundsAPI,
  productsAPI,
  reviewsAPI,
  bookingsAPI,
  ordersAPI,
  statsAPI,
  cartStorage,
}; 