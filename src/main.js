import './styles/main.css';
import { addScore } from './game/score.js';
import { updateScore, updateStatus } from './ui/hud.js';

const startButton = document.querySelector('#start-button');
const scoreElement = document.querySelector('#score');
const statusElement = document.querySelector('#status');

let score = 0;

startButton.addEventListener('click', () => {
  score = addScore(score, 10);
  updateScore(scoreElement, score);
  updateStatus(statusElement, 'Partida iniciada! Você ganhou 10 pontos.');
});
