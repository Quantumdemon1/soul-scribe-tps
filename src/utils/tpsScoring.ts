import { TPSScores, DominantTraits, PersonalityProfile } from '../types/tps.types';
import { logger } from './structuredLogging';

// Safe imports to avoid circular dependencies
let enhancedMappingsLoaded = false;
let calculateMBTIEnhanced: any = null;
let calculateEnneagramEnhanced: any = null;
let calculateBigFiveEnhanced: any = null;
let calculateHollandEnhanced: any = null;
let calculateAlignmentEnhanced: any = null;
let calculateAttachmentStyle: any = null;
let calculateSocionicsEnhanced: any = null;
let calculateIntegralDevelopment: any = null;

// Try to load enhanced mappings asynchronously
const loadEnhancedMappings = async () => {
  try {
    const mappings = await import('../mappings/index');
    calculateMBTIEnhanced = mappings.calculateMBTIEnhanced;
    calculateEnneagramEnhanced = mappings.calculateEnneagramEnhanced;
    calculateBigFiveEnhanced = mappings.calculateBigFiveEnhanced;
    calculateHollandEnhanced = mappings.calculateHollandEnhanced;
    calculateAlignmentEnhanced = mappings.calculateAlignmentEnhanced;
    calculateAttachmentStyle = mappings.calculateAttachmentStyle;
    calculateSocionicsEnhanced = mappings.calculateSocionicsEnhanced;
    calculateIntegralDevelopment = mappings.calculateIntegralDevelopment;
    enhancedMappingsLoaded = true;
  } catch (error) {
    // Enhanced mappings not available, using basic scoring
  }
};

// Initialize enhanced mappings
loadEnhancedMappings();

