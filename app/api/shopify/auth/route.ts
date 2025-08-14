import { NextRequest, NextResponse } from "next/server";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop") || searchParams.get("shopDomain");
  const code = searchParams.get("code");

  if (!shop) {
    return NextResponse.json({ error: "Missing shop" }, { status: 400 });
  }

  const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    scopes: (process.env.SHOPIFY_SCOPES || "").split(","),
    hostName: new URL(process.env.SHOPIFY_APP_URL || "https://example.com").host,
    apiVersion: (process.env.SHOPIFY_API_VERSION as any) || LATEST_API_VERSION,
    isCustomStoreApp: false,
    isEmbeddedApp: false,
  });

  if (!code) {
    const rawRequest: any = {
      headers: Object.fromEntries(req.headers as any),
      url: req.url,
      method: "GET",
    };
    const rawResponse: any = {
      setHeader: () => {},
      statusCode: 302,
    };
    const authRoute = await (shopify as any).auth.begin({
      shop,
      callbackPath: "/api/shopify/auth",
      isOnline: false,
      rawRequest,
      rawResponse,
    });
    return NextResponse.redirect(authRoute);
  }

  const { accessToken } = await (shopify as any).auth.callback({
    shop,
    callbackPath: "/api/shopify/auth",
    isOnline: false,
    code,
    rawRequest: {
      headers: Object.fromEntries(req.headers as any),
      url: req.url,
      method: "GET",
    },
  });

  await prisma.shop.upsert({
    where: { id: shop },
    update: { accessToken },
    create: { id: shop, domain: shop, accessToken },
  });

  const base = process.env.SHOPIFY_APP_URL || `${new URL(req.url).origin}`;
  return NextResponse.redirect(new URL(`/?installed=1&shop=${encodeURIComponent(shop)}`, base));
}


