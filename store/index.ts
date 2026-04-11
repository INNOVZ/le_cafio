import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartProduct {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

interface AppState {
  isMenuOpen: boolean;
  cartItems: CartItem[];
  cartCount: number;
  selectedMenuCategoryId: 'all' | string;
  toggleMenu: () => void;
  setSelectedMenuCategory: (categoryId: 'all' | string) => void;
  addToCart: (product: CartProduct, quantity: number) => void;
  incrementCartItem: (productId: string) => void;
  decrementCartItem: (productId: string) => void;
  removeCartItem: (productId: string) => void;
  clearCart: () => void;
}

function getCartCount(cartItems: CartItem[]) {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isMenuOpen: false,
      cartItems: [],
      cartCount: 0,
      selectedMenuCategoryId: 'all',
      setSelectedMenuCategory: (categoryId) =>
        set({ selectedMenuCategoryId: categoryId }),
      toggleMenu: () =>
        set((state) => ({ isMenuOpen: !state.isMenuOpen })),
      addToCart: (product, quantity) =>
        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.id === product.id
          );

          const cartItems = existingItem
            ? state.cartItems.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            : [...state.cartItems, { ...product, quantity }];

          return {
            cartItems,
            cartCount: getCartCount(cartItems),
          };
        }),
      incrementCartItem: (productId) =>
        set((state) => {
          const cartItems = state.cartItems.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );

          return {
            cartItems,
            cartCount: getCartCount(cartItems),
          };
        }),
      decrementCartItem: (productId) =>
        set((state) => {
          const cartItems = state.cartItems
            .map((item) =>
              item.id === productId
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter((item) => item.quantity > 0);

          return {
            cartItems,
            cartCount: getCartCount(cartItems),
          };
        }),
      removeCartItem: (productId) =>
        set((state) => {
          const cartItems = state.cartItems.filter(
            (item) => item.id !== productId
          );

          return {
            cartItems,
            cartCount: getCartCount(cartItems),
          };
        }),
      clearCart: () => set({ cartItems: [], cartCount: 0 }),
    }),
    {
      name: 'cafio-store',
      partialize: (state) => ({
        cartItems: state.cartItems,
        cartCount: state.cartCount,
      }),
    }
  )
);
