import { describe, expect, it } from 'vitest';
import { addScore } from '../src/game/score.js';

describe('addScore', () => {
  it('adiciona pontos à pontuação atual', () => {
    expect(addScore(10, 5)).toBe(15);
  });

  it('aceita pontuação zero', () => {
    expect(addScore(0, 5)).toBe(5);
  });

  it('rejeita uma pontuação inválida', () => {
    expect(() => addScore('10', 5)).toThrow(TypeError);
  });
});
