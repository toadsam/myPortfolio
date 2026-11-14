"use client";

/**
 * `/resume` v2 의 움직임 전부.
 *
 * 승인된 시안(c-family-v6.html)의 스크립트를 거의 그대로 옮겼다. 서버가 그린
 * 마크업(ResumeV2.tsx) 위에 붙고, 화면을 새로 그리지 않는다. 찾는 범위는 전부
 * `.rv2` 뿌리 안이고, 터지는 점·날아가는 종이도 뿌리 안에 붙인다(CSS 가 .rv2 로
 * 가둬져 있어서). 언마운트하면 리스너·rAF·관찰자·타이머·붙인 노드를 모두 걷는다.
 *
 * 시안과 다른 곳:
 * - PDF 버튼은 실제로 내려받는다(시안은 "연결 전" 안내였다).
 * - "전체 상세 보기"는 /resume/<id> 로 간다. 수정 키 없이 누르면 라우터로 옮긴다.
 */

import {useEffect, useRef} from "react";
import {useRouter} from "next/navigation";
import {
  BALLP,
  GAL,
  LINKS,
  NUMS,
  PROJECTS,
  SHORT,
  SUM_LINE,
  detailHref,
  img,
  type V2Project
} from "./resumeV2Data";

type Ex = HTMLElement & {
  _to?: string;
  _out?: Animation | null;
  _rolled?: boolean;
  _busy?: boolean;
  _x?: number;
};

type Props = {name: string; sumMeta: string; email: string; pdf: string};

