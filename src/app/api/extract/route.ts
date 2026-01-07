import { NextRequest, NextResponse } from "next/server";
import { extractRecipeFromUrl } from "@/lib/recipe-extractor";
import { prisma } from "@/lib/prisma";

// CORS headers for Chrome extension
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, save } = body;

  console.log("[extract/route] POST request received", { url, save });

  if (!url || typeof url !== "string") {
    console.log("[extract/route] Error: URL is required");
    return NextResponse.json({ error: "URL is required" }, { status: 400, headers: corsHeaders });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    console.log("[extract/route] Error: Invalid URL format", { url });
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400, headers: corsHeaders });
  }

  try {
    console.log("[extract/route] Starting extraction for URL:", url);
    const extracted = await extractRecipeFromUrl(url);
    console.log("[extract/route] Extraction successful", { title: extracted.title, ingredientCount: extracted.ingredients.length });

    // If save is true, create the recipe in the database
    if (save) {
      console.log("[extract/route] Saving recipe to database...");
      const recipe = await prisma.recipe.create({
        data: {
          title: extracted.title,
          description: extracted.description,
          instructions: extracted.instructions,
          prepTime: extracted.prepTime,
          cookTime: extracted.cookTime,
          servings: extracted.servings,
          sourceUrl: url,
          ingredients: {
            create: extracted.ingredients.map((ing) => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
            })),
          },
          categories: {
            connectOrCreate: extracted.categories.map((cat) => ({
              where: { name: cat },
              create: { name: cat },
            })),
          },
        },
        include: {
          ingredients: true,
          categories: true,
        },
      });

      console.log("[extract/route] Recipe saved successfully", { recipeId: recipe.id });
      return NextResponse.json({
        extracted,
        saved: true,
        recipe,
      }, { headers: corsHeaders });
    }

    console.log("[extract/route] Returning extracted recipe (not saved)");
    return NextResponse.json({ extracted, saved: false }, { headers: corsHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Extraction failed";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[extract/route] Error during extraction:", { message, stack, url });
    return NextResponse.json({ error: message }, { status: 500, headers: corsHeaders });
  }
}
