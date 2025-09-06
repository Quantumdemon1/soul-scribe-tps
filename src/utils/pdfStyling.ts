import { jsPDF } from 'jspdf';

export interface PDFTheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textLight: string;
  background: string;
  surface: string;
  border: string;
}

export const defaultTheme: PDFTheme = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#f093fb',
  text: '#1f2937',
  textLight: '#6b7280',
  background: '#ffffff',
  surface: '#f9fafb',
  border: '#e5e7eb'
};

export class PDFStyling {
  private pdf: jsPDF;
  public theme: PDFTheme;
  private pageWidth: number;
  private pageHeight: number;
  public margins: { top: number; right: number; bottom: number; left: number };

  constructor(pdf: jsPDF, theme: PDFTheme = defaultTheme) {
    this.pdf = pdf;
    this.theme = theme;
    this.pageWidth = pdf.internal.pageSize.getWidth();
    this.pageHeight = pdf.internal.pageSize.getHeight();
    this.margins = { top: 20, right: 20, bottom: 20, left: 20 };
  }

  getContentWidth(): number {
    return this.pageWidth - this.margins.left - this.margins.right;
  }

  getContentHeight(): number {
    return this.pageHeight - this.margins.top - this.margins.bottom;
  }

  // Header with gradient background
  addHeader(title: string, subtitle: string, y: number = 20): number {
    const headerHeight = 40;
    
    // Gradient background effect (simulated with rectangles)
    this.pdf.setFillColor(102, 126, 234); // Primary color
    this.pdf.rect(0, y, this.pageWidth, headerHeight, 'F');
    
    // Overlay for gradient effect
    this.pdf.setFillColor(118, 75, 162); // Secondary color
    this.pdf.setGState(this.pdf.GState({ opacity: 0.3 }));
    this.pdf.rect(0, y, this.pageWidth, headerHeight, 'F');
    this.pdf.setGState(this.pdf.GState({ opacity: 1 }));

    // Header text
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.pageWidth / 2, y + 18, { align: 'center' });
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(subtitle, this.pageWidth / 2, y + 30, { align: 'center' });
    
    // Reset text color
    this.pdf.setTextColor(this.theme.text);
    
