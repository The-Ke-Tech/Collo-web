import { createContext } from "react";

export interface AppContextType {
  cartProductCount: number;
  fetchUserAddToCart: () => void;
  fetchUserDetails: () => void;
}

const Context = createContext<AppContextType>({
  cartProductCount: 0,
  fetchUserAddToCart: () => {},
  fetchUserDetails: () => {},
});

export default Context;
