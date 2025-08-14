import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createHmac } from "node:crypto";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop") || searchParams.get("shopDomain");
  const code = searchParams.get("code");
  const debug = searchParams.get("debug");

  if (!shop) {
    return NextResponse.json({ error: "Missing shop" }, { status: 400 });
  }

  if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
    return NextResponse.json({ error: "Missing SHOPIFY_API_KEY or SHOPIFY_API_SECRET" }, { status: 500 });
  }

  if (!code) {
    // Manual OAuth start
    const redirectUri = `${new URL(process.env.SHOPIFY_APP_URL || req.url).origin}/api/shopify/auth`;
    const params = new URLSearchParams({
      client_id: process.env.SHOPIFY_API_KEY || "",
      scope: process.env.SHOPIFY_SCOPES || "",
      redirect_uri: redirectUri,
      state: Math.random().toString(36).slice(2),
      access_mode: "offline",
    });
    const manualUrl = `https://${shop}/admin/oauth/authorize?${params.toString()}`;
    if (debug) {
      return NextResponse.json({ ok: true, beginUrl: manualUrl });
    }
    return NextResponse.redirect(manualUrl);
  }

  // Verify HMAC
  const hmac = searchParams.get("hmac");
  if (!hmac) return NextResponse.json({ error: "Missing hmac" }, { status: 400 });
  const pairs: string[] = [];
  for (const [k, v] of searchParams.entries()) {
    if (k === "hmac" || k === "signature") continue;
    pairs.push(`${k}=${v}`);
  }
  pairs.sort();
  const message = pairs.join("&");
  const digest = createHmac("sha256", process.env.SHOPIFY_API_SECRET as string)
    .update(message)
    .digest("hex");
  if (digest !== hmac) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 400 });
  }

  // Exchange code for token
  let accessToken: string;
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_API_SECRET,
      code,
    }),
  });
  if (!tokenRes.ok) {
    const t = await tokenRes.text();
    return NextResponse.json({ error: "Token exchange failed", details: t }, { status: 500 });
  }
  const tokenJson: any = await tokenRes.json();
  accessToken = tokenJson.access_token as string;

  await prisma.shop.upsert({
    where: { id: shop },
    update: { accessToken },
    create: { id: shop, domain: shop, accessToken },
  });

  const base = process.env.SHOPIFY_APP_URL || `${new URL(req.url).origin}`;
  return NextResponse.redirect(new URL(`/?installed=1&shop=${encodeURIComponent(shop)}`, base));
}


