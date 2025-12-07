import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation bounds for user data
const VALIDATION = {
  weight: { min: 20, max: 500 },
  height: { min: 50, max: 300 },
  age: { min: 13, max: 120 },
  validGenders: ['male', 'female', 'other'],
  validGoals: ['bulk', 'cut', 'maintain'],
  validExperience: ['beginner', 'intermediate', 'advanced'],
};

// Validate and sanitize user data
function validateUserData(userData: any): { valid: boolean; error?: string; sanitized?: any } {
  if (!userData || typeof userData !== 'object') {
    return { valid: false, error: 'User data is required' };
  }

  const { weight, height, age, gender, goal, experience, dietaryPreference } = userData;

  // Validate numeric fields
  if (typeof weight !== 'number' || weight < VALIDATION.weight.min || weight > VALIDATION.weight.max) {
    return { valid: false, error: `Weight must be between ${VALIDATION.weight.min} and ${VALIDATION.weight.max}kg` };
  }

  if (typeof height !== 'number' || height < VALIDATION.height.min || height > VALIDATION.height.max) {
    return { valid: false, error: `Height must be between ${VALIDATION.height.min} and ${VALIDATION.height.max}cm` };
  }

  if (typeof age !== 'number' || !Number.isInteger(age) || age < VALIDATION.age.min || age > VALIDATION.age.max) {
    return { valid: false, error: `Age must be between ${VALIDATION.age.min} and ${VALIDATION.age.max}` };
  }

  // Validate enum fields
  if (!VALIDATION.validGenders.includes(gender)) {
    return { valid: false, error: 'Invalid gender value' };
  }

  if (!VALIDATION.validGoals.includes(goal)) {
    return { valid: false, error: 'Invalid goal value' };
  }

  if (!VALIDATION.validExperience.includes(experience)) {
    return { valid: false, error: 'Invalid experience level' };
  }

  if (typeof dietaryPreference !== 'string' || dietaryPreference.length === 0 || dietaryPreference.length > 50) {
    return { valid: false, error: 'Invalid dietary preference' };
  }

  // Return sanitized data (bounded numbers, validated strings)
  return {
    valid: true,
    sanitized: {
      weight: Math.round(weight * 10) / 10, // Round to 1 decimal
      height: Math.round(height),
      age: Math.floor(age),
      gender,
      goal,
      experience,
      dietaryPreference: dietaryPreference.slice(0, 50),
    }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userData } = await req.json();
    
    // Validate user data server-side
    const validation = validateUserData(userData);
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const sanitizedData = validation.sanitized;
    
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

    // Use sanitized data in the prompt
    const systemPrompt = `You are PocketFit AI, an advanced AI fitness coach + personal trainer + diet coach.
Your tone: Energetic, supportive, motivating, clear, simple. No medical claims, no extreme dieting.

CALORIE LOGIC:
- Bulk: TDEE + 300
- Cut: TDEE - 300
- Maintain: TDEE
Show calculation steps.

PROTEIN LOGIC:
1.6–2.2g × bodyweight (default: 1.8g × bodyweight)

WORKOUT LOGIC:
- Beginner → Full body 3x/week
- Intermediate → Push/Pull/Legs
- Advanced → PPL + accessories
Must include: warm-up, 5-7 exercises with sets/reps/rest, cooldown

DIET LOGIC:
- Breakfast → high protein
- Lunch → balanced
- Dinner → light
- Snacks → yogurt, tofu, eggs, shakes
Support: ${sanitizedData.dietaryPreference}

User Stats:
- Weight: ${sanitizedData.weight}kg
- Height: ${sanitizedData.height}cm
- Age: ${sanitizedData.age}
- Gender: ${sanitizedData.gender}
- Goal: ${sanitizedData.goal}
- Experience: ${sanitizedData.experience}
- Diet Preference: ${sanitizedData.dietaryPreference}

Return ONLY valid JSON:
{
  "calories": {
    "tdee": number,
    "target": number,
    "protein_target": number,
    "calculation_steps": ["string"]
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
        "muscle_group": "string",
        "notes": "warm-up/cooldown if applicable"
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
