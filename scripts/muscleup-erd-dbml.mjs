// 득근득근 JPA 엔티티 → dbdiagram.io DBML
// 사용: node erd-dbml.mjs <entity-dir> <out.dbml> [core|all]
import fs from "node:fs";
import path from "node:path";

const [, , ENTITY_DIR, OUT, SCOPE = "core"] = process.argv;

/** 이력서용 핵심 테이블 — 31개 다 그리면 안 읽힌다 */
const CORE = [
  "User",
  "RefreshToken",
  "EmailVerification",
  "AttendanceLog",
  "CharacterProfile",
  "CharacterEvolutionHistory",
  "BragPost",
  "BragComment",
  "BragLike",
  "WorkoutCrew",
  "WorkoutCrewMember",
  "WorkoutCrewJoinRequest",
  "FriendChatRoom",
  "FriendChatMessage",
  "Friendship",
  "AiChatMessage",
  "AuditLog"
];

const snake = s => s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();

const SQL_TYPE = {
  Long: "bigint",
  long: "bigint",
  Integer: "int",
  int: "int",
  Double: "double",
  double: "double",
  Float: "float",
  float: "float",
  Boolean: "boolean",
  boolean: "boolean",
  BigDecimal: "decimal",
  LocalDateTime: "datetime",
  LocalDate: "date",
  LocalTime: "time",
  Instant: "datetime"
};

const files = fs.readdirSync(ENTITY_DIR).filter(f => f.endsWith(".java"));

/** enum 이름 → 상수 목록 */
const enums = {};
for (const f of files) {
  const src = fs.readFileSync(path.join(ENTITY_DIR, f), "utf8");
  const m = src.match(/public\s+enum\s+(\w+)\s*\{([^}]*)\}/);
  if (!m) continue;
  const values = m[2]
    .split(",")
    .map(v => v.split("(")[0].split("//")[0].trim())
    .filter(v => /^[A-Z][A-Z0-9_]*$/.test(v));
  if (values.length) enums[m[1]] = values;
}

/** 어노테이션 인자에서 key = value 뽑기 */
const arg = (ann, key) => {
  const m = ann.match(new RegExp(`${key}\\s*=\\s*("([^"]*)"|[\\w.]+)`));
  return m ? m[2] ?? m[1] : null;
};

const entities = {};

