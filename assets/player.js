function createMoviePlayer(options) {
  var video = document.getElementById(options.videoId);
  var cover = document.getElementById(options.coverId);
  var url = options.url;
  var hlsInstance = null;
  var ready = false;

  function start() {
    if (!video || ready) {
      if (video) {
        video.play().catch(function () {});
      }
      return;
    }

    ready = true;

    if (cover) {
      cover.classList.add('is-hidden');
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', function () {
        video.play().catch(function () {});
      }, { once: true });
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(function () {});
      });
      hlsInstance.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          try {
            hlsInstance.destroy();
          } catch (error) {}
          video.setAttribute('controls', 'controls');
        }
      });
      return;
    }

    video.src = url;
    video.play().catch(function () {});
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!ready) {
        start();
      }
    });
  }
}
