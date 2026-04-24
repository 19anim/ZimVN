const VIDEOS_DATA = [
  {
    id: 1,
    title: "ZIM Academy - 139 Võ Oanh - Q. Bình Thạnh",
    location: "ZIM Academy - 139 Võ Oanh - Q. Bình Thạnh",
    thumbnail: "./assets/thumbnails/1.avif",
    video: "./assets/videos/vid_1.webm",
    description: "Trải nghiệm học tập chất lượng cao",
  },
  {
    id: 2,
    title: "ZIM Academy - 329 - 331 An Dương Vương, P.3, Q.5",
    location: "ZIM Academy - 329 - 331 An Dương Vương, P.3, Q.5",
    thumbnail: "./assets/thumbnails/2.avif",
    video: "./assets/videos/vid_2.webm",
    description: "Trung tâm đào tạo công nghệ hàng đầu Việt Nam",
  },
  {
    id: 3,
    title: "ZIM Academy - 148 Hoàng Diệu 2 - Tp. Thủ Đức",
    location: "ZIM Academy - 148 Hoàng Diệu 2 - Tp. Thủ Đức",
    thumbnail: "./assets/thumbnails/3.avif",
    video: "./assets/videos/vid_3.webm",
    description: "Không gian học tập hiện đại và sáng tạo",
  },
  {
    id: 4,
    title: "ZIM Academy - 243-245 Nguyễn Văn Linh, Đà Nẵng",
    location: "ZIM Academy - 243-245 Nguyễn Văn Linh, Đà Nẵng",
    thumbnail: "./assets/thumbnails/4.avif",
    video: "./assets/videos/vid_4.webm",
    description: "Trung tâm đào tạo công nghệ hàng đầu miền Trung",
  },
  {
    id: 5,
    title: "ZIM Academy - Q.10",
    location: "ZIM Academy - Q.10",
    thumbnail: "./assets/thumbnails/5.avif",
    video: "./assets/videos/vid_5.webm",
    description: "Trung tâm đào tạo công nghệ hàng đầu Việt Nam",
  },
];

const generateVideosList = () => {
  const videos = [];
  for (let i = 0; i < 4; i++) {
    VIDEOS_DATA.forEach((video) => {
      videos.push({
        ...video,
        id: videos.length + 1,
        title: `${video.title} (${i + 1})`,
      });
    });
  }
  return videos;
};

const VIDEOS = generateVideosList();
const HOVER_ACTIVATION_DELAY = 2000;
const HOVER_RING_LENGTH = 188.5;
const TILT_MAX_ROTATION = 8;
const TILT_DEPTH = 14;
const TILT_PERSPECTIVE = 1000;

