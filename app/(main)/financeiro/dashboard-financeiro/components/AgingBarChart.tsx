"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "../utils/formatters";

interface AgingBarChartProps {
  data: Array<{
    bucket: string;
    label: string;
    count: number;
    value: number;
  }>;
  visualizacaoType: "valor" | "quantidade";
  tipo: "aberto" | "vencidas";
  height?: number;
  onBarClick?: (bucket: string) => void;
}

// Mapeamento de cores por bucket
const BUCKET_COLORS: Record<string, string> = {
  "0-7": "#097129",     // Colors/green-800 - Até 7 dias
  "8-15": "#0CA83B",    // Colors/green-500 - 8-15 dias
  "16-30": "#FDC854",   // Colors/yellow-500 - 16-30 dias
  "31-60": "#FF9705",   // Colors/orange-500 - 31-60 dias
  "60+": "#F64133",     // Colors/red-500 - +60 dias
};

// Componente customizado para o label acima da barra
const createCustomBarLabel = (visualizacaoType: "valor" | "quantidade") => {
  const CustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    
    if (value === 0) return null;
    
    const displayValue = visualizacaoType === "valor" ? formatCurrency(value) : value.toString();
    
    return (
      <text
        x={x + width / 2}
        y={y - 12}
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
  CustomBarLabel.displayName = "AgingBarChartBarLabel";
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
  CustomTooltip.displayName = "AgingBarChartTooltip";
  return CustomTooltip;
};

export function AgingBarChart({ data, visualizacaoType, tipo, height = 200, onBarClick }: AgingBarChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState(height + 60);

  // Atualizar altura quando o container mudar de tamanho
  React.useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setContainerHeight(height);
      }
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Preparar dados para o Recharts
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
    displayValue: visualizacaoType === "valor" ? item.value : item.count,
    label: item.label,
    count: item.count,
    bucket: item.bucket,
  }));

  // Função customizada para renderizar o tick do eixo X
  const renderCustomAxisTick = (props: any) => {
    const { x, y, payload } = props;
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
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          {item.label}
        </text>
        <text
          x={0}
          y={0}
          dy={26}
          textAnchor="middle"
          fill="#5F6572"
          style={{ 
            fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
            fontSize: '11px',
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
    <div 
      ref={containerRef}
      className="w-full h-full" 
      style={{ 
        fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
        minHeight: '300px',
        margin: 0,
        padding: 0,
        width: '100%',
        height: '100%'
      }}
    >
      <ResponsiveContainer width="100%" height={containerHeight}>
        <BarChart 
          data={chartData}
          margin={{ top: 30, right: 0, left: 0, bottom: 0 }}
          barGap={8}
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
            height={50}
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
            radius={[4, 4, 0, 0]}
            label={<CustomBarLabel />}
            onClick={(entry: any) => {
              if (!entry?.bucket || !onBarClick) return;
              onBarClick(entry.bucket);
            }}
            style={{ cursor: onBarClick ? "pointer" : "default" }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={BUCKET_COLORS[entry.bucket] || "#0C3CF7"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

