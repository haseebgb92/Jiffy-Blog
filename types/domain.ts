export enum Provider {
  GEMINI = "GEMINI",
  OPENAI = "OPENAI",
}

export enum JobStatus {
  PENDING = "PENDING",
  DRAFTED = "DRAFTED",
  NEEDS_APPROVAL = "NEEDS_APPROVAL",
  SCHEDULED = "SCHEDULED",
  PUBLISHED = "PUBLISHED",
  FAILED = "FAILED",
}

export type CsvRow = {
  keyword: string;
  intent?: string;
  target_blog?: string;
  template?: string;
  publish_at?: string;
};


