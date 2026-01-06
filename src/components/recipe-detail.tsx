"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Ingredient {
  id: string;
  name: string;
  amount?: string | null;
  unit?: string | null;
}

interface Category {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
}

interface Recipe {
  id: string;
  title: string;
  description?: string | null;
  instructions: string;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  ingredients: Ingredient[];
  categories: Category[];
  comments: Comment[];
}

interface RecipeDetailProps {
  recipe: Recipe;
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const [scale, setScale] = useState(1);
  const [customScale, setCustomScale] = useState("");
  const [comments, setComments] = useState(recipe.comments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  function scaleAmount(amount: string | null | undefined): string {
    if (!amount) return "";

    // Try to parse as a number or fraction
    const num = parseAmount(amount);
    if (num === null) return amount;

    const scaled = num * scale;

    // Format nicely
    if (scaled === Math.floor(scaled)) {
      return scaled.toString();
    }
    return scaled.toFixed(2).replace(/\.?0+$/, "");
  }

  function parseAmount(amount: string): number | null {
    // Unicode fraction mapping
    const unicodeFractions: Record<string, number> = {
      '½': 0.5,
      '⅓': 1/3,
      '⅔': 2/3,
      '¼': 0.25,
      '¾': 0.75,
      '⅕': 0.2,
      '⅖': 0.4,
      '⅗': 0.6,
      '⅘': 0.8,
      '⅙': 1/6,
      '⅚': 5/6,
      '⅛': 0.125,
      '⅜': 0.375,
      '⅝': 0.625,
      '⅞': 0.875,
    };

    // Handle standalone unicode fractions like "½"
    if (unicodeFractions[amount] !== undefined) {
      return unicodeFractions[amount];
    }

    // Handle mixed unicode fractions like "1½" or "2 ½"
    for (const [frac, value] of Object.entries(unicodeFractions)) {
      const mixedUnicodeMatch = amount.match(new RegExp(`^(\\d+)\\s*${frac}$`));
      if (mixedUnicodeMatch) {
        return parseInt(mixedUnicodeMatch[1]) + value;
      }
    }

    // Handle fractions like "1/2" or "3/4"
    const fractionMatch = amount.match(/^(\d+)\/(\d+)$/);
    if (fractionMatch) {
      return parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
    }

    // Handle mixed fractions like "1 1/2"
    const mixedMatch = amount.match(/^(\d+)\s+(\d+)\/(\d+)$/);
    if (mixedMatch) {
      return parseInt(mixedMatch[1]) + parseInt(mixedMatch[2]) / parseInt(mixedMatch[3]);
    }

    // Handle plain numbers
    const num = parseFloat(amount);
    return isNaN(num) ? null : num;
  }

  function handleCustomScale() {
    const num = parseFloat(customScale);
    if (!isNaN(num) && num > 0) {
      setScale(num);
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments([comment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          ← Back to recipes
        </Link>
      </div>

      {recipe.imageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div>
        <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-lg text-muted-foreground">{recipe.description}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        {recipe.prepTime && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Prep:</span>
            <span>{recipe.prepTime} min</span>
          </div>
        )}
        {recipe.cookTime && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Cook:</span>
            <span>{recipe.cookTime} min</span>
          </div>
        )}
        {totalTime > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Total:</span>
            <span>{totalTime} min</span>
          </div>
        )}
        {recipe.servings && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Servings:</span>
            <span>{Math.round(recipe.servings * scale)}</span>
          </div>
        )}
      </div>

      {recipe.categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.categories.map((cat) => (
            <span
              key={cat.id}
              className="px-3 py-1 text-sm rounded-full bg-secondary text-secondary-foreground"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ingredients</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Scale:</span>
              {[1, 2, 3].map((s) => (
                <Button
                  key={s}
                  variant={scale === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScale(s)}
                >
                  {s}x
                </Button>
              ))}
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  placeholder="Custom"
                  className="w-20 h-8"
                  value={customScale}
                  onChange={(e) => setCustomScale(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomScale()}
                />
                <Button size="sm" variant="outline" onClick={handleCustomScale}>
                  Set
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex items-baseline gap-2">
                <span className="font-medium">
                  {scaleAmount(ing.amount)} {ing.unit}
                </span>
                <span>{ing.name}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {recipe.instructions.split("\n").map((step, i) => (
              <p key={i} className="mb-4">
                {step}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {recipe.sourceUrl && (
        <div className="text-sm text-muted-foreground">
          Source:{" "}
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {recipe.sourceUrl}
          </a>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Comments ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddComment} disabled={submitting}>
              {submitting ? "..." : "Post"}
            </Button>
          </div>

          {comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4 last:border-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="font-medium">
                      {comment.user?.name || comment.user?.email || "Anonymous"}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
