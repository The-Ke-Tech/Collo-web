import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./auth-store";
import { toast } from "react-toastify";

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

  // `dedupe: true` = "passive" refresh (header / layout on load): reuse a request that is already
  // in flight instead of sending a second one. Normal calls (e.g. after adding to cart) always fetch fresh.
  fetchCart: (opts?: { dedupe?: boolean }) => Promise<CartItem[] | void>;
  addToCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;

  totalCount: () => number;
  totalPrice: () => number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

let cartFetchInFlight: Promise<CartItem[] | void> | null = null;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      count: 0,
      items: [],
      loading: false,

      clearCart: () => {
        set({ count: 0, items: [], loading: false });
        // Wipe the persisted copy so it doesn't rehydrate after logout
        try {
          useCartStore.persist.clearStorage();
        } catch (err) {
          // Non-fatal — persist may not be ready yet
          console.warn("[CartStore] clearStorage failed:", err);
        }
      },

      fetchCart: (opts) => {
        if (opts?.dedupe && cartFetchInFlight) return cartFetchInFlight;

        const request = (async (): Promise<CartItem[] | void> => {
        // Guard: don't fetch if user isn't logged in
        const user = useAuthStore.getState().user;
        if (!user) {
          set({ count: 0, items: [], loading: false });
          return;
        }

        set({ loading: true });
        try {
          const res = await useAuthStore
            .getState()
            .fetchWithAuth(`${API_URL}/api/cart`);

          // Handle 401 / non-OK responses gracefully
          if (!res.ok) {
            set({ loading: false });
            return;
          }

          const data = await res.json();

          // The user may have logged out while this request was in flight.
          // Ignore the late response so it can't bring the old cart (and badge) back.
          if (!useAuthStore.getState().user) {
            set({ count: 0, items: [], loading: false });
            return;
          }

          if (data?.success) {
            set({
              count: data.count ?? 0,
              items: data.items ?? [],
              loading: false,
            });
            return data.items ?? [];
          } else {
            set({ loading: false });
          }
        } catch (err) {
          console.error("[CartStore] fetchCart error:", err);
          set({ loading: false });
        }
        })();

        const tracked: Promise<CartItem[] | void> = request.finally(() => {
          if (cartFetchInFlight === tracked) cartFetchInFlight = null;
        });
        cartFetchInFlight = tracked;
        return tracked;
      },

      addToCart: async (productId) => {
        const isLoggedIn = useAuthStore.getState().user !== null;

        if (!isLoggedIn) {
          toast.info("You must be logged in to add items to the cart.", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          return;
        }

        try {
          const res = await useAuthStore
            .getState()
            .fetchWithAuth(`${API_URL}/api/cart/add`, {
              method: "POST",
              body: JSON.stringify({ productId }),
            });
          const data = await res.json();

          if (data?.success) {
            await get().fetchCart();
            toast.success("Item added to cart!", {
              position: "top-right",
              autoClose: 2000,
            });
          }
        } catch (err) {
          console.error("[CartStore] addToCart error:", err);
          toast.error("Failed to add item to cart.", {
            position: "top-right",
            autoClose: 3000,
          });
        }
      },

      updateQuantity: async (productId, quantity) => {
        try {
          const res = await useAuthStore
            .getState()
            .fetchWithAuth(`${API_URL}/api/cart/update`, {
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
          const res = await useAuthStore
            .getState()
            .fetchWithAuth(`${API_URL}/api/cart/remove`, {
              method: "POST",
              body: JSON.stringify({ productId }),
            });
          const data = await res.json();
          if (data?.success) await get().fetchCart();
        } catch (err) {
          console.error("[CartStore] removeFromCart error:", err);
        }
      },

      totalCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) =>
            sum + (item.product?.sellingPrice ?? 0) * item.quantity,
          0
        ),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ count: state.count, items: state.items }),
      // On rehydrate, if the user isn't logged in, wipe the persisted cart
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const user = useAuthStore.getState().user;
        if (!user) {
          state.items = [];
          state.count = 0;
          try {
            useCartStore.persist.clearStorage();
          } catch {
            /* ignore */
          }
        }
      },
    }
  )
);

/* =======================
   Auto-clear the cart on logout
======================= */
// Whenever the user goes from logged-in -> logged-out (Logout button, header menu,
// expired session / failed token refresh, ...) the cart is wiped straight away.
// This makes the cart icon badge disappear instantly, on every page, without a refresh.
useAuthStore.subscribe((state, prevState) => {
  if (prevState.user && !state.user) {
    useCartStore.getState().clearCart();
  }
});