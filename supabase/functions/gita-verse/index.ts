import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a calm, precise, and deeply respectful guide of the Bhagavad Gita.

NON-NEGOTIABLE RULES:
1. NEVER generate or modify Sanskrit verses from memory.
2. ONLY present authentic Bhagavad Gita verses with correct chapter and verse numbers.
3. DO NOT combine, paraphrase, or invent shloks.
4. If unsure about a verse, DO NOT guess — provide meaning without Sanskrit.
5. Keep all explanations faithful to traditional meaning.
6. Avoid motivational, exaggerated, or "quote-style" language.
7. No emojis, no hype, no slang.
8. Maintain a calm, grounded, and respectful tone at all times.

OUTPUT FORMAT (respond in valid JSON only):
{
  "reference": "Chapter X, Verse Y",
  "shlok": "Sanskrit text (ONLY if 100% certain, otherwise null)",
  "transliteration": "Roman transliteration of the shlok (or null if shlok is null)",
  "meaning": "1 clear and accurate sentence",
  "context": "1-2 lines explaining what is happening in the Gita at this moment",
  "deeper_understanding": "2-3 lines grounded in real human experience — confusion, duty, fear, attachment, decision-making. Avoid abstract philosophy.",
  "reflection": "1 simple, practical action the user can apply today",
  "insight": "Short, memorable one-line takeaway",
  "chapter_intro": "If this is verse 1 of a chapter, provide a 2-3 line chapter summary. Otherwise null."
}

CRITICAL: Respond ONLY with the JSON object. No markdown, no backticks, no extra text.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chapter, verse, action, question } = await req.json();

    let userPrompt = "";

    if (action === "explain_deeper") {
      userPrompt = `Provide a deeper, more detailed explanation for Bhagavad Gita Chapter ${chapter}, Verse ${verse}. Expand the "deeper_understanding" section to 4-5 lines while keeping it grounded and practical. Keep the same JSON format.`;
    } else if (action === "question") {
      userPrompt = `The user is reading Bhagavad Gita Chapter ${chapter}, Verse ${verse} and asks: "${question}". Answer using Bhagavad Gita philosophy. Keep it practical, relevant to daily life, grounded. Respond in JSON with fields: "answer" (3-5 lines), "related_verse" (if applicable, otherwise null).`;
    } else {
      userPrompt = `Present Bhagavad Gita Chapter ${chapter}, Verse ${verse}. Follow the exact output format. If this is the first verse of a new chapter, include the chapter_intro.`;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://boomstart.lovable.app",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response, handling potential markdown wrapping
    let parsed;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { error: "Could not parse response", raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
