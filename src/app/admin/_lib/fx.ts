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

/**
 * 지시서에서 게이지까지 전기 한 방울이 날아간다. 둘이 같은 화면에 있어서 가능한 연출이다.
 * 도착하면 `done` 을 부른다 — 값은 그때 더해야 "날아가서 채운다"가 된다. 모션 줄이기면
 * 바로 `done`.
 */
export function bolt(
  from: Element | null,
  to: Element | null,
  done: () => void
) {
  if (!from || !to || reduced()) {
    done();
    return;
  }
  const a = from.getBoundingClientRect();
  const b = to.getBoundingClientRect();
  const el = document.createElement("i");
  el.className = "ab-bolt";
  el.style.left = `${a.left + 18}px`;
  el.style.top = `${a.top + a.height / 2}px`;
  document.body.appendChild(el);
  const dx = b.left + b.width * 0.5 - (a.left + 18);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const anim = el.animate(
    [
      {transform: "translate(0,0) scale(1)"},
      {transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 30}px) scale(1.3)`},
      {transform: `translate(${dx}px, ${dy}px) scale(0.6)`, opacity: 0.8}
    ],
    {duration: 520, easing: "cubic-bezier(.3,.6,.3,1)"}
  );
  // onfinish 는 숨은 탭·절전 모드에서 안 올 때가 있다. 그러면 값이 영영 안 들어가므로
  // 시간 상한을 같이 건다. 어느 쪽이 먼저 오든 한 번만 끝낸다.
  let fired = false;
  const finish = () => {
    if (fired) return;
    fired = true;
    el.remove();
    done();
  };
  anim.onfinish = finish;
  anim.finished.then(finish).catch(finish);
  window.setTimeout(finish, 650);
}
