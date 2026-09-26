import assert from 'node:assert/strict';
import test from 'node:test';
import { messageThemeColors, setHexBrightness } from './color.ts';

test('all six message themes have dark-to-light palettes', () => {
  assert.deepEqual(Object.keys(messageThemeColors), ['spring', 'summer', 'autumn', 'winter', 'aurora', 'sea']);
  for (const palette of Object.values(messageThemeColors)) {
    const value = (hex: string) => Math.max(...hex.match(/[0-9a-f]{2}/gi)!.map((part) => parseInt(part, 16)));
    assert.ok(value(palette.dark) < value(palette.light));
  }
  assert.equal(messageThemeColors.aurora.primary, '#2EC4B6');
});

test('brightness adjustment preserves full brightness and darkens at lower values', () => {
  assert.equal(setHexBrightness('#2EC4B6', 100), '#2ec4b6');
  assert.notEqual(setHexBrightness('#2EC4B6', 50), '#2ec4b6');
});
