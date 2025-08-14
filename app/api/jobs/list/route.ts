import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const shop = await prisma.shop.findFirst();
  if (!shop) return NextResponse.json([]);
  const jobs = await prisma.job.findMany({ where: { shopId: shop.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json(jobs);
}


