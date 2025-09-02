import { PersonalityProfile } from '../types/tps.types';
import { PersonalityInsightGenerator } from './personalityInsights';

export class PDFReportGenerator {
  static async generatePDFReport(profile: PersonalityProfile): Promise<void> {
    // Generate insights
    const insights = PersonalityInsightGenerator.generateCoreInsights(profile);
    const careerRecommendations = PersonalityInsightGenerator.generateCareerRecommendations(profile);
    const developmentAreas = PersonalityInsightGenerator.generateDevelopmentAreas(profile);

    // Create HTML content for PDF
    const htmlContent = this.createHTMLReport(profile, insights, careerRecommendations, developmentAreas);
    
    // For now, create a downloadable HTML file that can be printed to PDF
    // In a production environment, you'd use a PDF generation library like jsPDF or Puppeteer
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
        @media print {
            .page-break { page-break-before: always; }
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
        
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
        }
        
        .section-title {
            color: #667eea;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        .domain-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .domain-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        
        .score {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
        }
        
        .trait-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 10px;
        }
        
        .framework-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }
        
        .framework-card {
            background: #e8f2ff;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        
        .career-card {
            background: #f0f8ff;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .development-card {
            background: #fff8f0;
            padding: 20px;
            margin: 15px 0;
            border-radius: 8px;
            border-left: 4px solid #ff9500;
        }
        
        ul {
            margin: 10px 0;
            padding-left: 20px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Triadic Personality System (TPS)</h1>
        <h2>Comprehensive Personality Assessment Report</h2>
        <p>Generated on ${timestamp}</p>
    </div>

    <div class="section">
        <h2 class="section-title">Executive Summary</h2>
        <p>${insights.summary}</p>
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
        </div>
        
        <h4>Big Five Traits</h4>
        <div class="trait-list">
            ${Object.entries(profile.mappings.bigFive).map(([trait, score]) => `
                <div><strong>${trait}:</strong> ${score.toFixed(1)}/10</div>
            `).join('')}
        </div>
    </div>

    <div class="section page-break">
        <h2 class="section-title">Core Strengths</h2>
        <ul>
            ${insights.strengths.map((strength: string) => `<li>${strength}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2 class="section-title">Growth Areas</h2>
        <ul>
            ${insights.growthAreas.map((area: string) => `<li>${area}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2 class="section-title">Career Recommendations</h2>
        ${careerRecommendations.map(career => `
            <div class="career-card">
                <h4>${career.field}</h4>
                <p><strong>Recommended Roles:</strong> ${career.roles.join(', ')}</p>
                <p><strong>Why This Fits:</strong> ${career.reason}</p>
                <p><strong>Ideal Environment:</strong> ${career.workEnvironment}</p>
            </div>
        `).join('')}
    </div>

    <div class="section page-break">
        <h2 class="section-title">Personal Development Plan</h2>
        ${developmentAreas.map(area => `
            <div class="development-card">
                <h4>${area.area}</h4>
                <p>${area.description}</p>
                <p><strong>Recommended Activities:</strong></p>
                <ul>
                    ${area.activities.map((activity: string) => `<li>${activity}</li>`).join('')}
                </ul>
                <p><strong>Timeframe:</strong> ${area.timeframe}</p>
            </div>
        `).join('')}
    </div>

    <div class="section">
        <h2 class="section-title">Dominant Traits by Domain</h2>
        <div class="trait-list">
            ${Object.entries(profile.dominantTraits).map(([triad, trait]) => `
                <div><strong>${triad.replace('-', ' - ')}:</strong> ${trait}</div>
            `).join('')}
        </div>
    </div>

    <div class="footer">
        <p>This report was generated using the Triadic Personality System (TPS), a comprehensive personality assessment framework.</p>
        <p>For best results, please review this assessment with a qualified personality coach or counselor.</p>
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