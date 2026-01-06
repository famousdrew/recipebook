import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");

  const recipes = await prisma.recipe.findMany({
    where: category
      ? {
          categories: {
            some: { name: category },
          },
        }
      : undefined,
    include: {
      ingredients: true,
      categories: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(recipes);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { title, description, instructions, prepTime, cookTime, servings, imageUrl, sourceUrl, ingredients, categories } = body;

  if (!title || !instructions) {
    return NextResponse.json(
      { error: "Title and instructions are required" },
      { status: 400 }
    );
  }

  const recipe = await prisma.recipe.create({
    data: {
      title,
      description,
      instructions,
      prepTime,
      cookTime,
      servings,
      imageUrl,
      sourceUrl,
      ingredients: ingredients
        ? {
            create: ingredients.map((ing: { name: string; amount?: string; unit?: string }) => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
            })),
          }
        : undefined,
      categories: categories
        ? {
            connectOrCreate: categories.map((cat: string) => ({
              where: { name: cat },
              create: { name: cat },
            })),
          }
        : undefined,
    },
    include: {
      ingredients: true,
      categories: true,
    },
  });

  return NextResponse.json(recipe, { status: 201 });
}
