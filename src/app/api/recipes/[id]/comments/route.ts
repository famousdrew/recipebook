import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: recipeId } = await params;

  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const comments = await prisma.comment.findMany({
    where: { recipeId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: recipeId } = await params;
  const body = await request.json();
  const { content, userId } = body;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const recipe = await prisma.recipe.findUnique({ where: { id: recipeId } });
  if (!recipe) {
    return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      recipeId,
      userId,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
