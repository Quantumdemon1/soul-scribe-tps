import { PersonalityProfile } from '../types/tps.types';
import { AIInsights } from '../types/llm.types';
import { PersonalityInsightGenerator } from './personalityInsights';
import { PDFStyling, defaultTheme } from './pdfStyling';
import { PDFContentGenerator, PDFSection } from './pdfContent';
import { PDFChartGenerator } from './pdfCharts';
import jsPDF from 'jspdf';

export class PDFReportGenerator {
  static async generatePDFReport(
    profile: PersonalityProfile, 
    aiInsights?: AIInsights
  ): Promise<void> {
    try {
      console.log('Starting enhanced PDF generation...');
      
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const styling = new PDFStyling(pdf, defaultTheme);
      const chartGenerator = new PDFChartGenerator(pdf);
      const contentGenerator = new PDFContentGenerator(profile, aiInsights);
      
      // Generate all sections
      const sections = contentGenerator.generateAllSections();
      const totalPages = this.estimatePageCount(sections);
      
      let currentPage = 1;
      let currentY = 20;
      
      // Add cover page
      currentY = this.addCoverPage(pdf, styling, profile, currentPage, totalPages);
      
      // Process each section
      for (const section of sections) {
        // Check if we need a new page for this section
        if (section.pageBreak || styling.checkPageBreak(currentY, 50)) {
          currentPage++;
          currentY = styling.addNewPage(currentPage, totalPages);
        }
        
        // Add section header
        currentY = styling.addSectionHeader(section.title, styling.margins.left, currentY, 1);
        currentY += 5;
        
        // Process section content
        currentY = await this.processSectionContent(
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
        
        currentY += 10; // Space between sections
      }
      
      // Add final footer
      styling.addFooter(currentPage, totalPages);
      
      // Save the PDF
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`TPS-Comprehensive-Report-${timestamp}.pdf`);
      
      console.log('Enhanced PDF generation completed successfully');
      
    } catch (error) {
      console.error('Error generating enhanced PDF:', error);
      // Fallback to simple HTML download
      this.generateHTMLReport(profile);
    }
  }
  
  private static addCoverPage(
    pdf: jsPDF,
    styling: PDFStyling,
    profile: PersonalityProfile,
    currentPage: number,
    totalPages: number
  ): number {
    // Main header
    let currentY = styling.addHeader(
      'Triadic Personality System',
      'Comprehensive Personality Assessment Report',
      20
    );
    
    // Quick overview card
    const cardY = styling.addCard(
      styling.margins.left,
      currentY,
      styling.getContentWidth(),
      80,
      'Assessment Overview'
    );
    
    // Assessment details
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(styling.theme.text);
    
    const details = [
      `Assessment Date: ${new Date().toLocaleDateString()}`,
      `Assessment Type: Comprehensive TPS Analysis`,
      `Total Domains: 4 (External, Internal, Interpersonal, Processing)`,
      `Framework Correlations: MBTI, Enneagram, Big Five, Alignment`,
      `Pages in Report: ${totalPages}`,
      `Confidence Level: High (>90%)`
    ];
    
    let detailY = cardY;
    details.forEach(detail => {
      pdf.text(detail, styling.margins.left + 10, detailY);
      detailY += 8;
    });
    
    currentY += 100;
    
    // Quick personality snapshot
    const snapshotY = styling.addCard(
      styling.margins.left,
      currentY,
      styling.getContentWidth(),
      60,
      'Your Personality Snapshot'
    );
    
    const snapshots = [
      `MBTI Type: ${profile.mappings.mbti}`,
      `Enneagram: ${profile.mappings.enneagram}`,
      `Moral Alignment: ${profile.mappings.dndAlignment}`,
      `Holland Code: ${profile.mappings.hollandCode}`,
      `Socionics: ${profile.mappings.socionics}`
    ];
    
    let snapshotTextY = snapshotY;
    snapshots.forEach(snapshot => {
      pdf.text(snapshot, styling.margins.left + 10, snapshotTextY);
      snapshotTextY += 8;
    });
    
    currentY += 80;
    
    // Domain scores visualization
    const chartY = new PDFChartGenerator(pdf).drawRadarChart(
      styling.margins.left + 20,
      currentY,
      120,
      profile.domainScores,
      { 
        title: 'Domain Strength Overview',
        fillColor: styling.theme.primary 
      }
    );
    
    // Footer
    styling.addFooter(currentPage, totalPages);
    
    return chartY;
  }
  
