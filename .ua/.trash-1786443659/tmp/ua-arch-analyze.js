#!/usr/bin/env node
'use strict';
const fs = require('fs');

function main() {
  const inPath = process.argv[2];
  const outPath = process.argv[3];
  if (!inPath || !outPath) throw new Error('usage: node ua-arch-analyze.js <input.json> <output.json>');
  const data = JSON.parse(fs.readFileSync(inPath, 'utf8'));
  const fileNodes = data.fileNodes || [];
  const importEdges = data.importEdges || [];
  const allEdges = data.allEdges || [];

  const norm = (p) => String(p || '').replace(/\\/g, '/').replace(/^\.\//, '');
  const byId = new Map();
  fileNodes.forEach((n) => byId.set(n.id, Object.assign({}, n, { filePath: norm(n.filePath) })));
  const nodes = [...byId.values()];

  // ---- A. common prefix ----
  const paths = nodes.map((n) => n.filePath).filter(Boolean);
  let prefix = '';
  if (paths.length > 1) {
    const split = paths.map((p) => p.split('/'));
    const first = split[0];
    let i = 0;
    for (; i < first.length - 1; i++) {
      if (!split.every((s) => s.length > i + 1 && s[i] === first[i])) break;
    }
    prefix = i > 0 ? first.slice(0, i).join('/') + '/' : '';
  }

  const groupOf = (fp) => {
    if (!fp) return '(root)';
    let rest = prefix && fp.startsWith(prefix) ? fp.slice(prefix.length) : fp;
    const seg = rest.split('/');
    if (seg.length <= 1) return '(root)';
    // two-level grouping for src/* and backend/* style trees
    let g = seg[0];
    if (seg.length > 2 && (g === 'src' || g === 'backend' || g === 'app')) g = g + '/' + seg[1];
    if (seg.length > 3 && (g === 'src/components' || g === 'backend/app')) g = g + '/' + seg[2];
    return g;
  };

  const directoryGroups = {};
  const groupByFile = {};
  nodes.forEach((n) => {
    const g = groupOf(n.filePath);
    groupByFile[n.id] = g;
    (directoryGroups[g] = directoryGroups[g] || []).push(n.id);
  });

  // ---- B. node type groups ----
  const nodeTypeGroups = {};
  nodes.forEach((n) => (nodeTypeGroups[n.type] = nodeTypeGroups[n.type] || []).push(n.id));

  // ---- C. adjacency / fan-in / fan-out ----
  const fileFanIn = {}, fileFanOut = {};
  importEdges.forEach((e) => {
    fileFanOut[e.source] = (fileFanOut[e.source] || 0) + 1;
    fileFanIn[e.target] = (fileFanIn[e.target] || 0) + 1;
  });

  // ---- D. cross-category edges ----
  const ccMap = {};
  allEdges.forEach((e) => {
    const s = byId.get(e.source), t = byId.get(e.target);
    if (!s || !t) return;
    const k = s.type + '|' + t.type + '|' + e.type;
    ccMap[k] = (ccMap[k] || 0) + 1;
  });
  const crossCategoryEdges = Object.entries(ccMap)
    .map(([k, count]) => { const [fromType, toType, edgeType] = k.split('|'); return { fromType, toType, edgeType, count }; })
    .sort((a, b) => b.count - a.count);

  // ---- E. inter-group imports ----
  const igMap = {};
  importEdges.forEach((e) => {
    const a = groupByFile[e.source], b = groupByFile[e.target];
    if (!a || !b || a === b) return;
    const k = a + '|' + b;
    igMap[k] = (igMap[k] || 0) + 1;
  });
  const interGroupImports = Object.entries(igMap)
    .map(([k, count]) => { const [from, to] = k.split('|'); return { from, to, count }; })
    .sort((a, b) => b.count - a.count);

  // ---- F. intra-group density ----
  const intraGroupDensity = {};
  Object.keys(directoryGroups).forEach((g) => (intraGroupDensity[g] = { internalEdges: 0, totalEdges: 0, density: 0 }));
  importEdges.forEach((e) => {
    const a = groupByFile[e.source], b = groupByFile[e.target];
    if (a && intraGroupDensity[a]) intraGroupDensity[a].totalEdges++;
    if (b && intraGroupDensity[b] && b !== a) intraGroupDensity[b].totalEdges++;
    if (a && a === b) intraGroupDensity[a].internalEdges++;
  });
  Object.values(intraGroupDensity).forEach((v) => { v.density = v.totalEdges ? +(v.internalEdges / v.totalEdges).toFixed(3) : 0; });

  // ---- G. pattern matching ----
  const DIRPAT = [
    [/^(routes|api|controllers|controller|endpoints|handlers|routers|serializers|blueprints)$/, 'api'],
    [/^(services|core|lib|domain|logic|internal|signals|composables|mailers|jobs|channels)$/, 'service'],
    [/^(models|db|data|persistence|repository|entities|entity|migrations|sql|database|schema)$/, 'data'],
    [/^(components|views|pages|ui|layouts|screens)$/, 'ui'],
    [/^(middleware|plugins|interceptors|guards)$/, 'middleware'],
    [/^(utils|helpers|common|shared|tools|pkg|templatetags)$/, 'utility'],
    [/^(config|constants|env|settings|management|commands)$/, 'config'],
    [/^(__tests__|test|tests|spec|specs)$/, 'test'],
    [/^(types|interfaces|schemas|contracts|dtos|dto|request|response)$/, 'types'],
    [/^hooks$/, 'hooks'],
    [/^(store|state|reducers|actions|slices)$/, 'state'],
    [/^(assets|static|public)$/, 'assets'],
    [/^(cmd|bin)$/, 'entry'],
    [/^(docs|documentation|wiki)$/, 'documentation'],
    [/^(deploy|deployment|infra|infrastructure|docker|k8s|kubernetes|helm|charts|terraform|tf)$/, 'infrastructure'],
    [/^(\.github|\.gitlab|\.circleci)$/, 'ci-cd'],
    [/^scripts$/, 'build-tooling'],
  ];
  const patternMatches = {};
  Object.keys(directoryGroups).forEach((g) => {
    const last = g.split('/').pop();
    let label = null;
    for (const [re, l] of DIRPAT) if (re.test(last)) { label = l; break; }
    patternMatches[g] = label || 'unknown';
  });

  // file-level patterns
  const filePatterns = {};
  const P = (fp, name) => {
    if (/(\.test\.|\.spec\.|^test_|_test\.go$|Test\.java$|_spec\.rb$|Test\.php$|Tests\.cs$)/.test(name) || /(^|\/)(test_[^/]+\.py)$/.test(fp)) return 'test';
    if (/\.d\.ts$/.test(name)) return 'types';
    if (/^(Dockerfile|docker-compose)/.test(name)) return 'infrastructure';
    if (/\.(tf|tfvars)$/.test(name)) return 'infrastructure';
    if (/^Makefile$/.test(name)) return 'infrastructure';
    if (/^\.github\/workflows\//.test(fp) || /^(\.gitlab-ci\.yml|Jenkinsfile)$/.test(name)) return 'ci-cd';
    if (/\.sql$/.test(name)) return 'data';
    if (/\.(graphql|gql|proto)$/.test(name)) return 'types';
    if (/\.(md|rst)$/.test(name)) return 'documentation';
    if (/^(main|lib)\.rs$|^main\.go$|^manage\.py$|^config\.ru$|^Application\.java$|^Program\.cs$/.test(name)) return 'entry';
    if (/^(wsgi|asgi)\.py$/.test(name)) return 'config';
    if (/^(Cargo\.toml|go\.mod|Gemfile|pom\.xml|build\.gradle|composer\.json|package\.json|tsconfig\.json|requirements.*\.txt|pyproject\.toml)$/.test(name)) return 'config';
    if (/^(index\.tsx?|index\.jsx?|__init__\.py)$/.test(name)) return 'entry';
    return null;
  };
  nodes.forEach((n) => { const p = P(n.filePath, n.name || n.filePath.split('/').pop()); if (p) filePatterns[n.id] = p; });

  // ---- H. deployment topology ----
  const allPaths = nodes.map((n) => n.filePath);
  const infraFiles = allPaths.filter((p) => /(^|\/)(Dockerfile|docker-compose[^/]*|Makefile)$|\.(tf|tfvars)$|^\.github\/workflows\/|(^|\/)(k8s|kubernetes|helm|charts)\//i.test(p));
  const deploymentTopology = {
    hasDockerfile: allPaths.some((p) => /(^|\/)Dockerfile/i.test(p)),
    hasCompose: allPaths.some((p) => /docker-compose/i.test(p)),
    hasK8s: allPaths.some((p) => /(^|\/)(k8s|kubernetes|helm|charts)\//i.test(p)),
    hasTerraform: allPaths.some((p) => /\.tf$/.test(p)),
    hasCI: allPaths.some((p) => /^\.github\/workflows\/|\.gitlab-ci\.yml$|Jenkinsfile$/.test(p)),
    infraFiles,
  };

  // ---- I. data pipeline ----
  const dataPipeline = {
    schemaFiles: allPaths.filter((p) => /schemas?\.(py|ts)$|\.(sql|graphql|gql|proto|prisma)$/.test(p)),
    migrationFiles: allPaths.filter((p) => /migrations?\//.test(p)),
    dataModelFiles: allPaths.filter((p) => /models?\.(py|ts)$|\/models\//.test(p)),
    apiHandlerFiles: allPaths.filter((p) => /\/(routes|api)\/|route\.ts$|(^|\/)main\.py$|liveApi\.ts$/.test(p)),
    generatedDataFiles: allPaths.filter((p) => /^src\/data\/.*\.json$/.test(p)),
  };

  // ---- J. doc coverage ----
  const docNodes = nodes.filter((n) => n.type === 'document' || /\.(md|rst)$/.test(n.filePath));
  const groupsWithDocs = new Set();
  Object.entries(directoryGroups).forEach(([g, list]) => {
    if (list.some((id) => docNodes.find((d) => d.id === id))) groupsWithDocs.add(g);
  });
  const totalGroups = Object.keys(directoryGroups).length;
  const docCoverage = {
    groupsWithDocs: groupsWithDocs.size,
    totalGroups,
    coverageRatio: totalGroups ? +(groupsWithDocs.size / totalGroups).toFixed(2) : 0,
    undocumentedGroups: Object.keys(directoryGroups).filter((g) => !groupsWithDocs.has(g)),
  };

  // ---- K. dependency direction ----
  const pairSeen = new Set();
  const dependencyDirection = [];
  interGroupImports.forEach(({ from, to, count }) => {
    const key = [from, to].sort().join('||');
    if (pairSeen.has(key)) return;
    pairSeen.add(key);
    const rev = igMap[to + '|' + from] || 0;
    if (count > rev) dependencyDirection.push({ dependent: from, dependsOn: to, net: count - rev, forward: count, reverse: rev });
    else if (rev > count) dependencyDirection.push({ dependent: to, dependsOn: from, net: rev - count, forward: rev, reverse: count });
    else dependencyDirection.push({ dependent: from, dependsOn: to, net: 0, forward: count, reverse: rev, bidirectional: true });
  });
  dependencyDirection.sort((a, b) => b.net - a.net);

  // ---- stats ----
  const filesPerGroup = {}; Object.entries(directoryGroups).forEach(([g, l]) => (filesPerGroup[g] = l.length));
  const nodeTypeCounts = {}; Object.entries(nodeTypeGroups).forEach(([t, l]) => (nodeTypeCounts[t] = l.length));

  const topFanIn = Object.entries(fileFanIn).sort((a, b) => b[1] - a[1]).slice(0, 25);
  const topFanOut = Object.entries(fileFanOut).sort((a, b) => b[1] - a[1]).slice(0, 25);

  const result = {
    scriptCompleted: true,
    commonPrefix: prefix,
    directoryGroups,
    nodeTypeGroups,
    crossCategoryEdges,
    interGroupImports,
    intraGroupDensity,
    patternMatches,
    filePatterns,
    deploymentTopology,
    dataPipeline,
    docCoverage,
    dependencyDirection,
    fileStats: { totalFileNodes: nodes.length, filesPerGroup, nodeTypeCounts },
    fileFanIn: Object.fromEntries(topFanIn),
    fileFanOut: Object.fromEntries(topFanOut),
  };
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log('OK groups=' + totalGroups + ' files=' + nodes.length);
}

try { main(); } catch (e) { console.error(e && e.stack || String(e)); process.exit(1); }
