export function initProjectInteractions() {
  const notice = document.querySelector(".contact-notice");
  document.querySelectorAll(".placeholder-action").forEach((button) => {
    button.addEventListener("click", () => {
      if (!notice) return;
      notice.textContent = button.dataset.message ?? "정보 등록 후 활성화됩니다.";
      notice.setAttribute("tabindex", "-1");
      notice.focus();
    });
  });

  document.querySelectorAll(".resume-link").forEach((link) => {
    link.addEventListener("click", () => {
      const contact = document.querySelector("#contact");
      if (contact && link.getAttribute("href") === "#contact") {
        window.setTimeout(() => {
          const status = document.querySelector(".contact-notice");
          if (status) status.textContent = "이력서 파일은 검증된 자료 등록 후 다운로드할 수 있습니다.";
        }, 500);
      }
    });
  });
}
