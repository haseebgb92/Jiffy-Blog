import { AIProvider, Outline, DraftResult } from "./index";

async function callOpenAI(prompt: string): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return "";
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: prompt,
    }),
  });
  const json = await res.json();
  const text = json?.output_text || json?.choices?.[0]?.message?.content || "";
  return text;
}

export const openaiProvider: AIProvider = {
  async outline({ keyword, intent }): Promise<Outline> {
    if (!process.env.OPENAI_API_KEY) {
      return {
        sections: [
          { h2: `Basics of ${keyword}`, bullets: ["Intro", "Key points"] },
          { h2: "Next steps", bullets: ["Practical tips"] },
        ],
      };
    }
    const text = await callOpenAI(
      `Create a JSON outline for a blog about ${keyword}. Intent ${intent || "informational"}. Format: {"sections":[{"h2":"","bullets":["..."]}]}`
    );
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      return { sections: [{ h2: `About ${keyword}`, bullets: ["Overview"] }] };
    }
  },

  async draft({ outline, style }): Promise<DraftResult> {
    if (!process.env.OPENAI_API_KEY) {
      const title = outline.sections[0]?.h2 || "Post";
      return {
        html: `<h1>${title}</h1><p>Mock draft. Style: ${style}</p>` ,
        metaTitle: title,
        metaDescription: "Mock description",
      };
    }
    const text = await callOpenAI(
      `Write an HTML blog post with headings and paragraphs based on this outline: ${JSON.stringify(
        outline
      )}. Keep it concise in 600-900 words. Style: ${style}. Return raw HTML only.`
    );
    const metaTitle = outline.sections[0]?.h2 || "Article";
    return { html: text || "<p>Draft unavailable</p>", metaTitle, metaDescription: `About ${metaTitle}` };
  },

  async imagePrompt({ outline, style }): Promise<string> {
    const topic = outline.sections[0]?.h2 || "Concept";
    return `Hero photo, ${topic}, editorial, clean background, style ${style}`;
  },
};


