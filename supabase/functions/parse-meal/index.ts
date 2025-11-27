import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mealDescription, mealType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Parsing meal for user:', user.id);

    const systemPrompt = `You are PocketFit AI, an expert nutritionist.
Parse the user's meal description and estimate calories and protein for each food item.

MEAL PARSING RULES:
- Identify each food item
- Estimate portions from description (e.g., "2 eggs", "1 cup rice")
- Provide calorie and protein estimates
- Be realistic with portions
- Confidence score: 0.0-1.0 (1.0 = very confident)

Return ONLY valid JSON:
{
  "items": [
    {
      "name": "string",
      "estimated_cal": number,
      "estimated_protein_g": number,
      "confidence": number
    }
  ],
  "meal_total_cal": number,
  "meal_total_protein": number,
  "confidence_overall": number
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Parse this ${mealType}: ${mealDescription}` }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits depleted. Please add credits to continue.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const mealText = aiData.choices[0].message.content;
    
    console.log('Raw AI response:', mealText);
    
    let mealData;
    try {
      const jsonMatch = mealText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : mealText;
      mealData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Save to meal_logs
    const mealDate = new Date().toISOString().split('T')[0];
    const { data: savedMeal, error: saveError } = await supabaseClient
      .from('meal_logs')
      .insert({
        user_id: user.id,
        meal_date: mealDate,
        meal_type: mealType,
        items: mealData.items,
        total_calories: mealData.meal_total_cal,
        total_protein: mealData.meal_total_protein
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving meal:', saveError);
      throw saveError;
    }

    console.log('Meal saved successfully:', savedMeal.id);

    return new Response(JSON.stringify({ 
      meal: mealData,
      mealId: savedMeal.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-meal:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
