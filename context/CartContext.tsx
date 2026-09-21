'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartContextType {
  cartCount: number;
  updateCartCount: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0);

  // Load cart count on mount
  useEffect(() => {
    updateCartCount();
  }, []);

  const updateCartCount = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCartCount(data.data?.cart?.totalItems || 0);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();

      if (res.ok) {
        setCartCount(data.data?.cartItemCount || cartCount + quantity);
        return true;
      } else {
        throw new Error(data.error || data.message || 'Failed to add to cart');
      }
    } catch (error: any) {
      console.error('Add to cart error:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setCartCount(data.data?.cartItemCount || 0);
        return true;
      } else {
        throw new Error(data.message || 'Failed to remove from cart');
      }
    } catch (error: any) {
      console.error('Remove from cart error:', error);
      throw error;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (res.ok) {
        setCartCount(0);
        return true;
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (error: any) {
      console.error('Clear cart error:', error);
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartCount,
        updateCartCount,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
