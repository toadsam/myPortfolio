import {WebGLRenderer} from "three";
// three/examples 가 아니라 three-stdlib 에서 가져온다 — drei 의 useGLTF 가 쓰는
// GLTFLoader 가 이쪽이라, examples 쪽 타입을 넘기면 setKTX2Loader 시그니처가 안 맞는다.
import {KTX2Loader, type GLTFLoader} from "three-stdlib";

/**
 * GLB 안의 KTX2 텍스처를 읽게 해 주는 로더 확장.
 *
 * ── 왜 필요한가 ─────────────────────────────────────────────────────────────
 * JPEG/WebP 텍스처는 **전송용** 압축이라 GPU에 올릴 땐 무압축 RGBA로 풀린다.
 * 1024×1024 한 장이 파일로는 200KB인데 VRAM 에서는 5.6MB 다. 마을 텍스처를
 * 다 합치면 283MB — 내장 그래픽(공유 메모리)에서는 이게 곧 렉이다.
 *
 * KTX2(Basis Universal)는 GPU 하드웨어가 **압축된 채로 읽는** 형식(BC7/ASTC/ETC)
 * 이라 VRAM 에서도 압축 상태를 유지한다. 실측 1/8 (8.4MB → 1.05MB / 건물 1채).
 *
 * ── detectSupport 를 왜 임시 렌더러로 하나 ─────────────────────────────────
 * KTX2Loader 는 "이 GPU가 어떤 압축 포맷을 지원하나"를 알아야 트랜스코딩 대상을
 * 정한다. 보통 R3F 의 gl 을 넘기는데, useGLTF 는 Canvas 안 여기저기서 서스펜스로
 * 로딩을 시작하므로 "gl 이 준비된 뒤에 detectSupport 가 끝나 있다"를 보장할 수
 * 없다. 한 번이라도 순서가 어긋나면 "no supported texture format" 으로 죽는다.
 * 그래서 잠깐 만들었다 버리는 렌더러로 능력만 물어보고 끝낸다 — 순서 문제 자체가
 * 사라진다. (컨텍스트는 dispose 로 즉시 반납한다.)
 *
 * ── 아직 KTX2 가 없는 GLB 는 어떻게 되나 ───────────────────────────────────
 * 아무 일도 일어나지 않는다. KHR_texture_basisu 확장을 쓰는 GLB 에만 관여하므로,
 * 에셋을 다시 굽기 전에 이 파일을 먼저 넣어 둬도 안전하다.
 */

let ktx2Loader: KTX2Loader | null = null;

function getKtx2Loader(): KTX2Loader | null {
  if (typeof window === "undefined") return null;
  if (ktx2Loader) return ktx2Loader;

  const loader = new KTX2Loader().setTranscoderPath("/basis/");
  try {
    const probe = new WebGLRenderer();
    loader.detectSupport(probe);
    probe.dispose();
    // dispose 는 자바스크립트 쪽 자원만 놓아준다. 컨텍스트 자체를 바로 반납하지
    // 않으면 브라우저의 동시 WebGL 컨텍스트 상한(대개 16개)을 갉아먹는다.
    probe.forceContextLoss();
  } catch {
    // WebGL 을 못 만드는 환경(테스트·서버)에서는 KTX2 없이 진행한다
    return null;
  }

  ktx2Loader = loader;
  return ktx2Loader;
}

/** `useGLTF(url, true, true, extendGltfLoader)` 형태로 넘긴다. */
export function extendGltfLoader(loader: GLTFLoader): void {
  const ktx2 = getKtx2Loader();
  if (ktx2) loader.setKTX2Loader(ktx2);
}
