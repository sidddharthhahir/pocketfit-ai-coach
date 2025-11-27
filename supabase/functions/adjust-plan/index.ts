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
    const { reason, context } = await req.json();
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

    console.log('Adjusting plan for user:', user.id, 'Reason:', reason);

    // Get current active plan
    const { data: currentPlan, error: planError } = await supabaseClient
      .from('fitness_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (planError || !currentPlan) {
      throw new Error('No active plan found');
    }

    const planData = currentPlan.plan_data as any;

    const systemPrompt = `You are PocketFit AI, an advanced fitness coach.
Adjust the user's fitness plan based on the situation.

AUTO-ADJUST RULES:
- If user missed workout: shift workout to next available day, reduce volume slightly
- If weight changes too quickly: adjust calories (bulk: +0.5kg/week max, cut: -0.5kg/week max)
- If protein too low: suggest high-protein swaps, add protein snack
- If attendance low: suggest scheduling tips, reduce workout frequency temporarily

Current Plan Summary:
- Goal: ${context?.goal || 'not specified'}
- Current Calories: ${currentPlan.target_calories}
- Current Protein: ${currentPlan.target_protein}g
- Workout Split: ${planData?.workout_plan?.split || 'not specified'}

Adjustment Reason: ${reason}
Context: ${JSON.stringify(context || {})}

Return ONLY valid JSON:
{
  "adjustment_summary": "string (what changed and why)",
  "calorie_adjustment": number (new target, or null if unchanged),
  "protein_adjustment": number (new target, or null if unchanged),
  "workout_adjustments": {
    "split_change": "string or null",
    "volume_change": "increase|decrease|same",
    "notes": "string"
  },
  "diet_adjustments": {
    "meal_swaps": [{"from": "string", "to": "string"}],
    "notes": "string"
  },
  "recommendations": ["string", "string", "string"]
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
          { role: 'user', content: 'Adjust my plan based on the situation above.' }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429 || response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI service temporarily unavailable' 
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const adjustmentText = aiData.choices[0].message.content;
    
    let adjustmentData;
    try {
      const jsonMatch = adjustmentText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : adjustmentText;
      adjustmentData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Update plan if calories/protein changed
    if (adjustmentData.calorie_adjustment || adjustmentData.protein_adjustment) {
      const updateData: any = {};
      if (adjustmentData.calorie_adjustment) {
        updateData.target_calories = adjustmentData.calorie_adjustment;
      }
      if (adjustmentData.protein_adjustment) {
        updateData.target_protein = adjustmentData.protein_adjustment;
      }

      await supabaseClient
        .from('fitness_plans')
        .update(updateData)
        .eq('id', currentPlan.id);
    }

    return new Response(JSON.stringify({ 
      adjustment: adjustmentData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in adjust-plan:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
