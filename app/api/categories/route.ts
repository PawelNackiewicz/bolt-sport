import { handleRoute } from "@/src/lib/api/handler";
import { ok } from "@/src/lib/api/response";
import { productsRepo } from "@/src/lib/db/repositories/products";

export async function GET() {
  return handleRoute(async () => {
    const categories = await productsRepo.listCategories();
    return ok(categories);
  });
}
