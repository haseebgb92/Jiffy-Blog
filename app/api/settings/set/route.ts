import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { provider } = await req.json();
  const shop = await prisma.shop.findFirst();
  if (!shop) return NextResponse.json({ error: "Install app first" }, { status: 400 });
  const updated = await prisma.shop.update({ where: { id: shop.id }, data: { provider } });
  return NextResponse.json({ provider: updated.provider });
}


