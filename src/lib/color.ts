export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

export function hsvToHex({ h, s, v }: HsvColor): string {
  const saturation = s / 100;
  const value = v / 100;
  const chroma = value * saturation;
  const segment = ((h % 360) + 360) % 360 / 60;
  const x = chroma * (1 - Math.abs((segment % 2) - 1));
  const [r1, g1, b1] = segment < 1 ? [chroma, x, 0]
    : segment < 2 ? [x, chroma, 0]
      : segment < 3 ? [0, chroma, x]
        : segment < 4 ? [0, x, chroma]
          : segment < 5 ? [x, 0, chroma]
            : [chroma, 0, x];
  const match = value - chroma;
  return `#${[r1, g1, b1].map((part) => Math.round((part + match) * 255).toString(16).padStart(2, '0')).join('')}`;
}

export function hexToHsv(hex: string): HsvColor {
  const value = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }
  return { h: h < 0 ? h + 360 : h, s: max ? (delta / max) * 100 : 0, v: max * 100 };
}

export function shadeHex(hex: string, amount: number): string {
  const value = hex.replace('#', '');
  return `#${[0, 2, 4].map((index) => {
    const channel = parseInt(value.slice(index, index + 2), 16);
    const target = amount > 0 ? 255 : 0;
    return Math.round(channel + (target - channel) * Math.abs(amount)).toString(16).padStart(2, '0');
  }).join('')}`;
}
