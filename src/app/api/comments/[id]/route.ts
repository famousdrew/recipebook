import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const { content } = body;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: { content },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json(comment);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  await prisma.comment.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
