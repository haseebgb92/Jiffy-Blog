import { adminGraphQL } from "./graphql";

type CreateInput = {
  blogId: string;
  title: string;
  bodyHtml: string;
  summaryHtml?: string;
  tags?: string[];
  templateSuffix?: string;
  publishDate?: string;
  imageUrl?: string;
};

export async function createScheduledArticle(
  shopDomain: string,
  accessToken: string,
  input: CreateInput
) {
  const mutation = `#graphql
    mutation articleCreate($article: ArticleInput!, $id: ID!) {
      articleCreate(article: $article, blogId: $id) {
        article { id title handle }
        userErrors { field message }
      }
    }
  `;

  const article: any = {
    title: input.title,
    bodyHtml: input.bodyHtml,
    tags: input.tags,
    templateSuffix: input.templateSuffix,
    published: false,
  };
  if (input.summaryHtml) article.summaryHtml = input.summaryHtml;
  if (input.publishDate) article.publishDate = input.publishDate;
  if (input.imageUrl) article.image = { src: input.imageUrl };

  const variables = { article, id: input.blogId };
  const json = await adminGraphQL(shopDomain, accessToken, mutation, variables);
  return json.data.articleCreate.article;
}


