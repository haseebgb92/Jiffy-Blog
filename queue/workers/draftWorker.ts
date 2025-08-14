import { PrismaClient, JobStatus, Provider } from "@prisma/client";
import { getProvider } from "../../providers";

export async function runDraft(prisma: PrismaClient, jobId: string, providerName?: keyof typeof Provider) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Job not found");

  const shop = await prisma.shop.findUnique({ where: { id: job.shopId } });
  const active = providerName || (shop?.provider as keyof typeof Provider) || "GEMINI";
  const provider = await getProvider(active as any);

  const outline = await provider.outline({ keyword: job.keyword, intent: job.intent || undefined });
  const style = job.templateId
    ? (await prisma.template.findUnique({ where: { id: job.templateId } }))?.style || "Neutral"
    : "Neutral";
  const draft = await provider.draft({ outline, style });

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: {
      outlineJson: outline as any,
      draftHtml: draft.html,
      status: JobStatus.DRAFTED,
    },
  });
  return updated;
}


