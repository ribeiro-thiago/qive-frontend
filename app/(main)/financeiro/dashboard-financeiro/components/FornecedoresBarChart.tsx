"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { formatCurrency } from "../utils/formatters";

interface FornecedoresBarChartProps {
  data: Array<{
    fornecedor: string;
    valorTotal: number;
    quantidade: number;
  }>;
  visualizacaoType: "valor" | "quantidade";
  height?: number;
  onBarClick?: (fornecedor: string) => void;
}

// Cores para as barras (sequência de cinzas)
const BAR_COLORS = [
  "#383E4C", // Surfaces/gray-700
  "#535865", // Surfaces/gray-600
  "#70747D", // Surfaces/gray-500
  "#898C95", // Surfaces/gray-400
  "#B6B9BF", // Surfaces/gray-300
];

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
            {data.fornecedor}
          </p>
          <p style={{ margin: 0, color: '#5F6572', fontSize: '14px' }}>
            {visualizacaoType === "valor" 
              ? formatCurrency(data.valorTotal) 
              : `${data.quantidade} ${data.quantidade === 1 ? 'conta' : 'contas'}`}
          </p>
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
  CustomTooltip.displayName = "FornecedoresBarChartTooltip";
  return CustomTooltip;
};

export function FornecedoresBarChart({ data, visualizacaoType, height = 200, onBarClick }: FornecedoresBarChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = React.useState(400);

  // Atualizar largura quando o container mudar de tamanho
  React.useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setContainerWidth(width);
      }
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Preparar dados para o Recharts
  const chartData = data.map(item => {
    // Garantir que o nome do fornecedor existe
    const fornecedorName = item.fornecedor || 'Fornecedor sem nome';
    
    return {
      name: fornecedorName,
      fornecedor: fornecedorName,
      valorTotal: item.valorTotal,
      quantidade: item.quantidade,
      displayValue: visualizacaoType === "valor" ? item.valorTotal : item.quantidade,
    };
  });

  // Criar função de label que acessa os dados diretamente
  const renderBarLabel = React.useCallback((props: any) => {
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
  }, [visualizacaoType]);

  // Função para quebrar texto em duas linhas
  const splitTextIntoTwoLines = (text: string, maxCharsPerLine: number): string[] => {
    if (text.length <= maxCharsPerLine) {
      return [text];
    }
    
    // Tentar quebrar em um espaço próximo ao meio
    const midPoint = Math.floor(text.length / 2);
    let breakPoint = midPoint;
    
    // Procurar espaço antes do meio
    for (let i = midPoint; i >= Math.max(0, midPoint - maxCharsPerLine * 0.3); i--) {
      if (text[i] === ' ' || text[i] === '-' || text[i] === '_') {
        breakPoint = i + 1;
        break;
      }
    }
    
    // Se não encontrou espaço, procurar depois do meio
    if (breakPoint === midPoint) {
      for (let i = midPoint; i < Math.min(text.length, midPoint + maxCharsPerLine * 0.3); i++) {
        if (text[i] === ' ' || text[i] === '-' || text[i] === '_') {
          breakPoint = i;
          break;
        }
      }
    }
    
    // Se ainda não encontrou, quebrar no meio exato
    if (breakPoint === midPoint) {
      breakPoint = Math.floor(text.length / 2);
    }
    
    const line1 = text.substring(0, breakPoint).trim();
    const line2 = text.substring(breakPoint).trim();
    
    return [line1, line2];
  };

  // Função customizada para renderizar o tick do eixo X (2 linhas)
  const renderCustomAxisTick = React.useCallback((props: any) => {
    const { x, y, payload } = props;
    
    if (!payload || !payload.value) {
      return null;
    }
    
    // Tentar encontrar o item pelo nome
    let item = chartData.find(d => d.name === payload.value || d.fornecedor === payload.value);
    
    // Se não encontrou, tentar usar o payload.value diretamente
    let fornecedorName = '';
    if (item) {
      fornecedorName = item.fornecedor || item.name || '';
    }
    
    // Se ainda não tem nome, usar o payload.value
    if (!fornecedorName || fornecedorName.trim() === '') {
      fornecedorName = payload.value || '';
    }
    
    // Se ainda estiver vazio, usar um placeholder
    if (!fornecedorName || fornecedorName.trim() === '') {
      fornecedorName = 'Fornecedor sem nome';
    }
    
    // Calcular largura disponível baseada no número de itens e largura do container
    const fontSize = 12;
    const avgCharWidth = fontSize * 0.55; // Aproximação da largura média de um caractere
    
    // Estimar largura disponível por barra (considerando margens e espaçamento)
    const margins = 40; // Margens laterais estimadas
    const availableContainerWidth = containerWidth - margins;
    const estimatedBarWidth = chartData.length > 0 
      ? Math.max(60, availableContainerWidth / chartData.length) 
      : 100;
    const availableWidth = estimatedBarWidth * 0.9; // 90% da largura
    const maxCharsPerLine = Math.max(10, Math.floor(availableWidth / avgCharWidth)); // Mínimo de 10 caracteres por linha
    
    // Quebrar texto em duas linhas
    const lines = splitTextIntoTwoLines(fornecedorName, maxCharsPerLine);
    
    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, index) => (
          <text
            key={index}
            x={0}
            y={0}
            dy={12 + (index * 14)} // Primeira linha em 12, segunda em 26
            textAnchor="middle"
            fill="#0d0f1c"
            style={{ 
              fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
              fontSize: `${fontSize}px`,
              fontWeight: '500'
            }}
          >
            {line}
          </text>
        ))}
      </g>
    );
  }, [chartData, containerWidth]);

  const CustomTooltip = createCustomTooltip(visualizacaoType);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full" 
      style={{ 
        fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
        margin: 0,
        padding: 0,
        width: '100%',
        height
      }}
    >
      <BarChart
        width={Math.max(containerWidth, 320)}
        height={height}
        data={chartData}
        margin={{ top: 30, right: -10, left: -10, bottom: 0 }}
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
          interval={0}
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
          label={renderBarLabel}
          onClick={(entry: any) => {
            if (!entry?.fornecedor || !onBarClick) return;
            onBarClick(entry.fornecedor);
          }}
          style={{ cursor: onBarClick ? "pointer" : "default" }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
}
