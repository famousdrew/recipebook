"use client";

import { useState, useEffect } from "react";
import { RecipeCard } from "./recipe-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Recipe {
  id: string;
  title: string;
  description?: string | null;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
  imageUrl?: string | null;
  categories: { id: string; name: string }[];
}

interface Category {
  id: string;
  name: string;
  _count: { recipes: number };
}

export function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [selectedCategory]);

  async function fetchRecipes() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.set("category", selectedCategory);
      }
      const res = await fetch(`/api/recipes?${params}`);
      const data = await res.json();
      setRecipes(data);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }

  const filteredRecipes = recipes.filter((recipe) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      recipe.title.toLowerCase().includes(searchLower) ||
      recipe.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.name ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.name)}
            >
              {cat.name} ({cat._count.recipes})
            </Button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          Loading recipes...
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {search || selectedCategory
            ? "No recipes found matching your criteria"
            : "No recipes yet. Add your first recipe!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
