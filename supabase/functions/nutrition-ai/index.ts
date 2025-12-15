import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const NUTRITION_SYSTEM_PROMPT = `You are PocketFit Nutrition AI, an intelligent nutrition coach designed to help users eat better, fuel workouts, and reach fitness goals safely and sustainably.

IMPORTANT RULES:
- NO medical diagnosis or prescription supplements
- NO extreme diets or fear-based messaging
- Always sustainable, science-backed advice
- Simple, friendly, motivating language

When generating nutrition plans, use these formulas:
- Protein: 1.8g per kg bodyweight (range 1.6-2.2g)
- Fats: 25% of total calories
- Carbs: Remaining calories after protein and fat
- Bulk: TDEE + 400 calories
- Cut: TDEE - 400 calories
- Maintain: TDEE

RESPONSE FORMAT:
Always respond with valid JSON first, then a short encouraging sentence after.

For daily nutrition plans, use this exact schema:
{
  "type": "daily_nutrition",
  "date": "YYYY-MM-DD",
  "total_calories": number,
  "total_protein": number,
  "total_carbs": number,
  "total_fats": number,
  "meals": [
    {
      "meal_type": "breakfast|lunch|dinner|snack",
      "time": "HH:MM",
      "items": [
        {
          "name": "string",
          "quantity": "string",
          "calories": number,
          "protein_g": number,
          "carbs_g": number,
          "fats_g": number
        }
      ],
      "meal_calories": number,
      "meal_protein": number
    }
  ]
}

For macro targets, use:
{
  "type": "nutrition_targets",
  "goal": "bulk|cut|maintain",
  "calories": number,
  "macros": {
    "protein_g": number,
    "carbs_g": number,
    "fats_g": number
  },
  "calculation_steps": ["string"]
}

For food quality analysis, use:
{
  "type": "food_quality",
  "score": number (0-100),
  "breakdown": {
    "whole_food_ratio": number,
    "fiber_score": number,
    "sugar_control": number,
    "protein_distribution": number
  },
  "improvements": ["string"]
}

For cheat meal handling, use:
{
  "type": "cheat_meal_adjustment",
  "estimated_extra_calories": number,
  "weekly_adjustment": "string",
  "message": "string"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userData, conversationHistory = [] } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build user context
    let userContext = '';
    if (userData) {
      userContext = `
USER PROFILE:
- Weight: ${userData.weight}kg
- Height: ${userData.height}cm
- Age: ${userData.age}
- Gender: ${userData.gender}
- Goal: ${userData.goal}
- Experience: ${userData.experience}
- Dietary Preference: ${userData.dietary_preference}

Calculate targets based on this profile.
`;
    }

    const messages = [
      { role: 'system', content: NUTRITION_SYSTEM_PROMPT + userContext },
      ...conversationHistory.slice(-6).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Calling Lovable AI for nutrition guidance...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response received successfully');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in nutrition-ai function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
