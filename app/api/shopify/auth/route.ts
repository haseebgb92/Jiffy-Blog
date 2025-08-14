import { NextRequest, NextResponse } from "next/server";
import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import { PrismaClient } from "@prisma/client";

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

  const shopify = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    scopes: (process.env.SHOPIFY_SCOPES || "").split(","),
    hostName: new URL(process.env.SHOPIFY_APP_URL || "https://example.com").host,
    apiVersion: (process.env.SHOPIFY_API_VERSION as any) || LATEST_API_VERSION,
    isCustomStoreApp: true,
    isEmbeddedApp: false,
  });

  if (!code) {
    try {
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
      if (debug) {
        return NextResponse.json({
          ok: true,
          beginUrl: String(authRoute),
          hostName: new URL(process.env.SHOPIFY_APP_URL || "https://example.com").host,
          scopes: (process.env.SHOPIFY_SCOPES || "").split(","),
        });
      }
      return NextResponse.redirect(String(authRoute));
    } catch (e: any) {
      // Fallback manual start URL
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
        return NextResponse.json({ ok: false, error: `OAuth start error: ${e?.message || e}`, manualUrl });
      }
      return NextResponse.redirect(manualUrl);
    }
  }

  let accessToken: string;
  try {
    const res = await (shopify as any).auth.callback({
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
    accessToken = res.accessToken;
  } catch (e: any) {
    return new Response(`OAuth callback error: ${e?.message || e}`, { status: 500 });
  }

  await prisma.shop.upsert({
    where: { id: shop },
    update: { accessToken },
    create: { id: shop, domain: shop, accessToken },
  });

  const base = process.env.SHOPIFY_APP_URL || `${new URL(req.url).origin}`;
  return NextResponse.redirect(new URL(`/?installed=1&shop=${encodeURIComponent(shop)}`, base));
}


