import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RecipeNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
        <p className="text-muted-foreground mb-6">
          The recipe you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/">
          <Button>Back to recipes</Button>
        </Link>
      </div>
    </div>
  );
}
