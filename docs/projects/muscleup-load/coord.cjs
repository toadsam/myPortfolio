// 워커 여러 개로 나눠 붙이고 원시 표본을 합쳐 백분위를 낸다.
// 워커당 소켓 수를 25 로 묶는다 — 그 위로 올리면 클라이언트 이벤트 루프가
// 먼저 막혀서 서버가 아니라 하네스를 재게 된다(처음 램프가 그랬다).
const {spawn} = require("child_process");
const path = require("path");

const N = Number(process.argv[2]);
const SECONDS = Number(process.argv[3] ?? 16);
const PORT = Number(process.argv[4] ?? 4001);
const PER = 25;

const shards = [];
for (let off = 0; off < N; off += PER) shards.push([Math.min(PER, N - off), off]);

const run = ([count, off]) =>
  new Promise(res => {
    const p = spawn(
      process.execPath,
      [path.join(__dirname, "worker.cjs"), String(count), String(SECONDS), String(PORT), String(off)],
      {stdio: ["ignore", "pipe", "ignore"]}
    );
    let buf = "";
    p.stdout.on("data", d => (buf += d));
    p.on("close", () => {
      try {
        res(JSON.parse(buf));
      } catch {
        res(null);
      }
    });
  });

const pct = (a, q) => {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor((q / 100) * s.length))];
};

(async () => {
  const rs = (await Promise.all(shards.map(run))).filter(Boolean);
  const rtt = rs.flatMap(r => r.rtt);
  const alive = rs.reduce((a, r) => a + r.alive, 0);
  const elapsed = rs.reduce((a, r) => a + r.elapsed, 0) / rs.length;
  const events = rs.reduce((a, r) => a + r.playersEvents, 0);
  const bytes = rs.reduce((a, r) => a + r.playersBytes, 0);
  console.log(
    JSON.stringify({
      N,
      워커: shards.length,
      동시접속: alive,
      "왕복ms_p50": pct(rtt, 50),
      "왕복ms_p95": pct(rtt, 95),
      "왕복ms_p99": pct(rtt, 99),
      표본: rtt.length,
      "브로드캐스트_초당_1인": Number((events / alive / elapsed).toFixed(1)),
      "서버송신_MBs": Number((bytes / elapsed / 1048576).toFixed(2)),
      "1인당_수신_KBs": Number((bytes / alive / elapsed / 1024).toFixed(1))
    })
  );
})();
