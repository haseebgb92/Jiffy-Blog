import { PrismaClient } from "@prisma/client";
import { getProvider } from "../../providers";
import { uploadExternalImage } from "../../lib/files";

export async function runImage(
  prisma: PrismaClient,
  jobId: string,
  { shopDomain, accessToken }: { shopDomain: string; accessToken: string }
) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Job not found");

  const shop = await prisma.shop.findUnique({ where: { id: job.shopId } });
  const provider = await getProvider((shop?.provider as any) || "GEMINI");

  const outline = (job.outlineJson as any) || { sections: [{ h2: job.keyword, bullets: [] }] };
  const template = job.templateId ? await prisma.template.findUnique({ where: { id: job.templateId } }) : null;
  const prompt = await provider.imagePrompt({ outline, style: template?.style || "Neutral" });

  // Placeholder: use a sample image URL. In production you would call an image service.
  const sampleUrl = `https://source.unsplash.com/featured/1200x630?${encodeURIComponent(job.keyword)}`;
  const uploadedUrl = await uploadExternalImage(shopDomain, accessToken, {
    url: sampleUrl,
    filename: `${job.id}.jpg`,
  });

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: { heroImageUrl: uploadedUrl || sampleUrl },
  });
  return updated;
}


