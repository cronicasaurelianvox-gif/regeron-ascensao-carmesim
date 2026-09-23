const fallbackAudioFiles = ['ReDungeon-O Reino Esquecido .mp3'];

const discoveredMusicFiles = [
  'Aetherion, o Eterno.mp3',
  'Artrias, Aquele que a Floresta Chamou.mp3',
  'Arty, Lamento Final.mp3',
  'Aune, Senhora dos Caminhos.mp3',
  'Celestines - Os que Permanecem.mp3',
  'Ephelias, Os Três Círculos.mp3',
  'Hestia, Primeira Chama.mp3',
  'Lilibeth, A Verdade que Caiu.mp3',
  'Morvak - Quando a Realidade Hesita.mp3',
  'Nishi - Senhora do Equilíbrio.mp3',
  'O Coração da Magia.mp3',
  'O Reino Esquecido .mp3',
  'Onde o Vento me Levará.mp3',
  'Re’Geron - Mundo Azul.mp3',
  'Salomão, o Último Arquimago.mp3',
  'Yoru, A Sombra que os Deuses Temem.mp3'
].map((fileName) => ({
  fileName,
  src: getTrackSource(fileName)
}));

const audioFiles =
  discoveredMusicFiles.length > 0
    ? discoveredMusicFiles
    : fallbackAudioFiles.map((fileName) => ({
        fileName,
        src: getTrackSource(fileName)
      }));

export const musicPlaylist = audioFiles
  .filter(({ fileName }) => /\.(mp3|ogg|wav)$/i.test(fileName))
  .sort((a, b) => a.fileName.localeCompare(b.fileName, 'pt-BR', { sensitivity: 'base' }));

export function getTrackSource(fileName) {
  const cleanFileName = String(fileName || '').trim();

  if (!cleanFileName) {
    return '';
  }

  return `${import.meta.env.BASE_URL}audio/music/${encodeURIComponent(cleanFileName)}`;
}

export function clampVolume(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(1, Math.max(0, numericValue));
}

export function getNextTrackIndex(currentIndex, totalTracks) {
  if (!Number.isInteger(currentIndex) || !Number.isInteger(totalTracks) || totalTracks <= 0) {
    return 0;
  }

  if (totalTracks === 1) {
    return 0;
  }

  return (currentIndex + 1) % totalTracks;
}

export function getPreviousTrackIndex(currentIndex, totalTracks) {
  if (!Number.isInteger(currentIndex) || !Number.isInteger(totalTracks) || totalTracks <= 0) {
    return 0;
  }

  if (totalTracks === 1) {
    return 0;
  }

  return (currentIndex - 1 + totalTracks) % totalTracks;
}

export function normalizeTrackSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]+/g, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function filterTracksByQuery(tracks, query) {
  const normalizedQuery = normalizeTrackSearchText(query);

  if (!normalizedQuery) {
    return tracks;
  }

  return tracks.filter((track) => {
    const trackTitle = normalizeTrackSearchText(formatTrackName(track.fileName));
    return trackTitle.includes(normalizedQuery);
  });
}

export function formatTrackName(fileName) {
  const cleanFileName = String(fileName ?? '')
    .replace(/\.[^.]+$/, '')
    .trim();

  if (!cleanFileName) {
    return 'Música';
  }

  return cleanFileName;
}
