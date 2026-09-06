import {readdirSync, readFileSync, writeFileSync, existsSync} from "node:fs";
import {join, posix} from "node:path";
import {NextResponse} from "next/server";
import type {PropsLayout} from "@/types/props";

// dev 전용 편집 도구. public/models/props 의 GLB 목록을 (하위 폴더 포함) 읽고,
// src/data/propsLayout.json 에 배치 결과를 저장한다(서버 파일 → git 커밋 가능).

const PROPS_DIR = join(process.cwd(), "public", "models", "props");
const LAYOUT_FILE = join(process.cwd(), "src", "data", "propsLayout.json");

// props/ 아래를 재귀로 훑되, 원본 보관소인 raw/ 는 제외한다.
function listAssets(): string[] {
  if (!existsSync(PROPS_DIR)) return [];
  const found: string[] = [];
  const walk = (dir: string, relParts: string[]) => {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
      if (entry.isDirectory()) {
        if (relParts.length === 0 && entry.name === "raw") continue; // 원본 폴더 스킵
        walk(join(dir, entry.name), [...relParts, entry.name]);
      } else if (entry.name.toLowerCase().endsWith(".glb")) {
        found.push("/models/props/" + posix.join(...relParts, entry.name));
      }
    }
  };
  walk(PROPS_DIR, []);
  return found.sort();
}

function readLayout(): PropsLayout {
  try {
    return JSON.parse(readFileSync(LAYOUT_FILE, "utf-8")) as PropsLayout;
  } catch {
    return {props: []};
  }
}

// 프로덕션에서는 404 — preview 페이지들이 notFound() 로 막는 것과 같은 관례.
// 배포본에 이 라우트가 열려 있으면 서버 파일 목록 조회와 쓰기 시도가 공개된다.
function notInDev() {
  return process.env.NODE_ENV !== "development";
}

export function GET() {
  if (notInDev()) return NextResponse.json({error: "not found"}, {status: 404});
  return NextResponse.json({assets: listAssets(), layout: readLayout()});
}

export async function POST(req: Request) {
  if (notInDev()) return NextResponse.json({error: "not found"}, {status: 404});
  let body: PropsLayout;
  try {
    body = (await req.json()) as PropsLayout;
  } catch {
    return NextResponse.json({error: "invalid json"}, {status: 400});
  }
  if (!body || !Array.isArray(body.props)) {
    return NextResponse.json({error: "props 배열이 필요합니다"}, {status: 400});
  }
  const out = {props: body.props, buildings: body.buildings ?? {}};
  try {
    writeFileSync(LAYOUT_FILE, JSON.stringify(out, null, 2) + "\n", "utf-8");
  } catch (err) {
    return NextResponse.json({error: String(err)}, {status: 500});
  }
  return NextResponse.json({
    ok: true,
    props: body.props.length,
    buildings: Object.keys(out.buildings).length
  });
}
