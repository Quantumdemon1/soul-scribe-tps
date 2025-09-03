import { PersonalityProfile } from '../types/tps.types';
import { PersonalityInsightGenerator } from './personalityInsights';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFReportGenerator {
  static async generatePDFReport(profile: PersonalityProfile): Promise<void> {
    try {
      // Generate insights
      const insights = PersonalityInsightGenerator.generateCoreInsights(profile);
      const careerRecommendations = PersonalityInsightGenerator.generateCareerRecommendations(profile);
      const developmentAreas = PersonalityInsightGenerator.generateDevelopmentAreas(profile);

      // Create a temporary HTML element for rendering
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.top = '-9999px';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.innerHTML = this.createHTMLReport(profile, insights, careerRecommendations, developmentAreas);
      
      document.body.appendChild(tempDiv);

      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels at 96 DPI
        windowWidth: 794,
        windowHeight: 1123 // A4 height in pixels at 96 DPI
      });

      // Clean up
      document.body.removeChild(tempDiv);

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      const timestamp = new Date().toISOString().split('T')[0];
      pdf.save(`TPS-Personality-Report-${timestamp}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to HTML download
      this.generateHTMLReport(profile);
    }
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