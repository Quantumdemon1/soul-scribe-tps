import { IntegralDetail } from '../mappings/integral.enhanced';
import { PersonalityProfile } from '../types/tps.types';
import { PersonalityIntegration } from '../services/integralPersonalityService';
import { PDFStyling, defaultTheme } from './pdfStyling';
import { PDFChartGenerator } from './pdfCharts';
import jsPDF from 'jspdf';
import { logger } from './structuredLogging';

interface IntegralPDFSection {
  title: string;
  content: IntegralPDFContentItem[];
  pageBreak?: boolean;
}

interface IntegralPDFContentItem {
  type: 'text' | 'level-card' | 'insights-card' | 'development-card' | 'chart' | 'triad' | 'confidence';
  data: any;
}

export class IntegralPDFGenerator {
  static async generateIntegralPDFReport(
    integralDetail: IntegralDetail,
    personalityProfile?: PersonalityProfile | null,
    personalityIntegration?: PersonalityIntegration | null
  ): Promise<void> {
    try {
      logger.info('Starting Integral PDF generation', { component: 'integralPdfGenerator' });
      
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const styling = new PDFStyling(pdf, defaultTheme);
      const chartGenerator = new PDFChartGenerator(pdf);
      
      // Generate sections
      const sections = this.generateIntegralSections(integralDetail, personalityProfile, personalityIntegration);
      const totalPages = this.estimatePageCount(sections);
      
      let currentPage = 1;
      let currentY = 20;
      
      // Add cover page
      currentY = this.addIntegralCoverPage(pdf, styling, integralDetail, currentPage, totalPages, personalityProfile);
      
      // Process each section
      for (const section of sections) {
        // Check if we need a new page
        if (section.pageBreak || styling.checkPageBreak(currentY, 50)) {
          currentPage++;
          currentY = styling.addNewPage(currentPage, totalPages);
        }
        
        // Add section header
        currentY = styling.addSectionHeader(section.title, styling.margins.left, currentY, 1);
        currentY += 5;
        
        // Process section content
        currentY = await this.processIntegralSectionContent(
          section,
          pdf,
          styling,
          chartGenerator,
          currentY,
          () => {
            currentPage++;
            return styling.addNewPage(currentPage, totalPages);
          }
        );
        
        currentY += 10;
      }
      
      // Add final footer
      styling.addFooter(currentPage, totalPages);
      
      // Save the PDF
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`Integral-Level-Assessment-${timestamp}.pdf`);
      
      logger.info('Integral PDF generation completed successfully', { component: 'integralPdfGenerator' });
      
    } catch (error) {
      logger.error('Error generating Integral PDF', { component: 'integralPdfGenerator' }, error as Error);
      // Fallback to simple HTML download
      this.generateIntegralHTMLReport(integralDetail, personalityProfile || null);
    }
  }

  private static generateIntegralSections(
    integralDetail: IntegralDetail,
    personalityProfile?: PersonalityProfile | null,
    personalityIntegration?: PersonalityIntegration | null
  ): IntegralPDFSection[] {
    const sections: IntegralPDFSection[] = [
      this.generateLevelOverview(integralDetail),
      this.generateRealityTriadAnalysis(integralDetail),
      this.generateConfidenceAnalysis(integralDetail),
      this.generateDevelopmentPath(integralDetail)
    ];

    if (personalityProfile && personalityIntegration) {
      sections.push(this.generatePersonalityIntegration(personalityIntegration));
    }

    sections.push(this.generateActionPlan(integralDetail));

    return sections;
  }

  private static generateLevelOverview(integralDetail: IntegralDetail): IntegralPDFSection {
    const levelColors = this.getLevelColors();
    const primaryColor = levelColors[integralDetail.primaryLevel.number] || '#666666';

    return {
      title: 'Integral Level Overview',
      content: [
        {
          type: 'level-card',
          data: {
            title: `Your Primary Level: ${integralDetail.primaryLevel.name}`,
            number: integralDetail.primaryLevel.number,
            color: primaryColor,
            cognitiveStage: integralDetail.primaryLevel.cognitiveStage,
            confidence: integralDetail.confidence,
            complexity: integralDetail.cognitiveComplexity,
            worldview: integralDetail.primaryLevel.worldview,
            thinkingPattern: integralDetail.primaryLevel.thinkingPattern,
            developmentEdge: integralDetail.developmentalEdge
          }
        },
        {
          type: 'text',
          data: {
            title: 'Secondary Level Influence',
            content: integralDetail.secondaryLevel 
              ? `Your secondary level is ${integralDetail.secondaryLevel.name} (Level ${integralDetail.secondaryLevel.number}), which provides additional depth and nuance to your developmental profile. This combination creates a unique perspective that draws from multiple ways of understanding the world.`
              : 'No significant secondary level detected. Your development appears to be strongly centered in your primary level.'
          }
        }
      ]
    };
  }

  private static generateRealityTriadAnalysis(integralDetail: IntegralDetail): IntegralPDFSection {
    return {
      title: 'Reality Triad Analysis',
      content: [
        {
          type: 'text',
          data: {
            title: 'Understanding Your Reality Orientation',
            content: 'The Reality Triad represents three fundamental perspectives through which we engage with reality: Physical (objective individual), Social (intersubjective), and Universal (objective collective). Your orientation across these domains influences how you perceive and interact with the world.'
          }
        },
        {
          type: 'triad',
          data: {
            title: 'Your Reality Triad Scores',
            physical: integralDetail.realityTriadMapping.physical,
            social: integralDetail.realityTriadMapping.social,
            universal: integralDetail.realityTriadMapping.universal,
            descriptions: {
              physical: 'Your orientation toward individual, concrete, and empirical aspects of reality',
              social: 'Your attunement to collective meaning-making and cultural perspectives',
              universal: 'Your connection to systemic, abstract, and universal principles'
            }
          }
        }
      ]
    };
  }

  private static generateConfidenceAnalysis(integralDetail: IntegralDetail): IntegralPDFSection {
    const confidenceLevel = integralDetail.confidence >= 80 ? 'High' : 
                           integralDetail.confidence >= 60 ? 'Moderate' : 'Low';
    
    return {
      title: 'Assessment Confidence & Clarity',
      content: [
        {
          type: 'confidence',
          data: {
            title: `Confidence Level: ${confidenceLevel} (${integralDetail.confidence.toFixed(1)}%)`,
            confidence: integralDetail.confidence,
            description: this.getConfidenceDescription(integralDetail.confidence)
          }
        }
      ]
    };
  }

  private static generateDevelopmentPath(integralDetail: IntegralDetail): IntegralPDFSection {
    return {
      title: 'Development Path & Growth Edges',
      pageBreak: true,
      content: [
        {
          type: 'development-card',
          data: {
            title: 'Your Development Edge',
            edge: integralDetail.developmentalEdge,
            currentCapacities: [integralDetail.primaryLevel.thinkingPattern],
            emergingCapacities: integralDetail.secondaryLevel ? [integralDetail.secondaryLevel.thinkingPattern] : [],
            growthRecommendations: this.generateGrowthRecommendations(integralDetail)
          }
        }
      ]
    };
  }

  private static generatePersonalityIntegration(integration: PersonalityIntegration): IntegralPDFSection {
    return {
      title: 'Personality-Integral Integration',
      pageBreak: true,
      content: [
        {
          type: 'insights-card',
          data: {
            title: 'How Your Personality Expresses at Your Level',
            insights: integration.integrationInsights,
            recommendations: integration.developmentRecommendations,
            manifestations: integration.levelSpecificManifestations
          }
        }
      ]
    };
  }

  private static generateActionPlan(integralDetail: IntegralDetail): IntegralPDFSection {
    return {
      title: 'Personal Development Action Plan',
      content: [
        {
          type: 'text',
          data: {
            title: 'Next Steps for Growth',
            content: 'Based on your integral assessment, here are specific actions you can take to support your continued development and leverage your current capacities while growing into new ones.'
          }
        }
      ]
    };
  }

  private static async processIntegralSectionContent(
    section: IntegralPDFSection,
    pdf: jsPDF,
    styling: PDFStyling,
    chartGenerator: PDFChartGenerator,
    startY: number,
    addNewPage: () => number
  ): Promise<number> {
    let currentY = startY;
    
    for (const item of section.content) {
      if (styling.checkPageBreak(currentY, 40)) {
        currentY = addNewPage();
      }
      
      switch (item.type) {
        case 'text':
          currentY = this.addIntegralTextContent(pdf, styling, item.data, currentY);
          break;
          
        case 'level-card':
          currentY = this.addLevelCardContent(pdf, styling, item.data, currentY);
          break;
          
        case 'triad':
          currentY = this.addTriadContent(pdf, styling, chartGenerator, item.data, currentY);
          break;
          
        case 'confidence':
          currentY = this.addConfidenceContent(pdf, styling, item.data, currentY);
          break;
          
        case 'development-card':
          currentY = this.addDevelopmentCardContent(pdf, styling, item.data, currentY);
          break;
          
        case 'insights-card':
          currentY = this.addInsightsCardContent(pdf, styling, item.data, currentY);
          break;
          
        default:
          logger.warn(`Unknown Integral content type: ${item.type}`, { 
            component: 'integralPdfGenerator',
            metadata: { itemType: item.type }
          });
      }
      
      currentY += 8;
    }
    
    return currentY;
  }

  private static addIntegralTextContent(
    pdf: jsPDF,
    styling: PDFStyling,
    data: any,
    currentY: number
  ): number {
    if (data.title) {
      currentY = styling.addSectionHeader(data.title, styling.margins.left, currentY, 3);
    }
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(styling.theme.text);
    
    const lines = pdf.splitTextToSize(data.content || data, styling.getContentWidth());
    pdf.text(lines, styling.margins.left, currentY);
    
    return currentY + (lines.length * 4) + 8;
  }

  private static addLevelCardContent(
    pdf: jsPDF,
    styling: PDFStyling,
    data: any,
    currentY: number
  ): number {
    const cardHeight = 100;
    const cardY = styling.addCard(
      styling.margins.left,
      currentY,
      styling.getContentWidth(),
      cardHeight,
      data.title
    );
    
    let contentY = cardY;
    
    // Level details
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(data.color || styling.theme.text);
    
    const details = [
      `Cognitive Stage: ${data.cognitiveStage}`,
      `Confidence: ${data.confidence.toFixed(1)}%`,
      `Cognitive Complexity: ${data.complexity.toFixed(1)}/10`,
      '',
      data.description
    ];
    
    details.forEach(detail => {
      if (detail) {
        const lines = pdf.splitTextToSize(detail, styling.getContentWidth() - 20);
        pdf.text(lines, styling.margins.left + 10, contentY);
        contentY += lines.length * 4 + 2;
      } else {
        contentY += 4;
      }
    });
    
    return currentY + cardHeight + 10;
  }

  private static addTriadContent(
    pdf: jsPDF,
    styling: PDFStyling,
    chartGenerator: PDFChartGenerator,
    data: any,
    currentY: number
  ): number {
    const triadData = {
      Physical: data.physical,
      Social: data.social,
      Universal: data.universal
    };
    
    return chartGenerator.drawRadarChart(
      styling.margins.left + 20,
      currentY,
      120,
      triadData,
      { 
        title: data.title,
        fillColor: styling.theme.primary 
      }
    );
  }

  private static addConfidenceContent(
    pdf: jsPDF,
    styling: PDFStyling,
    data: any,
    currentY: number
  ): number {
    const cardHeight = 60;
    const cardY = styling.addCard(
      styling.margins.left,
      currentY,
      styling.getContentWidth(),
      cardHeight,
      data.title
    );
    
    let contentY = cardY;
    
    // Confidence bar
    const barWidth = styling.getContentWidth() - 40;
    const barHeight = 8;
    const barX = styling.margins.left + 20;
    const confidenceRatio = data.confidence / 100;
    
    // Background bar
    pdf.setFillColor(240, 240, 240);
    pdf.rect(barX, contentY, barWidth, barHeight, 'F');
    
    // Confidence bar
    const confidenceColor = data.confidence >= 80 ? [76, 175, 80] : 
                           data.confidence >= 60 ? [255, 193, 7] : [244, 67, 54];
    pdf.setFillColor(confidenceColor[0], confidenceColor[1], confidenceColor[2]);
    pdf.rect(barX, contentY, barWidth * confidenceRatio, barHeight, 'F');
    
    contentY += barHeight + 10;
    
    // Description
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(styling.theme.text);
    const lines = pdf.splitTextToSize(data.description, styling.getContentWidth() - 20);
    pdf.text(lines, styling.margins.left + 10, contentY);
    
    return currentY + cardHeight + 10;
  }

  private static addDevelopmentCardContent(
    pdf: jsPDF,
    styling: PDFStyling,
    data: any,
    currentY: number
  ): number {
    const cardHeight = 80;
    const cardY = styling.addCard(
      styling.margins.left,
      currentY,
      styling.getContentWidth(),
      cardHeight,
      data.title
    );
    
    let contentY = cardY;
    
    // Development edge description
    if (data.edge) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(styling.theme.text);
      const lines = pdf.splitTextToSize(data.edge, styling.getContentWidth() - 20);
      pdf.text(lines, styling.margins.left + 10, contentY);
      contentY += lines.length * 4 + 5;
    }
    
    return currentY + cardHeight + 10;
  }

  private static addInsightsCardContent(
    pdf: jsPDF,
    styling: PDFStyling,
    data: any,
    currentY: number
  ): number {
    const cardHeight = 120;
    const cardY = styling.addCard(
      styling.margins.left,
      currentY,
      styling.getContentWidth(),
      cardHeight,
      data.title
    );
    
    let contentY = cardY;
    
    // Add insights
    if (data.insights && data.insights.length > 0) {
      contentY = styling.addSectionHeader('Key Insights', styling.margins.left + 10, contentY, 3);
      data.insights.slice(0, 3).forEach((insight: any) => {
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${insight.category}:`, styling.margins.left + 10, contentY);
        contentY += 6;
        
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(insight.insight, styling.getContentWidth() - 30);
        pdf.text(lines, styling.margins.left + 15, contentY);
        contentY += lines.length * 4 + 3;
      });
    }
    
    return currentY + cardHeight + 10;
  }

  private static addIntegralCoverPage(
    pdf: jsPDF,
    styling: PDFStyling,
    integralDetail: IntegralDetail,
    currentPage: number,
    totalPages: number,
    personalityProfile?: PersonalityProfile
  ): number {
    // Main header
    let currentY = styling.addHeader(
      'Psyforge',
      'Integral Level Assessment Report',
      20
    );
    
    // Level overview card
    const levelColors = this.getLevelColors();
    const primaryColor = levelColors[integralDetail.primaryLevel.number] || '#666666';
    
    const cardY = styling.addCard(
      styling.margins.left,
      currentY,
      styling.getContentWidth(),
      80,
      'Your Integral Level Profile'
    );
    
    // Assessment details
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(styling.theme.text);
    
    const details = [
      `Assessment Date: ${new Date().toLocaleDateString()}`,
      `Primary Level: ${integralDetail.primaryLevel.name} (Level ${integralDetail.primaryLevel.number})`,
      `Cognitive Stage: ${integralDetail.primaryLevel.cognitiveStage}`,
      `Assessment Confidence: ${integralDetail.confidence.toFixed(1)}%`,
      `Cognitive Complexity: ${integralDetail.cognitiveComplexity.toFixed(1)}/10`,
      personalityProfile ? `Personality Integration: Available` : `Personality Integration: Not Available`
    ];
    
    let detailY = cardY;
    details.forEach(detail => {
      pdf.text(detail, styling.margins.left + 10, detailY);
      detailY += 8;
    });
    
    currentY += 100;
    
    // Footer
    styling.addFooter(currentPage, totalPages);
    
    return currentY;
  }

  private static generateIntegralHTMLReport(
    integralDetail: IntegralDetail,
    personalityProfile: PersonalityProfile | null = null
  ): void {
    const htmlContent = `
      <html>
        <head>
          <title>Integral Level Assessment Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .level-card { border: 2px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .confidence { color: ${integralDetail.confidence >= 80 ? 'green' : integralDetail.confidence >= 60 ? 'orange' : 'red'}; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Integral Level Assessment Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="level-card">
            <h2>Your Primary Level: ${integralDetail.primaryLevel.name}</h2>
            <p><strong>Level Number:</strong> ${integralDetail.primaryLevel.number}</p>
            <p><strong>Cognitive Stage:</strong> ${integralDetail.primaryLevel.cognitiveStage}</p>
            <p><strong>Confidence:</strong> <span class="confidence">${integralDetail.confidence.toFixed(1)}%</span></p>
            <p><strong>Worldview:</strong> ${integralDetail.primaryLevel.worldview}</p>
          </div>
          
          ${integralDetail.secondaryLevel ? `
            <div class="level-card">
              <h2>Secondary Level: ${integralDetail.secondaryLevel.name}</h2>
              <p><strong>Level Number:</strong> ${integralDetail.secondaryLevel.number}</p>
              <p><strong>Worldview:</strong> ${integralDetail.secondaryLevel.worldview}</p>
            </div>
          ` : ''}
          
          <div class="level-card">
            <h2>Reality Triad</h2>
            <p><strong>Physical:</strong> ${integralDetail.realityTriadMapping.physical.toFixed(1)}/10</p>
            <p><strong>Social:</strong> ${integralDetail.realityTriadMapping.social.toFixed(1)}/10</p>
            <p><strong>Universal:</strong> ${integralDetail.realityTriadMapping.universal.toFixed(1)}/10</p>
          </div>
        </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Integral-Assessment-Report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  private static estimatePageCount(sections: IntegralPDFSection[]): number {
    return 1 + Math.ceil(sections.length * 1.5);
  }

  private static getLevelColors(): Record<number, string> {
    return {
      1: '#8B4513', // Beige
      2: '#800080', // Purple
      3: '#DC143C', // Red
      4: '#0000FF', // Blue
      5: '#FFA500', // Orange
      6: '#008000', // Green
      7: '#FFFF00', // Yellow
      8: '#40E0D0', // Turquoise
      9: '#FF69B4'  // Coral
    };
  }

  private static getConfidenceDescription(confidence: number): string {
    if (confidence >= 80) {
      return 'High confidence - Your assessment results show strong clarity and consistency across responses.';
    } else if (confidence >= 60) {
      return 'Moderate confidence - Your results are generally clear with some areas of uncertainty that may benefit from further exploration.';
    } else {
      return 'Lower confidence - Your results suggest some uncertainty. Consider retaking the assessment or exploring the clarification features.';
    }
  }

  private static generateGrowthRecommendations(integralDetail: IntegralDetail): string[] {
    const recommendations = [
      `Focus on developing ${integralDetail.primaryLevel.cognitiveStage} thinking patterns`,
      'Explore perspectives from your developmental edge',
      'Practice integrating multiple viewpoints on complex issues'
    ];

    if (integralDetail.confidence < 70) {
      recommendations.push('Consider working with a developmental coach for clarity');
    }

    return recommendations;
  }
}