import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./auth-store";
import { toast } from "react-toastify"

interface CartItem {
  productId: string;
  quantity: number;
  product?: {
    _id: string;
    productName: string;
    category: string;
    productImage: string[];
    sellingPrice: number;
    price: number;
    stock: number;
  };
}

interface CartState {
  count: number;
  items: CartItem[];
  loading: boolean;

  fetchCart: () => Promise<CartItem[] | void>;
  addToCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;

  totalCount: () => number;
  totalPrice: () => number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      count: 0,
      items: [],
      loading: false,

      clearCart: () => set({ count: 0, items: [] }),

      fetchCart: async () => {
        set({ loading: true });
        try {
          const res = await useAuthStore.getState().fetchWithAuth(`${API_URL}/api/cart`);
          const data = await res.json();

          if (data?.success) {
            set({ count: data.count, items: data.items ?? [], loading: false });
            return data.items ?? [];
          } else {
            set({ loading: false });
          }
        } catch (err) {
          console.error("[CartStore] fetchCart error:", err);
          set({ loading: false });
        }
      },

     

addToCart: async (productId) => {
  const isLoggedIn = useAuthStore.getState().user !== null

  if (!isLoggedIn) {
    toast.info("You must be logged in to add items to the cart.", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    })
    return
  }

  try {
    const res = await useAuthStore.getState().fetchWithAuth(`${API_URL}/api/cart/add`, {
      method: "POST",
      body: JSON.stringify({ productId }),
    })
    const data = await res.json()
    if (data?.success) {
      await get().fetchCart()
      toast.success("Item added to cart!", {
        position: "top-right",
        autoClose: 2000,
      })
    }
  } catch (err) {
    console.error("[CartStore] addToCart error:", err)
    toast.error("Failed to add item to cart.", {
      position: "top-right",
      autoClose: 3000,
    })
  }
},

      updateQuantity: async (productId, quantity) => {
        try {
          const res = await useAuthStore.getState().fetchWithAuth(`${API_URL}/api/cart/update`, {
            method: "POST",
            body: JSON.stringify({ productId, quantity }),
          });
          const data = await res.json();
          if (data?.success) await get().fetchCart();
        } catch (err) {
          console.error("[CartStore] updateQuantity error:", err);
        }
      },

      removeFromCart: async (productId) => {
        try {
          const res = await useAuthStore.getState().fetchWithAuth(`${API_URL}/api/cart/remove`, {
            method: "POST",
            body: JSON.stringify({ productId }),
          });
          const data = await res.json();
          if (data?.success) await get().fetchCart();
        } catch (err) {
          console.error("[CartStore] removeFromCart error:", err);
        }
      },

      totalCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () => get().items.reduce((sum, item) => sum + (item.product?.sellingPrice ?? 0) * item.quantity, 0),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ count: state.count, items: state.items }),
    }
  )
);
