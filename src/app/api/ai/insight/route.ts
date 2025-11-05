import { NextRequest, NextResponse } from 'next/server';

interface MetricValue {
  year: number;
  month: number;
  value: number;
}

interface Metric {
  name: string;
  data_source: string;
  values: MetricValue[];
}

interface RequestBody {
  metrics: Metric[];
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { metrics } = body;

    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json(
        { error: 'Metrics array is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          insights: [
            '• AI insights are temporarily unavailable. Please check configuration.',
          ],
        },
        { status: 200 }
      );
    }

    // Generate analysis prompt
    const prompt = `
ROLE
You are a senior marketing analyst for small and medium businesses. Be concise, data-driven, and practical.

INPUT
You are given multiple metrics, each with monthly values (and possibly multiple years).
Example:
${JSON.stringify(metrics)}

TASK
1. Identify key trends and patterns across all metrics:
   - Growth or decline patterns month-over-month or year-over-year.
   - Seasonality (e.g., "Sales spike every December").
   - Metrics that move together or diverge (e.g., "Website traffic up, conversions flat").
2. Highlight insights that matter to marketing managers or business owners.
3. Provide short, actionable takeaways.

OUTPUT
Return strict JSON:
{
  "insights": [
    "• Insight 1 (≤25 words, include months/years and %/numbers)",
    "• Insight 2 (≤25 words, link metrics if relevant)",
    "• Optional: Action (≤20 words, starts with 'Try:' or 'Check:')"
  ]
}

CONSTRAINTS
- ≤80 words total.
- Use actual months/years and numeric references when possible.
- No hedging language.
- Focus on business value and clarity.
`.trim();

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return NextResponse.json(
        {
          insights: [
            '• Unable to generate insights at this time. Please try again later.',
          ],
        },
        { status: 200 }
      );
    }

    const data = await response.json();

    // Parse the JSON output
    let insights: string[] = [];
    try {
      const content = data?.choices?.[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed?.insights)) {
        insights = parsed.insights.slice(0, 3);
      } else {
        // Fallback: try to extract insights from text
        const text = content;
        insights = text
          .split(/\n/)
          .map((s: string) => s.trim())
          .filter(Boolean)
          .slice(0, 3);
      }
    } catch {
      // Fallback: extract insights from plain text response
      const text = data?.choices?.[0]?.message?.content ?? 'No insight available.';
      insights = text
        .split(/\n/)
        .map((s: string) => s.trim())
        .filter(Boolean)
        .slice(0, 3);
    }

    // Ensure we have at least one insight
    if (insights.length === 0) {
      insights = ['• Analysis complete. Review your metrics for trends and patterns.'];
    }

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error in AI insight route:', error);
    return NextResponse.json(
      {
        insights: [
          '• An error occurred while generating insights. Please try again later.',
        ],
      },
      { status: 200 }
    );
  }
}

