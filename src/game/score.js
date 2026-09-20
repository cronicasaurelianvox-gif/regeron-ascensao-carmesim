export function addScore(currentScore, points) {
  if (!Number.isFinite(currentScore)) {
    throw new TypeError('currentScore deve ser um número válido');
  }

  if (!Number.isFinite(points)) {
    throw new TypeError('points deve ser um número válido');
  }

  return currentScore + points;
}
