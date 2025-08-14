import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { runImage } from "../../../../queue/workers/imageWorker";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const shop = await prisma.shop.findFirst();
  if (!shop) return NextResponse.json({ error: "Install app first" }, { status: 400 });

  const updated = await runImage(prisma, jobId, { shopDomain: shop.domain, accessToken: shop.accessToken });
  return NextResponse.json(updated);
}


