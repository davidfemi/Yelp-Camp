import * as React from 'react';
const { createContext, useContext, useState, useEffect } = React;
type ReactNode = React.ReactNode;
import { cartStorage } from '../services/api';
import { Product, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  isInCart: (productId: string) => boolean;
  getCartItem: (productId: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const savedCart = await cartStorage.getCart();
      setCart(savedCart);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToStorage = async (newCart: CartItem[]) => {
    try {
      await cartStorage.saveCart(newCart);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = async (product: Product, quantity: number = 1) => {
    const newCart = [...cart];
    const existingItemIndex = newCart.findIndex(item => item.product._id === product._id);

    if (existingItemIndex >= 0) {
      // Update existing item
      newCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      newCart.push({ product, quantity });
    }

    setCart(newCart);
    await saveCartToStorage(newCart);
  };

  const removeFromCart = async (productId: string) => {
    const newCart = cart.filter(item => item.product._id !== productId);
    setCart(newCart);
    await saveCartToStorage(newCart);
  };

  const updateCartQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const newCart = cart.map(item =>
      item.product._id === productId
        ? { ...item, quantity }
        : item
    );

    setCart(newCart);
    await saveCartToStorage(newCart);
  };

  const clearCart = async () => {
    setCart([]);
    await cartStorage.clearCart();
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (productId: string) => {
    return cart.some(item => item.product._id === productId);
  };

  const getCartItem = (productId: string) => {
    return cart.find(item => item.product._id === productId);
  };

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isInCart,
    getCartItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 