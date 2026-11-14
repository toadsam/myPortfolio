"use client";

/**
 * 프로젝트 상세 v4 의 움직임 담당. 글은 서버가 다 그려 두고, 여기서는 DOM 에 손잡이만 단다.
 * 접기(문장 · 구역 · "더 보기"), 등장 모션, 숫자 굴리기, 목차 추적, 크게 보기, 이메일 복사.
 * 자바스크립트가 없어도 모든 글은 HTML 에 있다(접힌 글은 펼치지 못할 뿐 빠지지 않는다).
 */

import {useEffect} from "react";

export function ProjectDetailV4Motion({rootId}: {rootId: string}) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const $ = <T extends Element = HTMLElement>(
      s: string,
      el: ParentNode = root
    ) => el.querySelector(s) as T | null;
    const $$ = <T extends Element = HTMLElement>(
      s: string,
      el: ParentNode = root
    ) => Array.from(el.querySelectorAll(s)) as T[];
    const cleanups: (() => void)[] = [];
    const timers: number[] = [];

    root.classList.add("p4-js");

    // 휴대폰에서는 코드 창을 접어 둔다
    if (innerWidth < 760)
      $$<HTMLDetailsElement>("details.p4-codefold[open]").forEach(
        d => (d.open = false)
      );

    // ── 숫자 굴리기: 처음엔 0 에 두고, 보이면 제자리로 ──
    const rolls = $$(".p4-roll");
    if (!reduce)
      rolls.forEach(
        rl =>
          ((rl.firstElementChild as HTMLElement).style.transform =
            "translateY(0)")
      );
    const playRolls = (el: Element) =>
      $$(".p4-roll", el).forEach(rl => {
        const d = Number(rl.getAttribute("data-d"));
        const i = rl.firstElementChild as HTMLElement;
        requestAnimationFrame(
          () => (i.style.transform = `translateY(-${d * 10}%)`)
        );
      });

    // ── 등장 ──
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          e.target.classList.add("p4-in");
          playRolls(e.target);
          if (e.target.classList.contains("p4-frames-scene"))
            framesAuto(e.target as HTMLElement);
        });
      },
      {threshold: 0.15}
    );
    const targets = $$(".p4-rv, .p4-code, .p4-diag, .p4-perf");
    if (reduce) targets.forEach(el => el.classList.add("p4-in"));
    else targets.forEach(el => io.observe(el));
    cleanups.push(() => io.disconnect());

    // ── 구역 접기 ──
    const tocLinks = $$<HTMLAnchorElement>(".p4-toc a[data-to]");
    const setOpen = (sec: HTMLElement, on: boolean) => {
      sec.classList.toggle("p4-open", on);
      $(".p4-fold-h", sec)?.setAttribute(
        "aria-expanded",
        on ? "true" : "false"
      );
      const a = tocLinks.find(x => x.getAttribute("data-to") === sec.id);
      if (a) {
        const sm = $("small", a);
        if (sm && sm.lastChild) sm.lastChild.textContent = on ? "펼침" : "접힘";
        a.parentElement?.classList.toggle("p4-folded", !on);
      }
    };

    // ── 크게 보기 ──
    const modal = $(".p4-modal");
    const mbox = $(".p4-mbox");
    let lastFocus: HTMLElement | null = null;
    const openModal = (content: Node[], from: HTMLElement) => {
      if (!modal || !mbox) return;
      mbox.replaceChildren(...content);
      lastFocus = from;
      modal.classList.add("p4-open");
      ($(".p4-close", modal) as HTMLElement | null)?.focus();
    };
    const closeModal = () => {
      if (!modal?.classList.contains("p4-open")) return;
      modal.classList.remove("p4-open");
      lastFocus?.focus();
    };
    const capNode = (title: string, cap: string) => {
      const p = document.createElement("p");
      p.className = "p4-mcap";
      if (title) {
        const b = document.createElement("b");
        b.textContent = title;
        p.append(b, " ");
      }
      p.append(cap);
      return p;
    };

    // ── 목차 서랍 ──
    const drawer = $(".p4-drawer");

    const burst = (el: HTMLElement) => {
      if (reduce) return;
      const rc = el.getBoundingClientRect();
      const cx = rc.left + rc.width / 2;
      const cy = rc.top + rc.height / 2;
      for (let i = 0; i < 14; i++) {
        const b = document.createElement("i");
        b.className = "p4-burst";
        b.style.left = `${cx}px`;
        b.style.top = `${cy}px`;
        root.appendChild(b);
        const ang = Math.random() * Math.PI * 2;
        const dd = 60 + Math.random() * 70;
        const an = b.animate(
          [
            {transform: "translate(-50%,-50%) scale(1)", opacity: 1},
            {
              transform: `translate(calc(-50% + ${
                Math.cos(ang) * dd
              }px),calc(-50% + ${Math.sin(ang) * dd}px)) scale(.3)`,
              opacity: 0
            }
          ],
          {
            duration: 700 + Math.random() * 300,
            easing: "cubic-bezier(.2,.8,.2,1)"
          }
        );
        an.onfinish = () => b.remove();
      }
    };

    const scrollToSection = (sid: string) => {
      const el = document.getElementById(sid);
      if (!el) return;
      if (el.classList.contains("p4-fold") && !el.classList.contains("p4-open"))
        setOpen(el, true);
      const y = el.getBoundingClientRect().top + scrollY - 84;
      window.scrollTo({top: y, behavior: reduce ? "auto" : "smooth"});
    };

    // 장면 다시 보기: .p4-in 을 떼었다 붙이면 CSS 애니메이션이 처음부터 돈다.
    const replay = (sc: HTMLElement) => {
      if (reduce) return;
      sc.classList.remove("p4-in");
      void sc.offsetWidth;
      sc.classList.add("p4-in");
      if (sc.classList.contains("p4-frames-scene")) framesAuto(sc, true);
      if (sc.classList.contains("p4-line-scene")) lineLengths(sc);
    };

    // ── 꺾은선: 길이를 재서 그려 들어오게 ──
    const lineLengths = (sc: HTMLElement) =>
      $$<SVGPolylineElement>("polyline.p4-lpath", sc).forEach(pl => {
        const len = pl.getTotalLength();
        pl.style.setProperty("--len", `${len}`);
      });
    $$(".p4-line-scene").forEach(lineLengths);

    // ── 프레임 넘겨 보기: 손잡이·라벨·자동 재생 ──
    const framesSet = (sc: HTMLElement, i: number) => {
      $$("[data-frame]", sc).forEach(img =>
        img.classList.toggle(
          "p4-on",
          Number(img.getAttribute("data-frame")) === i
        )
      );
      $$("[data-frame-label]", sc).forEach(li =>
        li.classList.toggle(
          "p4-on",
          Number(li.getAttribute("data-frame-label")) === i
        )
      );
      const at = $("[data-frame-at]", sc);
      const lab = $(`[data-frame-label="${i}"] b`, sc);
      if (at) at.textContent = lab?.textContent ?? "";
      const range = $<HTMLInputElement>("[data-frame-range]", sc);
      if (range && Number(range.value) !== i) range.value = String(i);
    };
    const frameTimers = new Map<HTMLElement, number>();
    const framesAuto = (sc: HTMLElement, restart = false) => {
      if (reduce) return;
      const n = Number($(".p4-frames", sc)?.getAttribute("data-frames") || 0);
      if (n < 2) return;
      const old = frameTimers.get(sc);
      if (old) clearInterval(old);
      if (!restart && sc.hasAttribute("data-frames-touched")) return;
      let i = 0;
      framesSet(sc, 0);
      const id = window.setInterval(() => {
        i = (i + 1) % n;
        framesSet(sc, i);
        if (i === n - 1) {
          clearInterval(id);
          frameTimers.delete(sc);
        }
      }, 1500);
      frameTimers.set(sc, id);
    };
    const onInput = (e: Event) => {
      const t = e.target as HTMLElement;
      const range = t.closest<HTMLInputElement>("[data-frame-range]");
      if (range && root.contains(range)) {
        const sc = range.closest<HTMLElement>(".p4-frames-scene");
        if (!sc) return;
        sc.setAttribute("data-frames-touched", "");
        const old = frameTimers.get(sc);
        if (old) clearInterval(old);
        framesSet(sc, Number(range.value));
      }
    };
    root.addEventListener("input", onInput);
    cleanups.push(() => {
      root.removeEventListener("input", onInput);
      frameTimers.forEach(id => clearInterval(id));
    });

    // ── 전/후 슬라이더 ──
    const cmpSet = (box: HTMLElement, pos: number, animate = false) => {
      const p = Math.max(0, Math.min(100, pos));
      const over = $(".p4-cmp-over", box);
      const handle = $(".p4-cmp-handle", box);
      if (!over || !handle) return;
      if (animate && !reduce) {
        over.style.transition = "clip-path .6s cubic-bezier(.34,1.56,.64,1)";
        handle.style.transition = "left .6s cubic-bezier(.34,1.56,.64,1)";
      } else {
        over.style.transition = "none";
        handle.style.transition = "none";
      }
      over.style.clipPath = `inset(0 0 0 ${p}%)`;
      handle.style.left = `${p}%`;
      handle.setAttribute("aria-valuenow", String(Math.round(p)));
      const sc = box.closest<HTMLElement>("[data-cmp]");
      sc &&
        $$("[data-pos]", sc).forEach(b =>
          b.setAttribute(
            "aria-selected",
            Number(b.getAttribute("data-pos")) === Math.round(p)
              ? "true"
              : "false"
          )
        );
    };
    $$<HTMLElement>("[data-cmp] .p4-cmp-box").forEach(box => cmpSet(box, 50));
    let dragBox: HTMLElement | null = null;
    const cmpFromPointer = (box: HTMLElement, x: number) => {
      const rc = box.getBoundingClientRect();
      cmpSet(box, ((x - rc.left) / rc.width) * 100);
    };
    const onPD = (e: PointerEvent) => {
      const h = (e.target as HTMLElement).closest<HTMLElement>(
        ".p4-cmp-handle, .p4-cmp-box"
      );
      if (!h || !root.contains(h)) return;
      const box = h.closest<HTMLElement>(".p4-cmp-box");
      if (!box) return;
      dragBox = box;
      cmpFromPointer(box, e.clientX);
      e.preventDefault();
    };
    const onPM = (e: PointerEvent) =>
      dragBox && cmpFromPointer(dragBox, e.clientX);
    const onPU = () => (dragBox = null);
    root.addEventListener("pointerdown", onPD);
    window.addEventListener("pointermove", onPM);
    window.addEventListener("pointerup", onPU);
    cleanups.push(() => {
      root.removeEventListener("pointerdown", onPD);
      window.removeEventListener("pointermove", onPM);
      window.removeEventListener("pointerup", onPU);
    });

    // ── 3×3 퍼즐 ──
    const puzzles = $$<HTMLElement>("[data-puzzle]");
    const puzzleTimers: number[] = [];
    puzzles.forEach(pz => {
      let patterns: number[][] = [];
      try {
        patterns = JSON.parse(pz.getAttribute("data-patterns") || "[]");
      } catch {
        patterns = [];
      }
      if (!patterns.length) return;
      const interval = Number(pz.getAttribute("data-interval") || 8) * 1000;
      const sign = $$("[data-pz-sign] i", pz);
      const cells = $$<HTMLElement>("[data-pz-cell]", pz);
      const timerBar = $("[data-pz-timer]", pz);
      const result = $("[data-pz-result]", pz);
      // 줄 버튼 판(실제 게임 규칙): 칸 값이 0..states-1 이고 줄 버튼이 세 칸을 한 단계씩 넘긴다
      const states = Number(pz.getAttribute("data-states") || 0);
      const start = Number(pz.getAttribute("data-start") || 0);
      const solvedMsg = pz.getAttribute("data-solved") || "";
      const byLines = states > 0;
      let cur = 0;
      let solved = 0;
      const valOf = (c: HTMLElement) =>
        Number((c.className.match(/p4-b([0-9])/) || [])[1] || 0);
      const setVal = (c: HTMLElement, v: number) => {
        c.className = c.className.replace(/p4-b[0-9]/, `p4-b${v}`);
      };
      const board = () => cells.map(valOf);
      const showSign = (k: number) => {
        cur = k;
        const pat = patterns[k];
        sign.forEach((el, i) => {
          el.className = `p4-b${pat[i] ?? 0}`;
        });
        if (timerBar && !reduce) {
          timerBar.style.transition = "none";
          timerBar.style.transform = "scaleX(1)";
          void timerBar.offsetWidth;
          timerBar.style.transition = `transform ${interval}ms linear`;
          timerBar.style.transform = "scaleX(0)";
        }
      };
      const check = () => {
        const ok = board().every((v, i) => v === patterns[cur][i]);
        pz.classList.toggle("p4-solved", ok);
        if (ok) {
          solved += 1;
          if (result)
            result.textContent = solvedMsg
              ? `${solvedMsg} · ${solved}번째`
              : `정답 · ${solved}번째 맞춤`;
        } else if (result && (byLines || solved === 0)) result.textContent = "";
      };
      if (byLines) {
        $$<HTMLButtonElement>("[data-pz-line]", pz).forEach(btn => {
          const ids = (btn.getAttribute("data-pz-line") || "")
            .split(",")
            .map(Number);
          btn.addEventListener("click", () => {
            ids.forEach(i => {
              const c = cells[i];
              if (c) setVal(c, (valOf(c) + 1) % states);
            });
            check();
          });
        });
        const reset = $("[data-pz-reset]", pz);
        if (reset)
          reset.addEventListener("click", () => {
            cells.forEach(c => setVal(c, 0));
            check();
          });
      } else {
        cells.forEach(c => {
          c.addEventListener("click", () => {
            setVal(c, valOf(c) ? 0 : 1);
            check();
          });
        });
      }
      showSign(0);
      if (!reduce) {
        const id = window.setInterval(() => {
          let next = Math.floor(Math.random() * patterns.length);
          if (patterns.length > 1 && next === cur)
            next = (next + 1) % patterns.length;
          showSign(next);
          // 실제 게임은 패턴이 바뀔 때 판을 처음 값으로 되돌린다
          if (byLines) cells.forEach(c => setVal(c, start));
          pz.classList.remove("p4-solved");
          check();
        }, interval);
        puzzleTimers.push(id);
      }
    });
    cleanups.push(() => puzzleTimers.forEach(id => clearInterval(id)));

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      // 지표 타일의 출처 펼치기
      // 이야기 배치의 표: 여섯 가지 전부 / 5월에 겪은 것 / 축제 전 점검
      const lf = t.closest<HTMLElement>("[data-lg-filter]");
      if (lf) {
        const lg = lf.closest<HTMLElement>("[data-lg]");
        const v = lf.getAttribute("data-lg-filter") || "all";
        lg?.setAttribute("data-show", v);
        lg?.querySelectorAll("[data-lg-filter]").forEach(b =>
          b.setAttribute("aria-pressed", b === lf ? "true" : "false")
        );
        // 걸러서 새로 보이는 줄은 처음부터 다시 나타나게 한다.
        lg?.querySelectorAll<HTMLElement>("[data-lg-row]").forEach(row => {
          if (!row.offsetParent) return;
          row.classList.remove("p4-in");
          void row.offsetWidth;
          row.classList.add("p4-in");
        });
        return;
      }
      const tile = t.closest<HTMLElement>("[data-tile]");
      if (tile && root.contains(tile)) {
        const on = tile.getAttribute("aria-expanded") !== "true";
        tile.setAttribute("aria-expanded", on ? "true" : "false");
        return;
      }
      // 전/후 탭
      const pos = t.closest<HTMLElement>("[data-cmp] [data-pos]");
      if (pos && root.contains(pos)) {
        const box = pos
          .closest<HTMLElement>("[data-cmp]")
          ?.querySelector<HTMLElement>(".p4-cmp-box");
        if (box) cmpSet(box, Number(pos.getAttribute("data-pos")), true);
        return;
      }
      // 프레임 라벨
      const fl = t.closest<HTMLElement>("[data-frame-label]");
      if (fl && root.contains(fl)) {
        const sc = fl.closest<HTMLElement>(".p4-frames-scene");
        if (sc) {
          sc.setAttribute("data-frames-touched", "");
          const old = frameTimers.get(sc);
          if (old) clearInterval(old);
          framesSet(sc, Number(fl.getAttribute("data-frame-label")));
        }
        return;
      }
      const sc = t.closest<HTMLElement>("[data-scene]");
      if (
        sc &&
        root.contains(sc) &&
        !t.closest("a, button, input, [data-cmp] .p4-cmp-box, [data-puzzle]")
      ) {
        replay(sc);
        return;
      }
      // 문장 접기 · "N건 더 보기"
      const xb = t.closest<HTMLElement>(".p4-xf-btn, .p4-more");
      if (xb && root.contains(xb)) {
        const on = xb.getAttribute("aria-expanded") !== "true";
        xb.setAttribute("aria-expanded", on ? "true" : "false");
        const bodyEl = document.getElementById(
          xb.getAttribute("aria-controls") || ""
        );
        bodyEl?.classList.toggle("p4-open", on);
        const lbl = $(".p4-lbl", xb);
        if (lbl)
          lbl.textContent = on ? "접기" : xb.getAttribute("data-l") || "";
        return;
      }
      const fh = t.closest<HTMLElement>(".p4-fold-h");
      if (fh && root.contains(fh)) {
        const sec = fh.closest<HTMLElement>(".p4-fold");
        if (sec) setOpen(sec, !sec.classList.contains("p4-open"));
        return;
      }
      if (t.closest("[data-drawer-open]")) {
        drawer?.classList.add("p4-open");
        return;
      }
      const a = t.closest<HTMLAnchorElement>("a[data-to]");
      if (a && root.contains(a)) {
        e.preventDefault();
        drawer?.classList.remove("p4-open");
        const sid = a.getAttribute("data-to") || "";
        history.replaceState(null, "", `#${sid}`);
        scrollToSection(sid);
        return;
      }
      if (t.closest("[data-close]")) {
        closeModal();
        drawer?.classList.remove("p4-open");
        return;
      }
      if (modal && t === modal) {
        closeModal();
        return;
      }
      const z = t.closest<HTMLElement>("[data-zoom]");
      if (z && root.contains(z)) {
        const im = $<HTMLImageElement>("img", z);
        if (!im) return;
        const img = document.createElement("img");
        img.src = im.currentSrc || im.src;
        img.alt = im.alt;
        openModal(
          [
            img,
            capNode(
              z.getAttribute("data-title") || "",
              z.getAttribute("data-cap") || ""
            )
          ],
          z
        );
        return;
      }
      const dg = t.closest<HTMLElement>("[data-diag]");
      if (dg && root.contains(dg)) {
        const svg = $("svg", dg);
        if (!svg) return;
        // 화살촉 marker id 가 겹치지 않게 복제본의 id 를 바꾼다
        const html = svg.outerHTML.replace(/(id="|url\(#)([^")]+)/g, "$1$2-m");
        const wrap = document.createElement("div");
        wrap.innerHTML = html;
        const h = document.createElement("h3");
        h.style.cssText = "font-size:18px;font-weight:800;margin-bottom:8px";
        h.textContent = dg.getAttribute("data-title") || "";
        openModal(
          [
            h,
            ...Array.from(wrap.childNodes),
            capNode("", dg.getAttribute("data-cap") || "")
          ],
          dg
        );
        return;
      }
      const cp = t.closest<HTMLElement>("[data-copy]");
      if (cp && root.contains(cp)) {
        const txt = cp.getAttribute("data-copy") || "";
        const lab = $(".p4-lbl", cp);
        const done = (ok: boolean) => {
          if (lab) lab.textContent = ok ? "복사했습니다" : txt;
          if (ok) burst(cp);
          timers.push(
            window.setTimeout(
              () => lab && (lab.textContent = `${txt} 복사`),
              2200
            )
          );
        };
        try {
          navigator.clipboard.writeText(txt).then(
            () => done(true),
            () => done(false)
          );
        } catch {
          done(false);
        }
      }
    };
    root.addEventListener("click", onClick);
    cleanups.push(() => root.removeEventListener("click", onClick));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
        drawer?.classList.remove("p4-open");
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        const sc = (e.target as HTMLElement).closest?.<HTMLElement>(
          "[data-scene]"
        );
        if (sc && root.contains(sc) && e.target === sc) {
          e.preventDefault();
          replay(sc);
        }
      }
      // 전/후 손잡이: 좌우 화살표
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const h = (e.target as HTMLElement).closest?.<HTMLElement>(
          ".p4-cmp-handle"
        );
        if (h && root.contains(h)) {
          const box = h.closest<HTMLElement>(".p4-cmp-box");
          if (!box) return;
          e.preventDefault();
          const now = Number(h.getAttribute("aria-valuenow") || 50);
          cmpSet(box, now + (e.key === "ArrowLeft" ? -5 : 5));
        }
      }
    };
    document.addEventListener("keydown", onKey);
    cleanups.push(() => document.removeEventListener("keydown", onKey));

    // 코드 창을 펼치면 줄이 차례로 들어온다
    const onToggle = (e: Event) => {
      const d = e.target as HTMLDetailsElement;
      if (!d.classList?.contains("p4-codefold") || !d.open) return;
      $(".p4-code", d)?.classList.add("p4-in");
    };
    root.addEventListener("toggle", onToggle, true);
    cleanups.push(() => root.removeEventListener("toggle", onToggle, true));

    // ── 카드 기울기 ──
    const onMove = (e: PointerEvent) => {
      if (reduce || e.pointerType === "touch") return;
      const t = (e.target as HTMLElement).closest?.<HTMLElement>(".p4-tilt");
      if (!t) return;
      const rc = t.getBoundingClientRect();
      const x = (e.clientX - rc.left) / rc.width - 0.5;
      const y = (e.clientY - rc.top) / rc.height - 0.5;
      t.style.transform = `perspective(800px) rotateX(${(-y * 3).toFixed(
        2
      )}deg) rotateY(${(x * 3).toFixed(2)}deg) translateY(-2px)`;
    };
    const onOut = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest?.<HTMLElement>(".p4-tilt");
      if (t && !t.contains(e.relatedTarget as Node)) t.style.transform = "";
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerout", onOut);
    cleanups.push(() => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerout", onOut);
    });

    // ── 목차 추적 · 진행 막대 ──
    const secs = $$<HTMLElement>(".p4-main > section.p4-sec");
    const ind = $(".p4-toc .p4-ind");
    const drawerLinks = $$<HTMLAnchorElement>(".p4-drawer a[data-to]");
    const setCur = (sid: string) => {
      tocLinks.forEach(a => {
        const on = a.getAttribute("data-to") === sid;
        a.setAttribute("aria-current", on ? "true" : "false");
        if (on && ind) {
          ind.classList.add("p4-on");
          ind.style.transform = `translateY(${a.offsetTop}px)`;
          ind.style.height = `${a.offsetHeight}px`;
        }
      });
      drawerLinks.forEach(a =>
        a.setAttribute(
          "aria-current",
          a.getAttribute("data-to") === sid ? "true" : "false"
        )
      );
    };
    const tocIO = new IntersectionObserver(
      es => es.forEach(e => e.isIntersecting && setCur(e.target.id)),
      {rootMargin: "-20% 0px -65% 0px"}
    );
    secs.forEach(s => tocIO.observe(s));
    if (secs[0]) setCur(secs[0].id);
    cleanups.push(() => tocIO.disconnect());

    const prog = $(".p4-prog");
    const fill = $(".p4-toc .p4-track i");
    const tocOl = $(".p4-toc ol");
    const back = $(".p4-frame.p4-back");
    const front = $(".p4-frame.p4-front");
    const onScroll = () => {
      const hh = document.documentElement.scrollHeight - innerHeight;
      const pr = hh > 0 ? scrollY / hh : 0;
      if (prog) prog.style.transform = `scaleX(${pr})`;
      if (fill && tocOl) fill.style.height = `${pr * tocOl.offsetHeight}px`;
      if (back && front && !reduce) {
        const k = Math.min(1, Math.max(0, scrollY / 300));
        back.style.transform = `translateY(${14 + k * 26}px) scale(${
          0.96 - k * 0.04
        })`;
        back.style.opacity = (0.55 - k * 0.35).toFixed(2);
        front.style.transform = `translateY(${-k * 8}px)`;
      }
    };
    addEventListener("scroll", onScroll, {passive: true});
    onScroll();
    cleanups.push(() => removeEventListener("scroll", onScroll));

    // 주소 해시로 들어오면 그 구역(접힌 것이면 펼쳐서)으로
    const h0 = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (h0) {
      const el0 = document.getElementById(h0);
      if (el0 && root.contains(el0)) {
        if (el0.classList.contains("p4-fold")) setOpen(el0, true);
        timers.push(
          window.setTimeout(() => el0.scrollIntoView({block: "start"}), 60)
        );
      }
    }

    return () => {
      cleanups.forEach(f => f());
      timers.forEach(t => clearTimeout(t));
      root.classList.remove("p4-js");
    };
  }, [rootId]);

  return null;
}
