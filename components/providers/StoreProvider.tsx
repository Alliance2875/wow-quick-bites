"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { hydrateAuth } from "@/lib/redux/slices/authSlice";
import { hydrateCart } from "@/lib/redux/slices/cartSlice";
import { hydrateLastOrder } from "@/lib/redux/slices/orderSlice";
import { store } from "@/lib/redux/store";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      // 1. Hydrate Cart
      const rawCart = localStorage.getItem("wqb-cart");
      if (rawCart) {
        store.dispatch(hydrateCart(JSON.parse(rawCart)));
      }

      // 2. Hydrate Auth
      const token = localStorage.getItem("wqb_token");
      const refresh = localStorage.getItem("wqb_refresh");
      const rawUser = localStorage.getItem("wqb_user");
      if (token && rawUser) {
        store.dispatch(
          hydrateAuth({
            accessToken: token,
            refreshToken: refresh,
            user: JSON.parse(rawUser),
          }),
        );
      }

      // 3. Hydrate Last Order
      const rawOrder = localStorage.getItem("wqb-last-order");
      if (rawOrder) {
        store.dispatch(hydrateLastOrder(JSON.parse(rawOrder)));
      }
    } catch {
      // ignore parsing errors
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
