// 스크립트가 앱의 TypeScript 모듈을 **그대로** 불러오게 해 주는 해석 훅.
//
// ── 왜 필요한가 ─────────────────────────────────────────────────────────────
// 지금까지 검사 스크립트들은 앱의 규칙(구역 배치·해자 폴리라인·단차 높이)을
// 자기 안에 **다시 구현**해 왔다. 그러면 규칙을 고칠 때마다 두 곳을 같이
// 고쳐야 하고, 한 번이라도 빠뜨리면 검사기가 앱과 다른 마을을 보면서
// "전부 통과"라고 말한다. 실제로 해자·섬·물길 끝 반지름이 그렇게 세 번 낡았다.
//
// Node 22 는 .ts 를 타입만 떼고 실행할 수 있다(--experimental-strip-types).
// 남은 문제는 `@/lib/...` 별칭뿐이라 그것만 여기서 풀어 준다.
//
// 사용법:
//   node --experimental-strip-types --import ./scripts/lib/ts-loader.mjs 스크립트.mjs
// (package.json 의 `npm run check:village` 가 이렇게 부른다)

import {register} from "node:module";
import {pathToFileURL} from "node:url";

const ROOT = pathToFileURL(process.cwd() + "/");

register(
  "data:text/javascript," +
    encodeURIComponent(`
      const ROOT = ${JSON.stringify(ROOT.href)};
      // TypeScript 는 확장자를 생략해 쓰지만(./constants) Node ESM 은 못 찾는다.
      // 실패하면 붙여 가며 다시 시도한다 — tsconfig 의 moduleResolution 과 같은 순서.
      const EXT = [".ts", ".tsx", ".js", ".json", "/index.ts", "/index.tsx"];
      // Node 는 JSON 을 불러올 때 \`with { type: "json" }\` 을 요구하지만 번들러는
      // 요구하지 않아, 앱 코드에는 그 표기가 없다. 여기서 대신 붙여 준다.
      const withJson = (r) =>
        r && typeof r.url === "string" && r.url.endsWith(".json")
          ? {...r, importAttributes: {...(r.importAttributes ?? {}), type: "json"}}
          : r;
      async function tryResolve(url, context, next) {
        const ctx = {...context, importAttributes: {}};
        try {
          return withJson(await next(url, ctx));
        } catch (err) {
          for (const e of EXT) {
            try {
              return withJson(await next(url + e, ctx));
            } catch {}
          }
          throw err;
        }
      }
      export function resolve(specifier, context, next) {
        // tsconfig 의 "@/*": ["./src/*"] 와 같은 규칙
        const target = specifier.startsWith("@/")
          ? new URL("src/" + specifier.slice(2), ROOT).href
          : specifier;
        if (target.startsWith("node:") || !/^[.\\/]|^file:/.test(target))
          return next(target, context); // 내장 모듈·node_modules 는 건드리지 않는다
        return tryResolve(target, context, next);
      }
    `),
  import.meta.url
);
