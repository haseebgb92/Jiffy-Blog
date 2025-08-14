import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, JobStatus } from "@prisma/client";
import { nextSlots } from "../../../../lib/scheduler";
import { getOrCreateBlog } from "../../../../lib/blogs";
import { runPublish } from "../../../../queue/workers/publishWorker";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { daysOfWeek, timeOfDay, startDate, blogTitle, count } = await req.json();
  if (!Array.isArray(daysOfWeek) || !timeOfDay || !startDate || !blogTitle || !count) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const shop = await prisma.shop.findFirst();
  if (!shop) return NextResponse.json({ error: "Install app first" }, { status: 400 });

  const blogId = await getOrCreateBlog(shop.domain, shop.accessToken, blogTitle);
  const slots: string[] = nextSlots({ startDate, daysOfWeek, timeOfDay, count });

  const jobs = await prisma.job.findMany({
    where: { shopId: shop.id, status: JobStatus.DRAFTED },
    orderBy: { createdAt: "asc" },
    take: count,
  });

  let scheduled = 0;
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const slot = slots[i];
    await prisma.job.update({ where: { id: job.id }, data: { publishAt: new Date(slot) } });
    await runPublish(prisma, job.id, { shopDomain: shop.domain, accessToken: shop.accessToken, blogId });
    scheduled++;
  }

  return NextResponse.json({ scheduled });
}


