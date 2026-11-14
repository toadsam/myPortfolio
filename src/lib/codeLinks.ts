// PR · 커밋 · 코드 파일로 가는 링크를 화면에 그릴지 정하는 한 곳 (2026-11-14, 본인 결정).
//
// 지금은 끈다. 눌러서 나오는 PR 중에 본문이 비었거나 제목이 "Jjh rental" 인 것, 한 커밋이 만 줄을 넘는 것이
// 섞여 있어, PR 본문을 정리하기 전에는 걸지 않기로 했다. 저장소 첫 화면(GitHub 버튼) · 서비스 · 시연 영상
// 링크는 그대로 둔다.
//
// 데이터에서 주소를 지우지는 않는다. 다시 걸 때는 SHOW_CODE_LINKS 만 true 로 바꾼다.
// PR 번호 · 날짜 · 줄 수는 글자로 남아 있으므로 근거 자체는 화면에서 사라지지 않는다.
export const SHOW_CODE_LINKS = false;

/** github 의 PR · 커밋 · 파일 · 폴더 · 비교 화면 주소인가. 저장소 첫 화면은 아니다. */
export function isCodeLink(href?: string | null): boolean {
  return (
    !!href &&
    /github\.com\/[^/]+\/[^/]+\/(pull|commit|commits|blob|tree|compare)(\/|$)/.test(
      href
    )
  );
}

/** 그려도 되는 주소인가. */
export function codeLinkOk(href?: string | null): boolean {
  return !!href && (SHOW_CODE_LINKS || !isCodeLink(href));
}

/**
 * 데이터 덩어리 안의 `url` · `href` 중 코드 링크를 지운다(그 자리에서 고친다).
 * 화면을 그리는 곳이 여럿(상세 페이지 · 마을 전시실 · 원페이저)이라, 그리는 쪽마다 거르지 않고
 * 데이터를 내보내는 곳에서 한 번 거른다.
 */
export function stripCodeLinks<T>(data: T): T {
  if (SHOW_CODE_LINKS) return data;
  const walk = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    if (Array.isArray(v)) {
      v.forEach(walk);
      return;
    }
    const o = v as Record<string, unknown>;
    for (const k of Object.keys(o)) {
      const x = o[k];
      if ((k === "url" || k === "href") && typeof x === "string") {
        if (isCodeLink(x)) delete o[k];
      } else walk(x);
    }
  };
  walk(data);
  return data;
}

/** `{label, href}` 목록에서 코드 링크를 뺀다. */
export function withoutCodeLinks<T extends {href?: string}>(links: T[]): T[] {
  return SHOW_CODE_LINKS ? links : links.filter(l => !isCodeLink(l.href));
}
