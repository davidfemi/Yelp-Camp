// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

export interface UserProfile extends User {
  createdAt: string;
  stats: {
    campgrounds: number;
    reviews: number;
    bookings?: number;
  };
}

// Campground Types
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
  capacity?: number;
  peopleBooked?: number;
  availableSpots?: number;
}

// Review Types
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

// Product Types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'apparel' | 'accessories' | 'drinkware' | 'stationery';
  inStock: boolean;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

// Booking Types
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
    images: Array<{ url: string; filename: string }>;
  };
  checkInDate?: string;
  checkOutDate?: string;
  days: number;
  totalPrice: number;
  status: string;
  createdAt: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  CampgroundDetail: { campgroundId: string };
  ProductDetail: { productId: string };
  BookingForm: { campgroundId: string };
  Bookings: undefined;
  BookingDetail: { bookingId: string };
  Orders: undefined;
  OrderDetail: { orderId: string };
  EditProfile: undefined;
  Cart: undefined;
  Checkout: undefined;
};

export type MainTabParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  ShopTab: undefined;
  ProfileTab: undefined;
}; 