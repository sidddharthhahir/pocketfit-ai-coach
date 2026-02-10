import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { thoughts, sleepHours, bedTime, wakeTime } = await req.json();

    if (!thoughts || typeof thoughts !== "string") {
      return new Response(
        JSON.stringify({ error: "Thoughts are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a sleep and mood analyst. Analyze the following bedtime thoughts and sleep data to determine:

1. Sleep quality (must be one of: poor, fair, good, excellent)
2. Mood (a single word or short phrase like: Peaceful, Anxious, Restless, Calm, Worried, Happy, etc.)
3. A brief, helpful insight (1-2 sentences) about their sleep patterns or suggestions

Sleep data:
- Bed time: ${bedTime}
- Wake time: ${wakeTime}
- Sleep duration: ${sleepHours} hours

User's bedtime thoughts:
"${thoughts}"

Consider:
- Emotional tone of their thoughts
- Whether they mention stress, worries, or positive feelings
- Sleep duration adequacy (7-9 hours is optimal for adults)
- Late bed times (after midnight) may indicate poor sleep hygiene

Respond in this exact JSON format:
{
  "quality": "good",
  "mood": "Peaceful",
  "insight": "Your thoughts reflect a calm mindset which typically leads to better sleep quality."
}`;

    const response = await fetch("https://llm.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse AI response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Validate quality value
    const validQualities = ["poor", "fair", "good", "excellent"];
    if (!validQualities.includes(analysis.quality)) {
      analysis.quality = "good";
    }

    console.log("Sleep analysis result:", analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing sleep thoughts:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to analyze thoughts",
        quality: "good",
        mood: "Unknown",
        insight: "Unable to analyze thoughts at this time. Your sleep has been logged."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