for (const f of files) {
  const src = fs.readFileSync(path.join(ENTITY_DIR, f), "utf8");
  if (!/^\s*@Entity\b/m.test(src)) continue;

  const cls = src.match(/public\s+class\s+(\w+)(\s+extends\s+(\w+))?/);
  if (!cls) continue;
  const name = cls[1];
  const extendsBase = cls[3] === "BaseTimeEntity";

  // @Table(...) — 중첩 괄호까지 통째로
  let tableAnn = "";
  const tIdx = src.indexOf("@Table");
  if (tIdx >= 0) {
    let depth = 0;
    for (let i = src.indexOf("(", tIdx); i < src.length; i++) {
      if (src[i] === "(") depth++;
      else if (src[i] === ")") {
        depth--;
        if (depth === 0) {
          tableAnn = src.slice(tIdx, i + 1);
          break;
        }
      }
    }
  }

  // 테이블 이름을 찾기 전에 중첩 어노테이션을 걷어낸다.
  // @Table(indexes = {@Index(name = "idx_...")}) 처럼 안쪽에도 name 이 있어서,
  // 그냥 찾으면 인덱스 이름을 테이블 이름으로 읽는다(실제로 그렇게 깨졌었다).
  const tableAnnFlat = tableAnn
    .replace(/@Index\s*\([^)]*\)/g, "")
    .replace(/@UniqueConstraint\s*\([^)]*\)/g, "");
  const table = arg(tableAnnFlat, "name") || snake(name);

  // 인덱스
  const indexes = [];
  for (const m of tableAnn.matchAll(/@Index\s*\(([^)]*)\)/g)) {
    indexes.push({
      name: arg(m[1], "name"),
      columns: (arg(m[1], "columnList") || "")
        .split(",")
        .map(c => snake(c.trim()))
        .filter(Boolean)
    });
  }
  // 복합 유니크
  const uniques = [];
  for (const m of tableAnn.matchAll(
    /@UniqueConstraint\s*\(([\s\S]*?)\)\s*[,}\)]/g
  )) {
    const cols = m[1].match(/columnNames\s*=\s*\{([^}]*)\}/);
    if (!cols) continue;
    uniques.push({
      name: arg(m[1], "name"),
      columns: cols[1]
        .split(",")
        .map(c => c.trim().replace(/"/g, ""))
        .filter(Boolean)
    });
  }

  // 필드 — 앞선 어노테이션 블록과 함께
  const body = src.slice(src.indexOf("{", src.indexOf("public class")));
  const fields = [];
  const collections = [];
  // 선언 앞의 어노테이션 블록은 "직전 ; 또는 { } 이후" 전부로 잡는다.
  // (@Id @GeneratedValue 처럼 한 줄에 여러 개, @Builder.Default 처럼 점 있는 것까지)
  const fieldRe = /private\s+([\w<>,\[\] ]+?)\s+(\w+)\s*(=[^;]*)?;/g;

  for (const m of body.matchAll(fieldRe)) {
    const before = body.slice(0, m.index);
    const cut = Math.max(
      before.lastIndexOf(";"),
      before.lastIndexOf("{"),
      before.lastIndexOf("}")
    );
    const anns = before.slice(cut + 1);
    const javaType = m[1].trim();
    const fname = m[2];

    if (/@Transient\b/.test(anns)) continue;
    if (/@OneToMany|mappedBy/.test(anns)) continue; // 역방향은 컬럼이 없다

    // @ElementCollection → 별도 테이블
    if (/@ElementCollection/.test(anns)) {
      const ct = anns.match(/@CollectionTable\s*\(([\s\S]*?)\)\s*\r?\n/);
      const jc = anns.match(/@JoinColumn\s*\(([^)]*)\)/);
      const col = anns.match(/@Column\s*\(([^)]*)\)/);
      collections.push({
        table: (ct && arg(ct[1], "name")) || `${snake(name)}_${snake(fname)}`,
        fk: (jc && arg(jc[1], "name")) || `${snake(name)}_id`,
        column: (col && arg(col[1], "name")) || snake(fname),
        len: col ? Number(arg(col[1], "length")) || null : null
      });
      continue;
    }

    const isRel = /@ManyToOne|@OneToOne/.test(anns);
    const jc = anns.match(/@JoinColumn\s*\(([^)]*)\)/);
    const col = anns.match(/@Column\s*\(([^)]*)\)/);
    const src_ = isRel ? (jc ? jc[1] : "") : col ? col[1] : "";

    const colName = isRel
      ? (jc && arg(jc[1], "name")) || `${snake(fname)}_id`
      : (col && arg(col[1], "name")) || snake(fname);

    const len = src_ ? Number(arg(src_, "length")) || null : null;
    // 관계는 @JoinColumn(nullable=false) 뿐 아니라 @ManyToOne(optional=false) 로도 NOT NULL 이 된다
    const nn =
      /nullable\s*=\s*false/.test(src_) ||
      (isRel && /optional\s*=\s*false/.test(anns)) ||
      /@Id\b/.test(anns);
    const uq = /unique\s*=\s*true/.test(src_);
    const pk = /@Id\b/.test(anns);
    const isText =
      /@Lob\b/.test(anns) || /columnDefinition\s*=\s*"TEXT"/i.test(anns);

    let sqlType;
    if (isRel) sqlType = "bigint";
    else if (enums[javaType]) sqlType = `varchar(${len || 255})`;
    else if (javaType === "String")
      sqlType = isText ? "text" : `varchar(${len || 255})`;
    else sqlType = SQL_TYPE[javaType] || "varchar(255)";

    fields.push({
      name: colName,
      javaField: fname,
      javaType,
      sqlType,
      pk,
      nn,
      uq,
      len,
      enum: enums[javaType] ? javaType : null,
      ref: isRel ? javaType : null,
      note: isRel ? null : undefined
    });
  }

  if (extendsBase) {
    fields.push({
      name: "created_at",
      sqlType: "datetime",
      nn: false,
      base: true
    });
    fields.push({
      name: "updated_at",
      sqlType: "datetime",
      nn: false,
      base: true
    });
  }

  entities[name] = {table, fields, indexes, uniques, collections, extendsBase};
}

