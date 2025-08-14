export async function adminGraphQL(
  shopDomain: string,
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>
) {
  const version = process.env.SHOPIFY_API_VERSION || "2024-10";
  const res = await fetch(`https://${shopDomain}/admin/api/${version}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify GraphQL error ${res.status} ${text}`);
  }
  return res.json();
}


