import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartLine } from "@/lib/cart/cart";

type CartState = {
  lines: CartLine[];
};

const initialState: CartState = {
  lines: [],
};

const lineId = (itemId: string, choices: string[], note = "") =>
  [itemId, [...choices].sort().join("+"), note.trim()].join("|");

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrateCart: (state, action: PayloadAction<CartLine[]>) => {
      state.lines = action.payload;
    },
    addToCart: (
      state,
      action: PayloadAction<{ itemId: string; quantity: number; choices?: string[]; note?: string }>,
    ) => {
      const { itemId, quantity, choices = [], note } = action.payload;
      const id = lineId(itemId, choices, note);
      const existing = state.lines.find((line) => line.id === id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        state.lines.push({
          id,
          itemId,
          quantity,
          choices,
          note: note?.trim() || undefined,
        });
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("wqb-cart", JSON.stringify(state.lines));
        } catch {
          // ignore
        }
      }
    },
    setQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      if (quantity < 1) {
        state.lines = state.lines.filter((line) => line.id !== id);
      } else {
        const item = state.lines.find((line) => line.id === id);
        if (item) item.quantity = quantity;
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("wqb-cart", JSON.stringify(state.lines));
        } catch {
          // ignore
        }
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.lines = state.lines.filter((line) => line.id !== action.payload);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("wqb-cart", JSON.stringify(state.lines));
        } catch {
          // ignore
        }
      }
    },
    clearCart: (state) => {
      state.lines = [];
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("wqb-cart", JSON.stringify([]));
        } catch {
          // ignore
        }
      }
    },
  },
});

export const { hydrateCart, addToCart, setQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
