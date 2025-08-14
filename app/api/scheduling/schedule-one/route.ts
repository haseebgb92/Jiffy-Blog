import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getOrCreateBlog } from "../../../../lib/blogs";
import { runPublish } from "../../../../queue/workers/publishWorker";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });
  const shop = await prisma.shop.findFirst();
  if (!shop) return NextResponse.json({ error: "Install app first" }, { status: 400 });

  const blogId = await getOrCreateBlog(shop.domain, shop.accessToken, "News");
  const now = new Date();
  now.setDate(now.getDate() + 1);
  now.setHours(12, 0, 0, 0);
  await prisma.job.update({ where: { id: jobId }, data: { publishAt: now } });
  await runPublish(prisma, jobId, { shopDomain: shop.domain, accessToken: shop.accessToken, blogId });
  const updated = await prisma.job.findUnique({ where: { id: jobId } });
  return NextResponse.json(updated);
}


