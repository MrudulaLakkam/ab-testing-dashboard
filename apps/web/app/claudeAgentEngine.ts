/**
 * Real Claude-Powered Agentic AI Engine
 * Uses Anthropic API via backend route
 */

interface ExperimentData {
  variantA: string;
  variantB: string;
  sampleA: number;
  convA: number;
  sampleB: number;
  convB: number;
  pValue: number;
  lift: number;
  daysRunning: number;
}

/**
 * Get Claude's analysis of an experiment
 */
export async function analyzeExperimentWithClaude(data: ExperimentData) {
  const convRateA = (data.convA / data.sampleA) * 100;
  const convRateB = (data.convB / data.sampleB) * 100;

  const prompt = `You are an expert A/B testing statistician and product strategist. Analyze this experiment and provide insights.

Experiment Data:
- Variant A: "${data.variantA}"
  - Sample Size: ${data.sampleA}
  - Conversions: ${data.convA}
  - Conversion Rate: ${convRateA.toFixed(2)}%

- Variant B: "${data.variantB}"
  - Sample Size: ${data.sampleB}
  - Conversions: ${data.convB}
  - Conversion Rate: ${convRateB.toFixed(2)}%

- Lift: ${data.lift.toFixed(1)}%
- P-Value: ${data.pValue.toFixed(4)}
- Days Running: ${data.daysRunning}
- Statistically Significant: ${data.pValue < 0.05 ? 'Yes' : 'No'}

Please provide:
1. Your assessment of the results (2-3 sentences)
2. Key insights about what's working
3. Recommendation (LAUNCH / CONTINUE / INVESTIGATE / OPTIMIZE)
4. Next steps (2-3 bullet points)
5. Risks to consider (if any)

Be concise, actionable, and data-driven.`;

  try {
    const response = await fetch('/api/claude/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'API Error',
      };
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Claude API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze',
    };
  }
}

/**
 * Get Claude's deep insights on experiment data
 */
export async function getDeepInsightsWithClaude(experimentData: ExperimentData) {
  const prompt = `You are a data scientist specializing in conversion rate optimization. 

Analyze this A/B test deeply and identify:
1. Root causes of the performance difference
2. Segment-specific insights (mobile vs desktop, new vs returning users, etc.)
3. Potential confounding variables
4. Statistical confidence in the results
5. Recommendations for follow-up tests

Experiment: Variant A vs Variant B
- Lift: ${experimentData.lift.toFixed(1)}%
- P-Value: ${experimentData.pValue.toFixed(4)}
- Sample Size: ${(experimentData.sampleA + experimentData.sampleB).toLocaleString()}
- Test Duration: ${experimentData.daysRunning} days

Provide actionable insights that a product team can act on immediately.`;

  try {
    const response = await fetch('/api/claude/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error || 'API Error',
      };
    }

    const result = await response.json();
    return {
      success: result.success,
      insights: result.analysis,
    };
  } catch (error: any) {
    console.error('Claude API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get insights',
    };
  }
}
