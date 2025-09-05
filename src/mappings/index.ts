// Enhanced TPS Mappings - Modular Framework System
export * from './mbti.enhanced';
export * from './enneagram.enhanced';
export * from './bigfive.enhanced';
export * from './holland.enhanced';
export * from './alignment.enhanced';
export * from './attachment.mapping';
export * from './socionics.enhanced';

// Utility functions for enhanced mappings
export function calculateConfidence(score: number, threshold: number = 1.5): number {
  const distance = Math.abs(score);
  return Math.min(100, Math.max(50, (distance / threshold) * 50 + 50));
}

export function calculateWeightedScore(scores: Record<string, number>, traits: { strong_indicators?: string[]; moderate_indicators?: string[]; indicators?: string[] }): number {
  let totalScore = 0;
  let totalWeight = 0;

  // Strong indicators (weight 1.5)
  if (traits.strong_indicators) {
    traits.strong_indicators.forEach(trait => {
      const score = scores[trait] || 5;
      totalScore += score * 1.5;
      totalWeight += 1.5;
    });
  }

  // Moderate indicators (weight 1.0)
  if (traits.moderate_indicators) {
    traits.moderate_indicators.forEach(trait => {
      const score = scores[trait] || 5;
      totalScore += score * 1.0;
      totalWeight += 1.0;
    });
  }

  // Regular indicators (weight 1.0)
  if (traits.indicators) {
    traits.indicators.forEach(trait => {
      const score = scores[trait] || 5;
      totalScore += score * 1.0;
      totalWeight += 1.0;
    });
  }

  return totalWeight > 0 ? totalScore / totalWeight : 5;
}