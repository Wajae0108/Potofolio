const root = document.documentElement;
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-nav");
const themeButton = document.querySelector(".theme-toggle");
const languageButton = document.querySelector(".language-toggle");

const translations = {
  ko: { subtitle: "사용자의 경험을 이해하고,<br>안정적인 시스템을 고민하는 개발자." },
  en: { subtitle: "A developer focused on user experience<br>and dependable systems." },
};

export function initNavigation() {
  const updateHeader = () => header?.classList.toggle("scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const setMenu = (open) => {
    menuButton?.setAttribute("aria-expanded", String(open));
    mobileMenu?.classList.toggle("open", open);
    mobileMenu?.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) mobileMenu?.querySelector("a")?.focus();
    else menuButton?.focus({ preventScroll: true });
  };

  if (mobileMenu) mobileMenu.setAttribute("aria-hidden", "true");
  menuButton?.addEventListener("click", () => setMenu(menuButton.getAttribute("aria-expanded") !== "true"));
  mobileMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") setMenu(false);
  });

  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;
  updateThemeLabel();
  themeButton?.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("portfolio-theme", root.dataset.theme);
    updateThemeLabel();
  });

  let language = root.lang === "en" ? "en" : "ko";
  languageButton?.addEventListener("click", () => {
    language = language === "ko" ? "en" : "ko";
    root.lang = language;
    const subtitle = document.querySelector('[data-i18n="hero-subtitle"]');
    if (subtitle) subtitle.innerHTML = translations[language].subtitle;
    const labels = languageButton.querySelectorAll("span:not(.slash)");
    labels.forEach((label) => label.classList.toggle("selected", label.textContent?.toLowerCase() === language));
    languageButton.setAttribute("aria-label", language === "ko" ? "Switch to English" : "한국어로 변경");
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  const links = [...document.querySelectorAll(".desktop-nav a")];
  if (sections.length && links.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (!current) return;
        links.forEach((link) => link.classList.toggle("active", link.hash === `#${current.target.id}`));
      },
      { rootMargin: "-35% 0px -58% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
  }
}

function updateThemeLabel() {
  if (!themeButton) return;
  const isLight = root.dataset.theme === "light";
  themeButton.setAttribute("aria-label", isLight ? "다크 모드로 변경" : "라이트 모드로 변경");
  const icon = themeButton.querySelector(".theme-icon");
  if (icon) icon.textContent = isLight ? "◑" : "◐";
}
