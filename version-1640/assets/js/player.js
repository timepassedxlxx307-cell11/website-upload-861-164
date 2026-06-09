(function () {
  function setupStaticPlayer(videoId, buttonId, sourceUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hlsInstance = null;
    var prepared = false;

    if (!video || !button || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = sourceUrl;
    }

    function play() {
      attachSource();
      button.classList.add("is-hidden");
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", function (event) {
      event.preventDefault();
      play();
    });

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  }

  window.setupStaticPlayer = setupStaticPlayer;
})();
