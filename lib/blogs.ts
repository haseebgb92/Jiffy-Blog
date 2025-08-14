import { adminGraphQL } from "./graphql";

export async function getOrCreateBlog(shopDomain: string, accessToken: string, title: string): Promise<string> {
  const query = `#graphql
    query blogs($first: Int!) { blogs(first: $first) { edges { node { id title } } } }
  `;
  const resp = await adminGraphQL(shopDomain, accessToken, query, { first: 50 });
  const found = resp.data.blogs.edges.find((e: any) => e.node.title === title);
  if (found) return found.node.id as string;

  const mutation = `#graphql
    mutation blogCreate($input: BlogInput!) { blogCreate(blog: $input) { blog { id } userErrors { field message } } }
  `;
  const json = await adminGraphQL(shopDomain, accessToken, mutation, { input: { title } });
  const id = json.data.blogCreate.blog.id as string;
  return id;
}


