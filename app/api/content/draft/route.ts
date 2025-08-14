import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { runDraft } from "../../../../queue/workers/draftWorker";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { jobId } = await req.json();
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const job = await runDraft(prisma, jobId, (process.env.ACTIVE_PROVIDER as any) || undefined);
  return NextResponse.json(job);
}


