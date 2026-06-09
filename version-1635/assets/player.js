function setupPlayer(config) {
  const video = document.querySelector('[data-player-video]');
  const overlay = document.querySelector('[data-player-overlay]');
  const button = document.querySelector('[data-player-button]');

  if (!video || !config || !config.source) {
    return;
  }

  let ready = false;
  let hlsInstance = null;

  const loadVideo = function () {
    if (ready) {
      return;
    }

    ready = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(config.source);
      hlsInstance.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.source;
    } else {
      video.src = config.source;
    }
  };

  const playVideo = function () {
    loadVideo();

    const playPromise = video.play();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  };

  const toggleVideo = function () {
    if (video.paused) {
      playVideo();
    } else {
      video.pause();
    }
  };

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('click', toggleVideo);
  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
  video.addEventListener('pause', function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove('is-hidden');
    }
  });
  video.addEventListener('ended', function () {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
