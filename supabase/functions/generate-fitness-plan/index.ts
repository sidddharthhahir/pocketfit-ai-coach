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
    const { userData } = await req.json();
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

    console.log('Generating fitness plan for user:', user.id);

    const systemPrompt = `You are PocketFit AI, an advanced fitness coach. Generate a complete fitness plan with:
1. TDEE calculation
2. Calorie and protein targets based on goal (${userData.goal})
3. Daily diet plan matching dietary preference (${userData.dietaryPreference})
4. Daily workout plan matching experience level (${userData.experience})

User Stats:
- Weight: ${userData.weight}kg
- Height: ${userData.height}cm
- Age: ${userData.age}
- Gender: ${userData.gender}
- Goal: ${userData.goal}
- Experience: ${userData.experience}
- Diet Preference: ${userData.dietaryPreference}

Return ONLY valid JSON with this structure:
{
  "calories": {
    "tdee": number,
    "target": number,
    "protein_target": number
  },
  "diet_plan": {
    "meals": [
      {
        "type": "breakfast|lunch|dinner|snack",
        "time": "HH:MM",
        "items": ["string"],
        "calories": number,
        "protein": number
      }
    ]
  },
  "workout_plan": {
    "split": "push|pull|legs|upper|lower|full_body",
    "exercises": [
      {
        "name": "string",
        "sets": number,
        "reps": "string",
        "rest_seconds": number,
        "muscle_group": "string"
      }
    ]
  }
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
          { role: 'user', content: 'Generate my personalized fitness plan.' }
        ],
        temperature: 0.7,
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
    const planText = aiData.choices[0].message.content;
    
    console.log('Raw AI response:', planText);
    
    // Extract JSON from markdown code blocks if present
    let planData;
    try {
      const jsonMatch = planText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : planText;
      planData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Save the plan to database
    const { data: savedPlan, error: saveError } = await supabaseClient
      .from('fitness_plans')
      .insert({
        user_id: user.id,
        plan_type: 'both',
        plan_data: planData,
        target_calories: planData.calories.target,
        target_protein: planData.calories.protein_target,
        tdee: planData.calories.tdee,
        is_active: true
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving plan:', saveError);
      throw saveError;
    }

    console.log('Plan saved successfully:', savedPlan.id);

    return new Response(JSON.stringify({ 
      plan: planData,
      planId: savedPlan.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-fitness-plan:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
