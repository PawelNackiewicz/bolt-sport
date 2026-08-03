import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CartProvider, useCart } from "@/src/components/shop/cart-provider";
import { CART_COUNT_COOKIE } from "@/src/lib/shop/constants";

import { createFakeCartApi, FAKE_PRODUCT } from "../setup/fake-cart-api";

let api: ReturnType<typeof createFakeCartApi>;

beforeEach(() => {
  api = createFakeCartApi();
  vi.stubGlobal("fetch", api.fetchMock);
});

function Harness() {
  const { itemsCount, pending, cart, ensureCart, addItem, changeItemQuantity, removeItem, clear } =
    useCart();

  return (
    <div>
      <span data-testid="count">{itemsCount}</span>
      <span data-testid="pending">{String(pending)}</span>
      <span data-testid="loaded">{cart ? "yes" : "no"}</span>
      <button onClick={() => ensureCart()}>ensure</button>
      <button onClick={() => void addItem(FAKE_PRODUCT.id, 1)}>add</button>
      <button onClick={() => void changeItemQuantity("item-1", 1)}>plus</button>
      <button onClick={() => void changeItemQuantity("item-1", -1)}>minus</button>
      <button onClick={() => void removeItem("item-1")}>remove</button>
      <button onClick={() => void clear()}>clear</button>
    </div>
  );
}

const renderProvider = () =>
  render(
    <CartProvider>
      <Harness />
    </CartProvider>,
  );

const count = () => screen.getByTestId("count").textContent;
const pending = () => screen.getByTestId("pending").textContent;

describe("badge without a round-trip", () => {
  it("never calls the API just because a page mounted", async () => {
    // The whole reason the landing page can stay cheap.
    renderProvider();

    await waitFor(() => expect(count()).toBe("0"));
    expect(api.fetchMock).not.toHaveBeenCalled();
  });

  it("shows the count carried by the badge cookie", async () => {
    document.cookie = `${CART_COUNT_COOKIE}=4; path=/`;

    renderProvider();

    await waitFor(() => expect(count()).toBe("4"));
    expect(api.fetchMock).not.toHaveBeenCalled();
  });

  it("leaves the full cart unloaded until something asks for it", async () => {
    document.cookie = `${CART_COUNT_COOKIE}=4; path=/`;
    renderProvider();

    await waitFor(() => expect(count()).toBe("4"));
    expect(screen.getByTestId("loaded").textContent).toBe("no");
  });
});

describe("ensureCart", () => {
  it("loads the cart once, however many consumers ask", async () => {
    api.seed(2);
    renderProvider();

    fireEvent.click(screen.getByText("ensure"));
    fireEvent.click(screen.getByText("ensure"));
    fireEvent.click(screen.getByText("ensure"));

    await waitFor(() => expect(screen.getByTestId("loaded").textContent).toBe("yes"));
    expect(api.calls.filter((call) => call.method === "GET")).toHaveLength(1);
    expect(count()).toBe("2");
  });

  it("skips the fetch when a mutation already delivered the cart", async () => {
    renderProvider();

    fireEvent.click(screen.getByText("add"));
    await waitFor(() => expect(count()).toBe("1"));

    fireEvent.click(screen.getByText("ensure"));
    await waitFor(() => expect(screen.getByTestId("loaded").textContent).toBe("yes"));

    expect(api.calls.filter((call) => call.method === "GET")).toHaveLength(0);
  });
});

