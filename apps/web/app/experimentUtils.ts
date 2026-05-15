/**
 * Statistical Sample Size Calculator
 * Based on two-proportion z-test formula
 */
export function calculateSampleSize(
  expectedLift: number,
  confidenceLevel: number,
  baselineRate: number = 0.2
): number {
  // Simplified calculation based on industry standards
  // Real implementation would use more complex statistical formulas

  const zScores: Record<number, number> = {
    90: 1.645,
    95: 1.96,
    99: 2.576,
  };

  const z = zScores[confidenceLevel] || 1.96;
  const p1 = baselineRate;
  const p2 = baselineRate * (1 + expectedLift / 100);

  // Standard two-proportion z-test formula
  const pooledP = (p1 + p2) / 2;
  const variance = pooledP * (1 - pooledP) * 2;
  const numerator = (z * z) * variance;
  const denominator = Math.pow(p2 - p1, 2);

  const sampleSize = Math.ceil(numerator / denominator);

  // Add 10-20% buffer for dropout/incomplete data
  return Math.ceil(sampleSize * 1.15);
}

/**
 * Estimate experiment duration based on sample size and traffic
 */
export function estimateExperimentDuration(
  sampleSizePerVariant: number,
  trafficPercentage: number,
  dailyVisitors: number = 10000
): number {
  const totalSampleNeeded = sampleSizePerVariant * 2; // Both variants
  const allocatedVisitors = Math.floor((trafficPercentage / 100) * dailyVisitors);

  if (allocatedVisitors === 0) return 0;

  const days = Math.ceil(totalSampleNeeded / allocatedVisitors);
  return Math.max(days, 1);
}

/**
 * Validate traffic split
 */
export function validateTrafficSplit(variantA: number, variantB: number): {
  isValid: boolean;
  total: number;
  error?: string;
} {
  const total = variantA + variantB;

  if (total !== 100) {
    return {
      isValid: false,
      total,
      error: `Traffic allocation must equal 100%. Current: ${total}%`,
    };
  }

  return { isValid: true, total };
}

/**
 * Generate mock hypothesis based on experiment name
 */
export function generateHypothesis(
  experimentName: string,
  primaryMetric: string,
  expectedLift: number
): string {
  const metricDescriptions: Record<string, string> = {
    conversion: "increase conversion rate",
    click: "increase click-through rate",
    revenue: "increase revenue per visitor",
    custom: "improve the target metric",
    engagement: "improve user engagement",
  };

  const metricDesc = metricDescriptions[primaryMetric] || "improve results";

  return `Changing "${experimentName}" will ${metricDesc} by approximately ${expectedLift}% because users will find it more compelling and relevant to their needs.`;
}

/**
 * Primary metrics options
 */
export const PRIMARY_METRICS = [
  { value: "conversion", label: "Conversion", description: "User completes desired action" },
  { value: "click", label: "Click-through Rate", description: "Users click on element" },
  { value: "revenue", label: "Revenue", description: "Revenue per visitor" },
  { value: "custom", label: "Custom Metric", description: "Define your own metric" },
] as const;

/**
 * Secondary metrics options
 */
export const SECONDARY_METRICS = [
  { value: "engagement", label: "Engagement", description: "User interactions" },
  { value: "bounce_rate", label: "Bounce Rate", description: "Users leave without action" },
  { value: "session_time", label: "Session Time", description: "Average session duration" },
  { value: "cart_value", label: "Cart Value", description: "Average cart size" },
  { value: "repeat_visit", label: "Repeat Visits", description: "Users return" },
] as const;

/**
 * Audience targeting options
 */
export const AUDIENCE_OPTIONS = [
  { value: "all_users", label: "All Users", description: "100% of traffic" },
  { value: "new_users", label: "New Users", description: "First-time visitors" },
  { value: "returning_users", label: "Returning Users", description: "Previous visitors" },
  { value: "mobile_users", label: "Mobile Users", description: "Mobile devices only" },
  { value: "desktop_users", label: "Desktop Users", description: "Desktop devices only" },
  { value: "logged_in", label: "Logged-in Users", description: "Authenticated users only" },
] as const;

/**
 * Confidence level options
 */
export const CONFIDENCE_LEVELS = [
  { value: 90, label: "90% Confidence", riskLevel: "High", description: "Faster results, higher risk" },
  { value: 95, label: "95% Confidence", riskLevel: "Medium", description: "Balanced approach (recommended)" },
  { value: 99, label: "99% Confidence", riskLevel: "Low", description: "More rigorous, slower results" },
] as const;