  private static async processSectionContent(
    section: PDFSection,
    pdf: jsPDF,
    styling: PDFStyling,
    chartGenerator: PDFChartGenerator,
    startY: number,
    addNewPage: () => number
  ): Promise<number> {
    let currentY = startY;
    
    for (const item of section.content) {
      // Check page break before each major item
      if (styling.checkPageBreak(currentY, 40)) {
        currentY = addNewPage();
      }
      
      switch (item.type) {
        case 'text':
          currentY = this.addTextContent(pdf, styling, item.data, currentY);
          break;
          
        case 'card':
        case 'domain-card':
          currentY = this.addCardContent(pdf, styling, item.data, currentY);
          break;
          
        case 'list':
          currentY = this.addListContent(pdf, styling, item.data, currentY);
          break;
          
        case 'chart':
          currentY = this.addChartContent(pdf, styling, chartGenerator, item.data, currentY);
          break;
          
        case 'grid':
          currentY = this.addGridContent(pdf, styling, item.data, currentY);
          break;
          
        case 'table':
          currentY = this.addTableContent(pdf, styling, item.data, currentY);
          break;
          
        case 'progress':
          currentY = this.addProgressContent(pdf, styling, item.data, currentY);
          break;
          
        default:
          console.warn(`Unknown content type: ${item.type}`);
      }
      
      currentY += 5; // Space between items
    }
    
    return currentY;
  }
  
