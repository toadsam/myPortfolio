const sharp = require("sharp");
const D = __dirname + "/";
// 다크(ops) 캡처는 1280 폭 화면 안에 앱 열이 x=424..855(폭 432)로 들어 있다.
// 밝은(public) 폰 캡처(390x844)와 같은 비율(0.462)로 맞추려면 432x935.
const CROPS = {
  "ops-map.png":       {f: "g-map.png",       x: 424, y: 214, w: 432, h: 935},
  "ops-insight.png":   {f: "g-analytics.png", x: 424, y: 206, w: 432, h: 935},
  "ops-chat.png":      {f: "g-chat.png",      x: 424, y: 32,  w: 432, h: 935}
};
(async () => {
  for (const [out, c] of Object.entries(CROPS)) {
    await sharp(D + c.f)
      .extract({left: c.x, top: c.y, width: c.w, height: c.h})
      .toFile(D + out);
    console.log("ok", out);
  }
})();