// ---- DBML 출력 ----
const wanted =
  SCOPE === "all" ? Object.keys(entities) : CORE.filter(n => entities[n]);
const tableOf = Object.fromEntries(
  Object.entries(entities).map(([k, v]) => [k, v.table])
);

const out = [];
out.push(`// 득근득근 (MuscleUp) — 핵심 ${wanted.length}개 테이블`);
out.push(`// backend/src/main/java/com/ajou/muscleup/entity 에서 자동 생성`);
out.push(
  `// 전체 @Entity ${Object.keys(entities).length}개 중 이력서용으로 추린 것`
);
out.push("");

const usedEnums = new Set();
for (const n of wanted)
  for (const f of entities[n].fields) if (f.enum) usedEnums.add(f.enum);
for (const e of [...usedEnums].sort()) {
  out.push(`Enum ${snake(e)} {`);
  for (const v of enums[e]) out.push(`  ${v}`);
  out.push("}", "");
}

const refs = [];
for (const n of wanted) {
  const e = entities[n];
  out.push(`Table ${e.table} {`);
  for (const f of e.fields) {
    const settings = [];
    if (f.pk) settings.push("pk", "increment");
    if (f.nn && !f.pk) settings.push("not null");
    if (f.uq) settings.push("unique");
    if (f.enum) settings.push(`note: '${f.enum}'`);
    out.push(
      `  ${f.name} ${f.sqlType}${
        settings.length ? ` [${settings.join(", ")}]` : ""
      }`
    );
    if (f.ref && wanted.includes(f.ref))
      refs.push(`Ref: ${e.table}.${f.name} > ${tableOf[f.ref]}.id`);
  }
  const idxLines = [];
  for (const u of e.uniques)
    idxLines.push(
      `    (${u.columns.join(", ")}) [unique${
        u.name ? `, name: '${u.name}'` : ""
      }]`
    );
  for (const i of e.indexes)
    idxLines.push(
      `    (${i.columns.join(", ")})${i.name ? ` [name: '${i.name}']` : ""}`
    );
  if (idxLines.length) {
    out.push("", "  Indexes {", ...idxLines, "  }");
  }
  out.push("}", "");

  for (const c of e.collections) {
    out.push(`Table ${c.table} {`);
    out.push(`  ${c.fk} bigint [not null]`);
    out.push(`  ${c.column} varchar(${c.len || 255})`);
    out.push("}", "");
    refs.push(`Ref: ${c.table}.${c.fk} > ${e.table}.id`);
  }
}

out.push(...refs, "");
fs.writeFileSync(OUT, out.join("\n"), "utf8");

// ---- 요약 ----
const all = Object.keys(entities);
console.log(`엔티티 ${all.length}개 · DBML 대상 ${wanted.length}개 → ${OUT}`);
console.log(
  `enum ${Object.keys(enums).length}개 (DBML 포함 ${usedEnums.size}개)`
);
const idxTables = all.filter(n => entities[n].indexes.length);
const uqTables = all.filter(n => entities[n].uniques.length);
console.log(`명시적 @Index 가진 테이블: ${idxTables.join(", ") || "없음"}`);
console.log(`복합 UNIQUE 가진 테이블: ${uqTables.join(", ")}`);
const missing = CORE.filter(n => !entities[n]);
if (missing.length)
  console.log(`⚠ CORE에 있는데 못 찾은 엔티티: ${missing.join(", ")}`);

// ─── draw.io (app.diagrams.net) 출력 ──────────────────────────────────────────
//
// draw.io 는 DBML 을 못 읽는다. SQL 임포트는 되지만 **FK 관계선을 안 그려 준다** —
// 24개를 손으로 이어야 한다. 그래서 박스와 관계선이 이미 놓인 .drawio 를 직접 만든다.
// 열어서 위치만 다듬고 내보내면 끝난다.

const DRAWIO_OUT = OUT.replace(/\.dbml$/, "") + ".drawio";

const esc = s =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// 도메인별 색. users 는 허브라 따로 둔다.
const PALETTE = {
  hub: {fill: "#be185d", stroke: "#831843"},
  auth: {fill: "#7c3aed", stroke: "#4c1d95"},
  record: {fill: "#0369a1", stroke: "#0c4a6e"},
  community: {fill: "#b45309", stroke: "#78350f"},
  crew: {fill: "#15803d", stroke: "#14532d"},
  social: {fill: "#0f766e", stroke: "#134e4a"},
  ops: {fill: "#57534e", stroke: "#292524"}
};

