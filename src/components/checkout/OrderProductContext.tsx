import { createContext, useContext } from "react";
import { programProduct, type OrderProduct } from "@/content/content";

/**
 * Which product the order page parts show. OrderPage sets it; without a
 * provider the parts show the 8-Week Pilates Program.
 */
export const OrderProductContext = createContext<OrderProduct>(programProduct);

export function useOrderProduct(): OrderProduct {
  return useContext(OrderProductContext);
}
