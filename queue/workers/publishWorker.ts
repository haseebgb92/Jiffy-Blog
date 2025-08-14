import { PrismaClient, JobStatus } from "@prisma/client";
import { createScheduledArticle } from "../../lib/articles";

export async function runPublish(
  prisma: PrismaClient,
  jobId: string,
  { shopDomain, accessToken, blogId }: { shopDomain: string; accessToken: string; blogId: string }
) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Job not found");
  if (!job.draftHtml) throw new Error("Draft missing");

  const title = (job.outlineJson as any)?.sections?.[0]?.h2 || job.keyword;
  const template = job.templateId ? await prisma.template.findUnique({ where: { id: job.templateId } }) : null;
  const result = await createScheduledArticle(shopDomain, accessToken, {
    blogId,
    title,
    bodyHtml: job.draftHtml,
    templateSuffix: template?.templateSuffix || undefined,
    publishDate: job.publishAt ? new Date(job.publishAt).toISOString() : undefined,
    imageUrl: job.heroImageUrl || undefined,
  });

  await prisma.job.update({
    where: { id: jobId },
    data: { status: JobStatus.SCHEDULED, targetBlogId: blogId },
  });
  return result;
}


