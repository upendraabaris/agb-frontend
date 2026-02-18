import React, { useState } from 'react';

export const CartContext = React.createContext();

export const CartProvider = ({ children }) => {
  const [cartItemLength, setCartItemLength] = useState(0);

  return <CartContext.Provider value={{ cartItemLength, setCartItemLength }}>{children}</CartContext.Provider>;
};
