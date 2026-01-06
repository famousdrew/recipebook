"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Ingredient {
  name: string;
  amount?: string;
  unit?: string;
}

interface ExtractedRecipe {
  title: string;
  description?: string;
  instructions: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  ingredients: Ingredient[];
  categories: string[];
}

export function AddRecipeForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"url" | "manual">("url");
  const [url, setUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<ExtractedRecipe | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Form state for manual entry / editing
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", amount: "", unit: "" }]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [availableCategories, setAvailableCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (extracted) {
      setTitle(extracted.title);
      setDescription(extracted.description || "");
      setInstructions(extracted.instructions);
      setPrepTime(extracted.prepTime?.toString() || "");
      setCookTime(extracted.cookTime?.toString() || "");
      setServings(extracted.servings?.toString() || "");
      setIngredients(
        extracted.ingredients.length > 0
          ? extracted.ingredients
          : [{ name: "", amount: "", unit: "" }]
      );
      setCategories(extracted.categories);
    }
  }, [extracted]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setAvailableCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  }

  async function handleExtract() {
    if (!url.trim()) return;

    setExtracting(true);
    setError("");
    setExtracted(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, save: false }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to extract recipe");
      }

      setExtracted(data.extracted);
      setMode("manual"); // Switch to edit mode
    } catch (err) {
      setError(err instanceof Error ? err.message : "Extraction failed");
    } finally {
      setExtracting(false);
    }
  }

  async function handleSave() {
    if (!title.trim() || !instructions.trim()) {
      setError("Title and instructions are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          instructions,
          prepTime: prepTime ? parseInt(prepTime) : undefined,
          cookTime: cookTime ? parseInt(cookTime) : undefined,
          servings: servings ? parseInt(servings) : undefined,
          imageUrl: imageUrl || undefined,
          sourceUrl: url || undefined,
          ingredients: ingredients.filter((ing) => ing.name.trim()),
          categories,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save recipe");
      }

      router.push(`/recipes/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function addIngredient() {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: string) {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  }

  function addCategory() {
    if (newCategory.trim() && !categories.includes(newCategory.trim().toLowerCase())) {
      setCategories([...categories, newCategory.trim().toLowerCase()]);
      setNewCategory("");
    }
  }

  function removeCategory(cat: string) {
    setCategories(categories.filter((c) => c !== cat));
  }

  function toggleExistingCategory(name: string) {
    if (categories.includes(name)) {
      setCategories(categories.filter((c) => c !== name));
    } else {
      setCategories([...categories, name]);
    }
  }

  return (
    <div className="space-y-6">
      {mode === "url" && (
        <Card>
          <CardHeader>
            <CardTitle>Import from URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Paste recipe URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={extracting}
              />
              <Button onClick={handleExtract} disabled={extracting || !url.trim()}>
                {extracting ? "Extracting..." : "Extract"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Or{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setMode("manual")}
              >
                enter recipe manually
              </button>
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {mode === "manual" && (
        <div className="space-y-6">
          {extracted && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
              Recipe extracted! Review and edit the details below.
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recipe Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Recipe title"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the recipe"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Prep Time (min)</label>
                  <Input
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Cook Time (min)</label>
                  <Input
                    type="number"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Servings</label>
                  <Input
                    type="number"
                    value={servings}
                    onChange={(e) => setServings(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Image URL</label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input
                    placeholder="Amount"
                    value={ing.amount || ""}
                    onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                    className="w-20"
                  />
                  <Input
                    placeholder="Unit"
                    value={ing.unit || ""}
                    onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                    className="w-24"
                  />
                  <Input
                    placeholder="Ingredient name"
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, "name", e.target.value)}
                    className="flex-1"
                  />
                  {ingredients.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeIngredient(i)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                + Add Ingredient
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions *</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Step by step instructions..."
                rows={8}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {availableCategories.map((cat) => (
                    <Button
                      key={cat.id}
                      type="button"
                      variant={categories.includes(cat.name) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleExistingCategory(cat.name)}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add new category..."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
                />
                <Button type="button" variant="outline" onClick={addCategory}>
                  Add
                </Button>
              </div>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-1 text-sm bg-secondary rounded-full flex items-center gap-1"
                    >
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeCategory(cat)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "Saving..." : "Save Recipe"}
            </Button>
            {!extracted && (
              <Button variant="outline" onClick={() => setMode("url")}>
                Import from URL
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