// 열 배치 — users 를 가운데 두고 도메인별로 뭉친다. 자동 배치는 안 읽힌다.
const COLUMNS = [
  {x: 40, group: "auth", tables: ["refresh_tokens", "email_verifications"]},
  {x: 380, group: "ops", tables: ["audit_logs", "ai_chat_messages"]},
  {x: 720, group: "record", tables: ["character_profiles", "character_evolution_history", "attendance_logs"]},
  {x: 1060, group: "hub", tables: ["users"]},
  {x: 1400, group: "community", tables: ["brag_post", "brag_media", "brag_comment", "brag_like"]},
  {x: 1740, group: "crew", tables: ["workout_crews", "workout_crew_members", "workout_crew_join_requests"]},
  {x: 2080, group: "social", tables: ["friendships", "friend_chat_rooms", "friend_chat_messages"]}
];

const W = 300;
const HEAD = 34;
const ROW = 24;

// table 이름 → 엔티티(컬렉션 테이블 포함)
const byTable = {};
for (const n of wanted) {
  const e = entities[n];
  byTable[e.table] = {rows: e.fields, uniques: e.uniques, indexes: e.indexes};
  for (const c of e.collections)
    byTable[c.table] = {
      rows: [
        {name: c.fk, sqlType: "bigint", nn: true, ref: n},
        {name: c.column, sqlType: `varchar(${c.len || 255})`}
      ],
      uniques: [],
      indexes: []
    };
}

const rowsOf = t => {
  const d = byTable[t];
  const lines = d.rows.map(f => ({
    key: f.pk ? "PK" : f.ref ? "FK" : f.uq ? "U" : "",
    text: `${f.name} : ${f.sqlType}${f.nn && !f.pk ? "  NN" : ""}`,
    id: `R_${t}_${f.name}`,
    idx: false
  }));
  for (const u of d.uniques)
    lines.push({key: "UQ", text: `(${u.columns.join(", ")})`, id: `X_${t}_u_${u.columns.join("_")}`, idx: true});
  for (const i of d.indexes)
    lines.push({key: "IX", text: `(${i.columns.join(", ")})`, id: `X_${t}_i_${i.columns.join("_")}`, idx: true});
  return lines;
};

const cells = [];
const edges = [];
const placed = {};

// 열마다 높이가 크게 다르다(attendance_logs 는 17행). 위로 정렬하면 짧은 열이
// 위에 붕 뜨고 users 로 가는 선이 길게 사선으로 내려온다. 그래서 **가운데 정렬**한다.
const GAP = 50;
const colHeight = col =>
  col.tables
    .filter(t => byTable[t])
    .reduce((s, t) => s + HEAD + rowsOf(t).length * ROW + GAP, -GAP);
const tallest = Math.max(...COLUMNS.map(colHeight));

for (const col of COLUMNS) {
  let y = 60 + (tallest - colHeight(col)) / 2;
  for (const t of col.tables) {
    if (!byTable[t]) continue;
    const lines = rowsOf(t);
    const h = HEAD + lines.length * ROW;
    const c = PALETTE[col.group];
    placed[t] = {x: col.x, y, h};
    cells.push(
      `        <mxCell id="T_${t}" value="${esc(t)}" style="swimlane;fontStyle=1;childLayout=stackLayout;horizontal=1;startSize=${HEAD};horizontalStack=0;resizeParent=0;resizeParentMax=0;html=1;fontSize=13;fillColor=${c.fill};strokeColor=${c.stroke};fontColor=#ffffff;swimlaneFillColor=#ffffff;" vertex="1" parent="1">`,
      `          <mxGeometry x="${col.x}" y="${y}" width="${W}" height="${h}" as="geometry" />`,
      `        </mxCell>`
    );
    lines.forEach((ln, i) => {
      const label = ln.key ? `${ln.key}  ${ln.text}` : `      ${ln.text}`;
      const style = ln.idx
        ? `text;strokeColor=none;fillColor=#f8fafc;align=left;verticalAlign=middle;spacingLeft=8;overflow=hidden;rotatable=0;whiteSpace=wrap;html=1;fontSize=10;fontColor=#64748b;fontStyle=2;`
        : `text;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;spacingLeft=8;overflow=hidden;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;rotatable=0;whiteSpace=wrap;html=1;fontSize=11;${ln.key === "PK" ? "fontStyle=1;" : ""}`;
      cells.push(
        `        <mxCell id="${ln.id}" value="${esc(label)}" style="${style}" vertex="1" parent="T_${t}">`,
        `          <mxGeometry y="${HEAD + i * ROW}" width="${W}" height="${ROW}" as="geometry" />`,
        `        </mxCell>`
      );
    });
    y += h + GAP;
  }
}

