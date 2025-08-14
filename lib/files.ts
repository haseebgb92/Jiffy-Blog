import { adminGraphQL } from "./graphql";

async function stagedUploadsCreate(shopDomain: string, accessToken: string, filename: string) {
  const mutation = `#graphql
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters { name value }
        }
        userErrors { field message }
      }
    }
  `;
  const variables = {
    input: [
      {
        filename,
        httpMethod: "POST",
        mimeType: "image/jpeg",
        resource: "FILE",
        fileSize: 10_000_000,
      },
    ],
  };
  const json = await adminGraphQL(shopDomain, accessToken, mutation, variables);
  return json.data.stagedUploadsCreate.stagedTargets[0];
}

async function fileCreate(shopDomain: string, accessToken: string, resourceUrl: string, filename: string) {
  const mutation = `#graphql
    mutation fileCreate($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files { ... on GenericFile { id alt url } }
        userErrors { field message }
      }
    }
  `;
  const variables = {
    files: [
      {
        originalSource: resourceUrl,
        contentType: "FILE",
        alt: filename,
      },
    ],
  };
  const json = await adminGraphQL(shopDomain, accessToken, mutation, variables);
  const f = json.data.fileCreate.files[0];
  return f?.url as string | undefined;
}

export async function uploadExternalImage(
  shopDomain: string,
  accessToken: string,
  { url, filename }: { url: string; filename: string }
): Promise<string | undefined> {
  // Minimal approach: use Shopify files with staged upload by pointing to external URL.
  // For simplicity we skip the S3 upload step and directly call fileCreate with external URL.
  // This works when Shopify can fetch the external URL.
  return fileCreate(shopDomain, accessToken, url, filename);
}


