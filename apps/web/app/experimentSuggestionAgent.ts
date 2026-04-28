/**
 * Experiment Suggestion Agent
 * Analyzes current experiments and suggests new ones
 */

interface Experiment {
  name: string;
  lift: number;
  pValue: number;
  conversionRate: number;
  isSignificant: boolean;
}

interface ExperimentSuggestion {
  title: string;
  description: string;
  hypothesis: string;
  expectedLift: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToRun: string;
  reason: string;
}

/**
 * Analyzes existing experiments and suggests new ones
 */
export function suggestNewExperiments(experiments: Experiment[]): ExperimentSuggestion[] {
  const suggestions: ExperimentSuggestion[] = [];

  // Find highest performing experiments
  const topExperiments = experiments
    .filter(e => e.isSignificant)
    .sort((a, b) => b.lift - a.lift);

  // Suggestion 1: Scale winning elements
  if (topExperiments.length > 0) {
    const topExp = topExperiments[0];
    suggestions.push({
      title: `Scale Winning Element to More Pages`,
      description: `Your top performing test showed a ${topExp.lift.toFixed(1)}% lift. Apply this to similar pages.`,
      hypothesis: `Applying the winning design pattern from your ${topExp.lift.toFixed(1)}% improvement to other pages will produce similar results.`,
      expectedLift: topExp.lift * 0.7, // Usually scales to 70% of original
      difficulty: 'easy',
      timeToRun: '7-14 days',
      reason: `Proven winner with ${topExp.lift.toFixed(1)}% lift - high confidence approach`,
    });
  }

  // Suggestion 2: Test complementary elements
  const avgConversion = experiments.reduce((sum, e) => sum + e.conversionRate, 0) / experiments.length;
  suggestions.push({
    title: 'Test Complementary Element',
    description: `With avg ${avgConversion.toFixed(1)}% conversion, test a complementary element for compound improvements.`,
    hypothesis: `Combining top-performing elements from previous tests will produce cumulative conversion improvements.`,
    expectedLift: 8,
    difficulty: 'medium',
    timeToRun: '14-21 days',
    reason: 'Build on proven winners with complementary changes',
  });

  // Suggestion 3: Segment optimization
  suggestions.push({
    title: 'Mobile-Specific Optimization',
    description: `Optimize for mobile users who may have different behaviors than desktop.`,
    hypothesis: `Mobile users respond better to simplified checkout flows with larger touch targets.`,
    expectedLift: 12,
    difficulty: 'medium',
    timeToRun: '7-14 days',
    reason: 'Mobile typically underperforms - high opportunity',
  });

  // Suggestion 4: High-risk high-reward
  if (topExperiments.length > 0) {
    suggestions.push({
      title: 'Bold Design Overhaul Test',
      description: `Test a significant redesign combining multiple winning elements.`,
      hypothesis: `A comprehensive redesign combining all proven winning elements will achieve 25%+ lift.`,
      expectedLift: 25,
      difficulty: 'hard',
      timeToRun: '21-30 days',
      reason: 'High risk, high reward - stack multiple learnings',
    });
  }

  // Suggestion 5: New area exploration
  suggestions.push({
    title: 'Explore New Variable (Copy/Pricing)',
    description: `Test a new variable (messaging, pricing strategy, social proof) not yet explored.`,
    hypothesis: `Different pricing presentation or stronger social proof will increase conversion rates.`,
    expectedLift: 15,
    difficulty: 'easy',
    timeToRun: '7-14 days',
    reason: 'Untested variables often have high potential',
  });

  // Suggestion 6: Retention focus
  if (experiments.some(e => e.name.toLowerCase().includes('checkout'))) {
    suggestions.push({
      title: 'Post-Purchase Retention',
      description: `Shift focus from acquisition to retention and repeat purchases.`,
      hypothesis: `Personalized post-purchase follow-up will increase customer lifetime value by 20%.`,
      expectedLift: 20,
      difficulty: 'medium',
      timeToRun: '30+ days',
      reason: 'Retention ROI is higher than acquisition',
    });
  }

  return suggestions.slice(0, 6); // Return top 6 suggestions
}

/**
 * Generates a personalized experiment roadmap
 */
export function generateExperimentRoadmap(experiments: Experiment[]) {
  const suggestions = suggestNewExperiments(experiments);

  return {
    summary: `Based on ${experiments.length} experiments run, we've identified 6 high-potential opportunities for improvement.`,
    suggestions,
    nextSteps: [
      '1. Review suggestions and pick 1-2 to run this week',
      '2. Focus on high-confidence, easy experiments first',
      '3. Build on proven winners',
      '4. Document learnings for team',
    ],
    estimatedMonthlyLift: Math.round(
      suggestions.slice(0, 3).reduce((sum, s) => sum + s.expectedLift, 0)
    ),
  };
}
