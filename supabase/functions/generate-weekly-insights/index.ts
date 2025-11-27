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

    // Get last 7 days of data
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [workoutLogs, weightLogs, mealLogs, profile] = await Promise.all([
      supabaseClient.from('workout_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('workout_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('workout_date', { ascending: false }),
      supabaseClient.from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('log_date', { ascending: false }),
      supabaseClient.from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('meal_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('meal_date', { ascending: false }),
      supabaseClient.from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
    ]);

    const completedWorkouts = workoutLogs.data?.filter(log => log.completed).length || 0;
    const totalWorkouts = workoutLogs.data?.length || 0;
    const attendanceRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

    const avgProtein = mealLogs.data?.length 
      ? mealLogs.data.reduce((sum, log) => sum + log.total_protein, 0) / mealLogs.data.length 
      : 0;

    const weightChange = weightLogs.data && weightLogs.data.length >= 2
      ? weightLogs.data[0].weight - weightLogs.data[weightLogs.data.length - 1].weight
      : 0;

    const systemPrompt = `You are PocketFit AI, an advanced AI fitness coach.
Tone: Energetic, supportive, motivating, clear. Provide actionable insights.

INSIGHTS LOGIC:
Track: weight trends, attendance trends, protein average, consistency
Provide 3-4 clear, specific suggestions.

AUTO-ADJUST RULES:
- If weight changes too quickly (bulk: >0.5kg/week, cut: <-0.5kg/week) → suggest calorie adjustment
- If attendance < 70% → suggest scheduling tips or reduced volume
- If protein < target → suggest high-protein swaps

Weekly Data:
- Workout Attendance: ${attendanceRate.toFixed(1)}% (${completedWorkouts}/${totalWorkouts} sessions)
- Weight Change: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg
- Average Daily Protein: ${avgProtein.toFixed(1)}g
- Goal: ${profile.data?.goal}
- Target: ${profile.data?.goal === 'bulk' ? 'Gain weight' : profile.data?.goal === 'cut' ? 'Lose weight' : 'Maintain weight'}

Return ONLY valid JSON:
{
  "weight_change": ${weightChange},
  "attendance_rate": "${attendanceRate.toFixed(1)}%",
  "protein_average": ${avgProtein.toFixed(1)},
  "progress_summary": "string (assess if on track)",
  "top_issues": ["string"],
  "suggestions": ["string", "string", "string", "string"]
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
          { role: 'user', content: 'Analyze my progress and give insights.' }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
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
    const insightsText = aiData.choices[0].message.content;
    
    let insights;
    try {
      const jsonMatch = insightsText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : insightsText;
      insights = JSON.parse(jsonStr);
    } catch (parseError) {
      throw new Error('Invalid AI response format');
    }

    const weekStart = sevenDaysAgo.toISOString().split('T')[0];
    const weekEnd = new Date().toISOString().split('T')[0];

    const { data: savedInsights, error: saveError } = await supabaseClient
      .from('weekly_insights')
      .insert({
        user_id: user.id,
        week_start: weekStart,
        week_end: weekEnd,
        insights: insights
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-weekly-insights:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
