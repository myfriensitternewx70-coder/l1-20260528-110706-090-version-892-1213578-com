(function() {
  function setupMoviePlayer(video, trigger, source) {
    if (!video || !trigger || !source) {
      return;
    }

    var loaded = false;
    var hlsInstance = null;

    function hideTrigger() {
      trigger.classList.add("is-hidden");
    }

    function attach() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      hideTrigger();
      attach();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function() {});
      }
    }

    trigger.addEventListener("click", play);
    video.addEventListener("click", function() {
      if (!loaded || video.paused) {
        play();
      }
    });
    video.addEventListener("play", hideTrigger);
    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
