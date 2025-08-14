import { NextRequest, NextResponse } from "next/server";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  scopes: (process.env.SHOPIFY_SCOPES || "").split(","),
  hostName: new URL(process.env.SHOPIFY_APP_URL || "https://example.com").host,
  apiVersion: (process.env.SHOPIFY_API_VERSION as any) || LATEST_API_VERSION,
  isCustomStoreApp: true,
  isEmbeddedApp: false,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  const code = searchParams.get("code");

  if (!shop) {
    return NextResponse.json({ error: "Missing shop" }, { status: 400 });
  }

  if (!code) {
    const authRoute = await shopify.auth.begin({
      shop,
      callbackPath: "/api/shopify/auth",
      isOnline: false,
    });
    return NextResponse.redirect(authRoute);
  }

  const { accessToken } = await shopify.auth.callback({
    shop,
    callbackPath: "/api/shopify/auth",
    isOnline: false,
    code,
  });

  await prisma.shop.upsert({
    where: { id: shop },
    update: { accessToken },
    create: { id: shop, domain: shop, accessToken },
  });

  return NextResponse.redirect(new URL("/", process.env.SHOPIFY_APP_URL || req.url));
}


