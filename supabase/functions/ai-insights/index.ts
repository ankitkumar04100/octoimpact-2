import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { ecoScore, fsiScore, streak, level, totalTokens, recentActions, categories, alerts } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are OctoImpact's AI Sustainability Coach — an expert in personal sustainability, green finance, and environmental impact. You analyze user data and provide actionable, specific, encouraging advice.

Rules:
- Be specific and data-driven. Reference actual numbers.
- Never repeat generic advice. Each insight must be unique and contextual.
- Use positive, encouraging tone. Acknowledge progress.
- Format response as JSON with this structure:
{
  "dailyActions": [{"action": "string", "co2Points": number, "reason": "string"}],
  "weeklyInsight": "string",
  "nextStep": "string",
  "ticker": "string"
}
- dailyActions: 3-5 actions for the next 24 hours with estimated CO₂ reduction points
- weeklyInsight: One paragraph insight based on trends
- nextStep: One concrete, doable next step
- ticker: One short (under 80 chars) motivational message for the live ticker`;

    const userPrompt = `User Profile:
- EcoScore: ${ecoScore}/100
- FSI (Financial Sustainability Index): ${fsiScore}/100
- Current Streak: ${streak} days
- Level: ${level}
- Total ImpactTokens: ${totalTokens}

Recent Actions (last 7 days): ${JSON.stringify(recentActions || [])}
Category Breakdown: ${JSON.stringify(categories || {})}
Active Alerts: ${JSON.stringify(alerts || [])}

Provide personalized sustainability insights based on this data.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "provide_insights",
            description: "Provide sustainability insights and recommendations",
            parameters: {
              type: "object",
              properties: {
                dailyActions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      action: { type: "string" },
                      co2Points: { type: "number" },
                      reason: { type: "string" }
                    },
                    required: ["action", "co2Points", "reason"]
                  }
                },
                weeklyInsight: { type: "string" },
                nextStep: { type: "string" },
                ticker: { type: "string" }
              },
              required: ["dailyActions", "weeklyInsight", "nextStep", "ticker"]
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "provide_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    let insights;
    if (toolCall?.function?.arguments) {
      insights = typeof toolCall.function.arguments === 'string' 
        ? JSON.parse(toolCall.function.arguments) 
        : toolCall.function.arguments;
    } else {
      // Fallback: parse from content
      const content = data.choices?.[0]?.message?.content || '{}';
      try {
        insights = JSON.parse(content);
      } catch {
        insights = {
          dailyActions: [{ action: "Take public transport today", co2Points: 3, reason: "Based on your profile" }],
          weeklyInsight: "Keep building your sustainability habits!",
          nextStep: "Log your next eco action to grow your streak.",
          ticker: `EcoScore ${ecoScore}/100 — keep going! 🌊`
        };
      }
    }

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
