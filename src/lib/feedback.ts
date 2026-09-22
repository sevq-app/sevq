// Тактильная и звуковая обратная связь.
// Звуки синтезируются через Web Audio API (короткие тона), без внешних
// аудиофайлов — не увеличивает вес бандла и полностью контролируется по
// длительности/громкости.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(ctx: AudioContext, freq: number, startTime: number, duration: number, volume: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

/**
 * Тихий тон с нисходящей частотой и нарастающим приглушением — ощущение,
 * что звук "улетает от нас" (для отправленного сообщения). Частота
 * плавно едет вниз, а lowpass-фильтр закрывается к хвосту, будто звук
 * удаляется и глохнет вдалеке.
 */
function playDepartingTone(
  ctx: AudioContext,
  startTime: number,
  freqStart: number,
  freqEnd: number,
  duration: number,
  attack: number,
  decayTau: number,
  peak: number,
  filterStart: number,
  filterEnd: number
) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freqStart, startTime);
  osc.frequency.linearRampToValueAtTime(freqEnd, startTime + duration);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterStart, startTime);
  filter.frequency.linearRampToValueAtTime(filterEnd, startTime + duration);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peak, startTime + attack);
  gain.gain.setTargetAtTime(0.0001, startTime + attack, decayTau);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);
}

/**
 * Тихий приглушённый тон с лёгким вибрато — мягкий, "войлочный" звук
 * без резких верхних частот (используется для входящего сообщения).
 */
function playMuffledTone(
  ctx: AudioContext,
  startTime: number,
  baseFreq: number,
  duration: number,
  attack: number,
  decayTau: number,
  peak: number,
  filterFreq: number
) {
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = baseFreq;

  lfo.type = 'sine';
  lfo.frequency.value = 6;
  lfoGain.gain.value = baseFreq * 0.01;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);

  filter.type = 'lowpass';
  filter.frequency.value = filterFreq;

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(peak, startTime + attack);
  gain.gain.setTargetAtTime(0.0001, startTime + attack, decayTau);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  lfo.start(startTime);
  osc.stop(startTime + duration + 0.1);
  lfo.stop(startTime + duration + 0.1);
}

export type SoundKind = 'send' | 'receive' | 'tap';

/** Короткий (<0.5с), тихий и приятный звук. Не громче, чем нужно для лёгкого фидбэка. */
export function playSound(kind: SoundKind) {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    switch (kind) {
      case 'send':
        // тихий, тёплый тон, "улетающий" вниз и глохнущий — H1
        playDepartingTone(ctx, now, 210, 130, 0.22, 0.02, 0.075, 0.14, 2600, 800);
        break;
      case 'receive':
        // тихий приглушённый тон с мягкой атакой — G3-a
        playMuffledTone(ctx, now, 145, 0.22, 0.025, 0.075, 0.13, 1500);
        break;
      case 'tap':
      default:
        playTone(ctx, 440, now, 0.05, 0.03);
        break;
    }
  } catch {
    // звук недоступен (например, автоплей заблокирован) — молча игнорируем
  }
}

/**
 * Лёгкая вибрация. Работает на Android (Chrome), но НЕ поддерживается
 * в Safari на iOS — там Vibration API отсутствует в принципе, это
 * ограничение платформы, а не баг приложения.
 */
export function triggerHaptic(pattern: number | number[] = 15) {
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // недоступно — молча игнорируем
  }
}
