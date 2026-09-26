import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { previewText } from './messagePreview.ts';

describe('previewText', () => {
  const fallback = 'Нет сообщений';

  it('uses the fallback when the text is absent', () => {
    assert.equal(previewText(undefined, fallback), fallback);
    assert.equal(previewText('', fallback), fallback);
  });

  it('formats supported service prefixes', () => {
    const cases = [
      ['voice:recording.webm', '🎤 Голосовое сообщение'],
      ['image:https://example.com/photo.jpg', '📷 Фото'],
      ['sticker:😀', '😀 Стикер'],
    ] as const;

    for (const [input, expected] of cases) {
      assert.equal(previewText(input, fallback), expected);
    }
  });

  it('leaves regular text unchanged', () => {
    assert.equal(previewText('Привет!', fallback), 'Привет!');
  });

  it('does not treat a service marker in the middle as a prefix', () => {
    const text = 'Ссылка image:https://example.com/photo.jpg';
    assert.equal(previewText(text, fallback), text);
  });
});
