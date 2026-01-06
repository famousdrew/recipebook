import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { recipes: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json(
      { error: "Category already exists" },
      { status: 409 }
    );
  }

  const category = await prisma.category.create({
    data: { name },
  });

  return NextResponse.json(category, { status: 201 });
}