// Synchronous overrides loader (stored by admin in localStorage)
function getScoringOverrides(): {
  traitMappings?: Record<string, number[]>;
  mbti?: Record<'EI' | 'SN' | 'TF' | 'JP', { traits: Record<string, number>; threshold?: number }>;
  bigfive?: any;
  enneagram?: any;
  alignment?: any;
  holland?: any;
  socionics?: any;
  integral?: any;
  attachment?: any;
} | null {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('tps_scoring_overrides') : null;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export class TPSScoring {
  static readonly TRAIT_MAPPINGS = {
    "Structured": [1, 4, 7, 10, 13, 16],
    "Ambivalent": [2, 5, 8, 11, 14, 17],
    "Independent": [3, 6, 9, 12, 15, 18],
    "Passive": [19, 22, 25, 28, 31, 34],
    "Diplomatic": [20, 23, 26, 29, 32, 35],
    "Assertive": [21, 24, 27, 30, 33, 36],
    "Lawful": [37, 40, 43, 46, 49, 52],
    "Pragmatic": [38, 41, 44, 47, 50, 53],
    "Self-Principled": [39, 42, 45, 48, 51, 54],
    "Self-Indulgent": [55, 58, 61, 64, 67, 70],
    "Self-Aware": [56, 59, 62, 65, 68, 71],
    "Self-Mastery": [57, 60, 63, 66, 69, 72],
    "Intrinsic": [73, 76, 79, 82, 85, 88],
    "Responsive": [74, 77, 80, 83, 86, 89],
    "Extrinsic": [75, 78, 81, 84, 87, 90],
    "Pessimistic": [91, 94, 97, 100, 103, 106],
    "Realistic": [92, 95, 98, 101, 104, 107],
    "Optimistic": [93, 96, 99, 102, 105, 108],
    "Independent Navigate": [1, 7, 13, 19, 25, 31],
    "Mixed Navigate": [2, 8, 14, 20, 26, 32],
    "Communal Navigate": [3, 9, 15, 21, 27, 33],
    "Direct": [4, 10, 16, 22, 28, 34],
    "Mixed Communication": [5, 11, 17, 23, 29, 35],
    "Passive Communication": [6, 12, 18, 24, 30, 36],
    "Dynamic": [37, 43, 49, 55, 61, 67],
    "Modular": [38, 44, 50, 56, 62, 68],
    "Static": [39, 45, 51, 57, 63, 69],
    "Analytical": [40, 46, 52, 58, 64, 70],
    "Varied": [41, 47, 53, 59, 65, 71],
    "Intuitive": [42, 48, 54, 60, 66, 72],
    "Turbulent": [73, 79, 85, 91, 97, 103],
    "Responsive Regulation": [74, 80, 86, 92, 98, 104],
    "Stoic": [75, 81, 87, 93, 99, 105],
    "Physical": [76, 82, 88, 94, 100, 106],
    "Social": [77, 83, 89, 95, 101, 107],
    "Universal": [78, 84, 90, 96, 102, 108]
  };

  static readonly DOMAINS = {
    "External": {
      "Control": ["Structured", "Ambivalent", "Independent"],
      "Will": ["Passive", "Diplomatic", "Assertive"],
      "Design": ["Lawful", "Pragmatic", "Self-Principled"]
    },
    "Internal": {
      "Self-Focus": ["Self-Indulgent", "Self-Aware", "Self-Mastery"],
      "Motivation": ["Intrinsic", "Responsive", "Extrinsic"],
      "Behavior": ["Pessimistic", "Realistic", "Optimistic"]
    },
    "Interpersonal": {
      "Navigate": ["Independent Navigate", "Mixed Navigate", "Communal Navigate"],
      "Communication": ["Direct", "Mixed Communication", "Passive Communication"],
      "Stimulation": ["Dynamic", "Modular", "Static"]
    },
    "Processing": {
      "Cognitive": ["Analytical", "Varied", "Intuitive"],
      "Regulation": ["Turbulent", "Responsive Regulation", "Stoic"],
      "Reality": ["Physical", "Social", "Universal"]
    }
  };

  static calculateTraitScores(userScores: number[]): TPSScores {
    const traitScores: TPSScores = {};
    
    const overrides = getScoringOverrides();
    const traitMappings: Record<string, number[]> = overrides?.traitMappings || this.TRAIT_MAPPINGS as any;
    
    for (const [trait, indices] of Object.entries(traitMappings)) {
      const scores = indices.map(i => userScores[i - 1] || 5);
      traitScores[trait] = scores.reduce((a, b) => a + b, 0) / scores.length;
    }
    
    return traitScores;
  }

  static determineDominantTrait(triadTraits: string[], traitScores: TPSScores): string {
    const scores = triadTraits.map(trait => ({
      trait,
      score: traitScores[trait] || 0
    }));
    
    scores.sort((a, b) => b.score - a.score);
    
    const highestScore = scores[0].score;
    const tiedTraits = scores.filter(s => Math.abs(s.score - highestScore) < 0.01);
    
    if (tiedTraits.length === 2) {
      const indices = tiedTraits.map(t => triadTraits.indexOf(t.trait));
      if (indices.includes(0) && indices.includes(2)) {
        return triadTraits[1];
      }
      return tiedTraits[0].trait;
    } else if (tiedTraits.length === 3) {
      return triadTraits[1];
    }
    
    return scores[0].trait;
  }

  static calculateDominantTraits(traitScores: TPSScores): DominantTraits {
    const dominantTraits: DominantTraits = {};
    
    for (const [domain, triads] of Object.entries(this.DOMAINS)) {
      for (const [triadName, triadTraits] of Object.entries(triads)) {
        const fullTriadName = `${domain}-${triadName}`;
        dominantTraits[fullTriadName] = this.determineDominantTrait(
          triadTraits,
          traitScores
        );
      }
    }
    
    return dominantTraits;
  }

  static calculateDomainScores(traitScores: TPSScores): { External: number; Internal: number; Interpersonal: number; Processing: number; } {
    const domainScores = {
      External: 0,
      Internal: 0,
      Interpersonal: 0,
      Processing: 0
    };
    
    for (const [domain, triads] of Object.entries(this.DOMAINS)) {
      let totalScore = 0;
      let traitCount = 0;
      
      for (const triadTraits of Object.values(triads)) {
        for (const trait of triadTraits) {
          totalScore += traitScores[trait] || 0;
          traitCount++;
        }
      }
      
      domainScores[domain as keyof typeof domainScores] = totalScore / traitCount;
    }
    
    return domainScores;
  }

  static generateFullProfile(responses: number[]): PersonalityProfile {
    // Validate assessment responses for security
    const validatedResponses = this.validateResponses(responses);
    
    const traitScores = this.calculateTraitScores(validatedResponses);
    const dominantTraits = this.calculateDominantTraits(traitScores);
    const domainScores = this.calculateDomainScores(traitScores);
    const mappings = this.mapToOtherFrameworks(dominantTraits, traitScores);

    return {
      dominantTraits,
      traitScores,
      domainScores,
      mappings,
      timestamp: new Date().toISOString(),
      version: '2.1.0' // Enhanced mappings version
    };
  }

  private static validateResponses(responses: number[]): number[] {
    if (!Array.isArray(responses)) {
      throw new Error('Assessment responses must be an array');
    }
    
    if (responses.length !== 108) {
      throw new Error('Assessment must contain exactly 108 responses');
    }
    
    return responses.map((response, index) => {
      const num = Number(response);
      if (isNaN(num) || num < 1 || num > 10) {
        throw new Error(`Response ${index + 1} must be a number between 1 and 10`);
      }
      return num;
    });
  }

  // Utility to recalculate an existing profile with updated logic
  static recalculateProfile(profile: PersonalityProfile, originalResponses?: number[]): PersonalityProfile {
    // If we have original responses, do a full recalculation
    if (originalResponses) {
      return this.generateFullProfile(originalResponses);
    }
    
    // Otherwise, just recalculate mappings from existing trait scores
    const mappings = this.mapToOtherFrameworks(profile.dominantTraits, profile.traitScores);
    
    return {
      ...profile,
      mappings,
      timestamp: new Date().toISOString(),
      version: '2.1.0'
    };
  }

  static generateFullProfileWithAdjustedScores(responses: number[], adjustedScores: any): PersonalityProfile {
    const baseTraitScores = this.calculateTraitScores(responses);
    
    // Apply adjustments from Socratic clarification
    const finalTraitScores = { ...baseTraitScores };
    Object.entries(adjustedScores).forEach(([trait, adjustment]) => {
      if (finalTraitScores[trait] !== undefined) {
        finalTraitScores[trait] = Math.max(1, Math.min(10, finalTraitScores[trait] + (adjustment as number)));
      }
    });
    
    const dominantTraits = this.calculateDominantTraits(finalTraitScores);
    const domainScores = this.calculateDomainScores(finalTraitScores);
    const mappings = this.mapToOtherFrameworks(dominantTraits, finalTraitScores);

    return {
      dominantTraits,
      traitScores: finalTraitScores,
      domainScores,
      mappings,
      timestamp: new Date().toISOString(),
      version: '2.1.0'
    };
  }

  private static mapToOtherFrameworks(dominantTraits: DominantTraits, traitScores: TPSScores) {
    const mbti = this.calculateMBTI(traitScores);
    const enneagramDetails = this.calculateEnneagramDetails(traitScores);
    
    // Enhanced detailed mappings (with safe fallback)
    const mbtiDetail = calculateMBTIEnhanced ? calculateMBTIEnhanced(traitScores) : null;
    const enneagramDetail = calculateEnneagramEnhanced ? calculateEnneagramEnhanced(traitScores) : null;
    const bigFiveDetail = calculateBigFiveEnhanced ? calculateBigFiveEnhanced(traitScores) : null;
    const alignmentDetail = calculateAlignmentEnhanced ? calculateAlignmentEnhanced(traitScores) : null;
    const hollandDetail = calculateHollandEnhanced ? calculateHollandEnhanced(traitScores) : null;
    const attachmentStyle = calculateAttachmentStyle ? calculateAttachmentStyle(traitScores) : null;
    const socionicsDetail = calculateSocionicsEnhanced ? calculateSocionicsEnhanced(mbti, traitScores) : null;
    const integralDetail = calculateIntegralDevelopment ? calculateIntegralDevelopment(traitScores) : null;
    
    return {
      mbti,
      enneagram: `Type ${enneagramDetails.type}w${enneagramDetails.wing}`,
      enneagramDetails,
      bigFive: this.calculateBigFive(traitScores),
      dndAlignment: this.calculateAlignment(traitScores),
      socionics: this.calculateSocionics(mbti),
      hollandCode: this.calculateHollandCode(traitScores),
      personalityMatches: this.findPersonalityMatches(traitScores),
      // Enhanced detailed mappings
      mbtiDetail,
      enneagramDetail,
      bigFiveDetail,
      alignmentDetail,
      hollandDetail,
      attachmentStyle,
      socionicsDetail,
      integralDetail
    };
  }

  private static calculateMBTI(traitScores: TPSScores): string {
    const overrides = getScoringOverrides();

    // EXTRAVERSION vs INTROVERSION
    const eiWeights = overrides?.mbti?.EI?.traits || {
      'Communal Navigate': 0.35,
      'Dynamic': 0.35,
      'Assertive': 0.15,
      'Direct': 0.15,
    };
    const eiThreshold = overrides?.mbti?.EI?.threshold ?? 5;
    const extraversion = Object.entries(eiWeights).reduce((sum, [trait, w]) => sum + (traitScores[trait] || 5) * w, 0);
    const mbti_E_I = extraversion > eiThreshold ? 'E' : 'I';
    
    // SENSING vs INTUITION
    const snWeights = overrides?.mbti?.SN?.traits || {
      'Intuitive': 0.40,
      'Universal': 0.30,
      'Varied': 0.15,
      'Self-Aware': 0.15,
    };
    const snThreshold = overrides?.mbti?.SN?.threshold ?? 5;
    const intuition = Object.entries(snWeights).reduce((sum, [trait, w]) => sum + (traitScores[trait] || 5) * w, 0);
    const mbti_S_N = intuition > snThreshold ? 'N' : 'S';
    
    // THINKING vs FEELING
    const tfWeights = overrides?.mbti?.TF?.traits || {
      'Analytical': 0.35,
      'Stoic': 0.25,
      'Direct': 0.20,
      'Pragmatic': 0.20,
    };
    const tfThreshold = overrides?.mbti?.TF?.threshold ?? 5;
    const thinking = Object.entries(tfWeights).reduce((sum, [trait, w]) => sum + (traitScores[trait] || 5) * w, 0);
    const mbti_T_F = thinking > tfThreshold ? 'T' : 'F';
    
    // JUDGING vs PERCEIVING
    const jpWeights = overrides?.mbti?.JP?.traits || {
      'Structured': 0.35,
      'Lawful': 0.25,
      'Self-Mastery': 0.20,
      'Assertive': 0.20,
    };
    const jpThreshold = overrides?.mbti?.JP?.threshold ?? 5;
    const judging = Object.entries(jpWeights).reduce((sum, [trait, w]) => sum + (traitScores[trait] || 5) * w, 0);
    const mbti_J_P = judging > jpThreshold ? 'J' : 'P';
    
    return mbti_E_I + mbti_S_N + mbti_T_F + mbti_J_P;
  }

  private static calculateEnneagramDetails(traitScores: TPSScores): { type: number, wing: number, tritype: string } {
    const enneagramScores = {
      1: ( // The Perfectionist
        (traitScores['Self-Mastery'] * 0.30) +
        (traitScores['Lawful'] * 0.25) +
        (traitScores['Structured'] * 0.25) +
        (traitScores['Analytical'] * 0.10) +
        (traitScores['Stoic'] * 0.10)
      ) / 5,
      
      2: ( // The Helper
        (traitScores['Communal Navigate'] * 0.30) +
        (traitScores['Diplomatic'] * 0.25) +
        (traitScores['Responsive'] * 0.25) +
        (traitScores['Passive'] * 0.10) +
        (traitScores['Social'] * 0.10)
      ) / 5,
      
      3: ( // The Achiever
        (traitScores['Assertive'] * 0.30) +
        (traitScores['Extrinsic'] * 0.30) +
        (traitScores['Pragmatic'] * 0.20) +
        (traitScores['Dynamic'] * 0.10) +
        (traitScores['Optimistic'] * 0.10)
      ) / 5,
      
      4: ( // The Individualist
        (traitScores['Self-Aware'] * 0.30) +
        (traitScores['Intuitive'] * 0.25) +
        (traitScores['Independent'] * 0.20) +
        (traitScores['Turbulent'] * 0.15) +
        (traitScores['Universal'] * 0.10)
      ) / 5,
      
      5: ( // The Investigator
        (traitScores['Analytical'] * 0.30) +
        (traitScores['Independent Navigate'] * 0.25) +
        (traitScores['Intrinsic'] * 0.20) +
        (traitScores['Stoic'] * 0.15) +
        (traitScores['Physical'] * 0.10)
      ) / 5,
      
      6: ( // The Loyalist
        (traitScores['Ambivalent'] * 0.25) +
        (traitScores['Pessimistic'] * 0.25) +
        (traitScores['Lawful'] * 0.20) +
        (traitScores['Responsive Regulation'] * 0.15) +
        (traitScores['Structured'] * 0.15)
      ) / 5,
      
      7: ( // The Enthusiast
        (traitScores['Dynamic'] * 0.30) +
        (traitScores['Optimistic'] * 0.25) +
        (traitScores['Self-Indulgent'] * 0.20) +
        (traitScores['Varied'] * 0.15) +
        (traitScores['Independent'] * 0.10)
      ) / 5,
      
      8: ( // The Challenger
        (traitScores['Assertive'] * 0.35) +
        (traitScores['Direct'] * 0.25) +
        (traitScores['Independent'] * 0.20) +
        (traitScores['Physical'] * 0.10) +
        (traitScores['Self-Principled'] * 0.10)
      ) / 5,
      
      9: ( // The Peacemaker
        (traitScores['Passive'] * 0.30) +
        (traitScores['Ambivalent'] * 0.25) +
        (traitScores['Optimistic'] * 0.15) +
        (traitScores['Mixed Navigate'] * 0.15) +
        (traitScores['Responsive'] * 0.15)
      ) / 5
    };
    
    // Find primary type
    const sortedTypes = Object.entries(enneagramScores)
      .sort(([,a], [,b]) => b - a);
    const primaryType = parseInt(sortedTypes[0][0]);
    
    // Calculate wing (adjacent type with higher score)
    const leftWing = primaryType === 1 ? 9 : primaryType - 1;
    const rightWing = primaryType === 9 ? 1 : primaryType + 1;
    const wing = enneagramScores[leftWing] > enneagramScores[rightWing] ? leftWing : rightWing;
    
    // Calculate tritype (top type from each center)
    const heartTypes = [2, 3, 4];
    const headTypes = [5, 6, 7];
    const gutTypes = [8, 9, 1];
    
    const heartTop = heartTypes.reduce((max, type) => 
      enneagramScores[type] > enneagramScores[max] ? type : max, 2);
    const headTop = headTypes.reduce((max, type) => 
      enneagramScores[type] > enneagramScores[max] ? type : max, 5);
    const gutTop = gutTypes.reduce((max, type) => 
      enneagramScores[type] > enneagramScores[max] ? type : max, 8);
    
    const tritype = `${primaryType}${
      heartTypes.includes(primaryType) ? headTop : heartTop
    }${gutTypes.includes(primaryType) ? 
      (heartTypes.includes(primaryType) ? gutTop : headTop) : gutTop}`;
    
    return { type: primaryType, wing, tritype };
  }

  private static calculateBigFive(traitScores: TPSScores): Record<string, number> {
    return {
      Openness: (
        (traitScores['Intuitive'] * 0.25) +
        (traitScores['Universal'] * 0.20) +
        (traitScores['Self-Aware'] * 0.15) +
        (traitScores['Varied'] * 0.15) +
        (traitScores['Independent'] * 0.10) +
        (traitScores['Self-Principled'] * 0.10) +
        (traitScores['Dynamic'] * 0.05)
      ),
      
      Conscientiousness: (
        (traitScores['Structured'] * 0.25) +
        (traitScores['Self-Mastery'] * 0.25) +
        (traitScores['Lawful'] * 0.20) +
        (traitScores['Pragmatic'] * 0.10) +
        (traitScores['Assertive'] * 0.10) +
        (traitScores['Realistic'] * 0.10)
      ),
      
      Extraversion: (
        (traitScores['Assertive'] * 0.20) +
        (traitScores['Dynamic'] * 0.20) +
        (traitScores['Communal Navigate'] * 0.20) +
        (traitScores['Direct'] * 0.15) +
        (traitScores['Optimistic'] * 0.15) +
        (traitScores['Extrinsic'] * 0.10)
      ),
      
      Agreeableness: (
        (traitScores['Diplomatic'] * 0.25) +
        (traitScores['Passive'] * 0.20) +
        (traitScores['Responsive'] * 0.15) +
        (traitScores['Communal Navigate'] * 0.15) +
        (traitScores['Mixed Communication'] * 0.15) +
        (traitScores['Social'] * 0.10)
      ),
      
      Neuroticism: (
        (traitScores['Turbulent'] * 0.30) +
        (traitScores['Pessimistic'] * 0.25) +
        (traitScores['Self-Indulgent'] * 0.15) +
        (traitScores['Passive'] * 0.10) +
        (traitScores['Ambivalent'] * 0.10) +
        ((10 - traitScores['Stoic']) * 0.10)
      )
    };
  }

  private static calculateAlignment(traitScores: TPSScores): string {
    // Helper function to safely get trait score with fallback
    const getTraitScore = (traitName: string): number => {
      const score = traitScores[traitName];
      if (score === undefined) {
        logger.warn(`D&D Alignment: Missing trait '${traitName}', using default 5.0`, { 
          component: 'tpsScoring',
          metadata: { traitName }
        });
        return 5.0;
      }
      return score;
    };

    // Lawful-Chaotic Axis
    const lawfulness = (
      (getTraitScore('Lawful') * 0.40) +
      (getTraitScore('Structured') * 0.30) +
      (getTraitScore('Diplomatic') * 0.15) +
      (getTraitScore('Self-Mastery') * 0.15)
    );
    
    const chaos = (
      (getTraitScore('Self-Principled') * 0.35) +
      (getTraitScore('Independent') * 0.35) +
      (getTraitScore('Dynamic') * 0.15) +
      (getTraitScore('Intuitive') * 0.15)
    );
    
    // Debug logging
    logger.debug('D&D Alignment Calculation', { 
      component: 'tpsScoring',
      metadata: {
        lawfulness: lawfulness.toFixed(2),
        chaos: chaos.toFixed(2),
        availableTraits: Object.keys(traitScores),
        traitCounts: Object.keys(traitScores).length
      }
    });
    
    let ethical: string;
    if (lawfulness > chaos && lawfulness > 6.0) ethical = 'Lawful';
    else if (chaos > lawfulness && chaos > 6.0) ethical = 'Chaotic';
    else ethical = 'Neutral';
    
    // Good-Evil Axis
    const goodness = (
      (getTraitScore('Communal Navigate') * 0.30) +
      (getTraitScore('Diplomatic') * 0.25) +
      (getTraitScore('Optimistic') * 0.20) +
      (getTraitScore('Responsive') * 0.15) +
      (getTraitScore('Social') * 0.10)
    );
    
    const selfishness = (
      (getTraitScore('Self-Indulgent') * 0.40) +
      (getTraitScore('Independent Navigate') * 0.20) +
      (getTraitScore('Assertive') * 0.20) +
      (getTraitScore('Pessimistic') * 0.20)
    );
    
    logger.debug('D&D Alignment Moral Axis', { 
      component: 'tpsScoring',
      metadata: {
        goodness: goodness.toFixed(2),
        selfishness: selfishness.toFixed(2)
      }
    });
    
    let moral: string;
    if (goodness > selfishness && goodness > 6.0) moral = 'Good';
    else if (selfishness > goodness && selfishness > 6.0) moral = 'Evil';
    else moral = 'Neutral';
    
    const result = ethical === 'Neutral' && moral === 'Neutral' ? 'True Neutral' : `${ethical} ${moral}`;
    logger.debug('D&D Alignment Result', { 
      component: 'tpsScoring',
      metadata: { result }
    });
    
    return result;
  }

  private static calculateSocionics(mbti: string): string {
    const socMapping: Record<string, string> = {
      'INTJ': 'INTp (ILI)',
      'INTP': 'INTj (LII)',
      'ENTJ': 'ENTj (LIE)',
      'ENTP': 'ENTp (ILE)',
      'INFJ': 'INFp (IEI)',
      'INFP': 'INFj (EII)',
      'ENFJ': 'ENFj (EIE)',
      'ENFP': 'ENFp (IEE)',
      'ISTJ': 'ISTp (SLI)',
      'ISFJ': 'ISFp (SEI)',
      'ESTJ': 'ESTj (LSE)',
      'ESFJ': 'ESFj (ESE)',
      'ISTP': 'ISTj (LSI)',
      'ISFP': 'ISFj (ESI)',
      'ESTP': 'ESTp (SLE)',
      'ESFP': 'ESFp (SEE)'
    };
    
    return socMapping[mbti] || mbti;
  }

  private static calculateHollandCode(traitScores: TPSScores): string {
    const scores = {
      R: ( // Realistic
        (traitScores['Physical'] * 0.40) +
        (traitScores['Pragmatic'] * 0.30) +
        (traitScores['Independent Navigate'] * 0.20) +
        (traitScores['Stoic'] * 0.10)
      ),
      
      I: ( // Investigative
        (traitScores['Analytical'] * 0.40) +
        (traitScores['Intrinsic'] * 0.25) +
        (traitScores['Independent'] * 0.20) +
        (traitScores['Universal'] * 0.15)
      ),
      
      A: ( // Artistic
        (traitScores['Intuitive'] * 0.35) +
        (traitScores['Self-Aware'] * 0.25) +
        (traitScores['Self-Principled'] * 0.20) +
        (traitScores['Dynamic'] * 0.20)
      ),
      
      S: ( // Social
        (traitScores['Communal Navigate'] * 0.35) +
        (traitScores['Social'] * 0.30) +
        (traitScores['Diplomatic'] * 0.20) +
        (traitScores['Responsive'] * 0.15)
      ),
      
      E: ( // Enterprising
        (traitScores['Assertive'] * 0.35) +
        (traitScores['Extrinsic'] * 0.25) +
        (traitScores['Direct'] * 0.20) +
        (traitScores['Optimistic'] * 0.20)
      ),
      
      C: ( // Conventional
        (traitScores['Structured'] * 0.35) +
        (traitScores['Lawful'] * 0.30) +
        (traitScores['Passive'] * 0.20) +
        (traitScores['Realistic'] * 0.15)
      )
    };
    
    // Return top 3 codes
    return Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([code]) => code)
      .join('');
  }

  private static findPersonalityMatches(userScores: TPSScores): { name: string; type: 'real' | 'fictional'; similarity: number; description: string }[] {
    const archetypes = [
      // Historical Figures
      {
        name: "Albert Einstein",
        type: "real" as const,
        traits: {
          'Analytical': 10,
          'Intuitive': 9,
          'Independent': 8,
          'Self-Principled': 8,
          'Structured': 7
        },
        description: "Revolutionary scientific thinking and intellectual curiosity"
      },
      {
        name: "Leonardo da Vinci",
        type: "real" as const,
        traits: {
          'Intuitive': 10,
          'Artistic': 10,
          'Analytical': 8,
          'Independent': 9,
          'Self-Principled': 7
        },
        description: "Renaissance genius with boundless creativity and innovation"
      },
      {
        name: "Marie Curie",
        type: "real" as const,
        traits: {
          'Self-Mastery': 9,
          'Analytical': 9,
          'Structured': 8,
          'Self-Principled': 9,
          'Perseverance': 10
        },
        description: "Pioneering determination and scientific excellence"
      },
      {
        name: "Winston Churchill",
        type: "real" as const,
        traits: {
          'Assertive': 9,
          'Diplomatic': 8,
          'Self-Principled': 9,
          'Direct': 8,
          'Optimistic': 7
        },
        description: "Resilient leadership through adversity"
      },
      {
        name: "Mother Teresa",
        type: "real" as const,
        traits: {
          'Communal Navigate': 10,
          'Self-Principled': 9,
          'Responsive': 9,
          'Social': 8,
          'Self-Aware': 9
        },
        description: "Compassionate service and humanitarian dedication"
      },
      {
        name: "Benjamin Franklin",
        type: "real" as const,
        traits: {
          'Diplomatic': 9,
          'Pragmatic': 9,
          'Analytical': 8,
          'Social': 8,
          'Optimistic': 8
        },
        description: "Practical wisdom and diplomatic innovation"
      },
      {
        name: "Jane Austen",
        type: "real" as const,
        traits: {
          'Analytical': 8,
          'Artistic': 9,
          'Self-Aware': 9,
          'Mixed Communication': 8,
          'Independent': 7
        },
        description: "Keen social observation and literary brilliance"
      },
      {
        name: "Theodore Roosevelt",
        type: "real" as const,
        traits: {
          'Assertive': 9,
          'Optimistic': 9,
          'Direct': 8,
          'Self-Principled': 8,
          'Social': 7
        },
        description: "Energetic leadership and adventurous spirit"
      },
      {
        name: "Steve Jobs",
        type: "real" as const,
        traits: {
          'Assertive': 9,
          'Intuitive': 8,
          'Self-Principled': 9,
          'Direct': 8,
          'Independent': 8
        },
        description: "Visionary innovation and uncompromising standards"
      },
      {
        name: "Oprah Winfrey",
        type: "real" as const,
        traits: {
          'Communal Navigate': 9,
          'Responsive': 8,
          'Optimistic': 9,
          'Social': 9,
          'Self-Aware': 7
        },
        description: "Empathetic leadership and inspirational communication"
      },
      // Fictional Characters
      {
        name: "Sherlock Holmes",
        type: "fictional" as const,
        traits: {
          'Analytical': 10,
          'Independent': 9,
          'Structured': 8,
          'Self-Principled': 7,
          'Direct': 8
        },
        description: "Deductive reasoning and methodical investigation"
      },
      {
        name: "Hermione Granger",
        type: "fictional" as const,
        traits: {
          'Analytical': 9,
          'Self-Mastery': 9,
          'Structured': 8,
          'Lawful': 8,
          'Direct': 7
        },
        description: "Analytical brilliance and disciplined achievement"
      },
      {
        name: "Aragorn",
        type: "fictional" as const,
        traits: {
          'Self-Principled': 9,
          'Diplomatic': 8,
          'Self-Mastery': 8,
          'Lawful': 9,
          'Responsive': 7
        },
        description: "Noble leadership and unwavering duty"
      },
      {
        name: "Tyrion Lannister",
        type: "fictional" as const,
        traits: {
          'Analytical': 8,
          'Diplomatic': 8,
          'Intuitive': 7,
          'Mixed Communication': 7,
          'Pragmatic': 8
        },
        description: "Strategic thinking with emotional intelligence"
      },
      {
        name: "Elizabeth Bennet",
        type: "fictional" as const,
        traits: {
          'Independent': 9,
          'Self-Principled': 8,
          'Mixed Communication': 8,
          'Self-Aware': 8,
          'Direct': 7
        },
        description: "Independent spirit and principled convictions"
      },
      {
        name: "Captain Jean-Luc Picard",
        type: "fictional" as const,
        traits: {
          'Diplomatic': 9,
          'Self-Principled': 9,
          'Analytical': 8,
          'Lawful': 8,
          'Self-Mastery': 8
        },
        description: "Ethical leadership and diplomatic wisdom"
      },
      {
        name: "Yoda",
        type: "fictional" as const,
        traits: {
          'Self-Aware': 10,
          'Self-Mastery': 10,
          'Self-Principled': 9,
          'Responsive': 8,
          'Structured': 7
        },
        description: "Ancient wisdom and patient mentorship"
      },
      {
        name: "Atticus Finch",
        type: "fictional" as const,
        traits: {
          'Self-Principled': 10,
          'Lawful': 9,
          'Diplomatic': 8,
          'Self-Aware': 8,
          'Responsive': 8
        },
        description: "Moral integrity and principled justice"
      }
    ];
    
    // Calculate similarity scores with improved weighting
    const matches = archetypes.map(archetype => {
      let totalWeight = 0;
      let weightedSum = 0;
      
      Object.entries(archetype.traits).forEach(([trait, value]) => {
        const userScore = userScores[trait] || 5;
        const weight = value >= 8 ? 1.2 : 1.0; // Give more weight to defining traits
        const diff = Math.abs(userScore - value);
        const score = Math.max(0, 10 - diff);
        
        weightedSum += score * weight;
        totalWeight += weight;
      });
      
      const similarity = weightedSum / totalWeight;
      const confidence = Math.min(100, similarity * 10);
      
      return { 
        name: archetype.name, 
        type: archetype.type, 
        similarity: similarity / 10, // Normalize to 0-1 range
        description: archetype.description,
        confidence: Math.round(confidence)
      };
    });
    
    // Return top 6 matches (3 real, 3 fictional if possible)
    const sortedMatches = matches.sort((a, b) => b.similarity - a.similarity);
    const realMatches = sortedMatches.filter(m => m.type === 'real').slice(0, 3);
    const fictionalMatches = sortedMatches.filter(m => m.type === 'fictional').slice(0, 3);
    
    // Combine and take top 6 overall
    return [...realMatches, ...fictionalMatches]
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 6);
  }
}