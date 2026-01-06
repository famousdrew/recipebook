"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    description?: string | null;
    prepTime?: number | null;
    cookTime?: number | null;
    servings?: number | null;
    imageUrl?: string | null;
    categories: { id: string; name: string }[];
  };
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime =
    (recipe.prepTime || 0) + (recipe.cookTime || 0) || null;

  return (
    <Link href={`/recipes/${recipe.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        {recipe.imageUrl && (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
          {recipe.description && (
            <CardDescription className="line-clamp-2">
              {recipe.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {totalTime && (
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {totalTime} min
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <UsersIcon className="w-4 h-4" />
                {recipe.servings} servings
              </span>
            )}
          </div>
          {recipe.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.categories.slice(0, 3).map((cat) => (
                <span
                  key={cat.id}
                  className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground"
                >
                  {cat.name}
                </span>
              ))}
              {recipe.categories.length > 3 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-secondary text-secondary-foreground">
                  +{recipe.categories.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
