let sharedAudioElement = null;
let sharedListenersBound = false;

export function getSharedAudioElement() {
  if (!sharedAudioElement) {
    sharedAudioElement = new Audio();
    sharedAudioElement.loop = false;
    sharedAudioElement.preload = 'auto';
  }

  return sharedAudioElement;
}

export function bindSharedAudioListeners(listeners = {}) {
  if (sharedListenersBound) return;

  const audio = getSharedAudioElement();

  if (typeof listeners.loadedmetadata === 'function') {
    audio.addEventListener('loadedmetadata', listeners.loadedmetadata);
  }

  if (typeof listeners.timeupdate === 'function') {
    audio.addEventListener('timeupdate', listeners.timeupdate);
  }

  if (typeof listeners.play === 'function') {
    audio.addEventListener('play', listeners.play);
  }

  if (typeof listeners.pause === 'function') {
    audio.addEventListener('pause', listeners.pause);
  }

  if (typeof listeners.ended === 'function') {
    audio.addEventListener('ended', listeners.ended);
  }

  if (typeof listeners.error === 'function') {
    audio.addEventListener('error', listeners.error);
  }

  sharedListenersBound = true;
}

export function isSharedAudioBound() {
  return sharedListenersBound;
}
