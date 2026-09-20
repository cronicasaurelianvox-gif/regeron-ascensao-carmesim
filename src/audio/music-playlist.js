const fallbackAudioFiles = ['ReDungeon-O Reino Esquecido .mp3'];

const discoveredMusicFiles = Object.entries(
  import.meta.glob('/public/audio/music/*.{mp3,ogg,wav}', {
    eager: true,
    import: 'default'
  })
).map(([key, value]) => {
  const fileName = decodeURIComponent(String(key).split('/').pop() || '');

  if (!fileName) {
    return null;
  }

  return {
    fileName,
    src: typeof value === 'string' ? value : `${import.meta.env.BASE_URL}audio/music/${fileName}`
  };
});

const audioFiles =
  discoveredMusicFiles.filter(Boolean).length > 0
    ? discoveredMusicFiles.filter(Boolean)
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

  return `${import.meta.env.BASE_URL}audio/music/${cleanFileName}`;
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
