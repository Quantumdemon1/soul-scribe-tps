// Production-specific type definitions for better type safety

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  completedAssessments: number;
  conversionRate: number;
  weeklyGrowth: Array<{
    week: string;
    users: number;
    assessments: number;
    insights: number;
  }>;
  assessmentTypes: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
  hourlyActivity: Array<{
    hour: string;
    activity: number;
  }>;
  popularTraits: Array<{
    trait: string;
    count: number;
    percentage: number;
  }>;
}

export interface AssessmentData {
  id: string;
  email: string;
  variant: 'brief' | 'full' | 'detailed';
  created_at: string;
  scores?: Record<string, number>;
  results?: Record<string, unknown>;
}

export interface CareerData {
  careerFields: Array<{
    field: string;
    match: number;
    description: string;
    requirements: string[];
  }>;
}

export interface GrowthArea {
  area: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
}

export interface DevelopmentActivity {
  title: string;
  description: string;
  timeRequired: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export interface TrackingMethod {
  method: string;
  description: string;
  frequency: string;
  tools: string[];
}

export interface Milestone {
  title: string;
  description: string;
  timeframe: string;
  criteria: string[];
}

export interface PersonalityProfile {
  framework: string;
  type: string;
  confidence: number;
  description: string;
  traits: Record<string, number>;
  created_at: string;
  integralLevel?: string;
}

export interface IntegralLevel {
  level: string;
  name: string;
  description: string;
  characteristics: string[];
  percentage: number;
  color: string;
}

export interface FrameworkInsight {
  framework: string;
  insights: string[];
  correlations: Record<string, number>;
  recommendations: string[];
}

export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface PerformanceMetrics {
  memoryUsage: number;
  renderTime: number;
  apiCalls: number;
  errorCount: number;
  timestamp: number;
}

export interface TestResult {
  name: string;
  category: 'security' | 'performance' | 'accessibility' | 'code-quality';
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  details?: string;
  error?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface CacheData<T = unknown> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface DatabaseCacheEntry {
  id: string;
  section: string;
  data: Record<string, unknown>;
  created_at: string;
  expires_at: string;
}

export interface InsightData {
  personalDevelopment: {
    growthAreas: GrowthArea[];
    activities: DevelopmentActivity[];
    tracking: {
      trackingMethods: TrackingMethod[];
      milestones: Milestone[];
    };
  };
  careerLifestyle: {
    pathways: CareerData;
    workEnvironment: Record<string, unknown>;
    lifestyle: Record<string, unknown>;
  };
}