import React from 'react';
import { TPSScores } from '../../types/tps.types';

interface RadarChartProps {
  data: TPSScores;
  selectedTraits?: string[];
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, selectedTraits }) => {
  // Get the top 12 traits for the radar chart to avoid overcrowding
  const traits = selectedTraits || Object.entries(data)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 12)
    .map(([trait]) => trait);

  const size = 300;
  const center = size / 2;
  const radius = center - 60;
  const maxValue = 10;

  // Calculate points for each trait
  const points = traits.map((trait, index) => {
    const angle = (index * 2 * Math.PI) / traits.length - Math.PI / 2;
    const value = data[trait] || 0;
    const distance = (value / maxValue) * radius;
    
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      labelX: center + Math.cos(angle) * (radius + 40),
      labelY: center + Math.sin(angle) * (radius + 40),
      trait,
      value: value.toFixed(1)
    };
  });

  // Create the polygon path
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';

  // Create concentric circles for scale
  const scaleCircles = [0.2, 0.4, 0.6, 0.8, 1.0].map(scale => ({
    radius: radius * scale,
    value: (maxValue * scale).toFixed(0)
  }));

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background circles */}
        {scaleCircles.map((circle, index) => (
          <circle
            key={index}
            cx={center}
            cy={center}
            r={circle.radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="1"
            opacity={0.3}
          />
        ))}

        {/* Axis lines */}
        {traits.map((trait, index) => {
          const angle = (index * 2 * Math.PI) / traits.length - Math.PI / 2;
          const endX = center + Math.cos(angle) * radius;
          const endY = center + Math.sin(angle) * radius;
          
          return (
            <line
              key={trait}
              x1={center}
              y1={center}
              x2={endX}
              y2={endY}
              stroke="hsl(var(--muted))"
              strokeWidth="1"
              opacity={0.3}
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={pathData}
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="hsl(var(--primary))"
            stroke="hsl(var(--background))"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {points.map((point, index) => (
          <g key={index}>
            <text
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium fill-foreground"
              style={{
                fontSize: '11px',
                textAnchor: point.labelX > center ? 'start' : 
                           point.labelX < center ? 'end' : 'middle'
              }}
            >
              {point.trait}
            </text>
            <text
              x={point.labelX}
              y={point.labelY + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-bold fill-primary"
              style={{
                fontSize: '10px',
                textAnchor: point.labelX > center ? 'start' : 
                           point.labelX < center ? 'end' : 'middle'
              }}
            >
              {point.value}
            </text>
          </g>
        ))}

        {/* Scale labels */}
        {scaleCircles.map((circle, index) => (
          <text
            key={index}
            x={center + 5}
            y={center - circle.radius}
            className="text-xs fill-muted-foreground"
            dominantBaseline="middle"
          >
            {circle.value}
          </text>
        ))}
      </svg>
    </div>
  );
};