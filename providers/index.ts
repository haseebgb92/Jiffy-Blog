export interface Outline { sections: Array<{ h2: string; bullets: string[] }> }
export interface DraftResult { html: string; metaTitle: string; metaDescription: string }
export interface AIProvider {
  outline(input: { keyword: string; intent?: string }): Promise<Outline>
  draft(input: { outline: Outline; style: string }): Promise<DraftResult>
  imagePrompt(input: { outline: Outline; style: string }): Promise<string>
}

export async function getProvider(name: "GEMINI" | "OPENAI"): Promise<AIProvider> {
  if (name === "OPENAI") {
    const mod = await import("./openai");
    return mod.openaiProvider;
  }
  // Prefer Gemini. If key missing but OpenAI key exists, fall back to OpenAI.
  if (!process.env.GEMINI_API_KEY && process.env.OPENAI_API_KEY) {
    const mod = await import("./openai");
    return mod.openaiProvider;
  }
  const mod = await import("./gemini");
  return mod.geminiProvider;
}