// FK 관계선 — 까마귀발(many) 쪽이 FK, 홑선(one) 쪽이 PK.
//
// 선이 박스를 뚫지 않게 두 가지를 건다.
//  1) **면 지정**: FK 테이블이 대상 왼쪽에 있으면 오른쪽 면으로 나가 왼쪽 면으로
//     들어간다(반대면 그 반대). 안 정해 주면 draw.io 가 최단거리로 박스를 가로지른다.
//  2) **jumpStyle=arc**: 선끼리 만나는 곳을 반원으로 넘긴다. users 로 14개가
//     모이는 구조라 교차 자체는 못 없앤다 — 넘어가게 만드는 게 최선이다.
let ei = 0;
for (const t of Object.keys(byTable)) {
  for (const f of byTable[t].rows) {
    if (!f.ref) continue;
    const target = tableOf[f.ref];
    if (!target || !placed[target] || !placed[t]) continue;
    ei += 1;
    const leftOfTarget = placed[t].x < placed[target].x;
    const side = leftOfTarget
      ? "exitX=1;exitY=0.5;exitDx=0;exitDy=0;entryX=0;entryY=0.5;entryDx=0;entryDy=0;"
      : "exitX=0;exitY=0.5;exitDx=0;exitDy=0;entryX=1;entryY=0.5;entryDx=0;entryDy=0;";
    edges.push(
      `        <mxCell id="E${ei}" style="edgeStyle=entityRelationEdgeStyle;rounded=0;html=1;${side}startArrow=ERmany;startFill=0;endArrow=ERone;endFill=0;strokeColor=#94a3b8;strokeWidth=1;jumpStyle=arc;jumpSize=10;" edge="1" parent="1" source="R_${t}_${f.name}" target="R_${target}_id">`,
      `          <mxGeometry relative="1" as="geometry" />`,
      `        </mxCell>`
    );
  }
}

const title = [
  `        <mxCell id="TITLE" value="득근득근 (MuscleUp) ERD — 핵심 ${Object.keys(placed).length}개 테이블" style="text;html=1;fontSize=26;fontStyle=1;align=left;verticalAlign=middle;fontColor=#0f172a;" vertex="1" parent="1">`,
  `          <mxGeometry x="40" y="-40" width="900" height="40" as="geometry" />`,
  `        </mxCell>`,
  `        <mxCell id="SUB" value="PK 기본키 · FK 외래키 · U 단일 UNIQUE · NN NOT NULL · UQ 복합 UNIQUE · IX 인덱스   |   JPA 엔티티 소스에서 자동 생성" style="text;html=1;fontSize=13;align=left;verticalAlign=middle;fontColor=#475569;" vertex="1" parent="1">`,
  `          <mxGeometry x="40" y="0" width="1400" height="26" as="geometry" />`,
  `        </mxCell>`
];

const xml = [
  `<mxfile host="app.diagrams.net">`,
  `  <diagram name="MuscleUp ERD">`,
  `    <mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2339" pageHeight="1654" math="0" shadow="0">`,
  `      <root>`,
  `        <mxCell id="0" />`,
  `        <mxCell id="1" parent="0" />`,
  ...title,
  ...cells,
  ...edges,
  `      </root>`,
  `    </mxGraphModel>`,
  `  </diagram>`,
  `</mxfile>`,
  ``
].join("\n");

fs.writeFileSync(DRAWIO_OUT, xml, "utf8");
console.log(`draw.io: 테이블 ${Object.keys(placed).length}개 · 관계선 ${ei}개 → ${DRAWIO_OUT}`);
