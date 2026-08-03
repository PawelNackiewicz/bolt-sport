import { ApiError } from "@/src/lib/api/errors";
import { handleRoute } from "@/src/lib/api/handler";
import { ok } from "@/src/lib/api/response";
import { productsRepo } from "@/src/lib/db/repositories/products";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  return handleRoute(async () => {
    const { slug } = await context.params;

    const product = await productsRepo.findBySlug(slug);
    if (!product) throw new ApiError("NOT_FOUND", { message: "Nie znaleziono produktu" });

    const [related, category] = await Promise.all([
      productsRepo.findRelated(product, 4),
      productsRepo.findCategoryBySlug(product.categorySlug),
    ]);

    return ok({ product, related, category });
  });
}
