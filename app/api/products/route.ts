import { handleRoute, parseSearchParams } from "@/src/lib/api/handler";
import { ok } from "@/src/lib/api/response";
import { productsRepo } from "@/src/lib/db/repositories/products";
import { productQuerySchema } from "@/src/lib/validation/shop";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const query = parseSearchParams(new URL(request.url), productQuerySchema);
    const result = await productsRepo.findMany(query);

    return ok(result.items, {
      page: result.page,
      perPage: result.perPage,
      total: result.total,
      totalPages: result.totalPages,
    });
  });
}
