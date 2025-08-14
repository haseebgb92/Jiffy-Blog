import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const shop = await prisma.shop.findFirst();
  return NextResponse.json({ domain: shop?.domain || null, provider: shop?.provider || process.env.ACTIVE_PROVIDER || "GEMINI" });
}


