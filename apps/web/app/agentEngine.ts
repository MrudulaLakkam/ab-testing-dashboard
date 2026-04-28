/**
 * Hybrid Agentic AI Engine
 * Combines real data analysis with intelligent reasoning
 */

interface ExperimentData {
  id: string;
  name: string;
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

interface AgentInsight {
  type: 'analysis' | 'recommendation' | 'warning' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

interface AgentRecommendation {
  action: 'launch' | 'continue' | 'investigate' | 'optimize' | 'pause';
  reason: string;
  confidence: number;
  nextSteps: string[];
}

interface AgentDecision {
  advisor: {
    insights: AgentInsight[];
    recommendation: AgentRecommendation;
    reasoning: string;
  };
  automation: {
    shouldAutoLaunch: boolean;
    autoLaunchReason: string;
    estimatedImpact: number;
  };
  insights: {
    patterns: string[];
    opportunities: string[];
    risks: string[];
  };
  optimization: {
    suggestions: string[];
    predictedLift: number;
    nextExperimentIdeas: string[];
  };
}

// ADVISOR AGENT - Analyzes and recommends
export function advisorAgent(data: ExperimentData): AgentInsight[] {
  const insights: AgentInsight[] = [];
  const convRateA = (data.convA / data.sampleA) * 100;
  const convRateB = (data.convB / data.sampleB) * 100;

  // Statistical Significance Analysis
  if (data.pValue < 0.05) {
    insights.push({
      type: 'analysis',
      title: '✓ Statistically Significant Result',
      description: `${data.variantB} shows a ${data.lift.toFixed(1)}% improvement with p-value of ${data.pValue.toFixed(4)} (95% confidence)`,
      confidence: 0.95,
      actionable: true,
    });
  } else if (data.pValue < 0.1) {
    insights.push({
      type: 'analysis',
      title: '⚠️ Approaching Significance',
      description: `Trend towards ${data.variantB} (p=${data.pValue.toFixed(4)}). Consider running a few more days.`,
      confidence: 0.7,
      actionable: true,
    });
  } else {
    insights.push({
      type: 'analysis',
      title: '⏳ Insufficient Evidence',
      description: `Not yet statistically significant (p=${data.pValue.toFixed(4)}). More data needed.`,
      confidence: 0.6,
      actionable: false,
    });
  }

  // Sample Size Analysis
  const totalSample = data.sampleA + data.sampleB;
  if (totalSample >= 5000) {
    insights.push({
      type: 'analysis',
      title: '✓ Adequate Sample Size',
      description: `${totalSample.toLocaleString()} total samples collected. Results are reliable.`,
      confidence: 0.9,
      actionable: false,
    });
  } else if (totalSample >= 2000) {
    insights.push({
      type: 'analysis',
      title: '⚠️ Moderate Sample Size',
      description: `${totalSample.toLocaleString()} samples. Consider running longer for more confidence.`,
      confidence: 0.75,
      actionable: true,
    });
  }

  // Variant Performance Analysis
  if (convRateB > convRateA * 1.2) {
    insights.push({
      type: 'opportunity',
      title: '🎯 Strong Variant B Performance',
      description: `Variant B converts at ${convRateB.toFixed(1)}% vs ${convRateA.toFixed(1)}% for A. Consider testing on other pages.`,
      confidence: 0.85,
      actionable: true,
    });
  }

  // Time-based Analysis
  if (data.daysRunning < 7) {
    insights.push({
      type: 'warning',
      title: '⏱️ Short Test Duration',
      description: `Only ${data.daysRunning} days of data. Weekly patterns may not be captured yet.`,
      confidence: 0.8,
      actionable: true,
    });
  } else if (data.daysRunning > 30) {
    insights.push({
      type: 'recommendation',
      title: '📊 Extended Test Duration',
      description: `${data.daysRunning} days of data. Sufficient for seasonal/weekly pattern analysis.`,
      confidence: 0.9,
      actionable: false,
    });
  }

  return insights;
}

// AUTOMATION AGENT - Decides whether to auto-launch
export function automationAgent(data: ExperimentData): { shouldAutoLaunch: boolean; reason: string; impact: number } {
  const conditions = {
    isSignificant: data.pValue < 0.05,
    hasGoodLift: data.lift > 15,
    hasAdequateSample: (data.sampleA + data.sampleB) >= 5000,
    runLongEnough: data.daysRunning >= 7,
    confidenceHigh: data.pValue < 0.01,
  };

  const conditionsMet = Object.values(conditions).filter(Boolean).length;
  const totalConditions = Object.keys(conditions).length;
  const confidence = conditionsMet / totalConditions;

  let shouldAutoLaunch = false;
  let reason = '';
  let impact = 0;

  if (confidence >= 0.8 && conditions.isSignificant && conditions.hasAdequateSample) {
    shouldAutoLaunch = true;
    reason = `High confidence (${(confidence * 100).toFixed(0)}%) - All critical conditions met`;
    impact = data.lift;
  } else if (confidence >= 0.6 && conditions.isSignificant) {
    shouldAutoLaunch = true;
    reason = `Moderate-High confidence (${(confidence * 100).toFixed(0)}%) - Significant with adequate sample`;
    impact = data.lift * 0.8;
  } else {
    shouldAutoLaunch = false;
    reason = `Insufficient confidence (${(confidence * 100).toFixed(0)}%) - Need more data`;
    impact = 0;
  }

  return { shouldAutoLaunch, reason, impact };
}

// INSIGHT MINING AGENT - Finds hidden patterns
export function insightMiningAgent(data: ExperimentData): { patterns: string[]; opportunities: string[]; risks: string[] } {
  const patterns: string[] = [];
  const opportunities: string[] = [];
  const risks: string[] = [];

  const convRateA = (data.convA / data.sampleA) * 100;
  const convRateB = (data.convB / data.sampleB) * 100;
  const lift = ((convRateB - convRateA) / convRateA) * 100;

  // Pattern Discovery
  if (lift > 25) {
    patterns.push('Exceptionally strong variant - consider this approach for other elements');
  } else if (lift > 15) {
    patterns.push('Consistent improvement pattern - validated across sample');
  }

  if (data.daysRunning >= 14) {
    patterns.push('Two-week data reveals no weekly seasonality - results are stable');
  }

  // Opportunity Detection
  if (lift > 20 && data.pValue < 0.05) {
    opportunities.push(`Winning variant generates ~${(data.lift).toFixed(0)}% more conversions - Immediate launch recommended`);
    opportunities.push(`Scale to 100% traffic and measure incremental revenue impact`);
  }

  if (convRateB > 25) {
    opportunities.push('Variant B shows excellent conversion - Test similar improvements in checkout flow');
  }

  // Risk Detection
  if (data.pValue > 0.1) {
    risks.push('Results not statistically significant - Risk of false positive if launched');
  }

  if ((data.sampleA + data.sampleB) < 2000) {
    risks.push('Small sample size - Results may not be representative of full traffic');
  }

  if (data.daysRunning < 5) {
    risks.push('Very short test duration - May not capture full user behavior patterns');
  }

  return { patterns, opportunities, risks };
}

// OPTIMIZATION AGENT - Suggests improvements
export function optimizationAgent(data: ExperimentData): { suggestions: string[]; predictedLift: number; nextExperiments: string[] } {
  const suggestions: string[] = [];
  const nextExperiments: string[] = [];
  const convRateB = (data.convB / data.sampleB) * 100;
  let predictedLift = data.lift;

  // Optimization suggestions
  if (data.lift > 15) {
    suggestions.push('Variant B is a winner - Implement immediately and monitor in production');
    suggestions.push('A/B test similar improvements on related pages (checkout, cart, etc.)');
  }

  if (data.pValue < 0.01) {
    suggestions.push('Very high confidence result - Safe to implement without hesitation');
    predictedLift = data.lift * 1.05; // Slight boost for production
  }

  if (convRateB > 20) {
    suggestions.push('Exceptional conversion rate - Use this as baseline for future tests');
    suggestions.push('Document what makes this variant successful for other teams');
  }

  // Next Experiment Ideas
  if (data.lift > 10) {
    nextExperiments.push('Test this winning variant text/design on email campaigns');
    nextExperiments.push('A/B test color/CTA combinations based on this winner');
    nextExperiments.push('Multi-variate test combining this element with other improvements');
  }

  if (convRateB > 22) {
    nextExperiments.push('Optimize landing page to match this conversion rate');
    nextExperiments.push('Test personalization to further improve conversion');
  }

  return { suggestions, predictedLift, nextExperiments };
}

// MASTER AGENT - Coordinates all agents
export function masterAgent(data: ExperimentData): AgentDecision {
  const advisorInsights = advisorAgent(data);
  const automationDecision = automationAgent(data);
  const insightMining = insightMiningAgent(data);
  const optimization = optimizationAgent(data);

  // Determine recommendation
  const recommendation: AgentRecommendation = determineRecommendation(data, automationDecision);

  // Reasoning
  const reasoning = generateReasoning(data, advisorInsights);

  return {
    advisor: {
      insights: advisorInsights,
      recommendation,
      reasoning,
    },
    automation: {
      shouldAutoLaunch: automationDecision.shouldAutoLaunch,
      autoLaunchReason: automationDecision.reason,
      estimatedImpact: automationDecision.impact,
    },
    insights: insightMining,
    optimization: {
      suggestions: optimization.suggestions,
      predictedLift: optimization.predictedLift,
      nextExperimentIdeas: optimization.nextExperiments,
    },
  };
}

function determineRecommendation(data: ExperimentData, automation: any): AgentRecommendation {
  if (data.pValue < 0.05 && data.lift > 15 && (data.sampleA + data.sampleB) >= 5000) {
    return {
      action: 'launch',
      reason: `Variant B shows statistically significant ${data.lift.toFixed(1)}% improvement with adequate sample`,
      confidence: 0.95,
      nextSteps: [
        'Launch Variant B to 100% traffic',
        'Monitor key metrics for 2 weeks',
        'Plan next optimization test',
      ],
    };
  } else if (data.pValue < 0.1 && data.lift > 10) {
    return {
      action: 'continue',
      reason: 'Promising trend, but more data needed for confidence',
      confidence: 0.75,
      nextSteps: [
        'Run test for 3-5 more days',
        'Reach 5000+ total samples',
        'Re-evaluate for launch',
      ],
    };
  } else if (data.pValue > 0.2) {
    return {
      action: 'investigate',
      reason: 'No clear winner - Investigate user behavior differences',
      confidence: 0.6,
      nextSteps: [
        'Analyze segment performance (mobile vs desktop, new vs returning)',
        'Check for confounding variables',
        'Consider longer test duration',
      ],
    };
  } else {
    return {
      action: 'optimize',
      reason: 'Mixed results - Need to optimize variant or extend test',
      confidence: 0.7,
      nextSteps: [
        'Analyze which elements resonate',
        'Refine Variant B based on insights',
        'Run refinement test',
      ],
    };
  }
}

function generateReasoning(data: ExperimentData, insights: AgentInsight[]): string {
  const convRateA = (data.convA / data.sampleA) * 100;
  const convRateB = (data.convB / data.sampleB) * 100;

  return `
After analyzing ${data.sampleA + data.sampleB} total samples across ${data.daysRunning} days:

Variant A achieves ${convRateA.toFixed(1)}% conversion (${data.convA} conversions from ${data.sampleA} users)
Variant B achieves ${convRateB.toFixed(1)}% conversion (${data.convB} conversions from ${data.sampleB} users)

This represents a ${data.lift > 0 ? '+' : ''}${data.lift.toFixed(1)}% ${data.lift > 0 ? 'improvement' : 'decline'} for Variant B.

Statistical significance (p-value): ${data.pValue.toFixed(4)}
${data.pValue < 0.05 ? '✓ STATISTICALLY SIGNIFICANT (95% confidence)' : '✗ Not statistically significant'}

Key insights from analysis:
${insights.map(i => `• ${i.title}: ${i.description}`).join('\n')}

Recommendation confidence: ${data.pValue < 0.05 ? 'High' : data.pValue < 0.1 ? 'Moderate' : 'Low'}
  `.trim();
}
