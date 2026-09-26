export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

/**
 * Maps a point relative to the centre of the CSS colour wheel to HSV.
 * The wheel's conic gradient starts with red on the right and progresses
 * clockwise, which is also the direction used by atan2 in screen coordinates.
 */
export function wheelPointToHsv(x: number, y: number, radius: number, value = 100): HsvColor {
  const safeRadius = Math.max(radius, Number.EPSILON);
  const distance = Math.min(Math.hypot(x, y), safeRadius);
  const h = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  return { h, s: distance / safeRadius * 100, v: value };
}

/** Returns the marker offset for the wheel orientation used above. */
export function hsvToWheelPoint({ h, s }: HsvColor, radius: number): { x: number; y: number } {
  const radians = h * Math.PI / 180;
  const distance = Math.max(0, Math.min(100, s)) / 100 * radius;
  return { x: Math.cos(radians) * distance, y: Math.sin(radians) * distance };
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

export function messageGradientColors(primary: string): { primary: string; dark: string; light: string } {
  return {
    primary,
    // A 28% end-to-end range is clearly visible, while mixing only 14% toward
    // black/white keeps both edges recognisably the selected colour.
    dark: shadeHex(primary, -0.14),
    light: shadeHex(primary, 0.14),
  };
}

export const messageThemeColors: Record<string, { primary: string; dark: string; light: string }> = {
  spring: messageGradientColors('#E7548B'),
  summer: messageGradientColors('#F5A000'),
  autumn: messageGradientColors('#E06B24'),
  winter: messageGradientColors('#429FD1'),
  aurora: messageGradientColors('#2EC4B6'),
  sea: messageGradientColors('#1976C9'),
};

/** Scales HSV value while preserving a palette color's hue and saturation. */
export function setHexBrightness(hex: string, brightness: number): string {
  const hsv = hexToHsv(hex);
  return hsvToHex({ ...hsv, v: Math.max(0, Math.min(100, hsv.v * brightness / 100)) });
}
