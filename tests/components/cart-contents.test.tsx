import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CartContents } from "@/src/components/shop/cart-contents";
import { CartProvider } from "@/src/components/shop/cart-provider";
import { I18nProvider } from "@/src/i18n/i18n-provider";
import type { Dictionary } from "@/src/i18n/config";
import pl from "@/src/i18n/dictionaries/pl.json";

import { createFakeCartApi, FAKE_PRODUCT } from "../setup/fake-cart-api";

const dictionary = pl as Dictionary;
let api: ReturnType<typeof createFakeCartApi>;

beforeEach(() => {
  api = createFakeCartApi();
  vi.stubGlobal("fetch", api.fetchMock);
});

const renderCart = () =>
  render(
    <I18nProvider locale="pl" dictionary={dictionary}>
      <CartProvider>
        <CartContents />
      </CartProvider>
    </I18nProvider>,
  );

const plusButton = () => screen.getByRole("button", { name: "+1" });
const minusButton = () => screen.getByRole("button", { name: "-1" });

describe("loading", () => {
  it("asks for the cart exactly once when the page mounts", async () => {
    api.seed(2);
    renderCart();

    await waitFor(() => expect(screen.getByText(FAKE_PRODUCT.name)).toBeInTheDocument());
    expect(api.calls.filter((call) => call.method === "GET")).toHaveLength(1);
  });

  it("shows the empty state when there is nothing in the cart", async () => {
    renderCart();

    await waitFor(() =>
      expect(screen.getByText(dictionary.shop.cart.empty)).toBeInTheDocument(),
    );
  });
});

describe("quantity controls", () => {
  it("sends the resulting quantity, derived from a delta", async () => {
    api.seed(2);
    renderCart();
    await waitFor(() => expect(screen.getByText(FAKE_PRODUCT.name)).toBeInTheDocument());

    fireEvent.click(plusButton());
    await waitFor(() => expect(api.bodies("PATCH")).toEqual([{ quantity: 3 }]));

    fireEvent.click(minusButton());
    await waitFor(() =>
      expect(api.bodies("PATCH")).toEqual([{ quantity: 3 }, { quantity: 2 }]),
    );
  });

  it("swallows a double tap instead of sending the same change twice", async () => {
    // `pending` now covers the whole request, so the control is genuinely
    // disabled by the time the second tap lands. Before the fix the flag fell
    // back to false immediately and both taps went through as `quantity: 2`.
    api.seed(1);
    renderCart();
    await waitFor(() => expect(screen.getByText(FAKE_PRODUCT.name)).toBeInTheDocument());

    api.hold();
    fireEvent.click(plusButton());
    fireEvent.click(plusButton());
    api.release();

    await waitFor(() => expect(plusButton()).not.toBeDisabled());
    expect(api.bodies("PATCH")).toEqual([{ quantity: 2 }]);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("disables the controls while a mutation is on the wire", async () => {
    // The flag only became meaningful once `pending` covered the whole request.
    api.seed(2);
    renderCart();
    await waitFor(() => expect(screen.getByText(FAKE_PRODUCT.name)).toBeInTheDocument());

    api.hold();
    fireEvent.click(plusButton());

    await waitFor(() => expect(plusButton()).toBeDisabled());
    expect(minusButton()).toBeDisabled();

    api.release();
    await waitFor(() => expect(plusButton()).not.toBeDisabled());
  });

  it("removes a line", async () => {
    api.seed(2);
    renderCart();
    await waitFor(() => expect(screen.getByText(FAKE_PRODUCT.name)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: new RegExp(FAKE_PRODUCT.name) }));

    await waitFor(() =>
      expect(screen.getByText(dictionary.shop.cart.empty)).toBeInTheDocument(),
    );
  });
});

describe("errors", () => {
  it("shows a localised message when the server refuses the change", async () => {
    api.seed(2);
    renderCart();
    await waitFor(() => expect(screen.getByText(FAKE_PRODUCT.name)).toBeInTheDocument());

    api.failOnce();
    fireEvent.click(plusButton());

    // The API sends `{ available: 1 }`; the UI has to render the number rather
    // than falling back to the generic "not enough stock".
    await waitFor(() =>
      expect(screen.getByText("Dostępna ilość to 1 szt.")).toBeInTheDocument(),
    );
  });

  it("clears the message once a later change succeeds", async () => {
    api.seed(2);
    renderCart();
    await waitFor(() => expect(screen.getByText(FAKE_PRODUCT.name)).toBeInTheDocument());

    api.failOnce();
    fireEvent.click(plusButton());
    await waitFor(() =>
      expect(screen.getByText("Dostępna ilość to 1 szt.")).toBeInTheDocument(),
    );

    fireEvent.click(plusButton());
    await waitFor(() =>
      expect(screen.queryByText("Dostępna ilość to 1 szt.")).not.toBeInTheDocument(),
    );
  });
});

describe("summary", () => {
  it("renders the totals the server calculated", async () => {
    api.seed(2);
    renderCart();

    await waitFor(() => expect(screen.getByText(FAKE_PRODUCT.name)).toBeInTheDocument());
    expect(screen.getByText(dictionary.shop.cart.summary)).toBeInTheDocument();
    // 2 × 349,00 zł — formatted by Intl, so match on the digits.
    expect(screen.getAllByText(/698/).length).toBeGreaterThan(0);
  });
});
