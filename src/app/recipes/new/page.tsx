import Link from "next/link";
import { AddRecipeForm } from "@/components/add-recipe-form";
import { Button } from "@/components/ui/button";

export default function NewRecipePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Recipe Book
          </Link>
          <Link href="/">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Add Recipe</h1>
        <AddRecipeForm />
      </main>
    </div>
  );
}
