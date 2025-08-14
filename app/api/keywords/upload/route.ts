import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, JobStatus } from "@prisma/client";
import { parseKeywordsCsv } from "../../../../lib/csv";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file as any).arrayBuffer) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }
  const buff = Buffer.from(await (file as File).arrayBuffer());
  const rows = await parseKeywordsCsv(buff);

  // For simplicity, attach jobs to the first Shop row
  const firstShop = await prisma.shop.findFirst();
  if (!firstShop) return NextResponse.json({ error: "App not installed" }, { status: 400 });

  let count = 0;
  for (const r of rows) {
    if (!r.keyword) continue;
    await prisma.job.create({
      data: {
        shopId: firstShop.id,
        keyword: r.keyword,
        intent: r.intent || null,
        targetBlogId: null,
        templateId: null,
        status: JobStatus.PENDING,
        publishAt: r.publish_at ? new Date(r.publish_at) : null,
      },
    });
    count++;
  }
  return NextResponse.json({ count });
}


