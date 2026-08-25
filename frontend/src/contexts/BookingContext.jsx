import React, { createContext, useState, useContext, useEffect } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('booking_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [location, setLocation] = useState(() => {
    return localStorage.getItem('booking_location') || 'clinic';
  });

  useEffect(() => {
    localStorage.setItem('booking_cart', JSON.stringify(cart));
    localStorage.setItem('booking_location', location);
  }, [cart, location]);

  const addToCart = (service) => {
    if (cart.find(item => item.name === service.name)) {
      return; // Already in cart
    }
    setCart([...cart, { name: service.name, price: service.price }]);
  };

  const removeFromCart = (serviceName) => {
    const newCart = cart.filter(item => item.name !== serviceName);
    setCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
  };

  const changeLocation = (newLoc) => {
    if (newLoc !== location) {
      setLocation(newLoc);
      setCart([]); // Reset cart when location changes
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <BookingContext.Provider value={{ 
      cart, 
      location, 
      addToCart, 
      removeFromCart, 
      clearCart, 
      totalAmount,
      setLocation,
      changeLocation
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);
