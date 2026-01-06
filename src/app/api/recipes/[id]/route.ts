import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: true,
      categories: true,
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  return NextResponse.json(recipe);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();

  const { title, description, instructions, prepTime, cookTime, servings, imageUrl, sourceUrl, ingredients, categories } = body;

  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const recipe = await prisma.recipe.update({
    where: { id },
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
            deleteMany: {},
            create: ingredients.map((ing: { name: string; amount?: string; unit?: string }) => ({
              name: ing.name,
              amount: ing.amount,
              unit: ing.unit,
            })),
          }
        : undefined,
      categories: categories
        ? {
            set: [],
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

  return NextResponse.json(recipe);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const existing = await prisma.recipe.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  await prisma.recipe.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
