(function() {
  function bindPlayer(block) {
    var video = block.querySelector("video[data-src]");
    var overlay = block.querySelector("[data-play-overlay]");
    var status = block.querySelector("[data-player-status]");
    var hlsInstance = null;
    var isReady = false;

    if (!video) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text || "";
      }
    }

    function prepare() {
      var source = video.dataset.src;

      if (isReady || !source) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          lowLatencyMode: true,
          maxBufferLength: 30
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function() {
          setStatus("");
        });

        hlsInstance.on(window.Hls.Events.ERROR, function(eventName, data) {
          if (data && data.fatal) {
            setStatus("视频加载失败，请稍后重试");
          }
        });

        isReady = true;
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        isReady = true;
        return;
      }

      setStatus("当前浏览器需要加载 HLS 播放组件");
    }

    function startPlayback() {
      prepare();

      var playPromise = video.play();

      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(function() {
          block.classList.add("is-playing");
          setStatus("");
        }).catch(function() {
          setStatus("请再次点击播放按钮");
        });
      } else {
        block.classList.add("is-playing");
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", function() {
      block.classList.add("is-playing");
    });

    video.addEventListener("pause", function() {
      if (!video.ended) {
        block.classList.remove("is-playing");
      }
    });

    video.addEventListener("ended", function() {
      block.classList.remove("is-playing");
    });

    window.addEventListener("beforeunload", function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(bindPlayer);
})();