function createSwiperManager(containerId) {
  const container = document.getElementById(containerId);
  const swiperWrapper = container.querySelector("#swiper");

  const state = {
    currentIndex: 0,
    articleWidth: 430,
    gap: 28,
    totalWidth: 458,
    isAnimating: false,
    autoPlayInterval: null,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    isTouchDevice:
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0),
    hoverTimeouts: new Map(),
    playingVideos: new Set(),
    touchStartX: 0,
    touchStartY: 0,
    touchDeltaX: 0,
    touchDeltaY: 0,
    isPageVisible: !document.hidden,
    isPointerInside: false,
    tiltFrame: null,
    tiltTargetArticle: null,
    tiltRotateX: 0,
    tiltRotateY: 0,
  };

  const applyTilt = (article, rotateX = 0, rotateY = 0) => {
    article.style.transform = `
      perspective(${TILT_PERSPECTIVE}px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(${Math.max(Math.abs(rotateX), Math.abs(rotateY)) > 0 ? TILT_DEPTH : 0}px)
    `;
  };

  const queueTiltFrame = (article, rotateX, rotateY) => {
    state.tiltTargetArticle = article;
    state.tiltRotateX = rotateX;
    state.tiltRotateY = rotateY;

    if (state.tiltFrame) return;

    state.tiltFrame = window.requestAnimationFrame(() => {
      if (state.tiltTargetArticle) {
        applyTilt(state.tiltTargetArticle, state.tiltRotateX, state.tiltRotateY);
      }
      state.tiltFrame = null;
    });
  };

  const resetTilt = (article) => {
    if (state.tiltTargetArticle === article) {
      state.tiltTargetArticle = null;
      state.tiltRotateX = 0;
      state.tiltRotateY = 0;
    }
    applyTilt(article, 0, 0);
  };

  const hideHoverProgress = (article) => {
    article.classList.remove("hover-arming");
  };

  const clearHoverPlayback = (article) => {
    const timeout = state.hoverTimeouts.get(article);
    if (timeout) {
      clearTimeout(timeout);
      state.hoverTimeouts.delete(article);
    }
    hideHoverProgress(article);
  };

  const resetVideoToThumbnail = (videoElement) => {
    videoElement.pause();
    videoElement.currentTime = 0;
    videoElement.load();
  };

  const stopAllVideos = () => {
    document.querySelectorAll(".article-video").forEach((video) => {
      resetVideoToThumbnail(video);
    });

    document
      .querySelectorAll(".swiper-article")
      .forEach((article) => article.classList.remove("is-playing"));
    state.playingVideos.clear();
  };

  const syncDimensions = () => {
    const firstArticle = swiperWrapper.querySelector(".swiper-article");
    if (!firstArticle) return;

    const articleStyles = window.getComputedStyle(firstArticle);
    const wrapperStyles = window.getComputedStyle(swiperWrapper);
    state.articleWidth =
      parseFloat(articleStyles.width) || firstArticle.getBoundingClientRect().width;
    state.gap =
      parseFloat(
        wrapperStyles.columnGap || wrapperStyles.gap || articleStyles.marginRight || "28",
      ) || 28;
    state.totalWidth = state.articleWidth + state.gap;
  };

  const updatePosition = () => {
    syncDimensions();
    const containerWidth = container.offsetWidth;
    const centerOffset = containerWidth / 2 - state.articleWidth / 2;
    const translateX = centerOffset - state.currentIndex * state.totalWidth;

    swiperWrapper.style.transition = state.prefersReducedMotion
      ? "none"
      : "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
    swiperWrapper.style.transform = `translateX(${translateX}px)`;

    document.querySelectorAll(".swiper-article").forEach((article, index) => {
      article.classList.toggle("active", index === state.currentIndex);
      if (index !== state.currentIndex) {
        clearHoverPlayback(article);
        article.classList.remove("is-playing");
        resetTilt(article);
      }
    });
  };

  const playVideo = async (videoElement) => {
    if (videoElement.paused) {
      if (!videoElement.src && videoElement.dataset.src) {
        videoElement.src = videoElement.dataset.src;
      }
      await videoElement.play();
    }
  };

  const startAutoPlay = () => {
    if (state.prefersReducedMotion || state.autoPlayInterval || !state.isPageVisible) return;
    state.autoPlayInterval = setInterval(() => {
      next();
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (state.autoPlayInterval) {
      clearInterval(state.autoPlayInterval);
      state.autoPlayInterval = null;
    }
  };

  const goToSlide = (index, onComplete) => {
    if (index >= 0 && index < VIDEOS.length && !state.isAnimating) {
      stopAllVideos();
      state.isAnimating = true;
      state.currentIndex = index;
      updatePosition();

      setTimeout(() => {
        state.isAnimating = false;
        if (typeof onComplete === "function") {
          onComplete();
        }
      }, 500);
    }
  };

  const next = () => {
    if (state.isAnimating) return;
    stopAllVideos();
    state.isAnimating = true;
    state.currentIndex = (state.currentIndex + 1) % VIDEOS.length;
    updatePosition();

    setTimeout(() => {
      state.isAnimating = false;
    }, 500);
  };

  const prev = () => {
    if (state.isAnimating) return;
    stopAllVideos();
    state.isAnimating = true;
    state.currentIndex = (state.currentIndex - 1 + VIDEOS.length) % VIDEOS.length;
    updatePosition();

    setTimeout(() => {
      state.isAnimating = false;
    }, 500);
  };

  const showHoverProgress = (article) => {
    article.classList.add("hover-arming");
    article.style.setProperty("--hover-progress-duration", `${HOVER_ACTIVATION_DELAY}ms`);
    article.style.setProperty("--hover-progress-length", `${HOVER_RING_LENGTH}`);
  };

  const startHoverPlayback = (article, index, videoElement) => {
    if (state.isTouchDevice || state.prefersReducedMotion) return;
    if (!videoElement.paused) return;

    clearHoverPlayback(article);
    showHoverProgress(article);

    const timeout = window.setTimeout(async () => {
      const playHoveredVideo = async () => {
        stopAllVideos();
        try {
          await playVideo(videoElement);
        } catch (err) {
          console.log("Play failed:", err);
        }
      };

      if (!article.classList.contains("active")) {
        goToSlide(index, playHoveredVideo);
        return;
      }

      await playHoveredVideo();
    }, HOVER_ACTIVATION_DELAY);

    state.hoverTimeouts.set(article, timeout);
  };

  const handleArticleFocus = (article, index, videoElement) => {
    stopAutoPlay();

    if (!article.classList.contains("active")) {
      goToSlide(index);
    }

    startHoverPlayback(article, index, videoElement);
  };

  const handleArticleBlur = (article) => {
    clearHoverPlayback(article);

    window.setTimeout(() => {
      if (!container.contains(document.activeElement) && !state.isPointerInside) {
        startAutoPlay();
      }
    }, 0);
  };

  const handleTilt = (e, article) => {
    if (!article.classList.contains("active")) {
      resetTilt(article);
      return;
    }

    const rect = article.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normalizedX = (x / rect.width - 0.5) * 2;
    const normalizedY = (y / rect.height - 0.5) * 2;
    const rotateX = normalizedY * -TILT_MAX_ROTATION;
    const rotateY = normalizedX * TILT_MAX_ROTATION;

    queueTiltFrame(article, rotateX, rotateY);
  };

  const handleTouchStart = (e, article) => {
    state.touchStartX = e.changedTouches[0].clientX;
    state.touchStartY = e.changedTouches[0].clientY;
    state.touchDeltaX = 0;
    state.touchDeltaY = 0;
    article.classList.add("touch-active");
  };

  const handleTouchEnd = (e, article) => {
    setTimeout(() => article.classList.remove("touch-active"), 200);
  };

  const toggleVideo = async (videoElement) => {
    const article = videoElement.closest(".swiper-article");
    if (!article || !article.classList.contains("active")) return;

    if (videoElement.paused) {
      stopAllVideos();
      try {
        await playVideo(videoElement);
      } catch (err) {
        console.log("Play failed:", err);
      }
      return;
    }

    videoElement.pause();
  };

  const createArticleElement = (video, index) => {
    const article = document.createElement("article");
    article.className = "swiper-article h-[730px] w-[430px] flex-shrink-0 rounded-[28px]";
    article.setAttribute("data-index", index);
    article.setAttribute("tabindex", "0");
    article.setAttribute("role", "button");
    article.setAttribute("aria-label", `${video.title} - Video ${video.id}`);

    article.innerHTML = `
      <div class="article-inner">
        <div class="video-container">
          <video
            class="article-video"
            data-src="${video.video}"
            preload="none"
            poster="${video.thumbnail}"
            muted
            playsinline
          >
            <source src="${video.video}" type="video/webm" />
          </video>
          <button class="play-btn" aria-label="Play video: ${video.title}">
            <svg class="play-progress" viewBox="0 0 72 72" aria-hidden="true">
              <circle class="play-progress-track" cx="36" cy="36" r="30"></circle>
              <circle class="play-progress-bar" cx="36" cy="36" r="30"></circle>
            </svg>
            <span class="play-icon">
              <svg class="play-icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        </div>
        <div class="article-overlay">
          <h3 class="article-title">${video.title}</h3>
          <p class="article-location">${video.location}</p>
        </div>
      </div>
    `;

    const playBtn = article.querySelector(".play-btn");
    const playIconWrapper = playBtn.querySelector(".play-icon");
    const videoElement = article.querySelector(".article-video");
    const playIcon = `
      <svg class="play-icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    `;
    const pauseIcon = `
      <svg class="play-icon-svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
      </svg>
    `;

    playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!article.classList.contains("active")) {
        goToSlide(index);
        return;
      }
      toggleVideo(videoElement);
    });

    article.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.code === "Space") {
        e.preventDefault();
        if (!article.classList.contains("active")) {
          goToSlide(index);
          return;
        }
        toggleVideo(videoElement);
      }
    });

    article.addEventListener("click", (e) => {
      if (e.target !== playBtn && !playBtn.contains(e.target)) {
        goToSlide(index);
      }
    });

    article.addEventListener("mouseenter", () => startHoverPlayback(article, index, videoElement));
    article.addEventListener("mouseleave", () => clearHoverPlayback(article));
    article.addEventListener("focusin", () => handleArticleFocus(article, index, videoElement));
    article.addEventListener("focusout", () => handleArticleBlur(article));

    if (!state.isTouchDevice && !state.prefersReducedMotion) {
      article.addEventListener("mousemove", (e) => handleTilt(e, article));
      article.addEventListener("mouseleave", () => resetTilt(article));
    }

    if (state.isTouchDevice) {
      article.addEventListener("touchstart", (e) => handleTouchStart(e, article));
      article.addEventListener("touchend", (e) => handleTouchEnd(e, article));
    }

    videoElement.addEventListener("play", () => {
      article.classList.add("is-playing");
      playBtn.classList.add("playing");
      article.classList.remove("hover-arming");
      playBtn.setAttribute("aria-label", `Pause video: ${video.title}`);
      playIconWrapper.innerHTML = pauseIcon;
      state.playingVideos.add(videoElement);
    });

    videoElement.addEventListener("pause", () => {
      article.classList.remove("is-playing");
      playBtn.classList.remove("playing");
      playBtn.setAttribute("aria-label", `Play video: ${video.title}`);
      playIconWrapper.innerHTML = playIcon;
      state.playingVideos.delete(videoElement);
    });

    videoElement.addEventListener("ended", () => {
      resetVideoToThumbnail(videoElement);
      article.classList.remove("is-playing");
    });

    return article;
  };

  const renderArticles = () => {
    swiperWrapper.innerHTML = "";
    VIDEOS.forEach((video, index) => {
      swiperWrapper.appendChild(createArticleElement(video, index));
    });
  };

  const createControls = () => {
    const prevBtn = document.createElement("button");
    prevBtn.className = "swiper-btn prev";
    prevBtn.innerHTML = "&#10094;";
    prevBtn.setAttribute("aria-label", "Previous slide");
    prevBtn.addEventListener("click", () => prev());

    const nextBtn = document.createElement("button");
    nextBtn.className = "swiper-btn next";
    nextBtn.innerHTML = "&#10095;";
    nextBtn.setAttribute("aria-label", "Next slide");
    nextBtn.addEventListener("click", () => next());

    return { prevBtn, nextBtn };
  };

  const handleVisibilityChange = () => {
    state.isPageVisible = !document.hidden;

    if (!state.isPageVisible) {
      stopAutoPlay();
      stopAllVideos();
      state.hoverTimeouts.forEach((timeout) => clearTimeout(timeout));
      state.hoverTimeouts.clear();
      return;
    }

    if (!state.isPointerInside) {
      startAutoPlay();
    }
  };

  const setupEventListeners = () => {
    const controls = createControls();
    container.appendChild(controls.prevBtn);
    container.appendChild(controls.nextBtn);

    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.code === "Space") e.preventDefault();
    });

    container.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        if (e.deltaY > 0) next();
        else prev();
      },
      { passive: false },
    );

    if (state.isTouchDevice) {
      container.addEventListener(
        "touchstart",
        (e) => {
          state.touchStartX = e.changedTouches[0].clientX;
          state.touchStartY = e.changedTouches[0].clientY;
          state.touchDeltaX = 0;
          state.touchDeltaY = 0;
        },
        { passive: true },
      );

      container.addEventListener(
        "touchmove",
        (e) => {
          state.touchDeltaX = e.changedTouches[0].clientX - state.touchStartX;
          state.touchDeltaY = e.changedTouches[0].clientY - state.touchStartY;

          if (Math.abs(state.touchDeltaX) > Math.abs(state.touchDeltaY)) {
            e.preventDefault();
          }
        },
        { passive: false },
      );

      container.addEventListener(
        "touchend",
        () => {
          const isHorizontalSwipe =
            Math.abs(state.touchDeltaX) > 36 && Math.abs(state.touchDeltaX) > Math.abs(state.touchDeltaY);

          if (!isHorizontalSwipe) return;

          if (state.touchDeltaX < 0) next();
          else prev();
        },
        { passive: true },
      );
    }

    container.addEventListener("mouseenter", () => {
      state.isPointerInside = true;
      stopAutoPlay();
    });

    container.addEventListener("mouseleave", () => {
      state.isPointerInside = false;
      startAutoPlay();
    });

    window.addEventListener("resize", () => {
      syncDimensions();
      updatePosition();
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
      state.prefersReducedMotion = e.matches;
      if (state.prefersReducedMotion) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    });
  };

  renderArticles();
  syncDimensions();
  setupEventListeners();
  updatePosition();

  if (!state.prefersReducedMotion) {
    startAutoPlay();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  createSwiperManager("swiperContainer");
});
