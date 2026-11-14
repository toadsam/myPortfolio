/**
 * 착륙장에서 다른 주소로 "호로록" 넘어가기 (2026-11-12).
 *
 * 브라우저의 View Transition API 로 라우터 이동을 감싼다. Next 의 클라이언트 이동은 같은
 * 문서 안에서 일어나므로 `document.startViewTransition(() => router.push(...))` 가 전후
 * 화면을 찍어 섞어 준다. 누른 물건의 판(`view-transition-name: cl-cover`)은 옛 조각이 화면
 * 전체로 커지며 녹고, 그 밑에서 새 화면이 떠오른다. 모양은 `globals.css` 의
 * `::view-transition-*` 규칙이 정한다. (착륙장 문장을 이력서 h1 과 이어 주는 것도 해 봤는데
 * 두 화면의 줄바꿈이 달라 글자가 겹쳐 보여서 뺐다 — 2026-11-12.)
 *
 * 두 가지를 조심한다.
 *
 * 1. **콜백은 새 화면이 DOM 에 올라온 뒤에 끝나야 한다.** `router.push` 는 바로 돌아오고
 *    실제 교체는 RSC 응답이 온 뒤라, 그냥 넘기면 옛 화면만 두 번 찍힌다. 그래서 착륙장
 *    뿌리(`.cl-root`)가 DOM 에서 사라질 때까지 기다린다(상한 2초 — 첫 방문 dev 에서 컴파일이
 *    느려도 화면이 영영 멈추지 않게).
 * 2. **같은 화면 안에서 끝나는 동작에는 쓰면 안 된다.** 모바일의 "작업 의뢰하기"는 2D
 *    데스크를 겹쳐 열 뿐 주소가 안 바뀐다 — `.cl-root` 가 안 사라져 2초 동안 화면이 굳는다.
 *    그래서 `page.tsx` 는 라우터 이동 셋에만 이 함수를 쓴다.
 *
 * 미지원 브라우저와 모션 줄이기 설정은 그냥 `router.push` 다.
 */

type Router = {push: (href: string) => void};

type DocWithVT = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => {
    ready: Promise<void>;
    finished: Promise<void>;
  };
};

const LANDING_ROOT = ".cl-root";
const MAX_WAIT_MS = 2000;

export function pushWithTransition(router: Router, href: string) {
  const doc = document as DocWithVT;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduce) {
    router.push(href);
    return;
  }

  const transition = doc.startViewTransition(() => {
    router.push(href);
    return new Promise<void>(resolve => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        observer.disconnect();
        window.clearTimeout(timer);
        resolve();
      };
      const observer = new MutationObserver(() => {
        if (!document.querySelector(LANDING_ROOT)) finish();
      });
      observer.observe(document.body, {childList: true, subtree: true});
      const timer = window.setTimeout(finish, MAX_WAIT_MS);
    });
  });

  // 탭이 숨어 있으면 브라우저가 전환을 거부한다("Document hidden") — ready 가 reject 되고,
  // 받아 주지 않으면 콘솔에 Uncaught 로 남는다. 이동 자체는 이미 끝났으니 조용히 넘긴다.
  transition.ready.catch(() => undefined);
  transition.finished.catch(() => undefined);
}
