import { AIProvider, Outline, DraftResult } from "./index";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

async function callGemini(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return "";
  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return text;
}

export const geminiProvider: AIProvider = {
  async outline({ keyword, intent }): Promise<Outline> {
    if (!process.env.GEMINI_API_KEY) {
      return {
        sections: [
          { h2: `About ${keyword}`, bullets: ["Intro", "Why it matters"] },
          { h2: "How to use it", bullets: ["Steps", "Tips"] },
        ],
      };
    }
    const text = await callGemini(
      `Create a simple blog outline with 2-4 sections for keyword: ${keyword}. Intent: ${intent || "informational"}. Respond as JSON with sections array of {h2, bullets}.`
    );
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      return { sections: [{ h2: `About ${keyword}`, bullets: ["Overview"] }] };
    }
  },

  async draft({ outline, style }): Promise<DraftResult> {
    if (!process.env.GEMINI_API_KEY) {
      const title = outline.sections[0]?.h2 || "Post";
      return {
        html: `<h1>${title}</h1><p>Mock draft. Style: ${style}</p>` ,
        metaTitle: title,
        metaDescription: "Mock description",
      };
    }
    const text = await callGemini(
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


