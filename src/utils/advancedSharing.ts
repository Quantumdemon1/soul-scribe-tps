import { PersonalityProfile } from '../types/tps.types';
import { logger } from './structuredLogging';

export interface ShareContent {
  title: string;
  text: string;
  hashtags: string[];
  url?: string;
}

export class AdvancedSharing {
  static generateShareContent(profile: PersonalityProfile, platform: 'general' | 'linkedin' | 'twitter' | 'facebook' = 'general'): ShareContent {
    const baseContent = {
      mbti: profile.mappings.mbti,
      enneagram: profile.mappings.enneagram,
      topDomain: this.getTopDomain(profile),
      topScore: this.getTopDomainScore(profile)
    };

    switch (platform) {
      case 'linkedin':
        return {
          title: 'Professional Personality Assessment Results',
          text: `I just completed a comprehensive Psyforge personality assessment! 🧠

My results show I'm an ${baseContent.mbti} type with ${baseContent.enneagram} Enneagram patterns. My strongest domain is ${baseContent.topDomain} (${baseContent.topScore}/10).

Understanding your personality can unlock better collaboration, leadership, and career alignment. Psyforge maps to multiple systems including MBTI, Enneagram, and Big Five for a complete picture.

#PersonalityAssessment #ProfessionalDevelopment #SelfAwareness #Leadership #CareerGrowth #Psyforge`,
          hashtags: ['PersonalityAssessment', 'ProfessionalDevelopment', 'SelfAwareness', 'Leadership', 'CareerGrowth']
        };

      case 'twitter':
        return {
          title: 'My Psyforge Personality Results',
          text: `Just took the Psyforge personality assessment! 🧠

Results: ${baseContent.mbti} | ${baseContent.enneagram} | ${baseContent.topDomain} domain strongest (${baseContent.topScore}/10)

Love how it maps multiple frameworks together for deeper insights!

#PersonalityTest #SelfAwareness #MBTI #Enneagram`,
          hashtags: ['PersonalityTest', 'SelfAwareness', 'MBTI', 'Enneagram']
        };

      case 'facebook':
        return {
          title: 'Fascinating Personality Assessment Results!',
          text: `I just completed the most comprehensive personality assessment I've ever taken! Psyforge analyzes 36 different traits across 4 major domains.

My results:
🔹 MBTI Type: ${baseContent.mbti}
🔹 Enneagram: ${baseContent.enneagram}
🔹 Strongest Domain: ${baseContent.topDomain} (${baseContent.topScore}/10)

What I love about this assessment is how it connects different personality frameworks - MBTI, Enneagram, Big Five, and even D&D alignment! It's given me some really valuable insights for personal growth and career development.

Anyone else interested in taking a deep dive into understanding their personality? This was definitely eye-opening! 🤔✨`,
          hashtags: ['PersonalityAssessment', 'SelfDiscovery', 'PersonalGrowth']
        };

      default:
        return {
          title: 'My Psyforge Personality Assessment Results',
          text: `I just completed the Psyforge personality assessment! 

My results: ${baseContent.mbti} (MBTI) | ${baseContent.enneagram} (Enneagram) | ${baseContent.topDomain} domain strongest (${baseContent.topScore}/10)

Psyforge provides a comprehensive view by integrating multiple personality systems. Really valuable insights for personal and professional development!

#PersonalityAssessment #SelfAwareness #PersonalDevelopment`,
          hashtags: ['PersonalityAssessment', 'SelfAwareness', 'PersonalDevelopment']
        };
    }
  }

  static async shareToClipboard(profile: PersonalityProfile, platform: 'general' | 'linkedin' | 'twitter' | 'facebook' = 'general'): Promise<boolean> {
    try {
      const content = this.generateShareContent(profile, platform);
      await navigator.clipboard.writeText(content.text);
      return true;
    } catch (error) {
      logger.error('Failed to copy to clipboard', { 
        component: 'AdvancedSharing', 
        action: 'copyToClipboard' 
      }, error);
      return false;
    }
  }

  static async shareViaWebAPI(profile: PersonalityProfile, platform: 'general' | 'linkedin' | 'twitter' | 'facebook' = 'general'): Promise<boolean> {
    if (!navigator.share) return false;
    
    try {
      const content = this.generateShareContent(profile, platform);
      await navigator.share({
        title: content.title,
        text: content.text,
        url: window.location.href
      });
      return true;
    } catch (error) {
      logger.error('Failed to share via Web Share API', { 
        component: 'AdvancedSharing', 
        action: 'shareViaWebAPI' 
      }, error);
      return false;
    }
  }

  static generateSocialMediaUrls(profile: PersonalityProfile) {
    const content = this.generateShareContent(profile);
    const encodedText = encodeURIComponent(content.text);
    const encodedUrl = encodeURIComponent(window.location.href);

    return {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(content.title)}&body=${encodedText}%0A%0A${encodedUrl}`
    };
  }

  static generateQRCode(profile: PersonalityProfile): string {
    // Generate a simple data URL for the profile summary
    const summary = {
      mbti: profile.mappings.mbti,
      enneagram: profile.mappings.enneagram,
      domains: profile.domainScores,
      timestamp: new Date().toISOString()
    };
    
    const dataString = JSON.stringify(summary);
    return `data:text/plain;base64,${btoa(dataString)}`;
  }

  static createShareableImage(profile: PersonalityProfile): string {
    // Create a simple SVG image with the key results
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea"/>
            <stop offset="100%" style="stop-color:#764ba2"/>
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bg)"/>
        <text x="200" y="50" text-anchor="middle" fill="white" font-family="Arial" font-size="20" font-weight="bold">
          Psyforge Results
        </text>
        <text x="200" y="100" text-anchor="middle" fill="white" font-family="Arial" font-size="16">
          MBTI: ${profile.mappings.mbti}
        </text>
        <text x="200" y="130" text-anchor="middle" fill="white" font-family="Arial" font-size="16">
          Enneagram: ${profile.mappings.enneagram}
        </text>
        <text x="200" y="180" text-anchor="middle" fill="white" font-family="Arial" font-size="14">
          Top Domain: ${this.getTopDomain(profile)}
        </text>
        <text x="200" y="210" text-anchor="middle" fill="white" font-family="Arial" font-size="14">
          Score: ${this.getTopDomainScore(profile)}/10
        </text>
        <text x="200" y="260" text-anchor="middle" fill="white" font-family="Arial" font-size="12">
          Psyforge Personality Assessment
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  private static getTopDomain(profile: PersonalityProfile): string {
    return Object.entries(profile.domainScores)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  private static getTopDomainScore(profile: PersonalityProfile): string {
    const topScore = Object.entries(profile.domainScores)
      .sort(([,a], [,b]) => b - a)[0][1];
    return (topScore * 10).toFixed(1);
  }
}