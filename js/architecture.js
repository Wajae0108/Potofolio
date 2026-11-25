export function initArchitecture() {
  const detail = document.querySelector(".architecture-detail");
  const nodes = document.querySelectorAll(".arch-node");

  nodes.forEach((node) => {
    node.addEventListener("click", () => {
      nodes.forEach((item) => item.classList.remove("active"));
      node.classList.add("active");
      if (!detail) return;
      const number = node.querySelector("span")?.textContent ?? "";
      const numberElement = detail.querySelector(".detail-number");
      const titleElement = detail.querySelector("h3");
      const copyElement = detail.querySelector("div > span");
      if (numberElement) numberElement.textContent = number;
      if (titleElement) titleElement.textContent = node.dataset.title ?? "";
      if (copyElement) copyElement.textContent = node.dataset.detail ?? "";
    });
  });

  const tooltip = document.querySelector(".system-tooltip");
  document.querySelectorAll(".system-node").forEach((node) => {
    const showTip = () => {
      if (tooltip) tooltip.textContent = node.dataset.tip ?? "";
    };
    node.addEventListener("mouseenter", showTip);
    node.addEventListener("focus", showTip);
    node.addEventListener("click", showTip);
  });
}
