export function initAnimations() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");
  const progress = document.querySelector(".scroll-progress i");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px" },
    );
    reveals.forEach((element) => revealObserver.observe(element));
  }

  initCaseIndex();
  initTimeline();

  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    initCursor();
    const heroVisual = document.querySelector("[data-parallax]");
    window.addEventListener(
      "pointermove",
      (event) => {
        if (!heroVisual || window.scrollY > window.innerHeight) return;
        const x = (event.clientX / window.innerWidth - 0.5) * 7;
        const y = (event.clientY / window.innerHeight - 0.5) * 7;
        heroVisual.style.translate = `${x}px ${y}px`;
      },
      { passive: true },
    );

    document.querySelectorAll(".magnetic").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
        button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      button.addEventListener("pointerleave", () => {
        button.style.transform = "";
      });
    });
  }

  const heroCopy = document.querySelector(".hero-copy");
  const heroWordmark = document.querySelector(".hero-wordmark");
  let scrollQueued = false;
  const updateScrollMotion = () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${maxScroll > 0 ? scrollTop / maxScroll : 0})`;
    if (!reduceMotion && scrollTop < window.innerHeight) {
      const phase = Math.min(scrollTop / window.innerHeight, 1);
      if (heroCopy) {
        heroCopy.style.transform = `translate3d(0, ${phase * -24}px, 0)`;
        heroCopy.style.opacity = String(1 - phase * 0.58);
      }
      if (heroWordmark) heroWordmark.style.translate = `${phase * 3}% 0`;
    }
    scrollQueued = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(updateScrollMotion);
    },
    { passive: true },
  );
  updateScrollMotion();
}

function initCaseIndex() {
  const links = [...document.querySelectorAll(".case-index a")];
  if (!links.length || !("IntersectionObserver" in window)) return;
  const sections = links.map((link) => document.querySelector(link.hash)).filter(Boolean);
  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (!visible) return;
      links.forEach((link) => link.classList.toggle("active", link.hash === `#${visible.target.id}`));
    },
    { rootMargin: "-20% 0px -65% 0px" },
  );
  sections.forEach((section) => observer.observe(section));
}

function initTimeline() {
  const timeline = document.querySelector(".timeline");
  const items = [...document.querySelectorAll(".timeline-item")];
  if (!timeline || !items.length || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = items.indexOf(entry.target);
        items.forEach((item, itemIndex) => item.classList.toggle("is-current", itemIndex <= index));
        timeline.style.setProperty("--timeline-progress", `${(index / Math.max(items.length - 1, 1)) * 100}%`);
      });
    },
    { rootMargin: "-35% 0px -50% 0px" },
  );
  items.forEach((item) => observer.observe(item));
}

function initCursor() {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (!dot || !ring) return;

  document.body.classList.add("has-custom-cursor");
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let ringX = pointerX;
  let ringY = pointerY;

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      dot.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    },
    { passive: true },
  );
  document.addEventListener("mouseleave", () => {
    dot.style.opacity = "0";
    ring.style.opacity = "0";
  });

  document.querySelectorAll("[data-cursor-label], .next-project").forEach((target) => {
    target.addEventListener("pointerenter", () => {
      ring.classList.add("cursor-active");
      const label = ring.querySelector("span");
      if (label) label.textContent = target.dataset.cursorLabel ?? "NEXT";
    });
    target.addEventListener("pointerleave", () => ring.classList.remove("cursor-active"));
  });

  const render = () => {
    ringX += (pointerX - ringX) * 0.16;
    ringY += (pointerY - ringY) * 0.16;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    requestAnimationFrame(render);
  };
  render();
}
