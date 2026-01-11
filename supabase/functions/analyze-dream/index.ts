import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dreamContent, mood, lucidityLevel } = await req.json();

    console.log("Analyzing dream:", { 
      contentLength: dreamContent?.length, 
      mood, 
      lucidityLevel 
    });

    const systemPrompt = `You are a dream analyst combining psychology and symbolism. Analyze dreams briefly and insightfully.
Focus on:
- Key symbols and their meanings
- Emotional themes
- Potential connections to waking life
- Psychological insights

Keep your interpretation to 2-3 sentences, warm and supportive in tone.`;

    const userPrompt = `Analyze this dream:
"${dreamContent}"

${mood ? `The dreamer describes the mood as: ${mood}` : ""}
${lucidityLevel > 50 ? `This was a lucid dream (${lucidityLevel}% awareness)` : ""}

Provide a brief, insightful interpretation.`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const interpretation = data.choices?.[0]?.message?.content || 
      "Your dream reflects your subconscious mind processing daily experiences and emotions.";

    console.log("Dream analysis complete");

    return new Response(JSON.stringify({ interpretation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in analyze-dream function:', error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        interpretation: "Dreams often reflect our inner thoughts and emotions. Consider what aspects of your waking life might connect to the symbols and feelings in this dream."
      }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
