import { Container, Skeleton } from "@/src/components/ui";
import { ProductCardSkeleton } from "@/src/components/shop/product-card";

export default function ShopLoading() {
  return (
    <main className="py-10 sm:py-14">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
          <div className="flex flex-col gap-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-32" />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-44" />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
