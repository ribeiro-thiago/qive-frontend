interface FakeBarcodeProps {
  value: string;
  height?: number;
}

export function FakeBarcode({ value, height = 48 }: FakeBarcodeProps) {
  const clean = (value || '').replace(/\s+/g, '');
  const digits = clean.replace(/\D/g, '') || '000000000000';
  
  const patterns: number[][] = [
    [1,1,1,3], [3,1,1,1], [1,3,1,1], [1,1,3,1], [2,1,2,2],
    [2,2,1,2], [2,2,2,1], [1,2,2,2], [2,1,1,3], [3,1,1,2]
  ];
  
  const unit = 2; // px per module
  const quiet = 10; // quiet zone modules
  let x = quiet;
  const bars: Array<{ x: number; w: number }> = [];
  let isBar = true;
  
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[i]);
    const pat = patterns[d % patterns.length];
    for (let j = 0; j < pat.length; j++) {
      const w = pat[j] * unit;
      if (isBar) bars.push({ x, w });
      x += w;
      isBar = !isBar;
    }
  }
  
  const totalW = x + quiet;
  
  return (
    <svg 
      width="100%" 
      height={height} 
      viewBox={`0 0 ${totalW} ${height}`} 
      preserveAspectRatio="none" 
      role="img" 
      aria-label="Código de barras da chave de acesso"
    >
      <rect x={0} y={0} width={totalW} height={height} fill="#fff" />
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} fill="#0d0f1c" />
      ))}
    </svg>
  );
}

