import { jsPDF } from 'jspdf';

export interface ChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

export class PDFChartGenerator {
  private pdf: jsPDF;

  constructor(pdf: jsPDF) {
    this.pdf = pdf;
  }

  // Enhanced radar chart with better styling
  drawRadarChart(
    x: number, 
    y: number, 
    size: number, 
    data: Record<string, number>, 
    options: {
      title?: string;
      maxValue?: number;
      fillColor?: string;
      strokeColor?: string;
      backgroundColor?: string;
    } = {}
  ): number {
    const {
      title,
      maxValue = 10,
      fillColor = '#667eea',
      strokeColor = '#667eea',
      backgroundColor = '#f9fafb'
    } = options;

    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2 - 30;
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    let currentY = y;

    // Title
    if (title) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor('#1f2937');
      this.pdf.text(title, centerX, currentY + 10, { align: 'center' });
      currentY += 20;
    }

    // Background circle
    this.pdf.setFillColor(backgroundColor);
    this.pdf.circle(centerX, centerY, radius + 10, 'F');

    // Grid circles
    this.pdf.setDrawColor('#e5e7eb');
    this.pdf.setLineWidth(0.5);
    for (let i = 1; i <= 5; i++) {
      const r = (radius * i) / 5;
      this.pdf.circle(centerX, centerY, r, 'D');
    }

    // Grid lines and labels
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor('#6b7280');
    
    labels.forEach((label, index) => {
      const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2;
      
      // Grid line
      const endX = centerX + radius * Math.cos(angle);
      const endY = centerY + radius * Math.sin(angle);
      this.pdf.line(centerX, centerY, endX, endY);
      
      // Label
      const labelRadius = radius + 20;
      const labelX = centerX + labelRadius * Math.cos(angle);
      const labelY = centerY + labelRadius * Math.sin(angle);
      
      // Adjust text alignment based on position
      let align: 'left' | 'center' | 'right' = 'center';
      if (labelX < centerX - 5) align = 'right';
      else if (labelX > centerX + 5) align = 'left';
      
      this.pdf.text(label, labelX, labelY, { align });
    });

    // Data polygon
    if (values.length > 2) {
      const points: [number, number][] = values.map((value, index) => {
        const angle = (index * 2 * Math.PI) / labels.length - Math.PI / 2;
        const r = (radius * value) / maxValue;
        return [
          centerX + r * Math.cos(angle),
          centerY + r * Math.sin(angle)
        ];
      });

      // Fill
      this.pdf.setFillColor(fillColor);
      this.pdf.setGState(this.pdf.GState({ opacity: 0.3 }));
      this.drawPolygon(points, true);
      
      // Stroke
      this.pdf.setGState(this.pdf.GState({ opacity: 1 }));
      this.pdf.setDrawColor(strokeColor);
      this.pdf.setLineWidth(2);
      this.drawPolygon(points, false);

      // Data points
      this.pdf.setFillColor(strokeColor);
      points.forEach(([px, py]) => {
        this.pdf.circle(px, py, 2, 'F');
      });
    }

    // Scale labels
    this.pdf.setFontSize(6);
    this.pdf.setTextColor('#9ca3af');
    for (let i = 1; i <= 5; i++) {
      const value = (maxValue * i) / 5;
      this.pdf.text(value.toString(), centerX + 3, centerY - (radius * i) / 5 + 1);
    }

