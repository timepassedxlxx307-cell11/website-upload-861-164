function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-video');
  var overlay = document.getElementById('player-overlay');
  var hlsInstance = null;
  var prepared = false;

  function prepare() {
    if (!video || prepared) {
      return;
    }

    prepared = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    prepare();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (!video) {
    return;
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('play', function () {
    prepare();

    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('click', function () {
    prepare();
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
