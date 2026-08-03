"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  apiFetch,
  patchJson,
  postJson,
  type ApiFailure,
  type ApiResult,
} from "@/src/lib/shop/api-client";
import { readCartCountCookie } from "@/src/lib/shop/cart-count";
import type { CartView } from "@/src/lib/shop/types";

type CartContextValue = {
  /** `null` until something asks for the full cart — see `ensureCart`. */
  cart: CartView | null;
  /** Server count plus in-flight optimistic deltas; drives the header badge. */
  itemsCount: number;
  /** True while at least one mutation is on the wire. */
  pending: boolean;
  /** Loads the full cart once. For the pages that actually render it. */
  ensureCart: () => void;
  refresh: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<ApiFailure | null>;
  changeItemQuantity: (itemId: string, delta: number) => Promise<ApiFailure | null>;
  removeItem: (itemId: string) => Promise<ApiFailure | null>;
  clear: () => Promise<ApiFailure | null>;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Holds the cart for the whole app so the header badge and the cart page stay
 * in sync.
 *
 * Two things keep this cheap. The item count comes from a cookie the cart
 * routes keep up to date, so a page that only renders the badge — the landing
 * page, a product page — costs no request at all. The full cart is fetched
 * lazily by the pages that display it, and every mutation returns the
 * authoritative cart anyway.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartView | null>(null);
  const [count, setCount] = useState(0);

  /**
   * `inFlight` counts unsettled mutations, `delta` is the optimistic offset
   * shown on top of `count`. Kept in one state object so both move in a single
   * pure update — the delta has to be dropped exactly when the last mutation
   * settles, because from that point the server count is authoritative again.
   */
  const [optimistic, setOptimistic] = useState({ inFlight: 0, delta: 0 });

  /** Latest cart, readable synchronously from queued mutations. */
  const cartRef = useRef<CartView | null>(null);
  const loaded = useRef(false);

  const applyCart = useCallback((next: CartView) => {
    cartRef.current = next;
    setCart(next);
    setCount(next.summary.itemsCount);
  }, []);

  /**
   * Cart requests run one at a time. Without this, two quick taps on "+" would
   * race and the slower response could overwrite the newer cart.
   */
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const enqueue = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const result = queue.current.then(task, task);
    queue.current = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }, []);

  const refresh = useCallback(async () => {
    loaded.current = true;
    const result = await enqueue(() =>
      apiFetch<CartView>("/api/cart", { cache: "no-store" }),
    );
    if (result.ok) applyCart(result.data);
  }, [applyCart, enqueue]);

  const ensureCart = useCallback(() => {
    if (loaded.current) return;
    void refresh();
  }, [refresh]);

  useEffect(() => {
    // Badge only — no network. The cookie is refreshed by every cart route.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCount(readCartCountCookie());
  }, []);

  const mutate = useCallback(
    async (
      run: () => Promise<ApiResult<CartView>>,
      optimisticDelta: number,
    ): Promise<ApiFailure | null> => {
      // A mutation answers with the full cart, so the provider owns it from here.
      loaded.current = true;
      setOptimistic((state) => ({
        inFlight: state.inFlight + 1,
        delta: state.delta + optimisticDelta,
      }));

      try {
        const result = await enqueue(run);

        if (!result.ok) {
          // Re-read so the UI shows what the server actually holds.
          await refresh();
          return result.error;
        }

        applyCart(result.data);
        return null;
      } finally {
        setOptimistic((state) => {
          const inFlight = state.inFlight - 1;
          return { inFlight, delta: inFlight === 0 ? 0 : state.delta };
        });
      }
    },
    [applyCart, enqueue, refresh],
  );

  const addItem = useCallback(
    (productId: string, quantity: number) =>
      mutate(
        () => postJson<CartView>("/api/cart/items", { productId, quantity }),
        quantity,
      ),
    [mutate],
  );

  /**
   * Takes a delta, not an absolute quantity: the target value is resolved from
   * the freshest cart at the moment the request actually leaves the queue, so
   * two quick taps on "+" add two pieces instead of both computing "current + 1"
   * from the same stale render.
   */
  const changeItemQuantity = useCallback(
    (itemId: string, delta: number) =>
      mutate(() => {
        const current =
          cartRef.current?.items.find((item) => item.id === itemId)?.quantity ?? 0;
        return patchJson<CartView>(`/api/cart/items/${itemId}`, {
          quantity: Math.max(0, current + delta),
        });
      }, delta),
    [mutate],
  );

  const removeItem = useCallback(
    (itemId: string) => {
      const current =
        cartRef.current?.items.find((item) => item.id === itemId)?.quantity ?? 0;
      return mutate(
        () => apiFetch<CartView>(`/api/cart/items/${itemId}`, { method: "DELETE" }),
        -current,
      );
    },
    [mutate],
  );

  const clear = useCallback(
    () => mutate(() => apiFetch<CartView>("/api/cart", { method: "DELETE" }), -count),
    [count, mutate],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemsCount: Math.max(0, count + optimistic.delta),
      pending: optimistic.inFlight > 0,
      ensureCart,
      refresh,
      addItem,
      changeItemQuantity,
      removeItem,
      clear,
    }),
    [
      cart,
      count,
      optimistic,
      ensureCart,
      refresh,
      addItem,
      changeItemQuantity,
      removeItem,
      clear,
    ],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart musi być użyte wewnątrz <CartProvider>");
  }
  return context;
}