    return y + headerHeight + 10;
  }

  // Section header with underline
  addSectionHeader(title: string, x: number, y: number, level: number = 1): number {
    const fontSize = level === 1 ? 18 : level === 2 ? 16 : 14;
    const fontWeight = level === 1 ? 'bold' : level === 2 ? 'bold' : 'normal';
    
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', fontWeight);
    this.pdf.setTextColor(this.theme.text);
    
    this.pdf.text(title, x, y);
    
    // Underline for main sections
    if (level === 1) {
      const textWidth = this.pdf.getTextWidth(title);
      this.pdf.setDrawColor(this.theme.primary);
      this.pdf.setLineWidth(2);
      this.pdf.line(x, y + 2, x + textWidth, y + 2);
    }
    
    return y + (fontSize * 0.35) + 8;
  }

  // Card container with shadow effect
  addCard(x: number, y: number, width: number, height: number, title?: string): number {
    // Shadow effect
    this.pdf.setFillColor(0, 0, 0);
    this.pdf.setGState(this.pdf.GState({ opacity: 0.1 }));
    this.pdf.rect(x + 1, y + 1, width, height, 'F');
    this.pdf.setGState(this.pdf.GState({ opacity: 1 }));
    
    // Card background
    this.pdf.setFillColor(this.theme.surface);
    this.pdf.setDrawColor(this.theme.border);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(x, y, width, height, 'FD');
    
    let currentY = y + 8;
    
    // Card title if provided
    if (title) {
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(this.theme.text);
      this.pdf.text(title, x + 8, currentY + 6);
      currentY += 15;
    }
    
    return currentY;
  }

  // Progress bar
  addProgressBar(x: number, y: number, width: number, value: number, label?: string): number {
    const barHeight = 8;
    const progressWidth = (value / 10) * width;
    
    // Background bar
    this.pdf.setFillColor(this.theme.border);
    this.pdf.rect(x, y, width, barHeight, 'F');
    
    // Progress fill
    this.pdf.setFillColor(this.theme.primary);
    this.pdf.rect(x, y, progressWidth, barHeight, 'F');
    
    // Label and value
    if (label) {
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(this.theme.text);
      this.pdf.text(label, x, y - 2);
      this.pdf.text(`${value.toFixed(1)}/10`, x + width - 20, y - 2);
    }
    
    return y + barHeight + 8;
  }

  // Badge/tag
  addBadge(text: string, x: number, y: number, variant: 'primary' | 'secondary' | 'outline' = 'primary'): { width: number; height: number } {
    const padding = 4;
    const textWidth = this.pdf.getTextWidth(text);
    const badgeWidth = textWidth + (padding * 2);
    const badgeHeight = 8;
    
    // Badge background
    if (variant === 'primary') {
      this.pdf.setFillColor(this.theme.primary);
      this.pdf.setTextColor(255, 255, 255);
    } else if (variant === 'secondary') {
      this.pdf.setFillColor(this.theme.secondary);
      this.pdf.setTextColor(255, 255, 255);
    } else {
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.setDrawColor(this.theme.border);
      this.pdf.setTextColor(this.theme.text);
    }
    
    if (variant === 'outline') {
      this.pdf.rect(x, y - 6, badgeWidth, badgeHeight, 'FD');
    } else {
      this.pdf.rect(x, y - 6, badgeWidth, badgeHeight, 'F');
    }
    
    // Badge text
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(text, x + padding, y);
    
    return { width: badgeWidth, height: badgeHeight };
  }

  // Bullet list
  addBulletList(items: string[], x: number, y: number, width: number): number {
    let currentY = y;
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(this.theme.text);
    
    items.forEach(item => {
      // Bullet point
      this.pdf.setFillColor(this.theme.primary);
      this.pdf.circle(x + 2, currentY - 2, 1, 'F');
      
      // Text with word wrapping
      const lines = this.pdf.splitTextToSize(item, width - 10);
      this.pdf.text(lines, x + 8, currentY);
      currentY += lines.length * 4 + 2;
    });
    
    return currentY;
  }

  // Multi-column text
  addColumns(content: string[], x: number, y: number, columnWidth: number, gap: number): number {
    let maxY = y;
    
    content.forEach((text, index) => {
      const columnX = x + (index * (columnWidth + gap));
      const lines = this.pdf.splitTextToSize(text, columnWidth);
      this.pdf.text(lines, columnX, y);
      const columnHeight = lines.length * 4;
      maxY = Math.max(maxY, y + columnHeight);
    });
    
    return maxY + 5;
  }

  // Add footer with page numbers
  addFooter(pageNumber: number, totalPages: number): void {
    const footerY = this.pageHeight - 15;
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(this.theme.textLight);
    
    // Page number
    this.pdf.text(
      `Page ${pageNumber} of ${totalPages}`,
      this.pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    
    // Report info
    const timestamp = new Date().toLocaleDateString();
    this.pdf.text(
      `Psyforge Assessment Report - Generated ${timestamp}`,
      this.margins.left,
      footerY
    );
  }

  // Check if we need a new page
  checkPageBreak(currentY: number, requiredHeight: number): boolean {
    return currentY + requiredHeight > this.pageHeight - this.margins.bottom - 20;
  }

  // Add a new page with header
  addNewPage(pageNumber: number, totalPages: number): number {
    this.pdf.addPage();
    this.addFooter(pageNumber, totalPages);
    return this.margins.top + 10;
  }

  // Radar chart (simplified version)
  addRadarChart(data: Record<string, number>, x: number, y: number, size: number): number {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2 - 20;
    const labels = Object.keys(data);
    const values = Object.values(data);
    const maxValue = 10;
    
    // Background circles
    this.pdf.setDrawColor(this.theme.border);
    this.pdf.setLineWidth(0.5);
    for (let i = 1; i <= 5; i++) {
      const r = (radius * i) / 5;
      this.pdf.circle(centerX, centerY, r, 'D');
    }
    
    // Axes
    labels.forEach((_, index) => {
      const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2;
      const endX = centerX + radius * Math.cos(angle);
      const endY = centerY + radius * Math.sin(angle);
      this.pdf.line(centerX, centerY, endX, endY);
    });
    
    // Data polygon
    this.pdf.setDrawColor(this.theme.primary);
    this.pdf.setFillColor(this.theme.primary);
    this.pdf.setGState(this.pdf.GState({ opacity: 0.3 }));
    this.pdf.setLineWidth(2);
    
    const points: [number, number][] = values.map((value, index) => {
      const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2;
      const r = (radius * value) / maxValue;
      return [
        centerX + r * Math.cos(angle),
        centerY + r * Math.sin(angle)
      ];
    });
    
    // Draw polygon
    if (points.length > 0) {
      this.pdf.lines(
        points.slice(1).map(([x, y], i) => [x - points[i][0], y - points[i][1]]),
        points[0][0],
        points[0][1],
        [1, 1],
        'FD',
        true
      );
    }
    
    this.pdf.setGState(this.pdf.GState({ opacity: 1 }));
    
    // Labels
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(this.theme.text);
    
    labels.forEach((label, index) => {
      const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2;
      const labelRadius = radius + 15;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);
      this.pdf.text(label, labelX, labelY, { align: 'center' });
    });
    
    return y + size + 10;
  }
}