import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  const templateSuffix = String(form.get("templateSuffix") || "").trim();
  const style = String(form.get("style") || "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const shop = await prisma.shop.findFirst();
  if (!shop) return NextResponse.json({ error: "Install app first" }, { status: 400 });
  const t = await prisma.template.create({ data: { name, templateSuffix, style, shopId: shop.id } });
  return NextResponse.json(t);
}


