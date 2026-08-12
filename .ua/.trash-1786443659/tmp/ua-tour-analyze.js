#!/usr/bin/env node
'use strict';
const fs = require('fs');

function main() {
  const inPath = process.argv[2];
  const outPath = process.argv[3];
  if (!inPath || !outPath) throw new Error('usage: node ua-tour-analyze.js <input.json> <output.json>');

  const data = JSON.parse(fs.readFileSync(inPath, 'utf8'));
  const nodes = data.nodes || [];
  const edges = data.edges || [];
  const layers = data.layers || [];

  const byId = new Map(nodes.map((n) => [n.id, n]));

  // --- fan in / fan out ---
  const fanIn = new Map();
  const fanOut = new Map();
  nodes.forEach((n) => { fanIn.set(n.id, 0); fanOut.set(n.id, 0); });
  for (const e of edges) {
    if (!byId.has(e.source) || !byId.has(e.target)) continue;
    fanOut.set(e.source, fanOut.get(e.source) + 1);
    fanIn.set(e.target, fanIn.get(e.target) + 1);
  }

  const rank = (m, key) => nodes
    .map((n) => ({ id: n.id, [key]: m.get(n.id) || 0, name: n.name, type: n.type }))
    .sort((a, b) => b[key] - a[key])
    .slice(0, 20);

  const fanInRanking = rank(fanIn, 'fanIn');
  const fanOutRanking = rank(fanOut, 'fanOut');

  // --- entry point candidates ---
  const ENTRY_NAMES = new Set(['index.ts','index.js','index.tsx','main.ts','main.js','app.ts','app.js','server.ts','server.js','mod.rs','main.go','main.py','main.rs','manage.py','app.py','wsgi.py','asgi.py','run.py','__main__.py','Application.java','Main.java','Program.cs','config.ru','index.php','App.swift','Application.kt','main.cpp','main.c','page.tsx','layout.tsx']);

  const foutVals = nodes.map((n) => fanOut.get(n.id) || 0).sort((a, b) => b - a);
  const finVals = nodes.map((n) => fanIn.get(n.id) || 0).sort((a, b) => a - b);
  const foutTop10 = foutVals[Math.max(0, Math.floor(foutVals.length * 0.1) - 1)] || 0;
  const finBottom25 = finVals[Math.max(0, Math.floor(finVals.length * 0.25) - 1)] || 0;

  const candidates = [];
  for (const n of nodes) {
    const fp = (n.filePath || '').replace(/\\/g, '/');
    const depth = fp.split('/').length - 1;
    let score = 0;
    if (n.type === 'document') {
      if (/^README\.md$/i.test(fp)) score += 5;
      else if (depth === 0 && /\.md$/i.test(fp)) score += 2;
    } else {
      if (ENTRY_NAMES.has(n.name)) score += 3;
      if (depth <= 1) score += 1;
      if ((fanOut.get(n.id) || 0) >= foutTop10 && foutTop10 > 0) score += 1;
      if ((fanIn.get(n.id) || 0) <= finBottom25) score += 1;
    }
    if (score > 0) candidates.push({ id: n.id, score, name: n.name, type: n.type, filePath: fp, summary: n.summary });
  }
  candidates.sort((a, b) => b.score - a.score);
  const entryPointCandidates = candidates.slice(0, 5);

  // --- BFS from top code entry point ---
  const adj = new Map();
  nodes.forEach((n) => adj.set(n.id, []));
  for (const e of edges) {
    if (e.type !== 'imports' && e.type !== 'calls') continue;
    if (!adj.has(e.source) || !byId.has(e.target)) continue;
    adj.get(e.source).push(e.target);
  }

  const bfsFrom = (start) => {
    const ord = [];
    const dm = {};
    if (!start) return { ord, dm };
    const q = [start];
    dm[start] = 0;
    while (q.length) {
      const cur = q.shift();
      ord.push(cur);
      for (const nx of adj.get(cur) || []) {
        if (dm[nx] === undefined) { dm[nx] = dm[cur] + 1; q.push(nx); }
      }
    }
    return { ord, dm };
  };

  // Among the highest-scoring code candidates, prefer the one whose BFS reaches
  // the most of the codebase — that is the real runtime root, not a leaf hub.
  const codeCands = candidates.filter((c) => c.type !== 'document');
  const topScore = codeCands.length ? codeCands[0].score : 0;
  const tied = codeCands.filter((c) => c.score >= topScore - 1);
  let startNode = codeCands.length ? codeCands[0].id : (nodes[0] && nodes[0].id);
  let bestReach = -1;
  for (const c of tied) {
    const reach = bfsFrom(c.id).ord.length;
    if (reach > bestReach) { bestReach = reach; startNode = c.id; }
  }
  const { ord: order, dm: depthMap } = bfsFrom(startNode);
  const byDepth = {};
  for (const [id, d] of Object.entries(depthMap)) {
    (byDepth[d] = byDepth[d] || []).push(id);
  }

  // --- non-code inventory ---
  const bucket = (types) => nodes.filter((n) => types.includes(n.type))
    .map((n) => ({ id: n.id, name: n.name, type: n.type, filePath: n.filePath, summary: n.summary }));
  const nonCodeFiles = {
    documentation: bucket(['document']),
    infrastructure: bucket(['service', 'pipeline', 'resource']),
    data: bucket(['table', 'schema', 'endpoint']),
    config: bucket(['config']),
  };

  // --- clusters ---
  const pairKey = (a, b) => (a < b ? a + '||' + b : b + '||' + a);
  const pairCount = new Map();
  const undirected = new Map();
  nodes.forEach((n) => undirected.set(n.id, new Set()));
  const directed = new Set();
  for (const e of edges) {
    if (!byId.has(e.source) || !byId.has(e.target) || e.source === e.target) continue;
    if (!['imports', 'calls', 'depends_on', 'related'].includes(e.type)) continue;
    directed.add(e.source + '>>' + e.target + '>>' + e.type);
    pairCount.set(pairKey(e.source, e.target), (pairCount.get(pairKey(e.source, e.target)) || 0) + 1);
    undirected.get(e.source).add(e.target);
    undirected.get(e.target).add(e.source);
  }

  const seeds = [];
  for (const [k, c] of pairCount) {
    const [a, b] = k.split('||');
    const bidir = ['imports', 'calls', 'depends_on', 'related'].some(
      (t) => directed.has(a + '>>' + b + '>>' + t) && directed.has(b + '>>' + a + '>>' + t)
    );
    if (bidir || c >= 2) seeds.push({ nodes: [a, b], score: c + (bidir ? 2 : 0) });
  }
  seeds.sort((a, b) => b.score - a.score);

  const clusters = [];
  const used = new Set();
  for (const s of seeds) {
    if (s.nodes.some((n) => used.has(n))) continue;
    const members = new Set(s.nodes);
    let grew = true;
    while (grew && members.size < 5) {
      grew = false;
      let best = null, bestC = 1;
      for (const n of nodes) {
        if (members.has(n.id) || used.has(n.id)) continue;
        let c = 0;
        for (const m of members) if (undirected.get(n.id).has(m)) c++;
        if (c >= 2 && c > bestC) { best = n.id; bestC = c; }
      }
      if (best) { members.add(best); grew = true; }
    }
    let edgeCount = 0;
    for (const [k, c] of pairCount) {
      const [a, b] = k.split('||');
      if (members.has(a) && members.has(b)) edgeCount += c;
    }
    clusters.push({ nodes: [...members], edgeCount });
    members.forEach((m) => used.add(m));
    if (clusters.length >= 10) break;
  }
  clusters.sort((a, b) => b.edgeCount - a.edgeCount);

  const nodeSummaryIndex = {};
  for (const n of nodes) {
    nodeSummaryIndex[n.id] = { name: n.name, type: n.type, filePath: n.filePath, summary: n.summary };
  }

  const results = {
    scriptCompleted: true,
    entryPointCandidates,
    fanInRanking,
    fanOutRanking,
    bfsTraversal: { startNode, order, depthMap, byDepth },
    nonCodeFiles,
    clusters,
    layers: { count: layers.length, list: layers },
    nodeSummaryIndex,
    totalNodes: nodes.length,
    totalEdges: edges.length,
  };
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log('OK nodes=' + nodes.length + ' edges=' + edges.length + ' bfs=' + order.length + ' clusters=' + clusters.length);
}

try { main(); } catch (err) { console.error(err && err.stack || String(err)); process.exit(1); }
