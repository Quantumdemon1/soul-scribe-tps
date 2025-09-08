import { EnhancedPDFGenerator, EnhancedPDFOptions } from './pdfEnhancedGenerator';
import { PersonalityProfile } from '@/types/tps.types';
import { AIInsights } from '@/types/llm.types';
import { IntegralDetail } from '@/mappings/integral.enhanced';
import { logger } from './structuredLogging';

export interface MobilePDFOptions extends EnhancedPDFOptions {
  optimizeForMobile: boolean;
  reduceImageQuality: boolean;
  compactLayout: boolean;
}

export class MobilePDFGenerator extends EnhancedPDFGenerator {
  private mobileOptions: MobilePDFOptions;
  private isMobile: boolean;

  constructor(options: MobilePDFOptions) {
    super(options);
    this.mobileOptions = options;
    this.isMobile = this.detectMobile();
    
    logger.info('Mobile PDF Generator initialized', {
      component: 'MobilePDFGenerator',
      action: 'initialize',
      metadata: { isMobile: this.isMobile, options }
    });
  }

  private detectMobile(): boolean {
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  async generateMobileOptimizedReport(
    profile: PersonalityProfile,
    integralDetail?: IntegralDetail,
    aiInsights?: AIInsights
  ): Promise<void> {
    const startTime = performance.now();
    
    try {
      logger.info('Starting mobile-optimized PDF generation', {
        component: 'MobilePDFGenerator',
        action: 'generateReport',
        metadata: { isMobile: this.isMobile, hasIntegral: !!integralDetail }
      });

      if (this.isMobile && this.mobileOptions.optimizeForMobile) {
        await this.generateCompactReport(profile, integralDetail, aiInsights);
      } else {
        await this.generateReport(profile, integralDetail, aiInsights);
      }

      const duration = performance.now() - startTime;
      logger.performance('PDF generation', duration, {
        type: this.isMobile ? 'mobile-optimized' : 'standard',
        success: true
      });

    } catch (error) {
      const duration = performance.now() - startTime;
      logger.error('Mobile PDF generation failed', {
        component: 'MobilePDFGenerator',
        action: 'generateReport',
        metadata: { duration, isMobile: this.isMobile }
      }, error as Error);
      
      throw error;
    }
  }

  private async generateCompactReport(
    profile: PersonalityProfile,
    integralDetail?: IntegralDetail,
    aiInsights?: AIInsights
  ): Promise<void> {
    try {
      // Compact cover page
      this.addCompactCoverPage(profile);
      
      // Combined personality overview (MBTI + Enneagram on same page)
      this.addCompactPersonalityOverview(profile);
      
      // Integral section (if available)
      if (integralDetail) {
        this.addCompactIntegralSection(integralDetail);
      }
      
      // Key insights only (condensed AI insights)
      if (aiInsights && this.mobileOptions.includeInsights) {
        this.addCompactInsights(aiInsights);
      }
      
      // Essential recommendations
      if (this.mobileOptions.includeRecommendations) {
        this.addCompactRecommendations(profile);
      }
      
      // Save with mobile identifier
      const timestamp = new Date().toISOString().split('T')[0];
      (this as any).pdf.save(`Psyforge-Mobile-Report-${timestamp}.pdf`);
      
    } catch (error) {
      logger.error('Compact PDF generation failed', {
        component: 'MobilePDFGenerator',
        action: 'generateCompactReport'
      }, error as Error);
      throw error;
    }
  }

  private addCompactCoverPage(profile: PersonalityProfile): void {
    const colors = (this as any).getColorScheme();
    
    // Smaller header for mobile
    (this as any).pdf.setFillColor(...colors.primary);
    (this as any).pdf.rect(0, 0, (this as any).pageWidth, 40, 'F');
    
    // Compact title
    (this as any).pdf.setTextColor(255, 255, 255);
    (this as any).pdf.setFontSize(20);
    (this as any).pdf.setFont('helvetica', 'bold');
    (this as any).pdf.text('Psyforge Mobile Report', (this as any).pageWidth / 2, 20, { align: 'center' });
    
    (this as any).pdf.setFontSize(12);
    (this as any).pdf.text('Personality Assessment', (this as any).pageWidth / 2, 30, { align: 'center' });
    
    (this as any).pdf.setTextColor(...colors.text);
    (this as any).currentY = 50;
    
    // Compact overview
    (this as any).addCard((this as any).margins.left, (this as any).currentY, (this as any).getContentWidth(), 60, 'Quick Overview');
    
    let cardY = (this as any).currentY + 15;
    (this as any).pdf.setFontSize(9);
    
    const compactItems = [
      `${profile.mappings.mbti} • Type ${profile.mappings.enneagramDetails.type}w${profile.mappings.enneagramDetails.wing}`,
      `${profile.mappings.dndAlignment} • ${profile.mappings.hollandCode}`,
      `Generated: ${new Date().toLocaleDateString()}`
    ];
    
    compactItems.forEach(item => {
      (this as any).pdf.text(item, (this as any).margins.left + 10, cardY);
      cardY += 10;
    });
    
    (this as any).currentY += 80;
  }

  private addCompactPersonalityOverview(profile: PersonalityProfile): void {
    (this as any).addSectionHeader('Personality Overview');
    
    // MBTI section (compact)
    (this as any).addCard((this as any).margins.left, (this as any).currentY, (this as any).getContentWidth(), 40, 
      `MBTI: ${profile.mappings.mbti}`);
    
    let cardY = (this as any).currentY + 15;
    (this as any).pdf.setFontSize(9);
    const mbtiSummary = this.getCompactMBTIDescription(profile.mappings.mbti);
    const mbtiLines = (this as any).pdf.splitTextToSize(mbtiSummary, (this as any).getContentWidth() - 20);
    (this as any).pdf.text(mbtiLines, (this as any).margins.left + 10, cardY);
    
    (this as any).currentY += 50;
    
    // Enneagram section (compact)
    (this as any).addCard((this as any).margins.left, (this as any).currentY, (this as any).getContentWidth(), 40, 
      `Enneagram: Type ${profile.mappings.enneagramDetails.type}w${profile.mappings.enneagramDetails.wing}`);
    
    cardY = (this as any).currentY + 15;
    const enneagramSummary = this.getCompactEnneagramDescription(profile.mappings.enneagramDetails.type);
    const enneagramLines = (this as any).pdf.splitTextToSize(enneagramSummary, (this as any).getContentWidth() - 20);
    (this as any).pdf.text(enneagramLines, (this as any).margins.left + 10, cardY);
    
    (this as any).currentY += 60;
  }

  private addCompactIntegralSection(integralDetail: IntegralDetail): void {
    const primaryLevel = integralDetail.primaryLevel;
    
    (this as any).addCard((this as any).margins.left, (this as any).currentY, (this as any).getContentWidth(), 50, 
      `Integral Level ${primaryLevel.number}: ${primaryLevel.color}`);
    
    let cardY = (this as any).currentY + 15;
    (this as any).pdf.setFontSize(9);
    
    // Compact worldview description
    const compactWorldview = primaryLevel.worldview.substring(0, 150) + '...';
    const worldviewLines = (this as any).pdf.splitTextToSize(compactWorldview, (this as any).getContentWidth() - 20);
    (this as any).pdf.text(worldviewLines, (this as any).margins.left + 10, cardY);
    
    (this as any).currentY += 70;
  }

  private addCompactInsights(aiInsights: AIInsights): void {
    (this as any).addSectionHeader('Key Insights');
    
    const insights = [
      { title: 'Overview', content: aiInsights.general },
      { title: 'Career', content: aiInsights.career },
      { title: 'Development', content: aiInsights.development }
    ].filter(insight => insight.content);

    insights.forEach(insight => {
      (this as any).addCard((this as any).margins.left, (this as any).currentY, (this as any).getContentWidth(), 35, insight.title);
      
      let cardY = (this as any).currentY + 15;
      (this as any).pdf.setFontSize(8);
      
      // Truncate for mobile
      const truncatedContent = insight.content.substring(0, 120) + '...';
      const lines = (this as any).pdf.splitTextToSize(truncatedContent, (this as any).getContentWidth() - 20);
      (this as any).pdf.text(lines, (this as any).margins.left + 10, cardY);
      
      (this as any).currentY += 45;
    });
  }

  private addCompactRecommendations(profile: PersonalityProfile): void {
    if ((this as any).currentY > 200) {
      (this as any).addNewPage();
    }
    
    (this as any).addSectionHeader('Key Recommendations');
    
    (this as any).addCard((this as any).margins.left, (this as any).currentY, (this as any).getContentWidth(), 60, 'Development Focus');
    
    let cardY = (this as any).currentY + 15;
    (this as any).pdf.setFontSize(9);
    
    const compactRecs = this.getCompactRecommendations(profile);
    compactRecs.forEach(rec => {
      (this as any).pdf.text(`• ${rec}`, (this as any).margins.left + 10, cardY);
      cardY += 8;
    });
    
    (this as any).currentY += 80;
  }

  private getCompactMBTIDescription(mbti: string): string {
    const descriptions: Record<string, string> = {
      'INTJ': 'Strategic, independent, decisive. Natural system-builders.',
      'INTP': 'Logical, innovative, flexible. Love theoretical concepts.',
      'ENTJ': 'Natural leaders, strategic, efficient, organized.',
      'ENTP': 'Quick, ingenious, stimulating, versatile.',
      'INFJ': 'Insightful, creative, inspiring, decisive when needed.',
      'INFP': 'Idealistic, loyal, values-driven, adaptable.',
      'ENFJ': 'Warm, empathetic, inspiring, natural teachers.',
      'ENFP': 'Enthusiastic, creative, spontaneous, people-focused.',
      'ISTJ': 'Practical, fact-minded, reliable, responsible.',
      'ISFJ': 'Warm, considerate, gentle, loyal supporters.',
      'ESTJ': 'Practical, realistic, systematic, matter-of-fact.',
      'ESFJ': 'Cooperative, helpful, popular, active.',
      'ISTP': 'Tolerant, flexible, quiet observers, practical.',
      'ISFP': 'Quiet, friendly, sensitive, kind artists.',
      'ESTP': 'Flexible, tolerant, pragmatic, energetic.',
      'ESFP': 'Outgoing, friendly, spontaneous, enthusiastic.'
    };
    
    return descriptions[mbti] || 'Unique personality type with distinct strengths.';
  }

  private getCompactEnneagramDescription(type: number): string {
    const descriptions: Record<number, string> = {
      1: 'Perfectionist - principled, purposeful, self-controlled.',
      2: 'Helper - caring, interpersonal, generous, people-pleasing.',
      3: 'Achiever - success-oriented, pragmatic, driven, image-conscious.',
      4: 'Individualist - creative, sensitive, moody, self-aware.',
      5: 'Investigator - intense, cerebral, perceptive, innovative.',
      6: 'Loyalist - responsible, anxious, suspicious, cautious.',
      7: 'Enthusiast - spontaneous, versatile, scattered, optimistic.',
      8: 'Challenger - powerful, dominating, self-confident, confrontational.',
      9: 'Peacemaker - easygoing, reassuring, complacent, agreeable.'
    };
    
    return descriptions[type] || 'Unique enneagram type with distinct motivations.';
  }

  private getCompactRecommendations(profile: PersonalityProfile): string[] {
    const mbti = profile.mappings.mbti;
    const topDomains = Object.entries(profile.domainScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([domain]) => domain);

    return [
      `Leverage your ${mbti} strengths in leadership and decision-making`,
      `Focus development in ${topDomains.join(' and ')} areas`,
      `Consider careers that match your ${profile.mappings.hollandCode} interests`,
      `Practice mindfulness to balance analytical and emotional processing`
    ];
  }
}

// Utility function for easy mobile PDF generation
export const generateMobilePDF = async (
  profile: PersonalityProfile,
  integralDetail?: IntegralDetail,
  aiInsights?: AIInsights,
  options: Partial<MobilePDFOptions> = {}
): Promise<void> => {
  const defaultOptions: MobilePDFOptions = {
    includeCharts: true,
    includeInsights: true,
    includeRecommendations: true,
    colorScheme: 'professional',
    optimizeForMobile: true,
    reduceImageQuality: true,
    compactLayout: true,
    ...options
  };

  const generator = new MobilePDFGenerator(defaultOptions);
  await generator.generateMobileOptimizedReport(profile, integralDetail, aiInsights);
};