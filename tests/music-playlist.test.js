import { describe, expect, it } from 'vitest';

import {
  clampVolume,
  getNextTrackIndex,
  getPreviousTrackIndex,
  getTrackSource,
  formatTrackName,
  musicPlaylist,
  normalizeTrackSearchText,
  filterTracksByQuery
} from '../src/audio/music-playlist.js';

describe('music playlist', () => {
  it('detecta automaticamente as músicas da pasta pública e ignora entradas inválidas', () => {
    expect(musicPlaylist.length).toBeGreaterThan(0);
    expect(musicPlaylist.every((track) => /\.(mp3|ogg|wav)$/i.test(track.fileName))).toBe(true);
    expect(musicPlaylist.some((track) => track.fileName.includes('ReDungeon'))).toBe(true);
  });

  it('mantém o volume dentro do intervalo válido', () => {
    expect(clampVolume(-1)).toBe(0);
    expect(clampVolume(0.25)).toBe(0.25);
    expect(clampVolume(2)).toBe(1);
  });

  it('avança em sequência e retorna à primeira faixa', () => {
    expect(getNextTrackIndex(0, 3)).toBe(1);
    expect(getNextTrackIndex(2, 3)).toBe(0);
    expect(getNextTrackIndex(1, 1)).toBe(0);
  });

  it('retorna à faixa anterior e mantém o nome do arquivo sem a extensão', () => {
    expect(getPreviousTrackIndex(0, 3)).toBe(2);
    expect(getPreviousTrackIndex(1, 3)).toBe(0);
    expect(formatTrackName('musica-02.mp3')).toBe('musica-02');
  });

  it('gera URLs compatíveis com o BASE_URL do Vite e do GitHub Pages', () => {
    const trackUrl = getTrackSource('musica-02.mp3');

    expect(trackUrl).toBe(`${import.meta.env.BASE_URL}audio/music/musica-02.mp3`);
    expect(trackUrl).not.toContain('/Re-Dungeon-Game/');
  });

  it('normaliza texto para busca sem diferenciar maiúsculas e acentos', () => {
    expect(normalizeTrackSearchText('Batalha Final')).toBe('batalha final');
    expect(normalizeTrackSearchText('MÚSICA 02')).toBe('musica 02');
    expect(normalizeTrackSearchText('  Música - 03  ')).toBe('musica 03');
  });

  it('filtra faixas por pesquisa textual', () => {
    const tracks = [
      { fileName: 'musica-01.mp3' },
      { fileName: 'Batalha-Epica.mp3' },
      { fileName: 'exploracao-02.mp3' }
    ];

    expect(filterTracksByQuery(tracks, 'batalha')).toHaveLength(1);
    expect(filterTracksByQuery(tracks, 'MÚSICA')).toHaveLength(1);
    expect(filterTracksByQuery(tracks, 'nenhuma')).toHaveLength(0);
  });
});
