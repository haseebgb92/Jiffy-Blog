import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function createShopifyClient(shopDomain: string, accessToken: string) {
  const client = shopifyApi({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    scopes: (process.env.SHOPIFY_SCOPES || "").split(","),
    hostName: new URL(process.env.SHOPIFY_APP_URL || "https://example.com").host,
    apiVersion: (process.env.SHOPIFY_API_VERSION as any) || LATEST_API_VERSION,
    isCustomStoreApp: true,
  });
  return { client, shopDomain, accessToken };
}

export async function getAccessTokenForDomain(domain: string): Promise<string | null> {
  const shop = await prisma.shop.findUnique({ where: { domain } });
  return shop?.accessToken || null;
}

export async function saveOrUpdateShop(domain: string, token: string) {
  const id = domain;
  await prisma.shop.upsert({
    where: { id },
    update: { accessToken: token },
    create: {
      id,
      domain,
      accessToken: token,
    },
  });
}


