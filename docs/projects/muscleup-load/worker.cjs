// 워커 하나가 CLIENTS 개의 소켓만 맡는다.
//
// 왜 쪼개야 했나 — 처음엔 한 프로세스에 150 소켓을 다 물렸다. 그런데 서버
// CPU 가 한 코어의 20% 를 넘은 적이 없는데도 왕복 시간이 2초까지 뛰었다.
// Node 는 단일 스레드다. 서버가 병목이면 한 코어를 100% 물고 있어야 한다.
// 즉 그때 잰 건 서버가 아니라 **하네스 자신**이었다: 클라이언트도 서버와
// 똑같이 N² 만큼 JSON 을 파싱하는데 그걸 스레드 하나로 했다.
//
// 출력: 원시 왕복 표본까지 그대로 내보낸다. 워커별 p95 를 평균 내면 틀린다.
const {io} = require("socket.io-client");

const CLIENTS = Number(process.argv[2]);
const SECONDS = Number(process.argv[3]);
const PORT = Number(process.argv[4]);
const OFFSET = Number(process.argv[5] ?? 0);
const URL = `http://127.0.0.1:${PORT}`;

const MOVE_HZ = 10;
const PING_MS = 1000;
const TIERS = ["BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "MASTER"];
const growthParams = Object.fromEntries(
  [
    "bmiNormalized", "muscularityNormalized", "fatNormalized", "armGrowth",
    "legGrowth", "torsoGrowth", "armScale", "legScale", "torsoScaleX",
    "chestGrowth", "backGrowth", "shoulderGrowth", "quadGrowth",
    "hamstringGrowth", "gluteGrowth", "strokeWidth", "muscleDetailOpacity",
    "fatShadowOpacity", "contrastBoost"
  ].map(k => [k, 0.5])
);

const rtt = [];
let playersEvents = 0;
let playersBytes = 0;
let joined = 0;
const socks = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));

for (let k = 0; k < CLIENTS; k++) {
  const i = OFFSET + k;
  const sock = io(URL, {transports: ["websocket"], reconnection: false});
  sock.on("lounge:welcome", () => joined++);
  sock.on("lounge:players", p => {
    playersEvents++;
    playersBytes += Buffer.byteLength(JSON.stringify(p));
  });
  sock.on("ping:result", ({clientTs}) => rtt.push(Date.now() - clientTs));
  sock.on("connect", () =>
    sock.emit("lounge:join", {
      nickname: `load${i}`,
      level: 1 + (i % 90),
      tier: TIERS[i % TIERS.length],
      evolutionStage: i % 9,
      gender: i % 2 ? "MALE" : "FEMALE",
      growthParams,
      recentAttendanceCount: i % 30
    })
  );
  socks.push(sock);
}

(async () => {
  await sleep(3000);
  // 측정 구간 — 접속 폭주는 빼고 정상 상태만 본다.
  playersEvents = 0;
  playersBytes = 0;
  rtt.length = 0;
  const t0 = Date.now();
  const movers = socks.map((s, i) =>
    setInterval(() => {
      if (s.connected) s.emit("player:move", {x: Math.random() * 2000, y: Math.random() * 1200});
    }, Math.round(1000 / MOVE_HZ) + (i % 7))
  );
  const pingers = socks.map(s =>
    setInterval(() => {
      if (s.connected) s.emit("ping:check", {clientTs: Date.now()});
    }, PING_MS)
  );
  await sleep(SECONDS * 1000);
  movers.forEach(clearInterval);
  pingers.forEach(clearInterval);
  const elapsed = (Date.now() - t0) / 1000;
  process.stdout.write(
    JSON.stringify({
      alive: socks.filter(s => s.connected).length,
      joined,
      elapsed,
      rtt,
      playersEvents,
      playersBytes
    })
  );
  socks.forEach(s => s.close());
  await sleep(200);
  process.exit(0);
})();
