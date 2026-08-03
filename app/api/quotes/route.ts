import { handleRoute, parseJsonBody } from "@/src/lib/api/handler";
import { enforceRateLimit } from "@/src/lib/api/rate-limit";
import { created } from "@/src/lib/api/response";
import { productsRepo } from "@/src/lib/db/repositories/products";
import { quotesRepo } from "@/src/lib/db/repositories/quotes";
import { createQuoteSchema } from "@/src/lib/validation/shop";

/**
 * MOCK: the request is stored in memory and printed to the server console.
 * No mail is sent and no CRM is contacted.
 */
export async function POST(request: Request) {
  return handleRoute(async () => {
    enforceRateLimit(request, "quotes", { limit: 5, windowSeconds: 600 });

    const input = await parseJsonBody(request, createQuoteSchema);

    // An unknown productId is dropped rather than rejected — the enquiry itself
    // is still worth recording.
    const product = input.productId
      ? await productsRepo.findById(input.productId)
      : null;

    const quote = await quotesRepo.create({
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      productId: product?.id,
      message: input.message,
      type: input.type,
    });

    console.info(
      `\n[mock-quote] Nowe zapytanie ofertowe ${quote.id}\n` +
        `[mock-quote] ${quote.name}${quote.company ? ` (${quote.company})` : ""} · ${quote.email} · ${quote.phone}\n` +
        `[mock-quote] Typ: ${quote.type}${product ? ` · Produkt: ${product.name}` : ""}\n` +
        `[mock-quote] ${quote.message}\n`,
    );

    return created({ quote });
  });
}
