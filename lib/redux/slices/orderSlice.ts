import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Order } from "@/lib/orders";

type OrderState = {
  lastOrder: Order | null;
};

const initialState: OrderState = {
  lastOrder: null,
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setLastOrder: (state, action: PayloadAction<Order | null>) => {
      state.lastOrder = action.payload;
      if (typeof window !== "undefined") {
        try {
          if (action.payload) {
            localStorage.setItem("wqb-last-order", JSON.stringify(action.payload));
          } else {
            localStorage.removeItem("wqb-last-order");
          }
        } catch {
          // ignore
        }
      }
    },
    hydrateLastOrder: (state, action: PayloadAction<Order | null>) => {
      state.lastOrder = action.payload;
    },
  },
});

export const { setLastOrder, hydrateLastOrder } = orderSlice.actions;
export default orderSlice.reducer;
