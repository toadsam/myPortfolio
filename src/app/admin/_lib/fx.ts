/* 배전반 연출. 전부 **조작한 그 순간에만** 한 번 튄다 — 상시 도는 인터벌은 없다.
   매일 여는 도구라 가만히 있을 때 배터리를 먹으면 안 된다. 모션을 줄인 사용자에겐 없다.
   불꽃은 body 에 붙여서 그린다(`position: fixed`). 회로 카드 안에 넣으면 카드의
   overflow 에 잘린다. */

function reduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** 어떤 요소의 한가운데서 불꽃을 사방으로 터뜨린다. 저장·해정처럼 **성공했을 때만** 부른다. */
export function burstFrom(el: HTMLElement | null, count = 22) {
  if (!el) return;
  if (reduced()) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement("div");
    spark.className = "sw-burst";
    spark.style.left = `${cx}px`;
    spark.style.top = `${cy}px`;
    document.body.appendChild(spark);
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
    const dist = 80 + Math.random() * 170;
    spark.animate(
      [
        {transform: "translate(0,0) scale(1)", opacity: 1},
        {
          transform: `translate(${Math.cos(angle) * dist}px, ${
            Math.sin(angle) * dist
          }px) scale(0)`,
          opacity: 0
        }
      ],
      {duration: 750, easing: "ease-out"}
    );
    window.setTimeout(() => spark.remove(), 780);
  }
}

/** 요소 위로 작은 불꽃 몇 개 — 레버를 올리거나 목표선을 넘을 때. */
export function sparksAt(el: Element | null, count = 12, color?: string) {
  if (!el || reduced()) return;
  const rect = el.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const spark = document.createElement("i");
    spark.className = "ab-spark";
    if (color) spark.style.background = color;
    spark.style.left = `${rect.left + rect.width * Math.random()}px`;
    spark.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(spark);
    const angle = Math.random() * Math.PI * 2;
    const dist = 20 + Math.random() * 50;
    spark.animate(
      [
        {transform: "translate(0,0)", opacity: 1},
        {
          transform: `translate(${Math.cos(angle) * dist}px, ${
            Math.sin(angle) * dist - 20
          }px)`,
          opacity: 0
        }
      ],
      {duration: 500 + Math.random() * 300, easing: "cubic-bezier(.2,.8,.2,1)"}
    );
    window.setTimeout(() => spark.remove(), 850);
  }
}

/** 요소 위로 떠오르는 글자 — "+15", "목표 달성 +50kWh". */
export function floatText(el: Element | null, text: string) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const label = document.createElement("span");
  label.className = "ab-float";
  label.textContent = text;
  label.style.left = `${rect.left + rect.width / 2}px`;
  label.style.top = `${rect.top - 4}px`;
  document.body.appendChild(label);
  window.setTimeout(() => label.remove(), 1200);
}
