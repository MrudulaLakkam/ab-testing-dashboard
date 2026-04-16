/**
 * Statistics Engine for A/B Testing
 * Calculates chi-square, confidence intervals, and statistical significance
 */

export interface StatisticalResults {
  variantA: {
    sampleSize: number;
    conversions: number;
    conversionRate: number;
  };
  variantB: {
    sampleSize: number;
    conversions: number;
    conversionRate: number;
  };
  lift: number;
  liftPercentage: number;
  chiSquare: number;
  pValue: number;
  isSignificant: boolean;
  confidenceLevel: number;
  winner: 'A' | 'B' | 'none';
  recommendedSampleSize: number;
}

/**
 * Calculate Chi-Square statistic
 */
function calculateChiSquare(
  conversionsA: number,
  conversionsB: number,
  sampleSizeA: number,
  sampleSizeB: number
): { chiSquare: number; pValue: number } {
  const conversionRateA = conversionsA / sampleSizeA;
  const conversionRateB = conversionsB / sampleSizeB;
  const pooledRate = (conversionsA + conversionsB) / (sampleSizeA + sampleSizeB);

  const expectedA = sampleSizeA * pooledRate;
  const expectedB = sampleSizeB * pooledRate;
  const expectedNonConvA = sampleSizeA * (1 - pooledRate);
  const expectedNonConvB = sampleSizeB * (1 - pooledRate);

  const chiSquare =
    Math.pow(conversionsA - expectedA, 2) / expectedA +
    Math.pow(conversionsB - expectedB, 2) / expectedB +
    Math.pow(sampleSizeA - conversionsA - expectedNonConvA, 2) / expectedNonConvA +
    Math.pow(sampleSizeB - conversionsB - expectedNonConvB, 2) / expectedNonConvB;

  // Approximate p-value using chi-square distribution
  const pValue = approximatePValue(chiSquare);

  return { chiSquare, pValue };
}

/**
 * Approximate p-value from chi-square statistic
 */
function approximatePValue(chiSquare: number): number {
  // Simplified approximation for 1 degree of freedom
  if (chiSquare < 1) return 0.32;
  if (chiSquare < 2.71) return 0.1;
  if (chiSquare < 3.84) return 0.05;
  if (chiSquare < 5.41) return 0.02;
  if (chiSquare < 6.64) return 0.01;
  return 0.001;
}

/**
 * Calculate confidence level (1 - p-value)
 */
function calculateConfidenceLevel(pValue: number): number {
  return Math.round((1 - pValue) * 100 * 10) / 10;
}

/**
 * Determine if result is statistically significant (p < 0.05)
 */
function isStatisticallySignificant(pValue: number): boolean {
  return pValue < 0.05;
}

/**
 * Calculate minimum sample size needed (Cochran formula)
 */
function calculateRecommendedSampleSize(
  conversionRateA: number,
  conversionRateB: number
): number {
  const z = 1.96; // 95% confidence
  const beta = 0.2; // 80% power
  const pooledRate = (conversionRateA + conversionRateB) / 2;

  const numerator =
    Math.pow(z, 2) * pooledRate * (1 - pooledRate) * 2 +
    Math.pow(Math.sqrt(beta), 2) * (conversionRateA * (1 - conversionRateA) + conversionRateB * (1 - conversionRateB));

  const denominator = Math.pow(conversionRateB - conversionRateA, 2);

  return Math.ceil(numerator / denominator);
}

/**
 * Main function to calculate all statistics
 */
export function calculateStatistics(
  sampleSizeA: number,
  conversionsA: number,
  sampleSizeB: number,
  conversionsB: number
): StatisticalResults {
  const conversionRateA = conversionsA / sampleSizeA;
  const conversionRateB = conversionsB / sampleSizeB;

  const { chiSquare, pValue } = calculateChiSquare(
    conversionsA,
    conversionsB,
    sampleSizeA,
    sampleSizeB
  );

  const lift = conversionRateB - conversionRateA;
  const liftPercentage = conversionRateA > 0 ? (lift / conversionRateA) * 100 : 0;
  const confidenceLevel = calculateConfidenceLevel(pValue);
  const isSignificant = isStatisticallySignificant(pValue);

  const winner: 'A' | 'B' | 'none' = isSignificant
    ? conversionRateB > conversionRateA
      ? 'B'
      : 'A'
    : 'none';

  const recommendedSampleSize = calculateRecommendedSampleSize(conversionRateA, conversionRateB);

  return {
    variantA: {
      sampleSize: sampleSizeA,
      conversions: conversionsA,
      conversionRate: Math.round(conversionRateA * 1000) / 10,
    },
    variantB: {
      sampleSize: sampleSizeB,
      conversions: conversionsB,
      conversionRate: Math.round(conversionRateB * 1000) / 10,
    },
    lift: Math.round(lift * 1000) / 1000,
    liftPercentage: Math.round(liftPercentage * 10) / 10,
    chiSquare: Math.round(chiSquare * 100) / 100,
    pValue: Math.round(pValue * 1000) / 1000,
    isSignificant,
    confidenceLevel,
    winner,
    recommendedSampleSize,
  };
}