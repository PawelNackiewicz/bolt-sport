import { Container, Skeleton } from "@/src/components/ui";

export default function ProductLoading() {
  return (
    <main className="py-8 sm:py-12">
      <Container className="flex flex-col gap-12">
        <Skeleton className="h-4 w-48" />

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="size-20 rounded-lg" />
              <Skeleton className="size-20 rounded-lg" />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-11 w-64" />
            <div className="flex flex-col gap-2 pt-4">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-6 w-full" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