    return y + size + 20;
  }

  // Bar chart for domain comparisons
  drawBarChart(
    x: number,
    y: number,
    width: number,
    height: number,
    data: Record<string, number>,
    options: {
      title?: string;
      maxValue?: number;
      color?: string;
      showValues?: boolean;
    } = {}
  ): number {
    const {
      title,
      maxValue = 10,
      color = '#667eea',
      showValues = true
    } = options;

    let currentY = y;

    // Title
    if (title) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor('#1f2937');
      this.pdf.text(title, x, currentY + 10);
      currentY += 20;
    }

    const labels = Object.keys(data);
    const values = Object.values(data);
    const barWidth = width / labels.length * 0.8;
    const gap = width / labels.length * 0.2;

    // Background
    this.pdf.setFillColor('#f9fafb');
    this.pdf.rect(x, currentY, width, height, 'F');

    // Grid lines
    this.pdf.setDrawColor('#e5e7eb');
    this.pdf.setLineWidth(0.5);
    for (let i = 0; i <= 5; i++) {
      const gridY = currentY + height - (height * i) / 5;
      this.pdf.line(x, gridY, x + width, gridY);
    }

    // Bars
    this.pdf.setFillColor(color);
    labels.forEach((label, index) => {
      const value = values[index];
      const barHeight = (height * value) / maxValue;
      const barX = x + (index * (barWidth + gap)) + gap / 2;
      const barY = currentY + height - barHeight;

      this.pdf.rect(barX, barY, barWidth, barHeight, 'F');

      // Value labels
      if (showValues) {
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor('#1f2937');
        this.pdf.text(
          value.toFixed(1),
          barX + barWidth / 2,
          barY - 3,
          { align: 'center' }
        );
      }

      // Category labels
      this.pdf.setFontSize(8);
      this.pdf.setTextColor('#6b7280');
      const lines = this.pdf.splitTextToSize(label, barWidth);
      this.pdf.text(
        lines,
        barX + barWidth / 2,
        currentY + height + 8,
        { align: 'center' }
      );
    });

    // Y-axis labels
    this.pdf.setFontSize(7);
    this.pdf.setTextColor('#9ca3af');
    for (let i = 0; i <= 5; i++) {
      const value = (maxValue * i) / 5;
      const labelY = currentY + height - (height * i) / 5;
      this.pdf.text(value.toFixed(1), x - 8, labelY + 1, { align: 'right' });
    }

    return currentY + height + 25;
  }

  // Progress bars for trait scores
  drawProgressBars(
    x: number,
    y: number,
    width: number,
    data: Array<{ label: string; value: number; maxValue?: number }>,
    options: {
      title?: string;
      color?: string;
      height?: number;
    } = {}
  ): number {
    const {
      title,
      color = '#667eea',
      height = 12
    } = options;

    let currentY = y;

    // Title
    if (title) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor('#1f2937');
      this.pdf.text(title, x, currentY + 10);
      currentY += 20;
    }

    data.forEach((item, index) => {
      const { label, value, maxValue = 10 } = item;
      const progressWidth = (width * 0.6 * value) / maxValue;
      const labelWidth = width * 0.35;

      // Label
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor('#374151');
      this.pdf.text(label, x, currentY + height / 2 + 2);

      // Background bar
      const barX = x + labelWidth;
      this.pdf.setFillColor('#e5e7eb');
      this.pdf.rect(barX, currentY, width * 0.6, height, 'F');

      // Progress bar
      this.pdf.setFillColor(color);
      this.pdf.rect(barX, currentY, progressWidth, height, 'F');

      // Value
      this.pdf.setFontSize(8);
      this.pdf.setTextColor('#6b7280');
      this.pdf.text(
        `${value.toFixed(1)}/${maxValue}`,
        barX + width * 0.6 + 5,
        currentY + height / 2 + 2
      );

      currentY += height + 8;
    });

    return currentY + 10;
  }

  // Helper method to draw polygon
  private drawPolygon(points: [number, number][], fill: boolean): void {
    if (points.length < 3) return;

    const [startX, startY] = points[0];
    this.pdf.lines(
      points.slice(1).map(([x, y], i) => [
        x - points[i][0],
        y - points[i][1]
      ]),
      startX,
      startY,
      [1, 1],
      fill ? 'F' : 'D',
      true
    );
  }

  // Pie chart for trait distributions
  drawPieChart(
    x: number,
    y: number,
    radius: number,
    data: Array<{ label: string; value: number; color?: string }>,
    options: {
      title?: string;
      showLabels?: boolean;
      showValues?: boolean;
    } = {}
  ): number {
    const {
      title,
      showLabels = true,
      showValues = true
    } = options;

    const centerX = x + radius;
    const centerY = y + radius;
    let currentY = y;

    // Title
    if (title) {
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor('#1f2937');
      this.pdf.text(title, centerX, currentY + 10, { align: 'center' });
      currentY += 20;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2; // Start at top

    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

    data.forEach((item, index) => {
      const { label, value, color = colors[index % colors.length] } = item;
      const angle = (value / total) * 2 * Math.PI;
      const endAngle = currentAngle + angle;

      // Draw slice
      this.pdf.setFillColor(color);
      this.drawPieSlice(centerX, centerY, radius, currentAngle, endAngle);

      // Draw labels
      if (showLabels && angle > 0.1) { // Only show label if slice is large enough
        const labelAngle = currentAngle + angle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + labelRadius * Math.cos(labelAngle);
        const labelY = centerY + labelRadius * Math.sin(labelAngle);

        this.pdf.setFontSize(7);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor('#ffffff');
        
        if (showValues) {
          this.pdf.text(`${label}`, labelX, labelY - 2, { align: 'center' });
          this.pdf.text(`${((value / total) * 100).toFixed(1)}%`, labelX, labelY + 3, { align: 'center' });
        } else {
          this.pdf.text(label, labelX, labelY, { align: 'center' });
        }
      }

      currentAngle = endAngle;
    });

    return y + radius * 2 + 20;
  }

  // Helper method to draw pie slice
  private drawPieSlice(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): void {
    const steps = Math.max(10, Math.floor((endAngle - startAngle) * 20));
    const angleStep = (endAngle - startAngle) / steps;

    const points: [number, number][] = [[centerX, centerY]];
    
    for (let i = 0; i <= steps; i++) {
      const angle = startAngle + i * angleStep;
      points.push([
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle)
      ]);
    }

    this.drawPolygon(points, true);
  }
}