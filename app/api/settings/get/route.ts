import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
  const shop = await prisma.shop.findFirst();
  return NextResponse.json({ domain: shop?.domain || null, provider: shop?.provider || process.env.ACTIVE_PROVIDER || "GEMINI" });
}


