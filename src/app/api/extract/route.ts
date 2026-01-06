import { NextRequest, NextResponse } from "next/server";
import { extractRecipeFromUrl } from "@/lib/recipe-extractor";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { url, save } = body;

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  try {
    const extracted = await extractRecipeFromUrl(url);

    // If save is true, create the recipe in the database
    if (save) {
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

      return NextResponse.json({
        extracted,
        saved: true,
        recipe,
      });
    }

    return NextResponse.json({ extracted, saved: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
