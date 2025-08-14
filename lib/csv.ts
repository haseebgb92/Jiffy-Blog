import { parse } from "csv-parse/sync";

export type CsvRow = {
  keyword: string;
  intent?: string;
  target_blog?: string;
  template?: string;
  publish_at?: string;
};

export async function parseKeywordsCsv(buffer: Buffer): Promise<CsvRow[]> {
  const records = parse(buffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records.map((r: any) => ({
    keyword: String(r.keyword || r.Keyword || r.keys || "").trim(),
    intent: r.intent || r.Intent || undefined,
    target_blog: r.target_blog || r.blog || r.targetBlog || undefined,
    template: r.template || r.Template || undefined,
    publish_at: r.publish_at || r.publishAt || undefined,
  }));
}


