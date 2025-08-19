(() => {
  const video = document.getElementById("bgVideo");

  async function playWithSound() {
    try {
      video.muted = false;
      await video.play();
    } catch (e) {
      // Autoplay may still be blocked; we'll retry on lifecycle events and a short timer
    }
  }

  function scheduleRetries() {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(async () => {
      attempts += 1;
      if (!video.paused && !video.muted) {
        clearInterval(interval);
        return;
      }
      await playWithSound();
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 1500);
  }

  // Keep sound always on if something tries to mute the video
  video.addEventListener("volumechange", () => {
    // Do nothing here; initial load uses muted autoplay for reliability
  });

  // Initial attempts
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      // Start muted first for reliable autoplay background
      video.muted = true;
      video.play().catch(() => {});
      // Then try to enable sound
      playWithSound();
      scheduleRetries();
    });
  } else {
    video.muted = true;
    video.play().catch(() => {});
    playWithSound();
    scheduleRetries();
  }

  // Retry on lifecycle events (no visible UI)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      playWithSound();
    }
  });
  window.addEventListener("focus", playWithSound);

  // Turn sound on at the first user interaction (required in many browsers)
  const enableOnGesture = async () => {
    await playWithSound();
    window.removeEventListener("click", enableOnGesture);
    window.removeEventListener("keydown", enableOnGesture);
    window.removeEventListener("touchstart", enableOnGesture);
  };
  window.addEventListener("click", enableOnGesture, { once: false });
  window.addEventListener("keydown", enableOnGesture, { once: false });
  window.addEventListener("touchstart", enableOnGesture, { once: false });
})();


