import { created, ok } from "@/src/lib/api/response";
import { setCartCountCookie } from "@/src/lib/auth/cookies";

import type { CartView } from "./types";

/**
 * The one way a route handler hands back a cart: JSON body plus a refreshed
 * badge cookie. Going through here keeps the counter in the header in step with
 * the cart even on pages that never fetch `/api/cart`.
 */
export async function cartResponse(
  view: CartView,
  status: 200 | 201 = 200,
): Promise<Response> {
  await setCartCountCookie(view.summary.itemsCount);
  return status === 201 ? created(view) : ok(view);
}
