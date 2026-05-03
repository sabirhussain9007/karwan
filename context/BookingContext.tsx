"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type BookingItem = {
  packageId?: string;
  serviceType: string;
  title: string;
  price: number;
  passengers: number;
  travelDate?: string;
  returnDate?: string;
  applicationData?: Record<string, any>;
};

interface BookingContextType {
  cart: BookingItem[];
  addToCart: (item: BookingItem) => void;
  removeFromCart: (packageId: string) => void;
  clearCart: () => void;
  totalDisplayPrice: number;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<BookingItem[]>([]);

  const addToCart = (item: BookingItem) => {
    setCart((prev) => {
      // Prevent duplicates or handle updates
      const existing = prev.find((i) => i.packageId === item.packageId);
      if (existing) {
        return prev.map((i) => (i.packageId === item.packageId ? item : i));
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (packageId: string) => {
    setCart((prev) => prev.filter((i) => i.packageId !== packageId));
  };

  const clearCart = () => setCart([]);

  const totalDisplayPrice = cart.reduce((acc, curr) => acc + curr.price * curr.passengers, 0);

  return (
    <BookingContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalDisplayPrice }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBookingContext must be used within a BookingProvider");
  }
  return context;
};
