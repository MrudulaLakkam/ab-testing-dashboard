export type PrimaryMetric = "conversion" | "click" | "revenue" | "custom";
export type SecondaryMetric = "engagement" | "bounce_rate" | "session_time" | "cart_value" | "repeat_visit";
export type Audience = "all_users" | "new_users" | "returning_users" | "mobile_users" | "desktop_users" | "logged_in";
export type ConfidenceLevel = 90 | 95 | 99;

export interface ExperimentFormData {
  // Step 1: Goal
  name: string;
  primaryMetric: PrimaryMetric;
  secondaryMetrics: SecondaryMetric[];

  // Step 2: Audience
  audience: Audience;

  // Step 3: Experiment Setup
  hypothesis: string;
  variantA: string;
  variantB: string;
  description: string;

  // Step 4: Configuration
  trafficAllocationA: number;
  trafficAllocationB: number;
  expectedLift: number;
  confidenceLevel: ConfidenceLevel;
}

export interface ExperimentData extends ExperimentFormData {
  id: string;
  status: "draft" | "active" | "completed";
  created_at: string;
  updated_at?: string;
}
