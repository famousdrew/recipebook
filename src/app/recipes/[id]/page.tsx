import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RecipeDetail } from "@/components/recipe-detail";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecipePage({ params }: PageProps) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: true,
      categories: true,
      comments: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!recipe) {
    notFound();
  }

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
        <RecipeDetail recipe={recipe} />
      </main>
    </div>
  );
}