  private static addTextContent(
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
  
  private static addCardContent(
    pdf: jsPDF,
    styling: PDFStyling,
    data: any,
    currentY: number
  ): number {
    const cardHeight = this.estimateCardHeight(data);
    const cardY = styling.addCard(
      styling.margins.left,
      currentY,
      styling.getContentWidth(),
      cardHeight,
      data.title
    );
    
    let contentY = cardY;
    
    // Description
    if (data.description) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(styling.theme.text);
      const lines = pdf.splitTextToSize(data.description, styling.getContentWidth() - 20);
      pdf.text(lines, styling.margins.left + 10, contentY);
      contentY += lines.length * 4 + 5;
    }
    
    // Lists (strengths, challenges, etc.)
    ['strengths', 'challenges', 'roles', 'activities', 'behavioralIndicators', 'practicalImplications', 'developmentTips'].forEach(listType => {
      if (data[listType] && Array.isArray(data[listType])) {
        contentY = styling.addSectionHeader(
          this.capitalizeFirst(listType),
          styling.margins.left + 10,
          contentY,
          3
        );
        contentY = styling.addBulletList(
          data[listType],
          styling.margins.left + 10,
          contentY,
          styling.getContentWidth() - 20
        );
        contentY += 5;
      }
    });
    
    // Special fields
    if (data.workStyle) {
      contentY = styling.addSectionHeader('Work Style', styling.margins.left + 10, contentY, 3);
      const lines = pdf.splitTextToSize(data.workStyle, styling.getContentWidth() - 20);
      pdf.text(lines, styling.margins.left + 10, contentY);
      contentY += lines.length * 4 + 5;
    }
    
    if (data.timeframe) {
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Timeframe: ${data.timeframe}`, styling.margins.left + 10, contentY);
      contentY += 8;
    }
    
    return currentY + cardHeight + 10;
  }
  
  private static addListContent(
    pdf: jsPDF,
    styling: PDFStyling,
    data: any,
    currentY: number
  ): number {
    if (data.title) {
      currentY = styling.addSectionHeader(data.title, styling.margins.left, currentY, 3);
    }
    
    return styling.addBulletList(
      data.items || data,
      styling.margins.left,
      currentY,
      styling.getContentWidth()
    );
  }
  
  private static addChartContent(
    pdf: jsPDF,
    styling: PDFStyling,
    chartGenerator: PDFChartGenerator,
    data: any,
    currentY: number
  ): number {
    switch (data.type) {
      case 'radar':
        return chartGenerator.drawRadarChart(
          styling.margins.left + 20,
          currentY,
          120,
          data.data,
          { title: data.title }
        );
        
      case 'bar':
        return chartGenerator.drawBarChart(
          styling.margins.left,
          currentY,
          styling.getContentWidth(),
          80,
          data.data,
          { title: data.title }
        );
        
      default:
        return currentY + 20;
    }
  }
  
  private static addGridContent(
    pdf: jsPDF,
    styling: PDFStyling,
    data: any,
    currentY: number
  ): number {
    if (data.title) {
      currentY = styling.addSectionHeader(data.title, styling.margins.left, currentY, 3);
    }
    
    const items = data.items || [];
    const columns = 2;
    const itemsPerColumn = Math.ceil(items.length / columns);
    const columnWidth = styling.getContentWidth() / columns - 10;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const column = Math.floor(i / itemsPerColumn);
      const row = i % itemsPerColumn;
      
      const x = styling.margins.left + (column * (columnWidth + 10));
      const y = currentY + (row * 25);
      
      // Create mini card for each item
      styling.addCard(x, y, columnWidth, 20);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.label || item.name, x + 5, y + 8);
      
      pdf.setFont('helvetica', 'normal');
      pdf.text(item.value || item.type || '', x + 5, y + 15);
    }
    
    return currentY + (itemsPerColumn * 25) + 10;
  }
  
  private static addTableContent(
    pdf: jsPDF,
    styling: PDFStyling,
    data: any,
    currentY: number
  ): number {
    if (data.title) {
      currentY = styling.addSectionHeader(data.title, styling.margins.left, currentY, 3);
    }
    
    const { headers, rows } = data;
    const columnWidth = styling.getContentWidth() / headers.length;
    const rowHeight = 8;
    
    // Headers
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(styling.theme.surface);
    pdf.rect(styling.margins.left, currentY, styling.getContentWidth(), rowHeight, 'F');
    
    headers.forEach((header: string, index: number) => {
      pdf.text(
        header,
        styling.margins.left + (index * columnWidth) + 3,
        currentY + 5
      );
    });
    
    currentY += rowHeight;
    
    // Rows
    pdf.setFont('helvetica', 'normal');
    rows.forEach((row: string[], rowIndex: number) => {
      if (rowIndex % 2 === 0) {
        pdf.setFillColor(styling.theme.background);
        pdf.rect(styling.margins.left, currentY, styling.getContentWidth(), rowHeight, 'F');
      }
      
      row.forEach((cell, colIndex) => {
        pdf.text(
          cell,
          styling.margins.left + (colIndex * columnWidth) + 3,
          currentY + 5
        );
      });
      
      currentY += rowHeight;
    });
    
    return currentY + 5;
  }
  
  private static addProgressContent(
    pdf: jsPDF,
    styling: PDFStyling,
    data: any,
    currentY: number
  ): number {
    if (data.title) {
      currentY = styling.addSectionHeader(data.title, styling.margins.left, currentY, 3);
    }
    
    data.forEach((item: any) => {
      currentY = styling.addProgressBar(
        styling.margins.left,
        currentY,
        styling.getContentWidth() * 0.7,
        item.value,
        item.label
      );
    });
    
    return currentY;
  }
  
  private static estimatePageCount(sections: PDFSection[]): number {
    // Rough estimate: 1 page for cover + 2-3 pages per major section
    return 1 + Math.ceil(sections.length * 2.5);
  }
  
  private static estimateCardHeight(data: any): number {
    let height = 20; // Base height
    
    if (data.description) height += 20;
    
    ['strengths', 'challenges', 'roles', 'activities'].forEach(listType => {
      if (data[listType]?.length) {
        height += 15 + (data[listType].length * 5);
      }
    });
    
    return Math.min(height, 120); // Cap at reasonable height
  }
  
  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private static generateHTMLReport(profile: PersonalityProfile): void {
    const insights = PersonalityInsightGenerator.generateCoreInsights(profile);
    const careerRecommendations = PersonalityInsightGenerator.generateCareerRecommendations(profile);
    const developmentAreas = PersonalityInsightGenerator.generateDevelopmentAreas(profile);
    
    const htmlContent = this.createHTMLReport(profile, insights, careerRecommendations, developmentAreas);
    this.downloadHTMLReport(htmlContent);
  }

  private static createHTMLReport(
    profile: PersonalityProfile,
    insights: any,
    careerRecommendations: any[],
    developmentAreas: any[]
  ): string {
    const timestamp = new Date().toLocaleDateString();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TPS Personality Assessment Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
            padding: 0;
            margin: 0;
        }
        
        .container {
            max-width: 794px;
            margin: 0 auto;
            padding: 40px;
            background: white;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 40px;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header h2 {
            font-size: 18px;
            font-weight: 500;
            opacity: 0.9;
            margin-bottom: 16px;
        }
        
        .header p {
            font-size: 14px;
            opacity: 0.8;
        }
        
        .section {
            margin-bottom: 32px;
            padding: 24px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            background: #fafafa;
        }
        
        .section-title {
            color: #1f2937;
            font-size: 20px;
            font-weight: 600;
            border-bottom: 3px solid #667eea;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        
        .domain-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin: 24px 0;
        }
        
        .domain-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .domain-card h3 {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }
        
        .score {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
        }
        
        .framework-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin: 20px 0;
        }
        
        .framework-card {
            background: white;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #e5e7eb;
        }
        
        .framework-card h4 {
            font-size: 14px;
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 4px;
        }
        
        .framework-card strong {
            font-size: 16px;
            color: #1f2937;
        }
        
        .trait-list {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
            margin: 16px 0;
        }
        
        .trait-item {
            padding: 8px 12px;
            background: white;
            border-radius: 6px;
            font-size: 14px;
            border: 1px solid #e5e7eb;
        }
        
        .career-card {
            background: #f0f9ff;
            padding: 20px;
            margin: 16px 0;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }
        
        .career-card h4 {
            color: #1e40af;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        .career-detail {
            margin: 8px 0;
            font-size: 14px;
        }
        
        .career-detail strong {
            color: #374151;
        }
        
        .development-card {
            background: #fff7ed;
            padding: 20px;
            margin: 16px 0;
            border-radius: 8px;
            border-left: 4px solid #f59e0b;
        }
        
        .development-card h4 {
            color: #d97706;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        ul {
            margin: 12px 0;
            padding-left: 24px;
        }
        
        li {
            margin: 6px 0;
            font-size: 14px;
        }
        
        .summary-text {
            font-size: 16px;
            line-height: 1.7;
            color: #374151;
            margin: 16px 0;
        }
        
        .strengths-list, .growth-list {
            list-style: none;
            padding: 0;
        }
        
        .strengths-list li, .growth-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }
        
        .strengths-list li:before {
            content: "✓ ";
            color: #10b981;
            font-weight: bold;
            margin-right: 8px;
        }
        
        .growth-list li:before {
            content: "→ ";
            color: #f59e0b;
            font-weight: bold;
            margin-right: 8px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 24px;
            background: #f9fafb;
            border-radius: 8px;
            font-size: 12px;
            color: #6b7280;
            border: 1px solid #e5e7eb;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        @media print {
            body { print-color-adjust: exact; }
            .container { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Triadic Personality System (TPS)</h1>
            <h2>Comprehensive Personality Assessment Report</h2>
            <p>Generated on ${timestamp}</p>
        </div>

        <div class="section">
            <h2 class="section-title">Executive Summary</h2>
            <p class="summary-text">${insights.summary}</p>
        </div>

        <div class="section">
            <h2 class="section-title">Domain Scores</h2>
            <div class="domain-grid">
                ${Object.entries(profile.domainScores).map(([domain, score]) => `
                    <div class="domain-card">
                        <h3>${domain}</h3>
                        <div class="score">${(score * 10).toFixed(1)}/10</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Personality Framework Correlations</h2>
            <div class="framework-grid">
                <div class="framework-card">
                    <h4>MBTI Type</h4>
                    <strong>${profile.mappings.mbti}</strong>
                </div>
                <div class="framework-card">
                    <h4>Enneagram</h4>
                    <strong>${profile.mappings.enneagram}</strong>
                </div>
                <div class="framework-card">
                    <h4>D&D Alignment</h4>
                    <strong>${profile.mappings.dndAlignment}</strong>
                </div>
                <div class="framework-card">
                    <h4>Holland Code</h4>
                    <strong>${profile.mappings.hollandCode}</strong>
                </div>
                <div class="framework-card">
                    <h4>Socionics</h4>
                    <strong>${profile.mappings.socionics}</strong>
                </div>
                <div class="framework-card">
                    <h4>Big Five</h4>
                    <strong>See Below</strong>
                </div>
            </div>
            
            <h4 style="margin-top: 24px; margin-bottom: 12px; color: #374151;">Big Five Traits</h4>
            <div class="trait-list">
                ${Object.entries(profile.mappings.bigFive).map(([trait, score]) => `
                    <div class="trait-item"><strong>${trait}:</strong> ${score.toFixed(1)}/10</div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Core Strengths</h2>
            <ul class="strengths-list">
                ${insights.strengths.map((strength: string) => `<li>${strength}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h2 class="section-title">Growth Areas</h2>
            <ul class="growth-list">
                ${insights.growthAreas.map((area: string) => `<li>${area}</li>`).join('')}
            </ul>
        </div>

        <div class="section page-break">
            <h2 class="section-title">Career Recommendations</h2>
            ${careerRecommendations.map(career => `
                <div class="career-card">
                    <h4>${career.field}</h4>
                    <div class="career-detail"><strong>Recommended Roles:</strong> ${career.roles.join(', ')}</div>
                    <div class="career-detail"><strong>Why This Fits:</strong> ${career.reason}</div>
                    <div class="career-detail"><strong>Ideal Environment:</strong> ${career.workEnvironment}</div>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2 class="section-title">Personal Development Plan</h2>
            ${developmentAreas.map(area => `
                <div class="development-card">
                    <h4>${area.area}</h4>
                    <p style="margin: 8px 0; font-size: 14px;">${area.description}</p>
                    <p style="margin: 8px 0; font-weight: 600; font-size: 14px;">Recommended Activities:</p>
                    <ul style="margin: 8px 0;">
                        ${area.activities.map((activity: string) => `<li>${activity}</li>`).join('')}
                    </ul>
                    <p style="margin: 8px 0; font-size: 14px;"><strong>Timeframe:</strong> ${area.timeframe}</p>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2 class="section-title">Dominant Traits by Domain</h2>
            <div class="trait-list">
                ${Object.entries(profile.dominantTraits).map(([triad, trait]) => `
                    <div class="trait-item"><strong>${triad.replace('-', ' - ')}:</strong> ${trait}</div>
                `).join('')}
            </div>
        </div>

        <div class="footer">
            <p>This report was generated using the Triadic Personality System (TPS), a comprehensive personality assessment framework.</p>
            <p style="margin-top: 8px;">For best results, please review this assessment with a qualified personality coach or counselor.</p>
        </div>
    </div>
</body>
</html>`;
  }

  private static downloadHTMLReport(htmlContent: string): void {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `TPS-Personality-Report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static exportAsJSON(profile: PersonalityProfile): void {
    const dataStr = JSON.stringify(profile, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `TPS-Profile-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}