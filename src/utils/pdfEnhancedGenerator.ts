import { PersonalityProfile } from '../types/tps.types';
import { AIInsights } from '../types/llm.types';
import { IntegralDetail } from '@/mappings/integral.enhanced';
import jsPDF from 'jspdf';

export interface EnhancedPDFOptions {
  includeCharts: boolean;
  includeInsights: boolean;
  includeRecommendations: boolean;
  colorScheme: 'professional' | 'modern' | 'minimal';
  logoUrl?: string;
}

export class EnhancedPDFGenerator {
  private pdf: jsPDF;
  private options: EnhancedPDFOptions;
  private currentY: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private margins = { top: 20, right: 20, bottom: 30, left: 20 };

  constructor(options: EnhancedPDFOptions) {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.options = options;
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  async generateReport(
    profile: PersonalityProfile,
    integralDetail?: IntegralDetail,
    aiInsights?: AIInsights
  ): Promise<void> {
    try {
      // Cover page
      this.addCoverPage(profile);
      
      // Executive summary
      this.addNewPage();
      this.addExecutiveSummary(profile);
      
      // Personality breakdown
      this.addNewPage();
      this.addPersonalityBreakdown(profile);
      
      // Integral development (if available)
      if (integralDetail) {
        this.addNewPage();
        this.addIntegralSection(integralDetail);
      }
      
      // AI insights (if available)
      if (aiInsights && this.options.includeInsights) {
        this.addNewPage();
        this.addAIInsights(aiInsights);
      }
      
      // Recommendations
      if (this.options.includeRecommendations) {
        this.addNewPage();
        this.addRecommendations(profile);
      }
      
      // Charts summary
      if (this.options.includeCharts) {
        this.addNewPage();
        this.addChartsSection(profile);
      }
      
      // Save the PDF
      const timestamp = new Date().toISOString().split('T')[0];
      this.pdf.save(`Enhanced-Psyforge-Report-${timestamp}.pdf`);
      
    } catch (error) {
      console.error('Enhanced PDF generation failed:', error);
      throw error;
    }
  }

  private addCoverPage(profile: PersonalityProfile): void {
    const colors = this.getColorScheme();
    
    // Header with gradient effect
    this.pdf.setFillColor(...colors.primary);
    this.pdf.rect(0, 0, this.pageWidth, 60, 'F');
    
    // Title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(28);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Psyforge', this.pageWidth / 2, 25, { align: 'center' });
    
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Enhanced Personality Assessment Report', this.pageWidth / 2, 40, { align: 'center' });
    
    // Reset text color
    this.pdf.setTextColor(...colors.text);
    this.currentY = 80;
    
    // Profile overview card
    this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 80, 'Assessment Overview');
    
    let cardY = this.currentY + 15;
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'normal');
    
    const overviewItems = [
      `Assessment Date: ${new Date().toLocaleDateString()}`,
      `MBTI Type: ${profile.mappings.mbti}`,
      `Enneagram: Type ${profile.mappings.enneagramDetails.type}w${profile.mappings.enneagramDetails.wing}`,
      `Moral Alignment: ${profile.mappings.dndAlignment}`,
      `Holland Code: ${profile.mappings.hollandCode}`,
      `Report Type: Comprehensive Enhanced Analysis`
    ];
    
    overviewItems.forEach(item => {
      this.pdf.text(item, this.margins.left + 10, cardY);
      cardY += 8;
    });
    
    this.currentY += 100;
    
