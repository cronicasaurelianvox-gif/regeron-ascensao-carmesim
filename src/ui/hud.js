export function updateScore(scoreElement, score) {
  if (!scoreElement) {
    throw new Error('Elemento da pontuação não encontrado');
  }

  scoreElement.textContent = String(score);
}

export function updateStatus(statusElement, message) {
  if (!statusElement) {
    throw new Error('Elemento de status não encontrado');
  }

  statusElement.textContent = message;
}
