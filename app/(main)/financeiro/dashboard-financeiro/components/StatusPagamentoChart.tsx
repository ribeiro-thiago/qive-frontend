"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { formatCurrency } from "../utils/formatters";

interface StatusPagamentoChartProps {
  data: Array<{
    etapa: string;
    label: string;
    count: number;
    value: number;
  }>;
  visualizacaoType: "valor" | "quantidade";
  height?: number;
  onBarClick?: (etapa: string) => void;
}

// Cores para cada etapa
const ETAPA_COLORS: Record<string, string> = {
  "conferir": "#0484EE",      // Colors/azure-500
  "aprovacao": "#0059A3",     // Colors/azure-800
  "pagar": "#003F70",         // Colors/azure-1000
  "bloqueados": "#051863",    // Colors/blue-1000
};

// Componente customizado para o label no topo da barra
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
  CustomBarLabel.displayName = "StatusPagamentoChartBarLabel";
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
          <p style={{ margin: '8px 0 0 0', color: '#5F6572', fontSize: '12px', fontWeight: 600, lineHeight: '16px' }}>
            Clique para ver em
            <br />
            gestão de pagamentos
          </p>
        </div>
      );
    }
    return null;
  };
  CustomTooltip.displayName = "StatusPagamentoChartTooltip";
  return CustomTooltip;
};

export function StatusPagamentoChart({ data, visualizacaoType, height, onBarClick }: StatusPagamentoChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  // Usar altura padrão de 300px para garantir que o gráfico seja visível desde o início
  const [containerHeight, setContainerHeight] = React.useState(height || 300);

  // Atualizar altura quando o container mudar de tamanho
  React.useEffect(() => {
    if (height) {
      setContainerHeight(Math.max(height, 300));
      return;
    }

    const updateHeight = () => {
      if (containerRef.current) {
        // Tentar obter altura do container
        let computedHeight = containerRef.current.clientHeight;
        
        // Se a altura for 0 ou muito pequena, usar altura do offsetHeight ou altura mínima
        if (computedHeight === 0 || computedHeight < 300) {
          computedHeight = containerRef.current.offsetHeight || 300;
        }
        
        // Se ainda for muito pequena, usar altura do parent ou altura mínima
        if (computedHeight < 300 && containerRef.current.parentElement) {
          const parentHeight = containerRef.current.parentElement.clientHeight;
          if (parentHeight > 300) {
            computedHeight = parentHeight - 100; // Subtrair espaço dos filtros
          }
        }
        
        // Garantir altura mínima de 300px, especialmente importante em mobile
        const finalHeight = Math.max(computedHeight || 300, 300);
        setContainerHeight(finalHeight);
      }
    };

    // Executar imediatamente e também após um pequeno delay para garantir que o DOM está renderizado
    updateHeight();
    
    const timeoutId = setTimeout(() => {
      updateHeight();
    }, 100);

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Também observar mudanças de tamanho da janela
    window.addEventListener('resize', updateHeight);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [height]);

  // Preparar dados para o Recharts
  const chartData = data.map(item => ({
    name: item.label,
    value: item.value,
    displayValue: visualizacaoType === "valor" ? item.value : item.count,
    label: item.label,
    count: item.count,
    etapa: item.etapa,
  }));

  const CustomBarLabel = createCustomBarLabel(visualizacaoType);
  const CustomTooltip = createCustomTooltip(visualizacaoType);

  return (
    <div 
      ref={containerRef}
      className="w-full min-h-[300px]" 
      style={{ 
        fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
        margin: 0,
        padding: 0,
        width: '100%',
        height: containerHeight > 0 ? `${containerHeight}px` : '100%',
        minHeight: '300px'
      }}
    >
      <ResponsiveContainer width="100%" height={containerHeight || 300}>
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
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: '#0d0f1c',
              fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
              fontSize: 14,
              fontWeight: 500,
            }}
          />
          <YAxis 
            type="number"
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
              if (!entry?.etapa || !onBarClick) return;
              onBarClick(entry.etapa);
            }}
            style={{ cursor: onBarClick ? "pointer" : "default" }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={ETAPA_COLORS[entry.etapa] || "#0C3CF7"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}



