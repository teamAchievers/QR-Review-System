import { db } from "./db";

interface EnhanceReviewOptions {
  userComment: string;
  rating: number;
  businessName: string;
  city?: string | null;
  category?: string | null;
  keywords: string;
  tone?: string;
}

export async function enhanceReviewWithKeywords(options: EnhanceReviewOptions): Promise<string[]> {
  const { userComment, businessName, city, category, keywords, tone } = options;

  // Retrieve global or env Gemini API key
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const setting = await db.systemSetting.findUnique({
      where: { key: "GEMINI_API_KEY" },
    });
    if (setting?.value) apiKey = setting.value;
  }

  const keywordList = keywords
    ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : ["excellent service", "great quality", "highly recommended"];

  // 1. Try Google Gemini API if API key is provided
  if (apiKey) {
    try {
      const prompt = `You are an expert Google Business Profile review optimizer. 
A customer just left a positive review for "${businessName}"${category ? ` (${category})` : ""}${city ? ` located in ${city}` : ""}.
The customer's original words were: "${userComment}".

Task: Rewrite and polish their feedback into 2 different authentic, enthusiastic 5-star Google review options.
Requirements:
1. Write the review using casual, authentic lowercase letters throughout (all lowercase letters, as everyday mobile users write unstaged Google reviews).
2. Naturally and seamlessly weave in 2 or 3 of these SEO keywords in lowercase: ${keywordList.map((k) => k.toLowerCase()).join(", ")}.
3. Keep the tone ${tone || "enthusiastic, warm, and genuine"}.
4. The review MUST sound 100% human, honest, and natural—do NOT make it sound robotic or like awkward keyword stuffing.
5. Keep each option around 3 to 4 sentences (approx 40-70 words).
6. Output format: Return the two options separated by "===OPTION===". Do NOT include introductory text, numbers, or markdown formatting.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 350,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const options = text
            .split("===OPTION===")
            .map((s: string) => s.trim().replace(/^Option\s*\d+:?/i, "").trim().toLowerCase())
            .filter((s: string) => s.length > 20);

          if (options.length > 0) {
            return options;
          }
        }
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to heuristic engine:", err);
    }
  }

  // 2. Intelligent Heuristic / Algorithmic Fallback Engine
  // Writes authentic customer reviews formatted in natural, casual lowercase letters
  const cleanInput = userComment
    .trim()
    .replace(/[.!?]+$/, "")
    .replace(/^(i loved the|loved the|i liked the|liked the|loved|liked)\s+/i, "")
    .toLowerCase();
  const kw1 = (keywordList[0] || "top-notch service").toLowerCase();
  const kw2 = (keywordList[1] || "friendly staff").toLowerCase();
  const kw3 = (keywordList[2] || "great quality").toLowerCase();
  const bName = businessName.toLowerCase();
  const locPhrase = city ? ` in ${city.toLowerCase()}` : "";

  const optionA = `had a fantastic experience with ${bName}! ${cleanInput ? `${cleanInput}. ` : ""}from start to finish, their attention to detail and ${kw1} really stood out. you can tell they take true pride in their work and ${kw2}. definitely my go-to choice${locPhrase} and highly recommended!`.toLowerCase();

  const optionB = `such a wonderful experience with ${bName}! ${cleanInput ? `loved the ${cleanInput}. ` : ""}it is so rare to find places that consistently deliver both ${kw2} and ${kw3}, but this team completely nailed it. super welcoming atmosphere and truly ${kw1}. will definitely be returning!`.toLowerCase();

  return [optionA, optionB];
}
