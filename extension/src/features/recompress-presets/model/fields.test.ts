import { describe, expect, it } from 'vitest';
import { DEFAULT_FIELDS, SLIDERS, describeStep, trimError } from './fields';

describe('recompress preset fields', () => {
  it('every slider has its default value', () => {
    for (const def of SLIDERS) {
      const step = def.steps.find((s) => s.value === DEFAULT_FIELDS[def.field]);
      expect(step?.size ?? 100).toBe(100);
    }
  });

  it('describes steps', () => {
    const crf = SLIDERS[0]!;
    expect(describeStep(crf, crf.steps[8]!)).toBe('около 89% размера');
    const fps = SLIDERS.at(-1)!;
    expect(describeStep(fps, fps.steps[0]!)).toBe('как у исходника');
    expect(describeStep(fps, fps.steps[3]!)).toBe('около 85% размера, 93% времени');
  });

  it('checks the smart moment of time like the service', () => {
    for (const ok of ['94f', '12.5', '0:12.5', '1:02:03.25', '']) expect(trimError(ok, false)).toBe('');
    for (const ok of ['-94F', '-0:10.25', '3:40.5']) expect(trimError(ok, true)).toBe('');
    expect(trimError('-5', false)).not.toBe('');
    for (const wrong of ['abc', '1:75', '1:60:00', '12,5']) expect(trimError(wrong, true)).not.toBe('');
  });
});