    // Quick insights preview
    this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 60, 'Key Strengths');
    
    const topTraits = Object.entries(profile.traitScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([trait, score]) => `${trait}: ${score.toFixed(1)}/10`);
    
    cardY = this.currentY + 15;
    topTraits.forEach(trait => {
      this.pdf.text(`• ${trait}`, this.margins.left + 10, cardY);
      cardY += 8;
    });
    
    // Footer
    this.addFooter(1);
  }

  private addExecutiveSummary(profile: PersonalityProfile): void {
    this.addSectionHeader('Executive Summary');
    
    // Key findings card
    this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 80, 'Key Findings');
    
    let cardY = this.currentY + 15;
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    const summaryPoints = [
      `Primary personality type identified as ${profile.mappings.mbti} with strong alignment to Enneagram Type ${profile.mappings.enneagramDetails.type}.`,
      `Moral compass aligns with ${profile.mappings.dndAlignment} principles, indicating ${this.getAlignmentDescription(profile.mappings.dndAlignment)}.`,
      `Dominant cognitive strengths in ${this.getTopDomains(profile.domainScores).join(', ')} domains.`,
      `Career compatibility suggests ${profile.mappings.hollandCode} type roles would be most fulfilling.`,
      `Interpersonal style reflects ${profile.mappings.socionics} characteristics with emphasis on structured communication.`
    ];
    
    summaryPoints.forEach(point => {
      const lines = this.pdf.splitTextToSize(point, this.getContentWidth() - 20);
      this.pdf.text(lines, this.margins.left + 10, cardY);
      cardY += lines.length * 4 + 3;
    });
    
    this.currentY += 100;
    
    // Confidence metrics
    this.addProgressBars(profile);
  }

  private addPersonalityBreakdown(profile: PersonalityProfile): void {
    this.addSectionHeader('Detailed Personality Analysis');
    
    // MBTI breakdown
    this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 60, `MBTI Type: ${profile.mappings.mbti}`);
    
    let cardY = this.currentY + 15;
    this.pdf.setFontSize(10);
    this.pdf.text(`Cognitive Functions Profile`, this.margins.left + 10, cardY);
    cardY += 8;
    
    // Add cognitive function explanations
    const mbtiExplanation = this.getMBTIExplanation(profile.mappings.mbti);
    const lines = this.pdf.splitTextToSize(mbtiExplanation, this.getContentWidth() - 20);
    this.pdf.text(lines, this.margins.left + 10, cardY);
    
    this.currentY += 80;
    
    // Enneagram section
    this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 60, 
      `Enneagram Type ${profile.mappings.enneagramDetails.type}w${profile.mappings.enneagramDetails.wing}`);
    
    cardY = this.currentY + 15;
    const enneagramDescription = this.getEnneagramDescription(profile.mappings.enneagramDetails.type);
    const enneagramLines = this.pdf.splitTextToSize(enneagramDescription, this.getContentWidth() - 20);
    this.pdf.text(enneagramLines, this.margins.left + 10, cardY);
    
    this.currentY += 80;
  }

  private addIntegralSection(integralDetail: IntegralDetail): void {
    this.addSectionHeader('Integral Development Level');
    
    const primaryLevel = integralDetail.primaryLevel;
    
    // Primary level card
    this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 100, 
      `Level ${primaryLevel.number}: ${primaryLevel.name} (${primaryLevel.color})`);
    
    let cardY = this.currentY + 15;
    this.pdf.setFontSize(10);
    
    // Level description
    this.pdf.text('Worldview:', this.margins.left + 10, cardY);
    cardY += 6;
    const worldviewLines = this.pdf.splitTextToSize(primaryLevel.worldview, this.getContentWidth() - 20);
    this.pdf.text(worldviewLines, this.margins.left + 15, cardY);
    cardY += worldviewLines.length * 4 + 5;
    
    // Characteristics
    this.pdf.text('Key Characteristics:', this.margins.left + 10, cardY);
    cardY += 6;
    primaryLevel.characteristics.slice(0, 3).forEach(characteristic => {
      this.pdf.text(`• ${characteristic}`, this.margins.left + 15, cardY);
      cardY += 5;
    });
    
    this.currentY += 120;
    
    // Development recommendations
    if (integralDetail.developmentalEdge) {
      this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 50, 'Development Recommendations');
      cardY = this.currentY + 15;
      const edgeLines = this.pdf.splitTextToSize(integralDetail.developmentalEdge, this.getContentWidth() - 20);
      this.pdf.text(edgeLines, this.margins.left + 10, cardY);
      this.currentY += 70;
    }
  }

  private addAIInsights(aiInsights: AIInsights): void {
    this.addSectionHeader('AI-Generated Insights');
    
    // General insights
    if (aiInsights.general) {
      this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 60, 'General Insights');
      
      let cardY = this.currentY + 15;
      this.pdf.setFontSize(10);
      
      const lines = this.pdf.splitTextToSize(aiInsights.general, this.getContentWidth() - 20);
      this.pdf.text(lines, this.margins.left + 10, cardY);
      
      this.currentY += 80;
    }
    
    // Career insights
    if (aiInsights.career) {
      this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 60, 'Career Insights');
      
      let cardY = this.currentY + 15;
      const lines = this.pdf.splitTextToSize(aiInsights.career, this.getContentWidth() - 20);
      this.pdf.text(lines, this.margins.left + 10, cardY);
      
      this.currentY += 80;
    }
    
    // Development insights
    if (aiInsights.development) {
      this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 60, 'Development Insights');
      
      let cardY = this.currentY + 15;
      const lines = this.pdf.splitTextToSize(aiInsights.development, this.getContentWidth() - 20);
      this.pdf.text(lines, this.margins.left + 10, cardY);
      
      this.currentY += 80;
    }
  }

  private addRecommendations(profile: PersonalityProfile): void {
    this.addSectionHeader('Personalized Recommendations');
    
    // Career recommendations
    this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 70, 'Career Development');
    
    let cardY = this.currentY + 15;
    this.pdf.setFontSize(10);
    
    const careerRecs = this.getCareerRecommendations(profile);
    careerRecs.forEach(rec => {
      const lines = this.pdf.splitTextToSize(`• ${rec}`, this.getContentWidth() - 20);
      this.pdf.text(lines, this.margins.left + 10, cardY);
      cardY += lines.length * 4 + 3;
    });
    
    this.currentY += 90;
    
    // Personal development
    this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 70, 'Personal Growth Areas');
    
    cardY = this.currentY + 15;
    const growthAreas = this.getGrowthAreas(profile);
    growthAreas.forEach(area => {
      const lines = this.pdf.splitTextToSize(`• ${area}`, this.getContentWidth() - 20);
      this.pdf.text(lines, this.margins.left + 10, cardY);
      cardY += lines.length * 4 + 3;
    });
    
    this.currentY += 90;
  }

  private addChartsSection(profile: PersonalityProfile): void {
    this.addSectionHeader('Visual Analysis');
    
    // Domain scores chart
    this.addSimpleBarChart(profile.domainScores, 'Domain Strengths', this.currentY);
    this.currentY += 100;
    
    // Trait scores chart
    const topTraits = Object.entries(profile.traitScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    
    this.addSimpleBarChart(topTraits, 'Top Personality Traits', this.currentY);
  }

  // Helper methods
  private addSectionHeader(title: string): void {
    const colors = this.getColorScheme();
    
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(...colors.text);
    this.pdf.text(title, this.margins.left, this.currentY);
    
    // Underline
    const textWidth = this.pdf.getTextWidth(title);
    this.pdf.setDrawColor(...colors.primary);
    this.pdf.setLineWidth(2);
    this.pdf.line(this.margins.left, this.currentY + 2, this.margins.left + textWidth, this.currentY + 2);
    
    this.currentY += 15;
  }

  private addCard(x: number, y: number, width: number, height: number, title?: string): void {
    const colors = this.getColorScheme();
    
    // Shadow
    this.pdf.setFillColor(0, 0, 0);
    this.pdf.setGState(this.pdf.GState({ opacity: 0.1 }));
    this.pdf.rect(x + 1, y + 1, width, height, 'F');
    this.pdf.setGState(this.pdf.GState({ opacity: 1 }));
    
    // Card background
    this.pdf.setFillColor(...colors.surface);
    this.pdf.setDrawColor(...colors.border);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(x, y, width, height, 'FD');
    
    // Title
    if (title) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(...colors.text);
      this.pdf.text(title, x + 8, y + 12);
    }
  }

  private addProgressBars(profile: PersonalityProfile): void {
    this.addCard(this.margins.left, this.currentY, this.getContentWidth(), 80, 'Assessment Confidence Metrics');
    
    const colors = this.getColorScheme();
    let barY = this.currentY + 20;
    
    Object.entries(profile.domainScores).forEach(([domain, score]) => {
      // Label
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(domain, this.margins.left + 10, barY);
      this.pdf.text(`${score.toFixed(1)}/10`, this.margins.left + this.getContentWidth() - 30, barY);
      
      // Progress bar
      const barWidth = this.getContentWidth() - 60;
      const progressWidth = (score / 10) * barWidth;
      
      // Background
      this.pdf.setFillColor(...colors.border);
      this.pdf.rect(this.margins.left + 10, barY + 2, barWidth, 6, 'F');
      
      // Progress
      this.pdf.setFillColor(...colors.primary);
      this.pdf.rect(this.margins.left + 10, barY + 2, progressWidth, 6, 'F');
      
      barY += 12;
    });
    
    this.currentY += 100;
  }

  private addSimpleBarChart(data: Record<string, number>, title: string, y: number): void {
    this.addCard(this.margins.left, y, this.getContentWidth(), 80, title);
    
    const colors = this.getColorScheme();
    const chartY = y + 20;
    const chartWidth = this.getContentWidth() - 40;
    const chartHeight = 50;
    const maxValue = Math.max(...Object.values(data));
    
    let x = this.margins.left + 20;
    const barWidth = chartWidth / Object.keys(data).length - 5;
    
    Object.entries(data).forEach(([key, value]) => {
      const barHeight = (value / maxValue) * chartHeight;
      
      // Bar
      this.pdf.setFillColor(...colors.primary);
      this.pdf.rect(x, chartY + chartHeight - barHeight, barWidth, barHeight, 'F');
      
      // Label
      this.pdf.setFontSize(7);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(...colors.text);
      const label = key.length > 8 ? key.substring(0, 8) + '...' : key;
      this.pdf.text(label, x + barWidth/2, chartY + chartHeight + 8, { align: 'center' });
      
      // Value
      this.pdf.text(value.toFixed(1), x + barWidth/2, chartY + chartHeight - barHeight - 2, { align: 'center' });
      
      x += barWidth + 5;
    });
  }

  private addNewPage(): void {
    this.pdf.addPage();
    this.currentY = this.margins.top;
    this.addFooter(this.pdf.internal.pages.length - 1);
  }

  private addFooter(pageNumber: number): void {
    const colors = this.getColorScheme();
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(...colors.textLight);
    
    this.pdf.text(
      `Psyforge Enhanced Report - Generated ${new Date().toLocaleDateString()}`,
      this.margins.left,
      this.pageHeight - 10
    );
    
    this.pdf.text(
      `Page ${pageNumber}`,
      this.pageWidth - this.margins.right,
      this.pageHeight - 10,
      { align: 'right' }
    );
  }

  private getContentWidth(): number {
    return this.pageWidth - this.margins.left - this.margins.right;
  }

  private getColorScheme() {
    const schemes = {
      professional: {
        primary: [59, 130, 246] as [number, number, number],
        secondary: [30, 64, 175] as [number, number, number],
        text: [17, 24, 39] as [number, number, number],
        textLight: [107, 114, 128] as [number, number, number],
        surface: [248, 250, 252] as [number, number, number],
        border: [226, 232, 240] as [number, number, number]
      },
      modern: {
        primary: [139, 92, 246] as [number, number, number],
        secondary: [124, 58, 237] as [number, number, number],
        text: [15, 23, 42] as [number, number, number],
        textLight: [100, 116, 139] as [number, number, number],
        surface: [251, 251, 254] as [number, number, number],
        border: [203, 213, 225] as [number, number, number]
      },
      minimal: {
        primary: [75, 85, 99] as [number, number, number],
        secondary: [55, 65, 81] as [number, number, number],
        text: [31, 41, 55] as [number, number, number],
        textLight: [107, 114, 128] as [number, number, number],
        surface: [249, 250, 251] as [number, number, number],
        border: [229, 231, 235] as [number, number, number]
      }
    };
    
    return schemes[this.options.colorScheme] || schemes.professional;
  }

  private getTopDomains(domainScores: Record<string, number>): string[] {
    return Object.entries(domainScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([domain]) => domain);
  }

  private getAlignmentDescription(alignment: string): string {
    const descriptions: Record<string, string> = {
      'Lawful Good': 'strong ethical principles and commitment to justice',
      'Neutral Good': 'balanced approach to helping others',
      'Chaotic Good': 'flexible morality focused on individual freedom',
      'Lawful Neutral': 'respect for order and systematic approaches',
      'True Neutral': 'balanced and adaptable worldview',
      'Chaotic Neutral': 'independence and spontaneous decision-making',
      'Lawful Evil': 'structured approach to achieving personal goals',
      'Neutral Evil': 'pragmatic focus on self-interest',
      'Chaotic Evil': 'unpredictable and self-centered behavior'
    };
    return descriptions[alignment] || 'unique moral perspective';
  }

  private getMBTIExplanation(mbti: string): string {
    // Simplified explanations for PDF space
    const explanations: Record<string, string> = {
      'INTJ': 'Strategic thinker with natural drive for implementing ideas. Values competence and independence.',
      'INTP': 'Analytical problem-solver who seeks to understand theories and abstractions.',
      'ENTJ': 'Natural leader who thrives on organizing and directing activities toward goals.',
      'ENTP': 'Creative innovator who sees possibilities and enjoys intellectual challenges.',
      'INFJ': 'Insightful idealist with strong personal values and concern for human potential.',
      'INFP': 'Flexible dreamer who is highly attuned to values and seeks meaningful work.',
      'ENFJ': 'Charismatic motivator who is highly attuned to others\' emotions and needs.',
      'ENFP': 'Enthusiastic inspirer who sees life as full of possibilities and connections.',
      'ISTJ': 'Practical organizer who values stability, tradition, and systematic approaches.',
      'ISFJ': 'Caring protector who is highly attuned to others\' needs and feelings.',
      'ESTJ': 'Efficient organizer who values productivity, tradition, and clear structure.',
      'ESFJ': 'Supportive contributor who values harmony and helps others reach their potential.',
      'ISTP': 'Practical problem-solver who enjoys hands-on work and troubleshooting.',
      'ISFP': 'Gentle caretaker who values personal freedom and artistic expression.',
      'ESTP': 'Energetic problem-solver who thrives on action and social interaction.',
      'ESFP': 'Enthusiastic teammate who brings energy and enjoyment to group activities.'
    };
    return explanations[mbti] || 'Unique cognitive function combination.';
  }

  private getEnneagramDescription(type: number): string {
    const descriptions: Record<number, string> = {
      1: 'The Perfectionist: Principled, purposeful, self-controlled, and perfectionistic.',
      2: 'The Helper: Generous, demonstrative, people-pleasing, and possessive.',
      3: 'The Achiever: Adaptive, excelling, driven, and image-conscious.',
      4: 'The Individualist: Expressive, dramatic, self-absorbed, and temperamental.',
      5: 'The Investigator: Perceptive, innovative, secretive, and isolated.',
      6: 'The Loyalist: Engaging, responsible, anxious, and suspicious.',
      7: 'The Enthusiast: Spontaneous, versatile, acquisitive, and scattered.',
      8: 'The Challenger: Self-confident, decisive, willful, and confrontational.',
      9: 'The Peacemaker: Receptive, reassuring, complacent, and resigned.'
    };
    return descriptions[type] || 'Unique personality pattern.';
  }

  private getCareerRecommendations(profile: PersonalityProfile): string[] {
    // Generate career recommendations based on the personality profile
    const hollandTypes: Record<string, string[]> = {
      'R': ['Engineer', 'Technician', 'Mechanic', 'Pilot'],
      'I': ['Scientist', 'Researcher', 'Analyst', 'Data Scientist'],
      'A': ['Designer', 'Artist', 'Writer', 'Creative Director'],
      'S': ['Teacher', 'Counselor', 'Healthcare Worker', 'Social Worker'],
      'E': ['Manager', 'Sales Representative', 'Entrepreneur', 'Executive'],
      'C': ['Accountant', 'Administrator', 'Project Manager', 'Analyst']
    };
    
    const primaryCode = profile.mappings.hollandCode.charAt(0);
    return hollandTypes[primaryCode] || ['Explore careers matching your unique interests'];
  }

  private getGrowthAreas(profile: PersonalityProfile): string[] {
    // Identify potential growth areas based on lower domain scores
    const weakestDomains = Object.entries(profile.domainScores)
      .sort(([,a], [,b]) => a - b)
      .slice(0, 2);
    
    const growthSuggestions: Record<string, string[]> = {
      'External': ['Practice assertiveness', 'Develop leadership skills', 'Enhance networking abilities'],
      'Internal': ['Build self-awareness', 'Develop emotional regulation', 'Practice mindfulness'],
      'Interpersonal': ['Improve communication skills', 'Build empathy', 'Enhance conflict resolution'],
      'Processing': ['Develop analytical thinking', 'Improve decision-making', 'Enhance creativity']
    };
    
    return weakestDomains.flatMap(([domain]) => 
      growthSuggestions[domain] || [`Strengthen ${domain.toLowerCase()} capabilities`]
    ).slice(0, 4);
  }
}