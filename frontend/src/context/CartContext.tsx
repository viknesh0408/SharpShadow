import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

interface CartContextType {
  items: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  totalAmount: number;
  itemCount: number;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: number) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sharpshadow_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sharpshadow_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('sharpshadow_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('sharpshadow_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const isInCart = (productId: number) => {
    return items.some((p) => p.id === productId);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isWishlisted = (productId: number) => {
    return wishlist.some((p) => p.id === productId);
  };

  const totalAmount = items.reduce((sum, item) => {
    const price = item.discountPrice != null ? item.discountPrice : item.price;
    return sum + price;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        totalAmount,
        itemCount: items.length,
        wishlist,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
