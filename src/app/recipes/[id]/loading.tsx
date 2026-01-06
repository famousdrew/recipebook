import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RecipeLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
          <div className="aspect-video w-full bg-muted animate-pulse rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-10 w-3/4 bg-muted animate-pulse rounded"></div>
            <div className="h-6 w-full bg-muted animate-pulse rounded"></div>
          </div>
          <Card>
            <CardHeader>
              <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-5 w-full bg-muted animate-pulse rounded"></div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="h-6 w-28 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full bg-muted animate-pulse rounded"></div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
