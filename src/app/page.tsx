import Link from "next/link";
import { RecipeList } from "@/components/recipe-list";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Recipe Book
          </Link>
          <Link href="/recipes/new">
            <Button>Add Recipe</Button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <RecipeList />
      </main>
    </div>
  );
}
