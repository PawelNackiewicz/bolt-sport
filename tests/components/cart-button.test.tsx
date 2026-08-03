import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CartButton } from "@/src/components/shop/cart-button";
import { CartProvider } from "@/src/components/shop/cart-provider";
import { I18nProvider } from "@/src/i18n/i18n-provider";
import type { Dictionary } from "@/src/i18n/config";
import pl from "@/src/i18n/dictionaries/pl.json";
import { CART_COUNT_COOKIE } from "@/src/lib/shop/constants";

import { createFakeCartApi } from "../setup/fake-cart-api";

const dictionary = pl as Dictionary;
let api: ReturnType<typeof createFakeCartApi>;

beforeEach(() => {
  api = createFakeCartApi();
  vi.stubGlobal("fetch", api.fetchMock);
});

const renderButton = () =>
  render(
    <I18nProvider locale="pl" dictionary={dictionary}>
      <CartProvider>
        <CartButton />
      </CartProvider>
    </I18nProvider>,
  );

describe("CartButton", () => {
  it("links to the cart", () => {
    renderButton();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/pl/koszyk");
  });

  it("shows no counter for an empty cart", async () => {
    renderButton();

    await waitFor(() => expect(screen.getByRole("link")).toBeInTheDocument());
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders the count straight from the cookie, without any request", async () => {
    // This is the perf fix: the header on a marketing page must not trigger
    // a call to /api/cart just to draw a number.
    document.cookie = `${CART_COUNT_COOKIE}=3; path=/`;

    renderButton();

    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());
    expect(api.fetchMock).not.toHaveBeenCalled();
  });

  it("caps the badge at 99+", async () => {
    document.cookie = `${CART_COUNT_COOKIE}=140; path=/`;
    renderButton();

    await waitFor(() => expect(screen.getByText("99+")).toBeInTheDocument());
  });

  it("keeps the count out of the accessible name duplication, but in the label", async () => {
    document.cookie = `${CART_COUNT_COOKIE}=2; path=/`;
    renderButton();

    await waitFor(() =>
      expect(screen.getByRole("link")).toHaveAccessibleName(
        `${dictionary.shop.nav.cart} — 2 ${dictionary.shop.common.pieces}`,
      ),
    );
    // The visual badge is decorative; screen readers get the label instead.
    expect(screen.getByText("2")).toHaveAttribute("aria-hidden");
  });
});
