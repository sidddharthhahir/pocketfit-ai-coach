import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

function toFiniteNumber(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value.replace(/[^0-9.+-]/g, '')) : NaN;
  return Number.isFinite(n) ? n : null;
}

function clamp(min: number, v: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

type ParsedItem = {
  name: string;
  estimated_cal: number;
  estimated_protein_g: number;
  confidence?: number;
};

function sanitizeItems(items: unknown): ParsedItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => {
      const obj = (it ?? {}) as Record<string, unknown>;
      const name = typeof obj.name === 'string' ? obj.name.trim() : '';
      const cal = toFiniteNumber(obj.estimated_cal) ?? 0;
      const protein = toFiniteNumber(obj.estimated_protein_g) ?? 0;
      const confidence = toFiniteNumber(obj.confidence);

      if (!name) return null;

      return {
        name: name.slice(0, 80),
        estimated_cal: Math.max(0, Math.round(cal)),
        estimated_protein_g: Math.max(0, Math.round(protein * 10) / 10),
        confidence: confidence == null ? undefined : clamp(0, confidence, 1),
      } as ParsedItem;
    })
    .filter(Boolean) as ParsedItem[];
}

serve(async (req) => {
  console.log('analyze-meal-photo function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { imageUrl, mealType } = body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return new Response(JSON.stringify({ error: 'Image URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!mealType || !VALID_MEAL_TYPES.includes(mealType)) {
      return new Response(JSON.stringify({ error: 'Valid meal type is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing meal photo for user:', user.id);

    const systemPrompt = `You are PocketFit AI, an expert nutritionist with computer vision capabilities.
Analyze the food photo and identify all food items visible.

ANALYSIS RULES:
- Identify each food item visible in the image
- Estimate realistic portion sizes based on visual appearance
- Provide calorie and protein estimates per item
- Confidence score: 0.0-1.0 (1.0 = very confident in identification)
- If no food is detected, return empty items array
- Be conservative with estimates when unsure

Return ONLY valid JSON (no markdown, no code blocks):
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
  "confidence_overall": number,
  "description": "brief description of what's in the photo"
}`;

    const userMessage = `Analyze this ${mealType} meal photo and identify all food items with their nutritional estimates. Return ONLY the JSON object.`;

    console.log('Calling AI vision API...');

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
          {
            role: 'user',
            content: [
              { type: 'text', text: userMessage },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: `AI service error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await response.json();
    const mealText = aiData.choices?.[0]?.message?.content;

    if (!mealText) {
      return new Response(JSON.stringify({ error: 'AI returned empty response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('AI vision response:', mealText);

    let mealData;
    try {
      const jsonMatch = mealText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : mealText.trim();
      const cleanedJson = jsonStr
        .replace(/^\s*```json?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim();
      mealData = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(JSON.stringify({ error: 'Failed to parse food detection. Please try again.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const items = sanitizeItems(mealData.items);
    if (items.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'No food items detected in the photo. Please try a clearer photo.',
        description: mealData.description || 'Could not identify food'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const itemsCalories = items.reduce((sum, it) => sum + it.estimated_cal, 0);
    const itemsProtein = items.reduce((sum, it) => sum + it.estimated_protein_g, 0);

    const totalCalories = Math.max(0, Math.round(toFiniteNumber(mealData.meal_total_cal) ?? itemsCalories));
    const totalProtein = Math.max(0, Math.round(toFiniteNumber(mealData.meal_total_protein) ?? itemsProtein));

    // Save to meal_logs
    const mealDate = new Date().toISOString().split('T')[0];
    const { data: savedMeal, error: saveError } = await supabaseClient
      .from('meal_logs')
      .insert({
        user_id: user.id,
        meal_date: mealDate,
        meal_type: mealType,
        items,
        total_calories: totalCalories,
        total_protein: totalProtein,
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving meal:', saveError);
      return new Response(JSON.stringify({ error: 'Failed to save meal log' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Photo meal saved:', savedMeal.id);

    return new Response(JSON.stringify({
      meal: {
        items,
        meal_total_cal: totalCalories,
        meal_total_protein: totalProtein,
        confidence_overall: mealData.confidence_overall,
        description: mealData.description,
      },
      mealId: savedMeal.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-meal-photo:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});