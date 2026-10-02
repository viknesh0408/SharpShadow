import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { ApplyCouponResult, couponService } from '../services/couponService';

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
  appliedCoupon: ApplyCouponResult | null;
  applyCoupon: (coupon: ApplyCouponResult) => void;
  removeCoupon: () => void;
  discountAmount: number;
  finalTotal: number;
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

  const [appliedCoupon, setAppliedCouponState] = useState<ApplyCouponResult | null>(() => {
    try {
      const saved = localStorage.getItem('sharpshadow_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem('sharpshadow_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('sharpshadow_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('sharpshadow_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('sharpshadow_coupon');
    }
  }, [appliedCoupon]);

  // Re-sync or invalidate coupon if items in cart change
  useEffect(() => {
    if (items.length === 0) {
      if (appliedCoupon) {
        setAppliedCouponState(null);
      }
      return;
    }

    if (appliedCoupon) {
      // Re-validate coupon in background to adjust discount or remove if min spend is no longer met
      couponService.validateCoupon(appliedCoupon.code, items.map((i) => i.id))
        .then((fresh) => {
          setAppliedCouponState(fresh);
        })
        .catch(() => {
          // If criteria no longer met, remove coupon
          setAppliedCouponState(null);
        });
    }
  }, [items]);

  const applyCoupon = (coupon: ApplyCouponResult) => {
    setAppliedCouponState(coupon);
  };

  const removeCoupon = () => {
    setAppliedCouponState(null);
  };

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
    setAppliedCouponState(null);
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

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = appliedCoupon ? Math.max(0, appliedCoupon.finalTotal) : totalAmount;

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
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        finalTotal,
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
