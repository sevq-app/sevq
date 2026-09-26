import assert from 'node:assert/strict';
import test from 'node:test';
import { hsvToHex, hsvToWheelPoint, messageGradientColors, messageThemeColors, setHexBrightness, wheelPointToHsv } from './color.ts';

test('all six message themes have dark-to-light palettes', () => {
  assert.deepEqual(Object.keys(messageThemeColors), ['spring', 'summer', 'autumn', 'winter', 'aurora', 'sea']);
  for (const palette of Object.values(messageThemeColors)) {
    const value = (hex: string) => Math.max(...hex.match(/[0-9a-f]{2}/gi)!.map((part) => parseInt(part, 16)));
    assert.ok(value(palette.dark) < value(palette.light));
  }
  assert.equal(messageThemeColors.aurora.primary, '#2EC4B6');
});

test('message gradients stay close to the chosen colour without white highlights', () => {
  const palettes = [...Object.values(messageThemeColors), messageGradientColors('#2EC4B6')];
  for (const { primary, dark, light } of palettes) {
    const channels = (hex: string) => hex.match(/[0-9a-f]{2}/gi)!.map((part) => parseInt(part, 16));
    const [primaryChannels, darkChannels, lightChannels] = [primary, dark, light].map(channels);
    assert.ok(darkChannels.every((channel, index) => channel <= primaryChannels[index]));
    assert.ok(lightChannels.every((channel, index) => channel >= primaryChannels[index]));
    assert.ok(lightChannels.every((channel, index) => channel - primaryChannels[index] <= 36));
  }
  assert.equal(messageGradientColors('#808080').dark, '#6e6e6e');
  assert.equal(messageGradientColors('#808080').light, '#929292');
});

test('brightness adjustment preserves full brightness and darkens at lower values', () => {
  assert.equal(setHexBrightness('#2EC4B6', 100), '#2ec4b6');
  assert.notEqual(setHexBrightness('#2EC4B6', 50), '#2ec4b6');
});

test('colour wheel cardinal points match its CSS conic gradient', () => {
  const radius = 100;
  // The unchanged wheel has red at the right, green at lower-left and blue at upper-left.
  assert.equal(hsvToHex(wheelPointToHsv(radius, 0, radius)), '#ff0000');
  assert.equal(hsvToHex(wheelPointToHsv(-radius / 2, Math.sqrt(3) * radius / 2, radius)), '#00ff00');
  assert.equal(hsvToHex(wheelPointToHsv(-radius / 2, -Math.sqrt(3) * radius / 2, radius)), '#0000ff');
});

test('wheel marker uses the inverse of point-to-colour mapping', () => {
  for (const hue of [0, 60, 120, 180, 240, 300]) {
    const point = hsvToWheelPoint({ h: hue, s: 80, v: 100 }, 100);
    const mapped = wheelPointToHsv(point.x, point.y, 100);
    assert.ok(Math.abs(mapped.h - hue) < 0.000001);
    assert.ok(Math.abs(mapped.s - 80) < 0.000001);
  }
});
