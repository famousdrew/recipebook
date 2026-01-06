import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      recipes: {
        include: {
          ingredients: true,
          categories: true,
        },
      },
    },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(category);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const duplicate = await prisma.category.findFirst({
    where: { name, NOT: { id } },
  });
  if (duplicate) {
    return NextResponse.json(
      { error: "Category name already exists" },
      { status: 409 }
    );
  }

  const category = await prisma.category.update({
    where: { id },
    data: { name },
  });

  return NextResponse.json(category);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
