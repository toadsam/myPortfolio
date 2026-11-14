"use client";

// 득근득근 상세의 움직임. 시안 스크립트를 루트 아래 DOM 에만 걸리게 옮겼다.
// 마크업은 서버가 문자열로 그려 두었고, 여기서는 클래스·인라인 스타일만 바꾼다.
// 문서 전역 리스너는 스크롤·끌기·Esc 셋뿐이고 언마운트 때 전부 뗀다.
import {useEffect, useRef, type ReactNode} from "react";
import {useRouter} from "next/navigation";

type El = HTMLElement;

export function MuscleupDetailMotion({
  className,
  children
}: {
  className: string;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /* ── 정리 대상 모음 ── */
    const timers = new Set<number>();
    const rafs = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };
    const cancel = (id?: number) => {
      if (id == null) return;
      window.clearTimeout(id);
      timers.delete(id);
    };
    const raf = (fn: () => void) => {
      const id = window.requestAnimationFrame(() => {
        rafs.delete(id);
        fn();
      });
      rafs.add(id);
    };
    const offs: (() => void)[] = [];
    function on<K extends keyof HTMLElementEventMap>(
      target: HTMLElement | Document | Window,
      type: K | string,
      fn: (e: Event) => void,
      opt?: AddEventListenerOptions
    ) {
      target.addEventListener(type, fn, opt);
      offs.push(() => target.removeEventListener(type, fn, opt));
    }

    const $ = (s: string, el: ParentNode = root) =>
      el.querySelector(s) as El | null;
    const $$ = (s: string, el: ParentNode = root) =>
      Array.from(el.querySelectorAll(s)) as El[];
    const esc = (s: unknown) =>
      String(s == null ? "" : s).replace(
        /[&<>"']/g,
        ch =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
          }[ch] as string)
      );

    const main = $('[data-r="main"]');
    const toc = $('[data-r="toc"]');
    const drawer = $('[data-r="drawer"]');
    const modal = $('[data-r="modal"]');
    const modalbox = $('[data-r="modalbox"]');
    if (!main || !toc || !drawer || !modal || !modalbox) return;

    // 장면별 타이머와 비교 슬라이더 위치. 시안은 요소에 _t, _pos 를 달았다.
    const seqTimers = new WeakMap<El, number[]>();
    const rampTimer = new WeakMap<El, number>();
    const cmpPos = new WeakMap<El, number>();
    let io: IntersectionObserver | null = null;

    /* 휴대폰에서는 코드 창을 접어 둔다 */
    if (window.innerWidth < 760)
      $$("details.codefold", main).forEach(d => d.removeAttribute("open"));

    /* ── 장면 1: 토큰 회전 시퀀스 ── */
    function seqGo(sc: El, n: number) {
      sc.setAttribute("data-step", String(n));
      const btns = $$(".dots button", sc);
      const cap = $(".cap", sc);
      if (cap)
        cap.textContent = n ? btns[n - 1]?.getAttribute("data-cap") || "" : "";
      btns.forEach((b, i) =>
        b.setAttribute("aria-selected", i + 1 === n ? "true" : "false")
      );
      if (n === 4) {
        const g = sc.querySelector(".grace");
        if (g) {
          g.classList.remove("run");
          void g.getBoundingClientRect();
          g.classList.add("run");
        }
      }
    }
    function seqStop(sc: El) {
      (seqTimers.get(sc) || []).forEach(cancel);
      seqTimers.set(sc, []);
    }
    function seqPlay(sc: El) {
      seqStop(sc);
      if (reduce) {
        seqGo(sc, 5);
        return;
      }
      seqGo(sc, 0);
      const ts: number[] = [];
      [1, 2, 3, 4, 5].forEach((n, i) =>
        ts.push(later(() => seqGo(sc, n), 200 + i * 1100))
      );
      seqTimers.set(sc, ts);
    }

    /* ── 장면 2: perf 막대(전 → 후로 줄어듦) ── */
    function perfPlay(sc: El) {
      const bars = $$(".pbar", sc),
        bub = $(".bubble", sc);
      sc.classList.remove("done");
      if (bub) bub.classList.remove("on");
      const to = (b: El) =>
        Math.max(+(b.getAttribute("data-to") || 0), 0.4) + "%";
      if (reduce) {
        bars.forEach(b => {
          b.style.transition = "none";
          b.style.width = to(b);
        });
        sc.classList.add("done");
        if (bub) bub.classList.add("on");
        return;
      }
      bars.forEach(b => {
        b.style.transition = "none";
        b.style.width = b.getAttribute("data-from") + "%";
      });
      void sc.getBoundingClientRect();
      raf(() => {
        bars.forEach(b => {
          b.style.transition = "width 1.4s cubic-bezier(.22,.9,.3,1)";
          b.style.width = to(b);
        });
        later(() => {
          sc.classList.add("done");
          if (bub) bub.classList.add("on");
        }, 1450);
      });
    }

    /* ── 장면 3: 동시접속 램프 그래프 ── */
    function rampPlay(sc: El) {
      const ln = sc.querySelector(".line") as SVGPathElement | null;
      if (!ln) return;
      const len = ln.getTotalLength();
      sc.classList.remove("hit", "done");
      if (reduce) {
        ln.style.strokeDasharray = "none";
        sc.classList.add("hit", "done");
        return;
      }
      ln.style.transition = "none";
      ln.style.strokeDasharray = String(len);
      ln.style.strokeDashoffset = String(len);
      void sc.getBoundingClientRect();
      raf(() => {
        ln.style.transition = "stroke-dashoffset 1.8s cubic-bezier(.3,.7,.3,1)";
        ln.style.strokeDashoffset = "0";
      });
      // 100명 점 = 선 길이의 1/3 지점쯤. 길이 비율로 시점 계산
      const pts = Array.from(sc.querySelectorAll(".pt")) as SVGElement[];
      const hitPt = sc.querySelector(".pt.hit");
      let frac = 0;
      try {
        const hx = +(hitPt?.getAttribute("cx") || 0);
        let pL = 0;
        for (let i = 0; i <= len; i += 4) {
          const q = ln.getPointAtLength(i);
          if (q.x >= hx) {
            pL = i;
            break;
          }
        }
        frac = pL / len;
      } catch {
        frac = 0.33;
      }
      pts.forEach((pt, i) => {
        pt.style.transitionDelay = i * 0.3 + "s";
      });
      cancel(rampTimer.get(sc));
      rampTimer.set(
        sc,
        later(() => sc.classList.add("hit"), Math.max(300, frac * 1800))
      );
      later(() => sc.classList.add("done"), 1900);
    }

    /* ── 장면 4: 1.0 → 2.0 비교 슬라이더 ── */
    function cmpSet(sc: El, pos: number, anim: boolean) {
      pos = Math.max(0, Math.min(100, pos));
      cmpPos.set(sc, pos);
      const over = $(".cmp-over", sc),
        hd = $(".cmp-handle", sc);
      if (!over || !hd) return;
      over.style.transition =
        anim && !reduce ? "clip-path .7s var(--ease-pop)" : "none";
      hd.style.transition =
        anim && !reduce ? "left .7s var(--ease-pop)" : "none";
      over.style.clipPath = "inset(0 0 0 " + pos + "%)";
      hd.style.left = pos + "%";
      hd.setAttribute("aria-valuenow", String(Math.round(pos)));
      $$(".cmp-tabs button", sc).forEach(b =>
        b.setAttribute(
          "aria-selected",
          +(b.getAttribute("data-pos") || 0) === Math.round(pos)
            ? "true"
            : "false"
        )
      );
    }
    function cmpPlay(sc: El) {
      cmpSet(sc, 0, false);
      later(() => cmpSet(sc, 50, true), reduce ? 0 : 150);
    }

    function playScene(sc: El) {
      const k = sc.getAttribute("data-scene");
      if (k === "seq") seqPlay(sc);
      else if (k === "perf") perfPlay(sc);
      else if (k === "ramp") rampPlay(sc);
      else if (k === "cmp") cmpPlay(sc);
      sc.classList.add("played");
    }

    /* ── 접힌 구역 ── */
    function setOpen(secEl: El, open: boolean) {
      secEl.classList.toggle("open", open);
      const b = $(".fold-h", secEl);
      if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
      const a = toc!.querySelector('a[data-to="' + secEl.id + '"]');
      if (a) {
        const sm = a.querySelector("small");
        if (sm && sm.lastChild)
          sm.lastChild.textContent = open ? "펼침" : "접힘";
        a.parentElement?.classList.toggle("folded", !open);
      }
      if (open)
        $$(".rv", secEl).forEach(el => {
          if (!el.classList.contains("in") && io) io.observe(el);
        });
    }

    /* ── 갤러리: 누른 자리에서 커지는 전환 ── */
    let flipSrc: El | null = null;
    function flipOpen(fig: El) {
      const im = fig.querySelector("img");
      if (!im) return;
      flipSrc = fig;
      const cap = fig.querySelector("figcaption");
      const capB = cap?.querySelector("b");
      modalbox!.innerHTML =
        '<img src="' +
        esc(im.getAttribute("src")) +
        '" alt="' +
        esc(im.alt) +
        '" width="' +
        (im.getAttribute("width") || 1200) +
        '" height="' +
        (im.getAttribute("height") || 675) +
        '" style="width:100%;height:auto;display:block;border-radius:12px"><p style="font-size:14px;color:var(--sub);margin-top:10px"><b>' +
        (capB ? esc(capB.textContent) : "") +
        "</b> " +
        esc(fig.getAttribute("data-cap") || "") +
        "</p>";
      modal!.classList.add("open");
      if (reduce || !modalbox!.animate) return;
      const from = im.getBoundingClientRect(),
        to = modalbox!.getBoundingClientRect();
      const sx = from.width / to.width,
        sy = from.height / to.height;
      modalbox!.animate(
        [
          {
            transform:
              "translate(" +
              (from.left - to.left) +
              "px," +
              (from.top - to.top) +
              "px) scale(" +
              sx +
              "," +
              sy +
              ")",
            opacity: 0.6
          },
          {transform: "none", opacity: 1}
        ],
        {duration: 560, easing: "cubic-bezier(.34,1.3,.5,1)"}
      );
      modalbox!.style.transformOrigin = "0 0";
    }
    function closeModal() {
      if (!modal!.classList.contains("open")) return;
      const box = modalbox!;
      if (flipSrc && !reduce && box.animate) {
        const im = flipSrc.querySelector("img");
        if (im) {
          const from = im.getBoundingClientRect(),
            to = box.getBoundingClientRect();
          box.style.transformOrigin = "0 0";
          const an = box.animate(
            [
              {transform: "none", opacity: 1},
              {
                transform:
                  "translate(" +
                  (from.left - to.left) +
                  "px," +
                  (from.top - to.top) +
                  "px) scale(" +
                  from.width / to.width +
                  "," +
                  from.height / to.height +
                  ")",
                opacity: 0
              }
            ],
            {duration: 320, easing: "cubic-bezier(.3,.8,.2,1)"}
          );
          an.onfinish = () => modal!.classList.remove("open");
          flipSrc = null;
          return;
        }
      }
      flipSrc = null;
      modal!.classList.remove("open");
    }

    /* ── 복사 버튼의 불꽃. body 가 아니라 루트에 붙여야 스코프된 색이 닿는다 ── */
    const bursts = new Set<El>();
    function burst(el: El) {
      if (reduce) return;
      const rc = el.getBoundingClientRect(),
        cx = rc.left + rc.width / 2,
        cy = rc.top + rc.height / 2;
      for (let i = 0; i < 14; i++) {
        const b = document.createElement("i");
        b.className = "burst";
        b.style.left = cx + "px";
        b.style.top = cy + "px";
        root!.appendChild(b);
        bursts.add(b);
        const a = Math.random() * Math.PI * 2,
          dd = 60 + Math.random() * 70;
        b.animate(
          [
            {transform: "translate(-50%,-50%) scale(1)", opacity: 1},
            {
              transform:
                "translate(calc(-50% + " +
                Math.cos(a) * dd +
                "px),calc(-50% + " +
                Math.sin(a) * dd +
                "px)) scale(.3)",
              opacity: 0
            }
          ],
          {
            duration: 700 + Math.random() * 300,
            easing: "cubic-bezier(.2,.8,.2,1)"
          }
        ).onfinish = () => {
          b.remove();
          bursts.delete(b);
        };
      }
    }

    /* ── 코드 커서 ── */
    function codeCursor(code: El) {
      const hi = $(".ln.hi", code),
        cur = $(".cur", code),
        pre = $("pre", code);
      if (!hi || !cur || !pre) return;
      cur.style.top = "0px";
      cur.style.height = hi.offsetHeight + "px";
      cur.classList.add("on");
      later(
        () => {
          cur.style.top = hi.offsetTop + pre.offsetTop + "px";
        },
        reduce ? 0 : $$(".ln", code).length * 30 + 200
      );
    }

    function scrollToSection(id: string) {
      const el = document.getElementById(id);
      if (!el || !root!.contains(el)) return;
      if (el.classList.contains("fold") && !el.classList.contains("open"))
        setOpen(el, true);
      const y = el.getBoundingClientRect().top + window.scrollY - 84;
      window.scrollTo({top: y, behavior: reduce ? "auto" : "smooth"});
    }

    /* ── 클릭: 시안은 document 에 걸었고 여기서는 루트에 건다 ── */
    on(root, "click", ev => {
      const e = ev as MouseEvent;
      const target = e.target as Element | null;
      if (!target || !target.closest) return;
      const xb = target.closest(".xf-btn") as El | null;
      if (xb) {
        const open = xb.getAttribute("aria-expanded") !== "true";
        xb.setAttribute("aria-expanded", open ? "true" : "false");
        const body = document.getElementById(
          xb.getAttribute("aria-controls") || ""
        );
        if (body) body.classList.toggle("open", open);
        const lbl = $(".lbl", xb);
        if (lbl) lbl.textContent = open ? "접기" : xb.getAttribute("data-l");
        return;
      }
      // 이야기 배치의 표: 전체 · 피드백 · 막혔던 곳 고르기
      const lf = target.closest("[data-st-filter]") as El | null;
      if (lf) {
        const lg = lf.closest(".st-lg") as El | null;
        if (lg) {
          lg.setAttribute(
            "data-show",
            lf.getAttribute("data-st-filter") || "all"
          );
          $$("[data-st-filter]", lg).forEach(b =>
            b.setAttribute("aria-pressed", b === lf ? "true" : "false")
          );
        }
        return;
      }
      const fh = target.closest(".fold-h");
      if (fh) {
        const se = fh.closest(".fold") as El | null;
        if (se) setOpen(se, !se.classList.contains("open"));
        return;
      }
      const mb = target.closest("#moreBtn") as El | null;
      if (mb) {
        const open = mb.getAttribute("aria-expanded") !== "true";
        mb.setAttribute("aria-expanded", open ? "true" : "false");
        const more = $("#moreCh");
        if (more) more.classList.toggle("open", open);
        const lbl = $(".lbl", mb);
        if (lbl) lbl.textContent = open ? "접기" : mb.getAttribute("data-l");
        if (open && more) $$(".rv", more).forEach(el => io?.observe(el));
        return;
      }
      const tl = target.closest(".tile[aria-expanded]");
      if (tl) {
        tl.setAttribute(
          "aria-expanded",
          tl.getAttribute("aria-expanded") === "true" ? "false" : "true"
        );
        return;
      }
      const sd = target.closest(".seq .dots button");
      if (sd) {
        const sc0 = sd.closest(".scene") as El | null;
        if (sc0) {
          seqStop(sc0);
          seqGo(sc0, +(sd.getAttribute("data-step") || 0));
        }
        return;
      }
      const ct = target.closest(".cmp-tabs button");
      if (ct) {
        const sc1 = ct.closest(".scene") as El | null;
        if (sc1) cmpSet(sc1, +(ct.getAttribute("data-pos") || 0), true);
        return;
      }
      if (target.closest(".cmp-handle") || target.closest(".cmp-box")) return;
      const sc = target.closest(".scene") as El | null;
      if (sc && !target.closest("a,summary,details")) {
        playScene(sc);
        return;
      }
      if (target.closest('[data-r="tocbtn"]')) {
        drawer!.classList.add("open");
        return;
      }
      if (target.closest("[data-close]")) {
        closeModal();
        drawer!.classList.remove("open");
      }
      const a = target.closest("a[data-to]");
      if (a) {
        e.preventDefault();
        drawer!.classList.remove("open");
        scrollToSection(a.getAttribute("data-to") || "");
      }
      // 본문 안 앱 주소(/resume)는 전체 새로고침 없이 옮긴다. 머리의 링크는 next/link 가 맡는다
      const inner = target.closest(
        'a[href^="/"]:not([target])'
      ) as HTMLAnchorElement | null;
      if (
        inner &&
        main!.contains(inner) &&
        !e.defaultPrevented &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        e.button === 0
      ) {
        e.preventDefault();
        routerRef.current.push(inner.getAttribute("href") || "/");
        return;
      }
      const gf = target.closest(".gal figure") as El | null;
      if (gf) {
        flipOpen(gf);
        return;
      }
      const dg = target.closest(".diag");
      if (dg) {
        const tpl = root!.querySelector(
          'template[data-mu4-diag="' + dg.getAttribute("data-diag") + '"]'
        );
        if (tpl) {
          modalbox!.innerHTML = tpl.innerHTML;
          modal!.classList.add("open");
        }
      }
      const cp = target.closest("[data-copy]") as El | null;
      if (cp) {
        const txt = cp.getAttribute("data-copy") || "",
          lab = $(".lbl", cp);
        const done = (ok: boolean) => {
          if (lab) lab.textContent = ok ? "복사했습니다" : txt;
          if (ok) burst(cp);
          later(() => {
            if (lab) lab.textContent = txt + " 복사";
          }, 2200);
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
    });

    /* ── 키보드 ── */
    on(document, "keydown", ev => {
      const e = ev as KeyboardEvent;
      if (e.key === "Escape") {
        closeModal();
        drawer!.classList.remove("open");
      }
      const t = e.target as El | null;
      if (!t || !root!.contains(t)) return;
      if (
        t.closest &&
        (t.closest(".diag") || t.closest(".gal figure")) &&
        (e.key === "Enter" || e.key === " ")
      ) {
        e.preventDefault();
        t.click();
        return;
      }
      if (t.classList && t.classList.contains("cmp-handle")) {
        const sc = t.closest(".scene") as El | null;
        if (!sc) return;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          cmpSet(sc, (cmpPos.get(sc) ?? 50) - 5, false);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          cmpSet(sc, (cmpPos.get(sc) ?? 50) + 5, false);
        }
        return;
      }
      if (
        t.classList &&
        t.classList.contains("scene") &&
        (e.key === "Enter" || e.key === " ")
      ) {
        e.preventDefault();
        playScene(t);
      }
    });

    /* ── 비교 슬라이더 끌기 ── */
    let drag: El | null = null;
    const move = (ev: Event) => {
      if (!drag) return;
      const e = ev as PointerEvent;
      const box = $(".cmp-box", drag);
      if (!box) return;
      const rc = box.getBoundingClientRect();
      cmpSet(drag, ((e.clientX - rc.left) / rc.width) * 100, false);
    };
    on(root, "pointerdown", ev => {
      const e = ev as PointerEvent;
      const box = (e.target as Element | null)?.closest?.(
        ".cmp-box"
      ) as El | null;
      if (!box) return;
      drag = box.closest(".scene") as El | null;
      try {
        box.setPointerCapture(e.pointerId);
      } catch {
        /* 끝난 포인터면 무시 */
      }
      move(e);
    });
    on(document, "pointermove", move);
    on(document, "pointerup", () => {
      drag = null;
    });
    on(document, "pointercancel", () => {
      drag = null;
    });

    /* ── 코드 접기를 펼치면 줄 등장 + 커서 ── */
    on(
      root,
      "toggle",
      ev => {
        const d = ev.target as HTMLDetailsElement;
        if (!d.classList || !d.classList.contains("codefold") || !d.open)
          return;
        const code = $(".code", d);
        if (code && !code.classList.contains("in")) {
          code.classList.add("in");
          codeCursor(code);
        }
      },
      {capture: true}
    );

    /* ── 등장·숫자·장면·코드 커서 ── */
    io = new IntersectionObserver(
      es => {
        es.forEach(e => {
          if (!e.isIntersecting) return;
          io!.unobserve(e.target);
          const el = e.target as El;
          el.classList.add("in");
          $$(".roll", el).forEach(rl => {
            const d = +(rl.getAttribute("data-d") || 0);
            const i = rl.firstElementChild as El | null;
            if (!i) return;
            i.style.transform = "translateY(0)";
            raf(() => {
              i.style.transform = "translateY(-" + d * 10 + "%)";
            });
          });
          $$(".mini.bars b", el).forEach(b =>
            raf(() => {
              b.style.width = b.getAttribute("data-w") + "%";
            })
          );
          if (
            el.classList.contains("scene") &&
            !el.classList.contains("played")
          )
            playScene(el);
          $$(".scene", el).forEach(sc => {
            if (!sc.classList.contains("played")) playScene(sc);
          });
          if (el.classList.contains("code")) codeCursor(el);
          $$(".code", el).forEach(codeCursor);
          if (el.classList.contains("diag"))
            (
              Array.from(el.querySelectorAll(".dg-edge")) as SVGPathElement[]
            ).forEach(pth => {
              const Lg = pth.getTotalLength();
              pth.style.setProperty("--len", String(Lg));
              pth.style.strokeDasharray = pth.classList.contains("dashed")
                ? "7 6"
                : String(Lg);
            });
        });
      },
      {threshold: 0.15}
    );
    $$(".rv, .code, .diag, .scene", main).forEach(el => {
      const f = el.closest(".fold");
      if (f && !f.classList.contains("open") && !el.classList.contains("rv"))
        return;
      if (reduce) {
        el.classList.add("in");
        $$(".roll", el).forEach(rl => {
          const i = rl.firstElementChild as El | null;
          if (i)
            i.style.transform =
              "translateY(-" + +(rl.getAttribute("data-d") || 0) * 10 + "%)";
        });
        $$(".mini.bars b", el).forEach(b => {
          b.style.width = b.getAttribute("data-w") + "%";
        });
        if (el.classList.contains("scene")) playScene(el);
        $$(".scene", el).forEach(playScene);
        return;
      }
      io!.observe(el);
    });
    $$(".roll b", main).forEach(b => {
      b.style.height = "1.12em";
      b.style.lineHeight = "1.12";
    });

    /* ── 목차: 현재 구역 ── */
    const secs = $$("section.sec", main);
    const links = $$("a[data-to]", toc);
    const ind = $('[data-r="tocind"]', toc);
    function setCur(id: string) {
      links.forEach(a => {
        const cur = a.getAttribute("data-to") === id;
        a.setAttribute("aria-current", cur ? "true" : "false");
        if (cur && ind) {
          ind.classList.add("on");
          ind.style.transform = "translateY(" + a.offsetTop + "px)";
          ind.style.height = a.offsetHeight + "px";
        }
      });
      $$("a", drawer!).forEach(a =>
        a.setAttribute(
          "aria-current",
          a.getAttribute("data-to") === id ? "true" : "false"
        )
      );
    }
    const tocIO = new IntersectionObserver(
      es => {
        es.forEach(e => {
          if (e.isIntersecting) setCur((e.target as El).id);
        });
      },
      {rootMargin: "-20% 0px -65% 0px"}
    );
    secs.forEach(s => tocIO.observe(s));
    if (secs[0]) setCur(secs[0].id);

    /* ── 카드 기울이기 ── */
    on(root, "pointermove", ev => {
      const e = ev as PointerEvent;
      const t = (e.target as Element | null)?.closest?.(".tilt") as El | null;
      if (!t || reduce || e.pointerType === "touch") return;
      const rc = t.getBoundingClientRect(),
        x = (e.clientX - rc.left) / rc.width - 0.5,
        y = (e.clientY - rc.top) / rc.height - 0.5;
      t.style.transform =
        "perspective(800px) rotateX(" +
        (-y * 3).toFixed(2) +
        "deg) rotateY(" +
        (x * 3).toFixed(2) +
        "deg) translateY(-2px)";
    });
    on(root, "pointerout", ev => {
      const e = ev as PointerEvent;
      const t = (e.target as Element | null)?.closest?.(".tilt") as El | null;
      if (t && !t.contains(e.relatedTarget as Node | null))
        t.style.transform = "";
    });

    /* ── 스크롤: 진행 막대·목차 채움·첫 화면 겹친 그림 ── */
    const prog = $('[data-r="prog"]'),
      fill = $('[data-r="tocfill"]', toc),
      tocOl = $("ol", toc),
      back = $(".frame.back", main),
      front = $(".frame.front", main);
    const onScroll = () => {
      const hh = document.documentElement.scrollHeight - window.innerHeight,
        pr = hh > 0 ? window.scrollY / hh : 0;
      if (prog) prog.style.transform = "scaleX(" + pr + ")";
      if (fill && tocOl) fill.style.height = pr * tocOl.offsetHeight + "px";
      if (back && front && !reduce) {
        const k = Math.min(1, Math.max(0, window.scrollY / 300));
        back.style.transform =
          "translateY(" +
          (14 + k * 26) +
          "px) scale(" +
          (0.96 - k * 0.04) +
          ")";
        back.style.opacity = (0.55 - k * 0.35).toFixed(2);
        front.style.transform = "translateY(" + -k * 8 + "px)";
      }
    };
    on(window, "scroll", onScroll, {passive: true});
    onScroll();

    /* 주소 해시로 들어오면 그 구역(접힌 것이면 펼쳐서)으로 */
    const h0 = (window.location.hash || "").replace(/^#/, "");
    if (h0) {
      const el0 = document.getElementById(h0);
      if (el0 && root.contains(el0)) {
        if (el0.classList.contains("fold")) setOpen(el0, true);
        later(() => el0.scrollIntoView({block: "start"}), 60);
      }
    }

    return () => {
      offs.forEach(off => off());
      timers.forEach(id => window.clearTimeout(id));
      rafs.forEach(id => window.cancelAnimationFrame(id));
      io?.disconnect();
      tocIO.disconnect();
      bursts.forEach(b => b.remove());
    };
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