describe("concurrent mutations", () => {
  it("stacks two quick taps instead of racing them to the same value", async () => {
    // Regression: both handlers used to read `item.quantity` from the same
    // render and send `quantity: 2` twice, losing one increment.
    api.seed(1);
    renderProvider();

    fireEvent.click(screen.getByText("ensure"));
    await waitFor(() => expect(count()).toBe("1"));

    fireEvent.click(screen.getByText("plus"));
    fireEvent.click(screen.getByText("plus"));

    await waitFor(() => expect(count()).toBe("3"));
    expect(api.bodies("PATCH")).toEqual([{ quantity: 2 }, { quantity: 3 }]);
  });

  it("serialises requests — the second leaves only after the first answers", async () => {
    api.seed(1);
    renderProvider();
    fireEvent.click(screen.getByText("ensure"));
    await waitFor(() => expect(count()).toBe("1"));

    api.hold();
    fireEvent.click(screen.getByText("plus"));
    fireEvent.click(screen.getByText("plus"));

    await waitFor(() => expect(api.bodies("PATCH")).toHaveLength(1));
    // Still exactly one in flight while the first is held.
    expect(api.bodies("PATCH")).toEqual([{ quantity: 2 }]);

    api.release();
    await waitFor(() => expect(api.bodies("PATCH")).toEqual([{ quantity: 2 }, { quantity: 3 }]));
  });

  it("handles a mixed burst of increments and decrements", async () => {
    api.seed(5);
    renderProvider();
    fireEvent.click(screen.getByText("ensure"));
    await waitFor(() => expect(count()).toBe("5"));

    fireEvent.click(screen.getByText("plus"));
    fireEvent.click(screen.getByText("minus"));
    fireEvent.click(screen.getByText("plus"));

    await waitFor(() => expect(count()).toBe("6"));
    expect(api.bodies("PATCH")).toEqual([{ quantity: 6 }, { quantity: 5 }, { quantity: 6 }]);
  });
});

describe("pending", () => {
  it("stays true for the whole request, not just the render", async () => {
    // Regression: the flag was driven by a synchronous transition, so it fell
    // back to false immediately and `disabled={pending}` never engaged.
    renderProvider();
    api.hold();

    fireEvent.click(screen.getByText("add"));
    await waitFor(() => expect(pending()).toBe("true"));

    // Still pending while the response is held open.
    expect(pending()).toBe("true");

    api.release();
    await waitFor(() => expect(pending()).toBe("false"));
  });

  it("clears only once the last of several mutations settles", async () => {
    api.seed(1);
    renderProvider();
    fireEvent.click(screen.getByText("ensure"));
    await waitFor(() => expect(count()).toBe("1"));

    api.hold();
    fireEvent.click(screen.getByText("plus"));
    fireEvent.click(screen.getByText("plus"));
    await waitFor(() => expect(pending()).toBe("true"));

    api.release();
    await waitFor(() => expect(pending()).toBe("false"));
    expect(count()).toBe("3");
  });
});

describe("optimistic count", () => {
  it("moves before the server answers", async () => {
    renderProvider();
    api.hold();

    fireEvent.click(screen.getByText("add"));

    // The response has not landed yet — this number can only be optimistic.
    await waitFor(() => expect(count()).toBe("1"));
    expect(api.fetchMock).toHaveBeenCalledTimes(1);

    api.release();
    await waitFor(() => expect(pending()).toBe("false"));
    expect(count()).toBe("1");
  });

  it("drops back to the server count and re-reads after a failure", async () => {
    api.seed(2);
    renderProvider();
    fireEvent.click(screen.getByText("ensure"));
    await waitFor(() => expect(count()).toBe("2"));

    api.failOnce();
    fireEvent.click(screen.getByText("plus"));

    await waitFor(() => expect(pending()).toBe("false"));
    // Optimistic +1 is gone and the authoritative cart was re-fetched.
    expect(count()).toBe("2");
    expect(api.calls.filter((call) => call.method === "GET")).toHaveLength(2);
  });

  it("never renders a negative badge", async () => {
    renderProvider();
    api.hold();

    fireEvent.click(screen.getByText("remove"));
    await waitFor(() => expect(count()).toBe("0"));

    api.release();
    await waitFor(() => expect(pending()).toBe("false"));
    expect(Number(count())).toBeGreaterThanOrEqual(0);
  });
});

describe("useCart outside a provider", () => {
  it("fails loudly rather than silently doing nothing", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Harness />)).toThrow(/CartProvider/);
  });
});
