import { TPSScores, DominantTraits, PersonalityProfile } from '../types/tps.types';

export class TPSScoring {
  private static readonly TRAIT_MAPPINGS = {
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

  private static readonly DOMAINS = {
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
    
    for (const [trait, indices] of Object.entries(this.TRAIT_MAPPINGS)) {
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
    const traitScores = this.calculateTraitScores(responses);
    const dominantTraits = this.calculateDominantTraits(traitScores);
    const domainScores = this.calculateDomainScores(traitScores);
    const mappings = this.mapToOtherFrameworks(dominantTraits, traitScores);

    return {
      dominantTraits,
      traitScores,
      domainScores,
      mappings,
      timestamp: new Date().toISOString()
    };
  }

  private static mapToOtherFrameworks(dominantTraits: DominantTraits, traitScores: TPSScores) {
    return {
      mbti: this.calculateMBTI(dominantTraits, traitScores),
      enneagram: this.calculateEnneagram(dominantTraits, traitScores),
      bigFive: this.calculateBigFive(traitScores),
      dndAlignment: this.calculateAlignment(dominantTraits)
    };
  }

  private static calculateMBTI(dominantTraits: DominantTraits, scores: TPSScores): string {
    let mbti = '';
    
    const communalScore = scores['Communal Navigate'] || 0;
    const dynamicScore = scores['Dynamic'] || 0;
    mbti += (communalScore + dynamicScore) / 2 > 5 ? 'E' : 'I';
    
    const intuitiveScore = scores['Intuitive'] || 0;
    const universalScore = scores['Universal'] || 0;
    mbti += (intuitiveScore + universalScore) / 2 > 5 ? 'N' : 'S';
    
    const stoicScore = scores['Stoic'] || 0;
    const directScore = scores['Direct'] || 0;
    mbti += (stoicScore + directScore) / 2 > 5 ? 'T' : 'F';
    
    const structuredScore = scores['Structured'] || 0;
    const lawfulScore = scores['Lawful'] || 0;
    mbti += (structuredScore + lawfulScore) / 2 > 5 ? 'J' : 'P';
    
    return mbti;
  }

  private static calculateEnneagram(dominantTraits: DominantTraits, scores: TPSScores): string {
    const mappings = {
      1: ['Self-Mastery', 'Lawful', 'Structured'],
      2: ['Communal Navigate', 'Diplomatic', 'Responsive'],
      3: ['Assertive', 'Extrinsic', 'Pragmatic'],
      4: ['Self-Aware', 'Intuitive', 'Independent'],
      5: ['Analytical', 'Independent Navigate', 'Intrinsic'],
      6: ['Ambivalent', 'Pessimistic', 'Lawful'],
      7: ['Dynamic', 'Optimistic', 'Self-Indulgent'],
      8: ['Assertive', 'Direct', 'Independent'],
      9: ['Passive', 'Ambivalent', 'Optimistic']
    };
    
    let highestScore = 0;
    let enneagramType = 1;
    
    for (const [type, traits] of Object.entries(mappings)) {
      const avgScore = traits.reduce((sum, trait) => 
        sum + (scores[trait] || 0), 0) / traits.length;
      
      if (avgScore > highestScore) {
        highestScore = avgScore;
        enneagramType = parseInt(type);
      }
    }
    
    return `Type ${enneagramType}`;
  }

  private static calculateBigFive(scores: TPSScores): Record<string, number> {
    return {
      Openness: ((scores['Intuitive'] || 0) + (scores['Universal'] || 0) + (scores['Self-Aware'] || 0)) / 3,
      Conscientiousness: ((scores['Structured'] || 0) + (scores['Self-Mastery'] || 0) + (scores['Lawful'] || 0)) / 3,
      Extraversion: ((scores['Assertive'] || 0) + (scores['Dynamic'] || 0) + (scores['Communal Navigate'] || 0)) / 3,
      Agreeableness: ((scores['Diplomatic'] || 0) + (scores['Passive'] || 0) + (scores['Responsive'] || 0)) / 3,
      Neuroticism: ((scores['Turbulent'] || 0) + (scores['Pessimistic'] || 0) + (scores['Self-Indulgent'] || 0)) / 3
    };
  }

  private static calculateAlignment(dominantTraits: DominantTraits): string {
    let ethical = '';
    let moral = '';
    
    if (dominantTraits['External-Design'] === 'Lawful') ethical = 'Lawful';
    else if (dominantTraits['External-Design'] === 'Self-Principled') ethical = 'Chaotic';
    else ethical = 'Neutral';
    
    if (dominantTraits['Internal-Behavior'] === 'Optimistic' && 
        dominantTraits['Interpersonal-Navigate'] === 'Communal Navigate') {
      moral = 'Good';
    } else if (dominantTraits['Internal-Self-Focus'] === 'Self-Indulgent') {
      moral = 'Evil';
    } else {
      moral = 'Neutral';
    }
    
    return `${ethical} ${moral}`;
  }
}