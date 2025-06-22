import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface UserProfile extends User {
  createdAt: string;
  stats: {
    campgrounds: number;
    reviews: number;
  };
}

export interface Campground {
  _id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  images: Array<{
    url: string;
    filename: string;
  }>;
  author: {
    _id: string;
    username: string;
  };
  reviews: Review[];
  geometry?: {
    type: string;
    coordinates: [number, number];
  };
}

export interface Review {
  _id: string;
  rating: number;
  body: string;
  author: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCampgrounds: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export interface CampgroundsResponse {
  campgrounds: Campground[];
  pagination: PaginationInfo;
}

export interface Booking {
  _id: string;
  user: {
    _id: string;
    username: string;
    email: string;
  };
  campground: {
    _id: string;
    title: string;
    location: string;
    price: number;
    images?: Array<{
      url: string;
      filename: string;
    }>;
  };
  days: number;
  totalPrice: number;
  checkInDate?: string;
  checkOutDate?: string;
  status: 'confirmed' | 'cancelled' | 'expired';
  createdAt: string;
}

// Auth API
export const authAPI = {
  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await api.post<ApiResponse<{ user: User }>>('/api/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post<ApiResponse<{ user: User }>>('/api/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<null>>('/api/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<ApiResponse<{ user: User }>>('/api/auth/me');
    return response.data;
  },
};

// Campgrounds API
export const campgroundsAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const response = await api.get<ApiResponse<CampgroundsResponse>>('/api/campgrounds', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<{ campground: Campground; stats: { averageRating: number; totalReviews: number } }>>(`/api/campgrounds/${id}`);
    return response.data;
  },

  create: async (campgroundData: {
    title: string;
    description: string;
    location: string;
    price: number;
    images: Array<{ url: string; filename: string }>;
  }) => {
    const response = await api.post<ApiResponse<{ campground: Campground }>>('/api/campgrounds', campgroundData);
    return response.data;
  },

  update: async (id: string, campgroundData: Partial<Campground>) => {
    const response = await api.put<ApiResponse<{ campground: Campground }>>(`/api/campgrounds/${id}`, campgroundData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/api/campgrounds/${id}`);
    return response.data;
  },

  search: async (term: string, limit?: number) => {
    const response = await api.get<ApiResponse<{ searchTerm: string; results: number; campgrounds: Campground[] }>>(`/api/campgrounds/search/${term}`, {
      params: { limit }
    });
    return response.data;
  },

  getByCategory: async (category: string, limit?: number) => {
    const response = await api.get<ApiResponse<{ category: string; results: number; campgrounds: Campground[] }>>(`/api/campgrounds/category/${category}`, {
      params: { limit }
    });
    return response.data;
  },
};

// Reviews API
export const reviewsAPI = {
  create: async (campgroundId: string, reviewData: { rating: number; body: string }) => {
    const response = await api.post<ApiResponse<{ review: Review }>>(`/api/campgrounds/${campgroundId}/reviews`, reviewData);
    return response.data;
  },

  delete: async (campgroundId: string, reviewId: string) => {
    const response = await api.delete<ApiResponse<null>>(`/api/campgrounds/${campgroundId}/reviews/${reviewId}`);
    return response.data;
  },
};

// Stats API
export const statsAPI = {
  get: async () => {
    const response = await api.get<ApiResponse<{
      totalCampgrounds: number;
      totalReviews: number;
      pricing: { avgPrice: number; minPrice: number; maxPrice: number };
      topLocations: Array<{ _id: string; count: number }>;
    }>>('/api/stats');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get<ApiResponse<{ user: UserProfile }>>('/api/users/profile');
    return response.data;
  },
};

// Booking API
export const bookingAPI = {
  create: async (campgroundId: string, bookingData: { days: number }) => {
    const response = await api.post<ApiResponse<{ booking: Booking }>>(`/api/campgrounds/${campgroundId}/bookings`, bookingData);
    return response.data;
  },

  getUserBookings: async () => {
    const response = await api.get<ApiResponse<{ bookings: Booking[] }>>('/api/bookings');
    return response.data;
  },
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress console logging for expected 401/403 errors
    // These are normal when checking auth status of unauthenticated users
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Don't log these errors to console - they're expected
      // Let the AuthContext handle them appropriately
      return Promise.reject(error);
    }
    
    // Log other errors as they might indicate real issues
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api; 