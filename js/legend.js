const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function initLegend() {
  if (!reduceMotion && !root.classList.contains("legend-js")) root.classList.add("legend-js", "legend-intro");
  initLoader();
  initNetwork();
  initScramble();
  initTerminal();
  initMarquee();
  initFooter();
  initIncident();
  if (!reduceMotion && finePointer) {
    initTilt();
    initSpotlight();
    initContactGlow();
  }
}

/* Runs `callback` once the hero intro has started (after the preloader). */
function whenIntro(callback, delay = 0) {
  const run = () => window.setTimeout(callback, delay);
  if (!root.classList.contains("legend-loading")) return run();
  const observer = new MutationObserver(() => {
    if (root.classList.contains("legend-loading")) return;
    observer.disconnect();
    run();
  });
  observer.observe(root, { attributes: true, attributeFilter: ["class"] });
}

/* ---------- Preloader ---------- */
function initLoader() {
  const loader = document.querySelector(".legend-loader");
  if (!loader) return;
  if (!root.classList.contains("legend-loading")) {
    loader.remove();
    return;
  }
  const count = loader.querySelector("[data-loader-count]");
  const bar = loader.querySelector("[data-loader-bar]");
  const duration = 1500;
  const start = performance.now();
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    if (count) count.textContent = String(Math.round(eased * 100)).padStart(3, "0");
    if (bar) bar.style.transform = `scaleX(${eased})`;
    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }
    loader.classList.add("is-done");
    window.setTimeout(() => {
      root.classList.remove("legend-loading");
      root.classList.add("legend-intro");
    }, 420);
    window.setTimeout(() => loader.remove(), 1500);
  };
  requestAnimationFrame(step);
}

