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
    const { imageData, exerciseName } = await req.json();
    
    // Input validation for exerciseName
    if (!exerciseName || typeof exerciseName !== 'string') {
      return new Response(JSON.stringify({ error: 'Exercise name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Sanitize exerciseName: limit length, remove special characters
    const sanitizedExerciseName = exerciseName
      .trim()
      .slice(0, 100) // Max 100 characters
      .replace(/[<>{}[\]\\\/]/g, '') // Remove potentially dangerous characters
      .replace(/\s+/g, ' '); // Normalize whitespace
    
    if (sanitizedExerciseName.length < 2) {
      return new Response(JSON.stringify({ error: 'Exercise name must be at least 2 characters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Validate imageData
    if (!imageData || typeof imageData !== 'string') {
      return new Response(JSON.stringify({ error: 'Image data is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
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

    console.log('Analyzing exercise form for user:', user.id, 'Exercise:', sanitizedExerciseName);

    const systemPrompt = `You are PocketFit AI, an expert fitness form coach.
Analyze the user's exercise form from the image provided.

FORM ANALYSIS RULES:
- Assess body alignment, posture, joint angles
- Identify form mistakes and injury risks
- Rate overall form quality: excellent|good|needs_improvement|poor
- Provide specific, actionable corrections
- Be encouraging and supportive

Exercise: ${sanitizedExerciseName}

Return ONLY valid JSON:
{
  "form_rating": "excellent|good|needs_improvement|poor",
  "form_score": number (0-100),
  "body_alignment": {
    "back": "string assessment",
    "knees": "string assessment",
    "elbows": "string assessment",
    "head": "string assessment"
  },
  "issues": [
    {
      "severity": "critical|moderate|minor",
      "issue": "string",
      "correction": "string"
    }
  ],
  "positive_points": ["string"],
  "overall_feedback": "string (encouraging summary)"
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
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: 'Analyze my exercise form in this image.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
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
    const analysisText = aiData.choices[0].message.content;
    
    let analysis;
    try {
      const jsonMatch = analysisText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : analysisText;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-exercise-form:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
