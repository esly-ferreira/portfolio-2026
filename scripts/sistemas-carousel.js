document.addEventListener("DOMContentLoaded", () => {
  const visual = document.querySelector(".sistemas-visual");
  const wrap = document.querySelector(".sistemas-video-wrap");
  const carousel = document.querySelector(".sistemas-carousel");
  if (!visual || !wrap || !carousel) return;

  const items = Array.from(wrap.querySelectorAll(".sistemas-media-item"));
  const track = carousel.querySelector(".sistemas-carousel-track");
  const toggleBtn = carousel.querySelector(".sistemas-carousel-toggle");
  const titleEl = document.querySelector("[data-sistemas-title]");
  const leadEl = document.querySelector("[data-sistemas-lead]");

  if (!items.length || !track || !toggleBtn || !titleEl || !leadEl) return;

  const IMAGE_SLIDE_MS = 5000;
  const VIDEO_INDEX = 0;
  const TEXT_ANIM_MS = 550;
  const CHAR_STAGGER_S = 0.022;
  const WORD_STAGGER_S = 0.028;
  const videoEl = items[VIDEO_INDEX]?.tagName === "VIDEO" ? items[VIDEO_INDEX] : null;

  const slides = [
    {
      title: "Do código à aplicação em produção",
      lead:
        "Desenvolvo sistemas completos, da arquitetura e implementação no editor ao produto final rodando no navegador. Cada entrega une lógica, interface e experiência do usuário em soluções prontas para o dia a dia.",
    },
    {
      title: "Desenvolvimento Front-end",
      lead:
        "Estrutura, lógica e componentes reutilizáveis. Construo interfaces modernas com Vue.js e TypeScript, combinando tipagem estática, reatividade e gerenciamento de estado consistente, com foco em modularidade, menos erros em compilação e integração fluida com APIs.",
    },
    {
      title: "Interface & UX/UI",
      lead:
        "Da concepção ao design intuitivo. Projetar sistemas vai além do código: criar experiências fluidas, consistentes e funcionais. Cada elemento da interface é pensado no protótipo para garantir facilidade de uso, hierarquia visual clara e eficiência no dia a dia do usuário.",
    },
  ];

  let activeIndex = 0;
  let timerId = null;
  let isPaused = false;
  let slideStartedAt = 0;
  let imageTimerRemaining = IMAGE_SLIDE_MS;
  let isFirstSlide = true;

  const reduceMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.classList.contains("a11y-reduce-motion");

  const renderAnimatedText = (el, text, mode, baseDelay = 0) => {
    el.classList.remove("is-animating");
    el.innerHTML = "";

    if (reduceMotion()) {
      el.textContent = text;
      return;
    }

    const words = text.trim().split(/\s+/);
    const stagger = mode === "char" ? CHAR_STAGGER_S : WORD_STAGGER_S;
    let unitIndex = 0;

    words.forEach((word, wordIndex) => {
      const wordWrap = document.createElement("span");
      wordWrap.className = "sistemas-text-word";

      if (mode === "char") {
        Array.from(word).forEach((char) => {
          const span = document.createElement("span");
          span.className = "sistemas-text-unit";
          span.textContent = char;
          span.style.setProperty("--sistemas-text-delay", `${baseDelay + unitIndex * stagger}s`);
          span.style.setProperty("--sistemas-text-duration", `${TEXT_ANIM_MS}ms`);
          wordWrap.appendChild(span);
          unitIndex += 1;
        });
      } else {
        const span = document.createElement("span");
        span.className = "sistemas-text-unit";
        span.textContent = word;
        span.style.setProperty("--sistemas-text-delay", `${baseDelay + unitIndex * stagger}s`);
        span.style.setProperty("--sistemas-text-duration", `${TEXT_ANIM_MS}ms`);
        wordWrap.appendChild(span);
        unitIndex += 1;
      }

      el.appendChild(wordWrap);

      if (wordIndex < words.length - 1) {
        el.appendChild(document.createTextNode(" "));
      }
    });

    requestAnimationFrame(() => {
      el.classList.add("is-animating");
    });
  };

  const updateSlideCopy = (slide, animate = true) => {
    if (!animate) {
      titleEl.classList.remove("is-animating");
      leadEl.classList.remove("is-animating");
      titleEl.textContent = slide.title;
      leadEl.textContent = slide.lead;
      return;
    }

    renderAnimatedText(titleEl, slide.title, "char");
    renderAnimatedText(leadEl, slide.lead, "word", CHAR_STAGGER_S * 2);
  };

  const playVideo = (item) => {
    if (!item) return;

    const start = () => {
      const playPromise = item.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    };

    if (item.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      start();
      return;
    }

    item.addEventListener("canplay", start, { once: true });
  };

  const clearSchedule = () => {
    if (timerId) {
      window.clearTimeout(timerId);
      timerId = null;
    }
    if (videoEl) {
      videoEl.onended = null;
    }
  };

  const getSlideDuration = (index) => {
    if (index === VIDEO_INDEX && videoEl && Number.isFinite(videoEl.duration) && videoEl.duration > 0) {
      return videoEl.duration * 1000;
    }
    return IMAGE_SLIDE_MS;
  };

  const updateProgress = (index) => {
    const durationMs = getSlideDuration(index);
    visual.style.setProperty("--sistemas-slide-duration", `${durationMs}ms`);

    track.querySelectorAll(".sistemas-carousel-dot").forEach((dot, i) => {
      const progress = dot.querySelector(".sistemas-carousel-progress");
      if (!progress) return;
      progress.style.animation = "none";
      void progress.offsetWidth;
      if (i === index && !reduceMotion() && !isPaused) {
        progress.style.animation = "";
      }
    });
  };

  const syncVideo = (item, isActive, { restart = true } = {}) => {
    if (item.tagName !== "VIDEO") return;

    if (isActive) {
      if (restart) {
        item.currentTime = 0;
      }
      playVideo(item);
    } else {
      item.pause();
      if (restart) {
        item.currentTime = 0;
      }
    }
  };

  const setSlide = (index, { restartVideo = true } = {}) => {
    activeIndex = (index + slides.length) % slides.length;
    imageTimerRemaining = IMAGE_SLIDE_MS;

    items.forEach((item, i) => {
      const isActive = i === activeIndex;
      item.classList.toggle("is-active", isActive);
      syncVideo(item, isActive, { restart: restartVideo });
    });

    updateSlideCopy(slides[activeIndex], !isFirstSlide);
    isFirstSlide = false;

    track.querySelectorAll(".sistemas-carousel-dot").forEach((dot, i) => {
      const isActive = i === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-selected", String(isActive));
      dot.tabIndex = isActive ? 0 : -1;
    });

    updateProgress(activeIndex);
  };

  const setPaused = (paused) => {
    isPaused = paused;
    carousel.classList.toggle("is-paused", isPaused);
    toggleBtn.setAttribute("aria-pressed", String(isPaused));
    toggleBtn.setAttribute(
      "aria-label",
      isPaused ? "Retomar troca automática" : "Pausar troca automática"
    );

    if (isPaused) {
      if (timerId) {
        imageTimerRemaining = Math.max(0, IMAGE_SLIDE_MS - (Date.now() - slideStartedAt));
        window.clearTimeout(timerId);
        timerId = null;
      }
      if (videoEl && items[activeIndex] === videoEl) {
        videoEl.onended = null;
      }
      return;
    }

    scheduleNext(true);
  };

  const scheduleNext = (isResume = false) => {
    clearSchedule();
    if (reduceMotion() || isPaused) return;

    const currentItem = items[activeIndex];

    if (currentItem.tagName === "VIDEO") {
      if (isResume && currentItem.ended) {
        setSlide(activeIndex + 1);
        scheduleNext();
        return;
      }

      const onEnded = () => {
        if (isPaused) return;
        setSlide(activeIndex + 1);
        scheduleNext();
      };

      if (currentItem.readyState >= 1 && Number.isFinite(currentItem.duration)) {
        currentItem.onended = onEnded;
        if (!isResume) {
          updateProgress(activeIndex);
        }
      } else {
        currentItem.addEventListener(
          "loadedmetadata",
          () => {
            if (!isResume) {
              updateProgress(activeIndex);
            }
            currentItem.onended = onEnded;
          },
          { once: true }
        );
      }
      return;
    }

    const delay = isResume ? imageTimerRemaining : IMAGE_SLIDE_MS;
    slideStartedAt = Date.now();

    timerId = window.setTimeout(() => {
      setSlide(activeIndex + 1);
      scheduleNext();
    }, delay);
  };

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "sistemas-carousel-dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Slide ${index + 1}`);
    dot.setAttribute("aria-selected", "false");

    const progress = document.createElement("span");
    progress.className = "sistemas-carousel-progress";
    progress.setAttribute("aria-hidden", "true");
    dot.appendChild(progress);

    dot.addEventListener("click", () => {
      if (index === activeIndex) return;
      setSlide(index);
      if (!isPaused) scheduleNext();
    });

    track.appendChild(dot);
  });

  toggleBtn.addEventListener("click", () => {
    setPaused(!isPaused);
  });

  if (videoEl) {
    videoEl.addEventListener("loadedmetadata", () => {
      if (activeIndex === VIDEO_INDEX) {
        updateProgress(VIDEO_INDEX);
      }
    });

    const resumeOnVisible = () => {
      if (activeIndex !== VIDEO_INDEX) return;
      playVideo(videoEl);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              resumeOnVisible();
            }
          });
        },
        { threshold: 0.35 }
      );
      observer.observe(visual);
    }
  }

  setSlide(0);
  scheduleNext();
});