/* ---------- Interactive cloud network background ---------- */
function initNetwork() {
  const canvas = document.createElement("canvas");
  canvas.className = "legend-network";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const LINK = 150;
  const POINTER_RADIUS = 210;
  const pointer = { x: -9999, y: -9999 };
  let width = 0;
  let height = 0;
  let nodes = [];
  let packets = [];
  let colorA = "138,235,255";
  let colorB = "196,155,255";
  let running = false;
  let lastScroll = window.scrollY;

  const readColors = () => {
    const styles = getComputedStyle(root);
    colorA = styles.getPropertyValue("--net-a").trim() || colorA;
    colorB = styles.getPropertyValue("--net-b").trim() || colorB;
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = Math.max(28, Math.min(120, Math.round((width * height) / 15000)));
    nodes = Array.from({ length: target }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() < 0.12 ? 2.4 : 1 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    }));
    packets = [];
  };

  const draw = (time = 0) => {
    ctx.clearRect(0, 0, width, height);

    // Scroll gives the field a gentle parallax drift.
    const scrollDelta = window.scrollY - lastScroll;
    lastScroll = window.scrollY;

    for (const node of nodes) {
      if (!reduceMotion) {
        node.x += node.vx;
        node.y += node.vy - scrollDelta * 0.12 * (node.r / 2);
      }
      const dx = node.x - pointer.x;
      const dy = node.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance < POINTER_RADIUS && distance > 0.1) {
        const force = (1 - distance / POINTER_RADIUS) * 0.9;
        node.x += (dx / distance) * force;
        node.y += (dy / distance) * force;
      }
      if (node.x < -20) node.x = width + 20;
      else if (node.x > width + 20) node.x = -20;
      if (node.y < -20) node.y = height + 20;
      else if (node.y > height + 20) node.y = -20;
    }

    // Links, batched into alpha buckets so we stroke only a handful of paths.
    const buckets = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
    const neighbours = [];
    for (let i = 0; i < nodes.length; i += 1) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j += 1) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > LINK * LINK) continue;
        const strength = 1 - Math.sqrt(d2) / LINK;
        const bucket = buckets[Math.min(3, Math.floor(strength * 4))];
        bucket.moveTo(a.x, a.y);
        bucket.lineTo(b.x, b.y);
        if (strength > 0.35) neighbours.push([a, b]);
      }
    }
    ctx.lineWidth = 1;
    buckets.forEach((path, index) => {
      ctx.strokeStyle = `rgba(${colorA},${0.04 + index * 0.06})`;
      ctx.stroke(path);
    });

    // Pointer links.
    if (pointer.x > -999) {
      for (const node of nodes) {
        const distance = Math.hypot(node.x - pointer.x, node.y - pointer.y);
        if (distance > POINTER_RADIUS + 40) continue;
        ctx.strokeStyle = `rgba(${colorB},${(1 - distance / (POINTER_RADIUS + 40)) * 0.55})`;
        ctx.beginPath();
        ctx.moveTo(pointer.x, pointer.y);
        ctx.lineTo(node.x, node.y);
        ctx.stroke();
      }
    }

    // Nodes.
    for (const node of nodes) {
      const pulse = 0.55 + 0.45 * Math.sin(time * 0.002 + node.phase);
      ctx.fillStyle = `rgba(${colorA},${0.35 + pulse * 0.45})`;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fill();
      if (node.r > 2) {
        ctx.strokeStyle = `rgba(${colorA},${0.12 + pulse * 0.2})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + 4 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Data packets travelling between connected nodes.
    if (!reduceMotion && neighbours.length && packets.length < 16 && Math.random() < 0.1) {
      const [a, b] = neighbours[Math.floor(Math.random() * neighbours.length)];
      packets.push({ a, b, t: 0, speed: 0.008 + Math.random() * 0.014 });
    }
    packets = packets.filter((packet) => {
      packet.t += packet.speed;
      if (packet.t >= 1) return false;
      const x = packet.a.x + (packet.b.x - packet.a.x) * packet.t;
      const y = packet.a.y + (packet.b.y - packet.a.y) * packet.t;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 9);
      glow.addColorStop(0, `rgba(${colorB},0.9)`);
      glow.addColorStop(1, `rgba(${colorB},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.beginPath();
      ctx.arc(x, y, 1.3, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });

    if (running) requestAnimationFrame(draw);
  };

  const start = () => {
    if (running || reduceMotion) return;
    running = true;
    requestAnimationFrame(draw);
  };

  readColors();
  resize();
  if (reduceMotion) draw();
  else start();

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      resize();
      if (reduceMotion) draw();
    }, 150);
  });
  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    },
    { passive: true },
  );
  document.addEventListener("mouseleave", () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) running = false;
    else start();
  });
  new MutationObserver(() => {
    readColors();
    if (reduceMotion) draw();
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
}

/* ---------- Text scramble (ASCII only, so Korean glyphs keep their width) ---------- */
const GLYPHS = "!<>-_\\/[]{}=+*^?#01ABCDEFGHXYZ";

function scramble(element) {
  if (reduceMotion || element.dataset.scrambling === "true") return;
  element.dataset.scrambling = "true";
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) if (walker.currentNode.nodeValue?.trim()) textNodes.push(walker.currentNode);
  let pending = textNodes.length;
  if (!pending) {
    element.dataset.scrambling = "false";
    return;
  }

  textNodes.forEach((node) => {
    const original = node.nodeValue ?? "";
    const total = original.length * 2 + 14;
    let frame = 0;
    const tick = () => {
      frame += 1;
      let output = "";
      for (let index = 0; index < original.length; index += 1) {
        const char = original[index];
        const settled = frame > index * 2 + 8;
        output += settled || !/[A-Za-z0-9]/.test(char) ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      node.nodeValue = output;
      if (frame < total) {
        requestAnimationFrame(tick);
        return;
      }
      node.nodeValue = original;
      pending -= 1;
      if (!pending) element.dataset.scrambling = "false";
    };
    tick();
  });
}

function initScramble() {
  if (reduceMotion) return;
  const heroTargets = document.querySelectorAll(".hero [data-scramble]");
  whenIntro(() => heroTargets.forEach((element, index) => window.setTimeout(() => scramble(element), index * 220)), 350);

  const others = [...document.querySelectorAll("[data-scramble]")].filter((element) => !element.closest(".hero"));
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          scramble(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 },
    );
    others.forEach((element) => observer.observe(element));
  }

  if (finePointer) {
    document.querySelectorAll(".text-link, .button, .project-topline").forEach((element) => {
      element.addEventListener("pointerenter", () => scramble(element));
    });
  }
}

/* ---------- Typing terminal ---------- */
function initTerminal() {
  const body = document.querySelector("[data-term]");
  if (!body) return;
  const lines = [
    { cmd: "whoami" },
    { out: "kim-wonjae" },
    { cmd: "cat role.txt" },
    { out: "backend developer · cloud engineer" },
    { cmd: "echo $FOCUS" },
    { out: "backend architecture · cloud infra" },
    { cmd: "" },
  ];
  const caret = document.createElement("span");
  caret.className = "term-caret";

  const makeCommandRow = () => {
    const row = document.createElement("div");
    row.className = "term-cmd";
    row.innerHTML = '<span class="term-prompt">~/wonjae</span> <b>$</b> ';
    const text = document.createElement("span");
    row.append(text);
    body.append(row);
    return text;
  };
  const makeOutputRow = (value) => {
    const row = document.createElement("div");
    row.className = "term-out";
    row.textContent = `→ ${value}`;
    body.append(row);
  };

  if (reduceMotion) {
    lines.forEach((line) => {
      if ("out" in line) makeOutputRow(line.out);
      else makeCommandRow().textContent = line.cmd;
    });
    return;
  }

  const type = async () => {
    for (const line of lines) {
      if ("out" in line) {
        await wait(180);
        makeOutputRow(line.out);
        await wait(260);
        continue;
      }
      const text = makeCommandRow();
      text.after(caret);
      for (const char of line.cmd) {
        text.textContent += char;
        await wait(40 + Math.random() * 60);
      }
      await wait(260);
    }
  };
  whenIntro(() => void type(), 1100);
}