export function ResumeV2Motion({name, sumMeta, email, pdf}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>(".rv2");
    if (!root) return;

    // ── 정리 장부 ──
    const offs: (() => void)[] = [];
    const timers = new Set<number>();
    const rafs = new Set<number>();
    const observers: IntersectionObserver[] = [];
    const rolledText = new Map<HTMLElement, string>();
    let alive = true;
    const on = (
      t: EventTarget,
      ev: string,
      fn: (e: never) => void,
      opt?: AddEventListenerOptions | boolean
    ) => {
      const h = fn as unknown as EventListener;
      t.addEventListener(ev, h, opt);
      offs.push(() => t.removeEventListener(ev, h, opt));
    };
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        if (alive) fn();
      }, ms);
      timers.add(id);
      return id;
    };
    const clearLater = (id: number) => {
      window.clearTimeout(id);
      timers.delete(id);
    };
    const raf = (fn: FrameRequestCallback) => {
      const id = requestAnimationFrame(t => {
        rafs.delete(id);
        if (alive) fn(t);
      });
      rafs.add(id);
      return id;
    };

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("js");
    const $ = <T extends HTMLElement = HTMLElement>(
      s: string,
      p: ParentNode = root
    ) => p.querySelector<T>(s);
    const $$ = <T extends HTMLElement = HTMLElement>(
      s: string,
      p: ParentNode = root
    ) => Array.from(p.querySelectorAll<T>(s));
    const SPRING = 560;
    const springEase = () =>
      getComputedStyle(root).getPropertyValue("--ease-pop").trim() ||
      "ease-out";
    // 스프링 곡선(linear())을 못 읽는 브라우저는 넘침 곡선으로 대신한다
    function A(
      el: Element,
      kf: Keyframe[],
      opt: KeyframeAnimationOptions
    ): Animation {
      try {
        return el.animate(kf, opt);
      } catch {
        opt.easing = "cubic-bezier(.34,1.56,.64,1)";
        return el.animate(kf, opt);
      }
    }

    // ── 한 프레임 한 루프. 일거리는 true 를 돌려주는 동안만 다음 프레임에 다시 불린다 ──
    type Task = (t: number) => boolean;
    let tasks: Task[] = [];
    let loopRaf = 0;
    function addTask(fn: Task) {
      if (tasks.indexOf(fn) < 0) tasks.push(fn);
      if (!loopRaf) loopRaf = raf(loopFrame);
    }
    function loopFrame(t: number) {
      loopRaf = 0;
      const keep: Task[] = [];
      for (const fn of tasks) if (fn(t)) keep.push(fn);
      tasks = keep;
      if (tasks.length) loopRaf = raf(loopFrame);
    }
    function bounce(el: Element | null, amt?: number) {
      if (reduce || !el) return;
      A(el, [{scale: "1"}, {scale: String(1 + (amt || 0.08))}, {scale: "1"}], {
        duration: SPRING * 0.8,
        easing: springEase()
      });
    }

    const byId = (id: string): V2Project | undefined =>
      PROJECTS.find(x => x.id === id);
    const OUT =
      '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M5 3h6v6M11 3L3.5 10.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const DOWN =
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const ARW = (d: number) =>
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="' +
      (d < 0 ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5") +
      '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const CHECK =
      '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 6.4l2.3 2.3 4.7-5.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const X_ICON =
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    const BACK_ICON =
      '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8H3.5M7.5 3.5L3 8l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const vh = window.innerHeight || 800;

    // ── 글자 바꾸기: 옛 글자는 위로 빠지고 새 글자가 아래에서 올라온다. 도중에 다시 불려도 마지막 값으로 끝난다 ──
    function swapLab(lab: Ex | null, html: string, host?: HTMLElement) {
      if (!lab) return;
      if ((lab._to !== undefined ? lab._to : lab.innerHTML) === html) return;
      lab._to = html;
      if (reduce) {
        lab.innerHTML = html;
        return;
      }
      const w0 = host ? host.offsetWidth : 0;
      if (lab._out) {
        lab._out.onfinish = null;
        lab._out.cancel();
      }
      const out = (lab._out = lab.animate(
        [
          {opacity: 1, transform: "none"},
          {opacity: 0, transform: "translateY(-60%)"}
        ],
        {duration: 110, easing: "ease-in", fill: "forwards"}
      ));
      out.onfinish = () => {
        lab._out = null;
        lab.innerHTML = lab._to ?? "";
        out.cancel();
        if (host) {
          const w1 = host.offsetWidth;
          if (Math.abs(w1 - w0) > 1)
            A(host, [{width: w0 + "px"}, {width: w1 + "px"}], {
              duration: SPRING,
              easing: springEase()
            });
        }
        A(
          lab,
          [
            {opacity: 0, transform: "translateY(60%)"},
            {opacity: 1, transform: "none"}
          ],
          {duration: SPRING * 0.7, easing: springEase()}
        );
      };
    }
    const morph = (btn: HTMLElement, html: string) =>
      swapLab($<Ex>(".lbl", btn), html, btn);

    // ── 강조색 점이 터진다. 드문 순간에만 쓴다 (인디고 네 단계, resumeV2.css 토큰과 같은 값) ──
    const BLUES = ["#4f46e5", "#aeaaf3", "#d9d7f9", "#2a1fe0"];
    function burst(x: number, y: number, n: number) {
      if (reduce) return;
      for (let i = 0; i < n; i++) {
        const d = document.createElement("i");
        d.className = "dot";
        d.style.left = x + "px";
        d.style.top = y + "px";
        d.style.background = BLUES[i % 4];
        root!.appendChild(d);
        const ang = Math.random() * Math.PI * 2;
        const dist = 40 + Math.random() * 80;
        const a = d.animate(
          [
            {transform: "translate(-50%,-50%) scale(1)", opacity: 1},
            {
              transform:
                "translate(calc(-50% + " +
                (Math.cos(ang) * dist).toFixed(0) +
                "px),calc(-50% + " +
                (Math.sin(ang) * dist - 24).toFixed(0) +
                "px)) scale(.3)",
              opacity: 0
            }
          ],
          {
            duration: 650 + Math.random() * 250,
            easing: "cubic-bezier(.2,.8,.2,1)"
          }
        );
        a.onfinish = () => d.remove();
      }
    }

    // ── 숫자: 자릿수마다 굴러 올라가 멈춘다. 멈춘 뒤에는 원래 글자로 되돌려 줄 맞춤을 지킨다 ──
    function roll(el: Ex) {
      if (reduce || el._rolled) return;
      el._rolled = true;
      const txt = el.textContent ?? "";
      rolledText.set(el, txt);
      let k = 0;
      el.classList.add("rolling");
      el.innerHTML = txt
        .split("")
        .map(c => {
          if (!/\d/.test(c)) return '<span class="dg">' + c + "</span>";
          return (
            '<span class="dg"><span class="dg-col" data-d="' +
            c +
            '" style="--k:' +
            k++ +
            '"><span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span></span></span>'
          );
        })
        .join("");
      raf(() =>
        raf(() => {
          $$(".dg-col", el).forEach(c => {
            c.style.transform =
              "translateY(-" + +(c.getAttribute("data-d") ?? 0) * 1.2 + "em)";
          });
        })
      );
      later(() => {
        el.classList.remove("rolling");
        el.textContent = txt;
        rolledText.delete(el);
      }, 1000 + k * 70 + 500);
    }

    // ── 스크롤 등장 ──
    function reveal(el: HTMLElement) {
      el.classList.remove("rv-wait");
      el.classList.add("rv-in");
      el.addEventListener("animationend", () => el.classList.remove("rv-in"), {
        once: true
      });
      $$<Ex>(".num[data-roll]", el).forEach(roll);
      if (!reduce)
        $$(".row", el).forEach((r, i) => {
          A(
            r,
            [
              {opacity: 0, transform: "translateY(14px)"},
              {opacity: 1, transform: "none"}
            ],
            {
              duration: 520,
              delay: 120 + i * 40,
              easing: springEase(),
              fill: "backwards"
            }
          );
        });
    }
    if ("IntersectionObserver" in window && !reduce) {
      const io = new IntersectionObserver(
        es => {
          es.forEach(e => {
            if (e.isIntersecting) {
              io.unobserve(e.target);
              reveal(e.target as HTMLElement);
            }
          });
        },
        {threshold: 0.12}
      );
      observers.push(io);
      $$(".rv").forEach(el => {
        if (el.getBoundingClientRect().top > vh * 0.94)
          el.classList.add("rv-wait");
        io.observe(el);
      });
    }
    // 끝까지 읽은 사람에게 한 번
    const thanks = $("#thanks");
    if (
      thanks &&
      !reduce &&
      "IntersectionObserver" in window &&
      thanks.getBoundingClientRect().top > vh
    ) {
      thanks.classList.add("wait");
      const tio = new IntersectionObserver(
        es => {
          if (es[0].isIntersecting) {
            tio.disconnect();
            thanks.classList.remove("wait");
            thanks.classList.add("in");
          }
        },
        {threshold: 0.6}
      );
      observers.push(tio);
      tio.observe(thanks);
    }

    // ── PDF: 종이가 접혀 날아간 뒤 실제로 내려받고 글자가 바뀐다 ──
    function paperFly(btn: HTMLElement, done: () => void) {
      if (reduce) {
        done();
        return;
      }
      const r = btn.getBoundingClientRect();
      const p = document.createElement("span");
      p.className = "paper";
      p.style.left = r.left + r.width / 2 - 9 + "px";
      p.style.top = r.top + r.height / 2 - 12 + "px";
      root!.appendChild(p);
      const up = r.top > 200 ? -150 : 150;
      const a = p.animate(
        [
          {transform: "translateY(0) scaleY(1) rotate(0deg)", opacity: 1},
          {
            transform: "translateY(" + up / 20 + "px) scaleY(.5) rotate(-8deg)",
            opacity: 1,
            offset: 0.38
          },
          {
            transform: "translateY(" + up + "px) scaleY(.5) rotate(20deg)",
            opacity: 0
          }
        ],
        {duration: 720, easing: "cubic-bezier(.3,.7,.2,1)"}
      );
      a.onfinish = () => {
        p.remove();
        if (alive) done();
      };
    }
    function download() {
      const a = document.createElement("a");
      a.href = pdf;
      a.download = "";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    function onPdf(b: Ex) {
      if (b._busy) return;
      b._busy = true;
      const orig = b.getAttribute("data-pdf") ?? "";
      paperFly(b, () => {
        download();
        morph(b, CHECK + " 내려받는 중");
        later(placeInd, SPRING + 160);
        later(() => {
          morph(b, orig);
          b._busy = false;
          later(placeInd, SPRING + 160);
        }, 2600);
      });
    }
    function onCopy(b: Ex) {
      if (b._busy) return;
      b._busy = true;
      const label = b.getAttribute("data-label") ?? "";
      const done = (ok: boolean) => {
        if (!alive) return;
        morph(
          b,
          ok ? CHECK + " 복사했습니다" : b.getAttribute("data-copy") ?? ""
        );
        if (ok) {
          const r = b.getBoundingClientRect();
          burst(r.left + r.width / 2, r.top + r.height / 2, 10);
        }
        later(() => {
          morph(b, label);
          b._busy = false;
        }, 2200);
      };
      try {
        navigator.clipboard.writeText(b.getAttribute("data-copy") ?? "").then(
          () => done(true),
          () => done(false)
        );
      } catch {
        done(false);
      }
    }

    // ── 알약 내비게이션: 현재 구역 표시가 미끄러진다 ──
    const ind = $<Ex>("#ind")!;
    const navBtns = $$(".pill [data-go]");
    const secs = $$("[data-sec]");
    let curSec = "intro";
    function placeInd() {
      const b = navBtns.filter(x => x.getAttribute("data-go") === curSec)[0];
      if (!b || !ind) return;
      const moved = ind._x !== undefined && ind._x !== b.offsetLeft;
      ind._x = b.offsetLeft;
      ind.style.width = b.offsetWidth + "px";
      ind.style.transform = "translateX(" + b.offsetLeft + "px)";
      if (moved && !reduce)
        A(ind, [{scale: "1 1"}, {scale: "1.22 .86"}, {scale: "1 1"}], {
          duration: SPRING,
          easing: springEase()
        });
      navBtns.forEach(x =>
        x.setAttribute("aria-current", x === b ? "true" : "false")
      );
    }
    const pillEl = $(".pill")!;
    let lastY = window.scrollY;
    let dirY = 0;
    let pillBusy = false;
    function pillBump() {
      if (reduce || pillBusy || pillEl.classList.contains("enter")) return;
      pillBusy = true;
      const a = A(
        pillEl,
        [
          {translate: "-50% 0"},
          {translate: "-50% -6px"},
          {translate: "-50% 0"}
        ],
        {
          duration: SPRING * 0.8,
          easing: springEase()
        }
      );
      a.onfinish = () => {
        pillBusy = false;
      };
    }
    function trackSec() {
      const line = window.innerHeight * 0.42;
      let cur = "intro";
      secs.forEach(s => {
        if (s.getBoundingClientRect().top <= line)
          cur = s.getAttribute("data-sec") ?? cur;
      });
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4
      )
        cur = "contact";
      if (cur !== curSec) {
        curSec = cur;
        placeInd();
      }
    }
    let st = 0;
    on(
      window,
      "scroll",
      () => {
        const y = window.scrollY;
        const d = y > lastY ? 1 : y < lastY ? -1 : 0;
        if (d && dirY && d !== dirY && Math.abs(y - lastY) > 2) pillBump();
        if (d) dirY = d;
        lastY = y;
        if (st) return;
        st = raf(() => {
          st = 0;
          trackSec();
        });
      },
      {passive: true}
    );
    on(window, "resize", () => placeInd());
    placeInd();
    later(placeInd, 400);
    if (document.fonts && document.fonts.ready)
      document.fonts.ready.then(() => {
        if (alive) placeInd();
      });
    $$("[data-go]").forEach(b => {
      on(b, "click", () => {
        const t = $('[data-sec="' + b.getAttribute("data-go") + '"]');
        if (!t) return;
        const y =
          t.getBoundingClientRect().top +
          window.scrollY -
          (t.id === "intro" ? 0 : 70);
        window.scrollTo({top: y, behavior: reduce ? "auto" : "smooth"});
      });
    });

    // ── 판: 누른 요소의 자리에서 커지고, 닫으면 그 자리로 돌아간다. 단계를 넘기면 내용이 밀려 들어오고 높이가 변한다 ──
    const tray = $("#tray")!;
    const fit = $("#fit")!;
    const trayIn = $("#trayIn")!;
    const grab = $("#grab")!;
    const head = $("#trayHead")!;
    const foot = $("#trayFoot")!;
    const scrim = $("#scrim")!;
    const titleEl = $("#trayTitle")!;
    const stepEl = $("#trayStep")!;
    const iconBtn = $("#trayIcon")!;
    const sdots = $("#sdots")!;
    const nextBtn = $("#nextBtn")!;
    const trayDetail = $<HTMLAnchorElement>("#trayDetail");
    type P = V2Project | {id: "summary"; title: string; summary: true};
    const isSum = (p: P): p is {id: "summary"; title: string; summary: true} =>
      "summary" in p;
    let curP: P | null = null;
    let steps: string[] = [];
    let step = 0;
    let srcEl: HTMLElement | null = null;
    let hiddenEl: HTMLElement | null = null;
    let lastFocus: Element | null = null;
    let fitFade: Animation | null = null;
    let trayAnim: Animation | null = null;
    let outAnim: Animation | null = null;
    let galI = 0;
    let iconKind = "";
    const SUMMARY: P = {id: "summary", title: "30초 요약", summary: true};
    const STEP_NAME: Record<string, string> = {
      intro: "소개",
      pain: "불편과 고친 것",
      nums: "숫자와 맡은 일",
      links: "링크",
      sum: ""
    };
    function stepsOf(p: P) {
      if (isSum(p)) return ["sum"];
      const s = ["intro"];
      if (p.pain) s.push("pain");
      s.push("nums");
      if (LINKS[p.id]) s.push("links");
      return s;
    }
    function galHTML(p: V2Project) {
      const g = GAL[p.id] || [p.id];
      const many = g.length > 1;
      return (
        '<div class="gal"><img class="gal-img" id="galImg" src="' +
        img(g[galI]) +
        '" alt="' +
        p.title +
        " 화면 " +
        (galI + 1) +
        '">' +
        (many
          ? '<button type="button" class="gal-btn prev" data-gal="-1" aria-label="이전 그림">' +
            ARW(-1) +
            '</button><button type="button" class="gal-btn next" data-gal="1" aria-label="다음 그림">' +
            ARW(1) +
            "</button>" +
            '<span class="gal-dots" aria-hidden="true">' +
            g
              .map((_, i) => "<i" + (i === galI ? ' class="on"' : "") + "></i>")
              .join("") +
            "</span>"
          : "") +
        "</div>"
      );
    }
    function sumHTML() {
      return (
        '<div class="step sum"><h2>' +
        name +
        '</h2><p class="s-meta">' +
        sumMeta +
        "</p>" +
        '<div class="s-nums">' +
        NUMS.map(
          n =>
            '<div class="s-num"><b class="num">' +
            n[0] +
            "</b><span>" +
            n[2] +
            " · " +
            n[1] +
            "</span></div>"
        ).join("") +
        "</div>" +
        '<div class="s-list">' +
        PROJECTS.map(
          p =>
            '<button type="button" class="s-item" data-open="' +
            p.id +
            '"><img src="' +
            img(p.id) +
            '" alt=""><span><b>' +
            p.title +
            "</b><span>" +
            (SHORT[p.id] || p.sub) +
            "</span></span></button>"
        ).join("") +
        "</div>" +
        '<p class="s-line">' +
        SUM_LINE +
        "</p>" +
        '<div class="s-cta"><a class="btn press" href="' +
        pdf +
        '" download data-pdf="이력서 PDF 받기"><span class="lbl">이력서 PDF 받기</span></a>' +
        '<button type="button" class="btn soft press" data-copy="' +
        email +
        '" data-label="이메일 복사"><span class="lbl">이메일 복사</span></button></div></div>'
      );
    }
    function stepHTML(p: P, kind: string) {
      if (isSum(p) || kind === "sum") return sumHTML();
      if (kind === "intro")
        return (
          '<div class="step">' +
          galHTML(p) +
          '<p class="meta"><span class="badge' +
          (p.status === "운영중" ? " on" : " off") +
          '">' +
          p.status +
          "</span> " +
          p.period +
          " · " +
          p.team +
          '</p><p class="lead">' +
          p.sub +
          "</p></div>"
        );
      if (kind === "pain")
        return (
          '<div class="step"><div class="pf" style="--i:0"><span class="tag">겪은 불편</span><p>' +
          p.pain +
          '</p></div><div class="arrow">' +
          DOWN +
          '</div><div class="pf fixed" style="--i:1"><span class="tag fix">고친 것</span><p>' +
          p.fix +
          "</p></div></div>"
        );
      if (kind === "nums")
        return (
          '<div class="step"><div class="mets" style="grid-template-columns:repeat(' +
          p.metrics.length +
          ',minmax(0,1fr))">' +
          p.metrics
            .map(
              (m, k) =>
                '<div class="met" style="--i:' +
                k +
                '"><b class="num">' +
                m[0] +
                "</b><span>" +
                m[1] +
                "</span></div>"
            )
            .join("") +
          "</div>" +
          '<dl class="kv"><dt>출처</dt><dd>' +
          p.source +
          "</dd><dt>맡은 일</dt><dd>" +
          p.role +
          "</dd><dt>기간 · 팀</dt><dd>" +
          p.period +
          " · " +
          p.team +
          "</dd></dl></div>"
        );
      return (
        '<div class="step"><div class="lks">' +
        '<a class="lk detail" style="--i:0" href="' +
        detailHref(p.id) +
        '"><span>전체 상세 보기</span>' +
        OUT +
        "</a>" +
        (LINKS[p.id] || [])
          .map(
            (x, k) =>
              '<a class="lk" style="--i:' +
              (k + 1) +
              '" href="' +
              x[1] +
              '" target="_blank" rel="noopener"><span>' +
              x[0] +
              "</span>" +
              OUT +
              "</a>"
          )
          .join("") +
        "</div></div>"
      );
    }
    // 제목 줄 아이콘: 첫 단계는 닫기, 그다음부터 뒤로. 바뀔 때 돌면서 교체된다
    function setIcon(kind: string, now?: boolean) {
      if (kind === iconKind) return;
      iconKind = kind;
      iconBtn.setAttribute("aria-label", kind === "x" ? "닫기" : "이전 단계");
      const svg = iconBtn.firstElementChild;
      if (now || reduce || !svg) {
        iconBtn.innerHTML = kind === "x" ? X_ICON : BACK_ICON;
        return;
      }
      const o = svg.animate(
        [
          {transform: "rotate(0deg) scale(1)", opacity: 1},
          {transform: "rotate(90deg) scale(.4)", opacity: 0}
        ],
        {duration: 120, easing: "ease-in", fill: "forwards"}
      );
      o.onfinish = () => {
        iconBtn.innerHTML = iconKind === "x" ? X_ICON : BACK_ICON;
        const n = iconBtn.firstElementChild;
        if (n)
          A(
            n,
            [
              {transform: "rotate(-90deg) scale(.4)", opacity: 0},
              {transform: "none", opacity: 1}
            ],
            {duration: SPRING * 0.7, easing: springEase()}
          );
      };
    }
    function chrome(now?: boolean) {
      if (!curP) return;
      titleEl.textContent = curP.title;
      if (trayDetail) {
        const sum = isSum(curP);
        trayDetail.hidden = sum;
        if (!sum) trayDetail.setAttribute("href", detailHref(curP.id));
      }
      stepEl.textContent =
        steps.length > 1
          ? STEP_NAME[steps[step]] + " · " + (step + 1) + " / " + steps.length
          : "";
      setIcon(step === 0 ? "x" : "back", now);
      sdots.innerHTML =
        steps.length > 1
          ? steps
              .map((_, i) => "<i" + (i === step ? ' class="on"' : "") + "></i>")
              .join("")
          : "";
      const txt = step === steps.length - 1 ? "닫기" : "계속";
      const lab = $<Ex>(".lbl", nextBtn)!;
      if (now) {
        if (lab._out) {
          lab._out.onfinish = null;
          lab._out.cancel();
          lab._out = null;
        }
        lab.innerHTML = txt;
        lab._to = txt;
      } else {
        morph(nextBtn, txt);
        bounce(nextBtn, 0.1);
        const onDot = $(".sdots i.on", sdots);
        if (onDot && !reduce)
          A(
            onDot,
            [
              {transform: "scaleX(.4)"},
              {transform: "scaleX(1.25)"},
              {transform: "none"}
            ],
            {
              duration: SPRING * 0.8,
              easing: springEase()
            }
          );
      }
    }
    type R = {left: number; top: number; width: number; height: number};
    const finalWidth = () => Math.min(520, window.innerWidth - 24);
    function measureAuto() {
      fit.style.width = finalWidth() + "px";
      const kids = trayIn.children;
      let hh = 0;
      const cs = getComputedStyle(trayIn);
      for (let k = 0; k < kids.length; k++) {
        const m = getComputedStyle(kids[k]);
        hh +=
          (kids[k] as HTMLElement).offsetHeight +
          parseFloat(m.marginTop) +
          parseFloat(m.marginBottom);
      }
      return (
        grab.offsetHeight +
        head.offsetHeight +
        hh +
        parseFloat(cs.paddingTop) +
        parseFloat(cs.paddingBottom) +
        foot.offsetHeight
      );
    }
    function finalRect(hh: number): R {
      const vw = window.innerWidth;
      const vhh = window.innerHeight;
      const w = finalWidth();
      const H = Math.min(hh, vhh * 0.88);
      return {left: (vw - w) / 2, top: vhh - 12 - H, width: w, height: H};
    }
    function setRect(r: R) {
      tray.style.left = r.left + "px";
      tray.style.top = r.top + "px";
      tray.style.width = r.width + "px";
      tray.style.height = r.height + "px";
    }
    const kf = (r: R, rad: string): Keyframe => ({
      left: r.left + "px",
      top: r.top + "px",
      width: r.width + "px",
      height: r.height + "px",
      borderRadius: rad
    });
    const plain = (r: DOMRect | R): R => ({
      left: r.left,
      top: r.top,
      width: r.width,
      height: r.height
    });
    // 움직이는 도중에 다시 불리면 앞의 움직임을 끊고 지금 자리에서 이어 간다(호출 쪽이 from 을 먼저 잰다)
    function moveTo(
      from: R,
      to: R,
      r0: string,
      r1: string,
      opt?: KeyframeAnimationOptions
    ) {
      if (trayAnim) {
        trayAnim.onfinish = null;
        trayAnim.cancel();
        trayAnim = null;
      }
      setRect(to);
      if (reduce) return null;
      trayAnim = A(
        tray,
        [kf(from, r0), kf(to, r1)],
        opt || {duration: SPRING, easing: springEase()}
      );
      return trayAnim;
    }
    const radOf = (el: HTMLElement) =>
      el.classList.contains("ptile") ? "34px" : "99px";
    const mainEl = $("main")!;
    function pushBg(onOff: boolean) {
      if (reduce) return;
      if (onOff) mainEl.style.setProperty("--sy", window.scrollY + "px");
      root!.classList.toggle("pushed", onOff);
    }
    function setHash(hh: string) {
      try {
        history.replaceState(
          null,
          "",
          hh ? "#" + hh : location.pathname + location.search
        );
      } catch {
        /* 주소를 못 바꿔도 판은 연다 */
      }
    }
    function showHidden() {
      if (hiddenEl) {
        hiddenEl.style.visibility = "";
        hiddenEl = null;
      }
    }
    function openTray(id: string, el: HTMLElement) {
      const p = id === "summary" ? SUMMARY : byId(id);
      if (!p) return;
      if (curP) {
        if (curP !== p) switchTo(p);
        return;
      }
      showHidden();
      curP = p;
      steps = stepsOf(p);
      step = 0;
      galI = 0;
      srcEl = el;
      lastFocus = document.activeElement;
      setHash(isSum(p) ? "" : "p-" + p.id);
      if (outAnim) {
        outAnim.onfinish = null;
        outAnim.cancel();
        outAnim = null;
      }
      trayIn.innerHTML = stepHTML(p, steps[0]);
      trayIn.scrollTop = 0;
      iconKind = "";
      chrome(true);
      if (fitFade) {
        fitFade.cancel();
        fitFade = null;
      }
      const from = plain(el.getBoundingClientRect());
      const to = finalRect(measureAuto());
      if (el.classList.contains("ptile")) {
        el.style.visibility = "hidden";
        hiddenEl = el;
      }
      tray.classList.add("on");
      tray.style.transform = "";
      scrim.classList.add("open");
      pushBg(true);
      moveTo(from, to, radOf(el), "36px");
      if (!reduce)
        fit.animate([{opacity: 0}, {opacity: 1}], {
          duration: 220,
          easing: "ease-out"
        });
      later(() => {
        if (curP === p) nextBtn.focus({preventScroll: true});
      }, 90);
    }
    function closeTray() {
      if (!curP) return;
      curP = null;
      setHash("");
      pushBg(false);
      const from = plain(tray.getBoundingClientRect());
      const el = srcEl!;
      const r = el.getBoundingClientRect();
      const seen = r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
      const to = seen
        ? plain(r)
        : {
            left: from.left + from.width * 0.1,
            top: window.innerHeight + 20,
            width: from.width * 0.8,
            height: from.height * 0.8
          };
      scrim.classList.remove("open");
      const fin = () => {
        if (curP || !alive) return;
        trayAnim = null;
        tray.classList.remove("on");
        tray.style.transform = "";
        showHidden();
        if (lastFocus instanceof HTMLElement)
          lastFocus.focus({preventScroll: true});
      };
      const a = moveTo(from, to, "36px", radOf(el), {
        duration: 300,
        easing: "cubic-bezier(.3,.8,.2,1)"
      });
      if (!a) {
        fin();
        return;
      }
      fitFade = fit.animate([{opacity: 1}, {opacity: 0}], {
        duration: 170,
        fill: "forwards"
      });
      a.onfinish = fin;
    }
    // 단계 넘기기. 넘기는 도중 다시 넘기면 앞의 것을 끊고 바로 마지막 단계를 그린다
    function render(d: number) {
      const p = curP;
      if (!p) return;
      if (outAnim) {
        outAnim.onfinish = null;
        outAnim.cancel();
        outAnim = null;
      }
      const swapIn = () => {
        if (curP !== p) return;
        const from = plain(tray.getBoundingClientRect());
        trayIn.innerHTML = stepHTML(p, steps[step]);
        trayIn.scrollTop = 0;
        chrome();
        moveTo(from, finalRect(measureAuto()), "36px", "36px");
      };
      if (reduce) {
        swapIn();
        return;
      }
      outAnim = trayIn.animate(
        [
          {opacity: 1, transform: "none"},
          {opacity: 0, transform: "translateX(" + -d * 48 + "px)"}
        ],
        {duration: 100, easing: "ease-in", fill: "forwards"}
      );
      outAnim.onfinish = () => {
        const o = outAnim;
        outAnim = null;
        o?.cancel();
        swapIn();
        A(
          trayIn,
          [
            {opacity: 0, transform: "translateX(" + d * 48 + "px)"},
            {opacity: 1, transform: "none"}
          ],
          {duration: SPRING * 0.75, easing: springEase()}
        );
      };
    }
    function go(d: number) {
      if (!curP) return;
      const n = step + d;
      if (n >= steps.length) {
        closeTray();
        return;
      }
      if (n < 0) return;
      step = n;
      render(d);
    }
    function switchTo(p: P) {
      curP = p;
      steps = stepsOf(p);
      step = 0;
      galI = 0;
      setHash("p-" + p.id);
      render(1);
    }
    function galStep(d: number) {
      if (!curP) return;
      const g = GAL[curP.id] || [];
      const im = $<HTMLImageElement>("#galImg");
      if (g.length < 2 || !im) return;
      galI = (galI + d + g.length) % g.length;
      $$(".gal-dots i", trayIn).forEach((el, k) => {
        el.className = k === galI ? "on" : "";
      });
      const title = curP.title;
      const swap = () => {
        im.src = img(g[galI]);
        im.alt = title + " 화면 " + (galI + 1);
      };
      if (reduce) {
        swap();
        return;
      }
      const out = im.animate(
        [
          {opacity: 1, transform: "none"},
          {opacity: 0, transform: "translateX(" + -d * 36 + "px)"}
        ],
        {duration: 100, easing: "ease-in", fill: "forwards"}
      );
      out.onfinish = () => {
        swap();
        out.cancel();
        A(
          im,
          [
            {opacity: 0, transform: "translateX(" + d * 36 + "px)"},
            {opacity: 1, transform: "none"}
          ],
          {duration: SPRING * 0.7, easing: springEase()}
        );
      };
    }
    on(nextBtn, "click", () => go(1));
    on(iconBtn, "click", () => {
      if (step === 0) closeTray();
      else go(-1);
    });
    on(root, "click", (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (!t || !t.closest) return;
      const g = t.closest("[data-gal]");
      if (g) {
        galStep(+(g.getAttribute("data-gal") ?? 0));
        return;
      }
      const pd = t.closest<HTMLElement>("[data-pdf]");
      if (pd) {
        e.preventDefault();
        onPdf(pd);
        return;
      }
      const cp = t.closest<HTMLElement>("[data-copy]");
      if (cp) {
        onCopy(cp);
        return;
      }
      const sm = t.closest<HTMLElement>("[data-sum]");
      if (sm) {
        openTray("summary", sm);
        return;
      }
      // 상세 보기는 라우터로(새 탭·수정 키는 브라우저에 맡긴다)
      const dl = t.closest<HTMLAnchorElement>("a.lk.detail, a[data-detail]");
      if (dl) {
        if (
          e.button === 0 &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.shiftKey &&
          !e.altKey
        ) {
          e.preventDefault();
          routerRef.current.push(dl.getAttribute("href") ?? "/resume");
        }
        return;
      }
      const b = t.closest<HTMLElement>("[data-open]");
      if (b) openTray(b.getAttribute("data-open") ?? "", b);
    });
    on(scrim, "click", closeTray);
    on(document, "keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (curP) closeTray();
        return;
      }
      if (!curP || steps.length < 2) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (step < steps.length - 1) go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    });
    on(window, "resize", () => {
      if (curP) setRect(finalRect(measureAuto()));
    });
    // 손잡이를 끌어 내려 닫기
    {
      let y0 = 0;
      let dy = 0;
      let dragOn = false;
      let t0 = 0;
      on(grab, "pointerdown", (e: PointerEvent) => {
        if (!curP) return;
        dragOn = true;
        y0 = e.clientY;
        dy = 0;
        t0 = performance.now();
        try {
          grab.setPointerCapture(e.pointerId);
        } catch {
          /* 끝난 포인터면 무시 */
        }
      });
      on(grab, "pointermove", (e: PointerEvent) => {
        if (!dragOn) return;
        dy = Math.max(-20, e.clientY - y0);
        tray.style.transform = "translateY(" + dy + "px)";
      });
      const end = () => {
        if (!dragOn) return;
        dragOn = false;
        const v = dy / Math.max(1, performance.now() - t0);
        if (dy > 110 || v > 0.7) {
          const r = plain(tray.getBoundingClientRect());
          tray.style.transform = "";
          setRect(r);
          closeTray();
        } else {
          tray.style.transform = "";
          if (!reduce)
            A(
              tray,
              [{transform: "translateY(" + dy + "px)"}, {transform: "none"}],
              {duration: SPRING, easing: springEase()}
            );
        }
      };
      on(grab, "pointerup", end);
      on(grab, "pointercancel", end);
    }
    // 주소로 바로 들어오면 그 프로젝트를 연다
    function openFromHash() {
      const m = /^#p-([a-z0-9-]+)$/.exec(location.hash);
      if (!m || curP) return;
      const el = $('.ptile[data-open="' + m[1] + '"]');
      if (!el) return;
      el.scrollIntoView({block: "center", behavior: "auto"});
      later(() => openTray(m[1], el), reduce ? 0 : 700);
    }
    on(window, "hashchange", openFromHash);
    openFromHash();

    // ── 기술 공: 원끼리 부딪히는 작은 물리. 누르면 그 기술을 쓴 대표 프로젝트가 아래에 나온다 ──
    type Ball = {
      el: HTMLElement;
      r: number;
      m: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      sq: number;
    };
    const box = $("#balls")!;
    const ballOut = $("#ballOut")!;
    let balls: Ball[] = [];
    let ballOn = false;
    let last = 0;
    let still = 0;
    let W = 0;
    let H = 0;
    let dragging: Ball | null = null;
    function selectBall(el: HTMLElement) {
      const nm = el.textContent ?? "";
      const ids = BALLP[nm] || [];
      if (!ids.length) return;
      $$(".ball.sel", box).forEach(x => x.classList.remove("sel"));
      el.classList.add("sel");
      ballOut.innerHTML =
        "<span>" +
        nm +
        " · 이 기술을 쓴 대표 프로젝트</span>" +
        ids
          .map(
            id =>
              '<button type="button" class="pchip press" data-open="' +
              id +
              '">' +
              (byId(id)?.title ?? id) +
              "</button>"
          )
          .join("");
      if (!reduce)
        $$(".pchip", ballOut).forEach((c, i) => {
          A(
            c,
            [
              {opacity: 0, transform: "translateY(16px) scale(.6)"},
              {opacity: 1, transform: "none"}
            ],
            {
              duration: SPRING,
              delay: i * 70,
              easing: springEase(),
              fill: "backwards"
            }
          );
        });
    }
    function setupBalls() {
      W = box.clientWidth;
      H = box.clientHeight;
      const k = W < 420 ? 0.76 : W < 560 ? 0.88 : 1;
      box.classList.add("live");
      balls = $$(".ball", box).map(el => {
        const r = (el.hasAttribute("data-big") ? 46 : 38) * k;
        el.style.width = el.style.height = r * 2 + "px";
        el.style.fontSize =
          (el.hasAttribute("data-big") ? 13.5 : 12) * Math.max(0.86, k) + "px";
        return {el, r, m: r * r, x: 0, y: 0, vx: 0, vy: 0, sq: 0};
      });
      balls.forEach((b, i) => {
        b.x = b.r + Math.random() * Math.max(1, W - 2 * b.r);
        b.y = -b.r - 20 - i * 70;
        b.vx = (Math.random() - 0.5) * 160;
        b.vy = 0;
      });
      wake();
    }
    function wake() {
      still = 0;
      if (!ballOn) {
        ballOn = true;
        last = 0;
        addTask(tick);
      }
    }
    function stepPhys(dt: number) {
      const e = 0.5;
      const g = 2400;
      for (const b of balls) {
        if (b === dragging) continue;
        b.vy += g * dt;
        b.vx *= 0.996;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }
      for (let it = 0; it < 3; it++) {
        for (let i = 0; i < balls.length; i++) {
          const b = balls[i];
          if (b.x < b.r) {
            b.x = b.r;
            if (b.vx < 0) b.vx = -b.vx * e;
          }
          if (b.x > W - b.r) {
            b.x = W - b.r;
            if (b.vx > 0) b.vx = -b.vx * e;
          }
          if (b.y > H - b.r) {
            b.y = H - b.r;
            if (b.vy > 0) {
              if (b.vy > 260) b.sq = Math.min(1, b.vy / 1600);
              b.vy = -b.vy * e;
              if (Math.abs(b.vy) < g * dt * 2.2) b.vy = 0;
            }
            b.vx *= 0.97;
          }
          if (b.y < b.r && b.vy < 0 && b.y > -b.r) {
            b.y = b.r;
            b.vy = -b.vy * e;
          }
          for (let j = i + 1; j < balls.length; j++) {
            const c = balls[j];
            const dx = c.x - b.x;
            const dy = c.y - b.y;
            const rs = b.r + c.r;
            const d2 = dx * dx + dy * dy;
            if (d2 >= rs * rs || d2 === 0) continue;
            const d = Math.sqrt(d2);
            const nx = dx / d;
            const ny = dy / d;
            const ov = rs - d;
            const mb = b === dragging ? 1e9 : b.m;
            const mc = c === dragging ? 1e9 : c.m;
            const tm = mb + mc;
            b.x -= nx * ov * (mc / tm);
            b.y -= ny * ov * (mc / tm);
            c.x += nx * ov * (mb / tm);
            c.y += ny * ov * (mb / tm);
            const vn = (c.vx - b.vx) * nx + (c.vy - b.vy) * ny;
            if (vn < 0) {
              const imp = (-(1 + e) * vn) / (1 / mb + 1 / mc);
              b.vx -= (imp * nx) / mb;
              b.vy -= (imp * ny) / mb;
              c.vx += (imp * nx) / mc;
              c.vy += (imp * ny) / mc;
            }
          }
        }
      }
    }
    function tick(t: number) {
      if (!last) last = t;
      const dt = Math.min(0.033, (t - last) / 1000);
      last = t;
      let mv = 0;
      const px = balls.map(b => [b.x, b.y]);
      stepPhys(dt / 2);
      stepPhys(dt / 2);
      balls.forEach((b, i) => {
        mv = Math.max(mv, Math.abs(b.x - px[i][0]) + Math.abs(b.y - px[i][1]));
        if (b.sq > 0.01) {
          b.sq *= 0.84;
          mv = Math.max(mv, 1);
        } else b.sq = 0;
        b.el.style.transform =
          "translate3d(" +
          (b.x - b.r).toFixed(1) +
          "px," +
          (b.y - b.r).toFixed(1) +
          "px,0) scale(" +
          (1 + b.sq * 0.28).toFixed(3) +
          "," +
          (1 - b.sq * 0.28).toFixed(3) +
          ")";
      });
      still = mv < 0.35 ? still + 1 : 0;
      if (still < 50 || dragging) return true;
      balls.forEach(b => {
        b.vx = b.vy = 0;
      });
      ballOn = false;
      return false;
    }
    const ballOf = (el: Element) => balls.find(b => b.el === el) ?? null;
    function kick(b: Ball) {
      b.vy = -(700 + Math.random() * 250);
      b.vx = (Math.random() - 0.5) * 520;
      balls.forEach(c => {
        if (c === b) return;
        const dx = c.x - b.x;
        const dy = c.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < b.r + c.r + 26) {
          c.vx += (dx / d) * 200;
          c.vy += (dy / d) * 200 - 90;
        }
      });
      wake();
    }
    // 터치는 톡 쳐서 튀기고, 마우스는 잡아서 던진다(터치로 끌면 화면 스크롤을 막게 된다)
    let dragMoved = 0;
    let pl = {x: 0, y: 0, t: 0};
    let mouseDown = false;
    on(box, "pointerdown", (e: PointerEvent) => {
      const el = (e.target as Element).closest(".ball");
      const b = el && ballOf(el);
      if (!b || e.pointerType !== "mouse") return;
      dragging = b;
      dragMoved = 0;
      mouseDown = true;
      pl = {x: e.clientX, y: e.clientY, t: performance.now()};
      b.vx = b.vy = 0;
      try {
        box.setPointerCapture(e.pointerId);
      } catch {
        /* 끝난 포인터면 무시 */
      }
      wake();
    });
    on(box, "pointermove", (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - pl.t) / 1000;
      const dx = e.clientX - pl.x;
      const dy = e.clientY - pl.y;
      dragMoved += Math.abs(dx) + Math.abs(dy);
      dragging.x = Math.min(
        W - dragging.r,
        Math.max(dragging.r, dragging.x + dx)
      );
      dragging.y = Math.min(
        H - dragging.r,
        Math.max(dragging.r, dragging.y + dy)
      );
      dragging.vx = dragging.vx * 0.5 + (dx / dt) * 0.5;
      dragging.vy = dragging.vy * 0.5 + (dy / dt) * 0.5;
      pl = {x: e.clientX, y: e.clientY, t: now};
    });
    const endDrag = () => {
      if (!dragging) return;
      const b = dragging;
      dragging = null;
      const cap = 2600;
      b.vx = Math.max(-cap, Math.min(cap, b.vx));
      b.vy = Math.max(-cap, Math.min(cap, b.vy));
      if (dragMoved < 6) {
        kick(b);
        selectBall(b.el);
      } else wake();
    };
    on(box, "pointerup", endDrag);
    on(box, "pointercancel", endDrag);
    on(box, "click", (e: MouseEvent) => {
      if (mouseDown) {
        mouseDown = false;
        return;
      }
      const el = (e.target as Element).closest<HTMLElement>(".ball");
      if (!el) return;
      selectBall(el);
      const b = ballOf(el);
      if (b) kick(b);
    });
    let rz = 0;
    on(window, "resize", () => {
      clearLater(rz);
      rz = later(() => {
        if (!balls.length) return;
        W = box.clientWidth;
        H = box.clientHeight;
        wake();
      }, 120);
    });
    // 통이 화면에 들어올 때 떨어뜨린다
    if (!reduce && "IntersectionObserver" in window) {
      const bio = new IntersectionObserver(
        es => {
          if (es[0].isIntersecting) {
            bio.disconnect();
            setupBalls();
          }
        },
        {threshold: 0.3}
      );
      observers.push(bio);
      bio.observe(box);
    }

    // ── 숫자 타일: 누르면 출처와 기간이 타일 안에서 펼쳐진다 ──
    $$(".ntile").forEach(t => {
      on(t, "click", () => {
        t.setAttribute(
          "aria-expanded",
          t.getAttribute("aria-expanded") === "true" ? "false" : "true"
        );
      });
    });

    // ── 히어로 도형: 떠다니고, 마우스를 조금 따라오고, 스크롤하면 저마다 다른 속도로 밀려 올라간다. 할 일은 없다 ──
    (() => {
      const obs = $$(".ob");
      const cap = $("#obCap");
      if (!obs.length) return;
      let capT = 0;
      obs.forEach(el => {
        let hideT = 0;
        on(el, "click", () => {
          const inner = $(".ob-in", el);
          if (!reduce && inner)
            A(
              inner,
              [{scale: "1"}, {scale: "1.22"}, {scale: ".94"}, {scale: "1"}],
              {duration: SPRING, easing: "ease-out"}
            );
          el.classList.add("show");
          clearLater(hideT);
          hideT = later(() => el.classList.remove("show"), 1500);
          if (cap) {
            cap.textContent = el.getAttribute("aria-label");
            cap.classList.add("on");
            clearLater(capT);
            capT = later(() => cap.classList.remove("on"), 1500);
          }
        });
      });
      if (reduce) return;
      const wide = matchMedia("(min-width:1180px)");
      const fine = matchMedia("(pointer:fine)");
      // x,y 는 마우스·스크롤을 따라오는 몫, kx,ky 는 튕김(스프링) 몫
      const stt = obs.map(el => ({
        el,
        d: parseFloat(getComputedStyle(el).getPropertyValue("--d")) || 12,
        x: 0,
        y: 0,
        kx: 0,
        ky: 0,
        vx: 0,
        vy: 0
      }));
      type O = (typeof stt)[number];
      let mx = 0;
      let my = 0;
      let lastT = 0;
      const frame: Task = t => {
        const dt = lastT ? Math.min(0.034, (t - lastT) / 1000) : 0.016;
        lastT = t;
        let busy = false;
        const sy = wide.matches ? Math.min(window.scrollY, 700) : 0;
        stt.forEach(o => {
          const tx = wide.matches ? mx * o.d : 0;
          const ty = (wide.matches ? my * o.d : 0) - sy * (0.03 + o.d * 0.006);
          o.x += (tx - o.x) * 0.09;
          o.y += (ty - o.y) * 0.09;
          // 스프링: 제자리로 돌아오되 몇 번 넘쳤다 선다
          o.vx += (-o.kx * 160 - o.vx * 9) * dt;
          o.vy += (-o.ky * 160 - o.vy * 9) * dt;
          o.kx += o.vx * dt;
          o.ky += o.vy * dt;
          if (
            Math.abs(tx - o.x) > 0.1 ||
            Math.abs(ty - o.y) > 0.1 ||
            Math.abs(o.kx) > 0.2 ||
            Math.abs(o.ky) > 0.2 ||
            Math.abs(o.vx) > 2 ||
            Math.abs(o.vy) > 2
          )
            busy = true;
          else {
            o.kx = o.ky = o.vx = o.vy = 0;
          }
          o.el.style.setProperty("--px", (o.x + o.kx).toFixed(2) + "px");
          o.el.style.setProperty("--py", (o.y + o.ky).toFixed(2) + "px");
        });
        if (!busy) lastT = 0;
        return busy;
      };
      const kickOb = () => addTask(frame);
      const center = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return [r.left + r.width / 2, r.top + r.height / 2];
      };
      // 한 도형을 누르면 이웃이 거리에 따라 작게 따라 흔들린다
      function ripple(src: O, power: number) {
        const c = center(src.el);
        stt.forEach(o => {
          if (o === src) return;
          const p = center(o.el);
          const dx = p[0] - c[0];
          const dy = p[1] - c[1];
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const f = power * Math.max(0, 1 - d / (wide.matches ? 620 : 260));
          if (f <= 0) return;
          o.vx += (dx / d) * f;
          o.vy += (dy / d) * f;
        });
        kickOb();
      }
      stt.forEach(o => {
        on(o.el, "click", () => {
          o.vy -= 220;
          o.vx += (Math.random() - 0.5) * 120;
          ripple(o, 170);
          kickOb();
        });
        // 마우스가 지나가면 자석처럼 살짝 밀려났다 돌아온다
        on(o.el, "pointerenter", (e: PointerEvent) => {
          if (e.pointerType !== "mouse" || !fine.matches) return;
          const c = center(o.el);
          const dx = c[0] - e.clientX;
          const dy = c[1] - e.clientY;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          o.vx += (dx / d) * 150;
          o.vy += (dy / d) * 150;
          kickOb();
        });
      });
      // 휴대폰: 한 줄 도형을 좌우로 쓸면 전부 출렁인다
      const row = $("#obs");
      if (row) {
        let lx: number | null = null;
        on(
          row,
          "touchstart",
          (e: TouchEvent) => {
            lx = e.touches[0].clientX;
          },
          {passive: true}
        );
        on(
          row,
          "touchmove",
          (e: TouchEvent) => {
            if (lx === null) return;
            const x = e.touches[0].clientX;
            const dx = x - lx;
            lx = x;
            if (Math.abs(dx) < 1) return;
            stt.forEach((o, i) => {
              o.vx += dx * 9 * (1 + i * 0.12);
              o.vy += (i % 2 ? 1 : -1) * Math.abs(dx) * 2;
            });
            kickOb();
          },
          {passive: true}
        );
        on(
          row,
          "touchend",
          () => {
            lx = null;
          },
          {passive: true}
        );
      }
      on(
        window,
        "pointermove",
        (e: PointerEvent) => {
          if (e.pointerType !== "mouse" || !wide.matches || !fine.matches)
            return;
          mx = (e.clientX / window.innerWidth - 0.5) * 2;
          my = (e.clientY / window.innerHeight - 0.5) * 2;
          kickOb();
        },
        {passive: true}
      );
      on(window, "scroll", kickOb, {passive: true});
      on(window, "resize", () => {
        if (!wide.matches) {
          mx = my = 0;
        }
        kickOb();
      });
    })();

    // ── 입장 연출: 알약이 내려오고, 낱말이 차례로 올라오고, 도형이 통통 나타나고, 칩과 버튼이 뒤따른다 ──
    // 클래스는 서버가 이미 붙였다. 여기서는 끝난 뒤 떼기만 한다(떼야 알약 출렁임이 켜진다)
    const heroEl = $(".hero");
    const h1 = $("#headline");
    const endEnter = () => {
      heroEl?.classList.remove("enter");
      h1?.classList.remove("play");
      pillEl.classList.remove("enter");
      $$<SVGElement & HTMLElement>(".ob svg").forEach(x => {
        x.style.animation = "none";
      });
    };
    if (reduce) endEnter();
    else later(endEnter, 1400);

    // ── 기울임: 숫자 타일과 프로젝트 타일이 마우스 쪽으로 기울고, 그림 위 하이라이트가 마우스를 따라간다 ──
    if (!reduce && matchMedia("(pointer:fine)").matches) {
      const bind = (sel: string, max: number, lift: number) => {
        $$(sel).forEach(el => {
          on(el, "pointermove", (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            el.style.setProperty(
              "--ry",
              ((px - 0.5) * 2 * max).toFixed(2) + "deg"
            );
            el.style.setProperty(
              "--rx",
              ((0.5 - py) * 2 * max).toFixed(2) + "deg"
            );
            el.style.setProperty("--hx", (px * 100).toFixed(1) + "%");
            el.style.setProperty("--hy", (py * 100).toFixed(1) + "%");
            el.style.setProperty("--lift", lift + "px");
          });
          const reset = () => {
            el.style.setProperty("--rx", "0deg");
            el.style.setProperty("--ry", "0deg");
            el.style.setProperty("--lift", "0px");
          };
          on(el, "pointerleave", reset);
          on(el, "pointerdown", reset);
        });
      };
      bind(".ntile", 6, -4);
      bind(".ptile", 5, -6);
    }

    // ── 정리: 다시 마운트돼도(StrictMode 포함) 처음 상태에서 시작하게 되돌린다 ──
    return () => {
      alive = false;
      offs.forEach(f => f());
      timers.forEach(id => window.clearTimeout(id));
      rafs.forEach(id => cancelAnimationFrame(id));
      observers.forEach(o => o.disconnect());
      root.getAnimations({subtree: true}).forEach(a => a.cancel());
      $$(".dot, .paper").forEach(n => n.remove());
      rolledText.forEach((txt, el) => {
        el.classList.remove("rolling");
        el.textContent = txt;
        (el as Ex)._rolled = false;
      });
      $$(".rv-wait, .rv-in").forEach(el =>
        el.classList.remove("rv-wait", "rv-in")
      );
      thanks?.classList.remove("wait");
      root.classList.remove("js", "pushed");
      showHidden();
      tray.classList.remove("on");
      tray.removeAttribute("style");
      scrim.classList.remove("open");
      fit.style.width = "";
      box.classList.remove("live");
      $$(".ball", box).forEach(b => b.removeAttribute("style"));
    };
  }, [name, sumMeta, email, pdf]);

  return <span ref={ref} hidden aria-hidden="true" />;
}
