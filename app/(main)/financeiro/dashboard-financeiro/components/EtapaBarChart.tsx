"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { formatCurrency } from "../utils/formatters";

interface EtapaBarChartProps {
  data: Array<{
    etapa: string;
    label: string;
    count: number;
    value: number;
  }>;
  height?: number;
  visualizacaoType?: "valor" | "quantidade";
}

// Componente customizado para o label acima da barra
const createCustomBarLabel = (visualizacaoType: "valor" | "quantidade") => {
  const CustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    
    if (value === 0) return null;
    
    const displayValue = visualizacaoType === "valor" ? formatCurrency(value) : value.toString();
    
    return (
      <text
        x={x + width / 2}
        y={y - 10}
        fill="#0d0f1c"
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ 
          fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
          fontSize: '14px',
          fontWeight: '600'
        }}
      >
        {displayValue}
      </text>
    );
  };
  CustomBarLabel.displayName = "EtapaBarChartBarLabel";
  return CustomBarLabel;
};

// Tooltip customizado
const createCustomTooltip = (visualizacaoType: "valor" | "quantidade") => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          style={{
            backgroundColor: 'white',
            padding: '12px 16px',
            border: '1px solid #EBECEE',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, color: '#0d0f1c', marginBottom: '4px' }}>
            {data.label}
          </p>
          <p style={{ margin: 0, color: '#5F6572', fontSize: '14px' }}>
            {visualizacaoType === "valor" ? formatCurrency(data.value) : `${data.count} ${data.count === 1 ? 'conta' : 'contas'}`}
          </p>
          {visualizacaoType === "valor" && (
            <p style={{ margin: 0, color: '#5F6572', fontSize: '13px' }}>
              {data.count} {data.count === 1 ? 'conta' : 'contas'}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  CustomTooltip.displayName = "EtapaBarChartTooltip";
  return CustomTooltip;
};

export function EtapaBarChart({ data, height = 240, visualizacaoType = "valor" }: EtapaBarChartProps) {
  // Preparar dados para o Recharts
  const chartData = data.map(item => ({
    name: item.label, // Usar o label como nome para exibir
    value: item.value,
    displayValue: visualizacaoType === "valor" ? item.value : item.count,
    label: item.label,
    count: item.count,
    etapa: item.etapa,
  }));

  // Função customizada para renderizar o tick do eixo X
  const renderCustomAxisTick = (props: any) => {
    const { x, y, payload } = props;
    // Encontrar o item correspondente no chartData
    const item = chartData.find(d => d.name === payload.value);
    
    if (!item) return null;
    
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={12}
          textAnchor="middle"
          fill="#0d0f1c"
          style={{ 
            fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {item.label}
        </text>
        <text
          x={0}
          y={0}
          dy={28}
          textAnchor="middle"
          fill="#5F6572"
          style={{ 
            fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: '400'
          }}
        >
          {item.count} {item.count === 1 ? 'conta' : 'contas'}
        </text>
      </g>
    );
  };

  const CustomBarLabel = createCustomBarLabel(visualizacaoType);
  const CustomTooltip = createCustomTooltip(visualizacaoType);

  return (
    <div className="w-full" style={{ fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif' }}>
      <ResponsiveContainer width="100%" height={height + 60}>
        <BarChart 
          data={chartData}
          margin={{ top: 30, right: 0, left: 0, bottom: 0 }}
          barGap={16}
        >
          <CartesianGrid 
            strokeDasharray="2 2" 
            stroke="#EBECEE" 
            vertical={false}
          />
          <XAxis 
            dataKey="name" 
            tick={renderCustomAxisTick}
            axisLine={false}
            tickLine={false}
            height={60}
          />
          <YAxis 
            hide 
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: 'transparent' }}
          />
          <Bar 
            dataKey="displayValue" 
            fill="#0C3CF7" 
            radius={[4, 4, 0, 0]}
            label={<CustomBarLabel />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