/* ---------- Scroll-velocity marquee ---------- */
function initMarquee() {
  const marquee = document.querySelector(".legend-marquee");
  if (!marquee || reduceMotion) return;
  const rows = [...marquee.querySelectorAll(".marquee-row")].map((row) => ({
    track: row.querySelector(".marquee-track"),
    direction: row.classList.contains("is-reverse") ? 1 : -1,
    x: row.classList.contains("is-reverse") ? -400 : 0,
  }));
  let visible = true;
  let lastY = window.scrollY;
  let velocity = 0;
  let heading = 1;

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }).observe(marquee);
  }

  const tick = () => {
    const y = window.scrollY;
    const delta = y - lastY;
    lastY = y;
    velocity += (delta - velocity) * 0.12;
    if (Math.abs(delta) > 0.5) heading = delta > 0 ? 1 : -1;
    if (visible) {
      const speed = 0.7 + Math.min(Math.abs(velocity), 70) * 0.35;
      const skew = Math.max(-14, Math.min(14, velocity * -0.35));
      rows.forEach((row) => {
        if (!row.track) return;
        const half = row.track.scrollWidth / 2;
        row.x += row.direction * speed * heading;
        if (row.x <= -half) row.x += half;
        if (row.x > 0) row.x -= half;
        row.track.style.transform = `translate3d(${row.x}px,0,0) skewX(${skew}deg)`;
      });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- 3D tilt with glare ---------- */
function initTilt() {
  document.querySelectorAll("[data-tilt]").forEach((element) => {
    const max = Number(element.dataset.tilt) || 8;
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      element.classList.add("is-tilting");
      element.style.transform = `perspective(1000px) rotateX(${(0.5 - py) * max}deg) rotateY(${(px - 0.5) * max}deg) scale(1.02)`;
      element.style.setProperty("--gx", `${px * 100}%`);
      element.style.setProperty("--gy", `${py * 100}%`);
    });
    element.addEventListener("pointerleave", () => {
      element.classList.remove("is-tilting");
      element.style.transform = "";
    });
  });
}

/* ---------- Spotlight border on project cards ---------- */
function initSpotlight() {
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

/* ---------- Contact glow follows the pointer ---------- */
function initContactGlow() {
  const contact = document.querySelector(".contact");
  if (!contact) return;
  contact.addEventListener("pointermove", (event) => {
    const rect = contact.getBoundingClientRect();
    contact.style.setProperty("--cx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
    contact.style.setProperty("--cy", `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });
  contact.addEventListener("pointerleave", () => {
    contact.style.removeProperty("--cx");
    contact.style.removeProperty("--cy");
  });
}

/* ---------- Incident board: BEFORE / AFTER pipeline ---------- */
function initIncident() {
  const board = document.querySelector("[data-incident]");
  if (!board) return;
  const buttons = [...board.querySelectorAll("[data-incident-view]")];
  const status = board.querySelector("[data-incident-status]");
  let touched = false;

  const setState = (state) => {
    board.dataset.state = state;
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.incidentView === state)));
    if (status) status.textContent = state === "after" ? "ALL SERVICES HEALTHY" : "4 / 4 FAILING";
  };

  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      touched = true;
      setState(button.dataset.incidentView ?? "before");
    }),
  );

  // Play the "recovery" once when the board scrolls into view, unless the reader already chose a view.
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      window.setTimeout(() => {
        if (!touched) setState("after");
      }, 2600);
    },
    { threshold: 0.55 },
  );
  observer.observe(board);
}

/* ---------- Footer wordmark fills in when it enters view ---------- */
function initFooter() {
  const brand = document.querySelector(".footer-brand");
  if (!brand) return;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    brand.classList.add("is-visible");
    return;
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      window.setTimeout(() => brand.classList.add("is-visible"), 250);
      observer.disconnect();
    },
    { threshold: 0.5 },
  );
  observer.observe(brand);
}
