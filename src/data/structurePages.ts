/**
 * 「구조 한눈에 보기」 페이지가 있는 프로젝트.
 *
 * 여기에 id 가 있으면 `/resume/<id>` 머리에 버튼이 생기고 `/resume/<id>/structure` 로 간다.
 * 그 주소는 next.config.mjs 의 rewrite 가 `public/structure/<id>/index.html` 로 넘긴다.
 * 파일은 `node scripts/import-structure.mjs <id> <html> [그림 폴더]` 로 들여온다.
 */
export const STRUCTURE_PAGES: readonly string[] = [
  "mystock",
  "muscleup",
  "festflow",
  "village-portfolio",
  "sign-language"
];

export const STRUCTURE_LABEL = "구조 한눈에 보기";

export function structureHref(id: string): string | undefined {
  return STRUCTURE_PAGES.includes(id) ? `/resume/${id}/structure` : undefined;
}
