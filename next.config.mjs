import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: projectRoot
  },
  // 「구조 한눈에 보기」: /resume/<id>/structure 는 public/structure/<id>/index.html 을 그대로 낸다.
  // 버튼이 보이는 프로젝트 목록은 src/data/structurePages.ts.
  async rewrites() {
    return [
      {
        source: "/resume/:id/structure",
        destination: "/structure/:id/index.html"
      }
    ];
  }
};

export default nextConfig;
