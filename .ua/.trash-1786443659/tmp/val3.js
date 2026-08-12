const fs=require('fs'),path=require('path');
const d=require(path.resolve('.ua/intermediate/batches.json'));
const b=(d.batches||d).find(x=>x.batchIndex===3);
let expImp=0; for(const k in b.batchImportData) expImp+=b.batchImportData[k].length;
let n=0,e=0,imp=0; const ids=new Set(); const dup=[];
for(const p of [1,2]){
  const j=JSON.parse(fs.readFileSync(`.ua/intermediate/batch-3-part-${p}.json`,'utf8'));
  n+=j.nodes.length; e+=j.edges.length;
  for(const nd of j.nodes){ if(ids.has(nd.id)) dup.push(nd.id); ids.add(nd.id); }
  for(const ed of j.edges){ if(ed.type==='imports') imp++; if(ed.source===ed.target) console.log('SELF',ed.source); }
  console.log(`part${p}: nodes=${j.nodes.length} edges=${j.edges.length}`);
}
console.log('total nodes',n,'edges',e,'imports',imp,'expected imports',expImp,'dups',dup.length);
const files=new Set(b.files.map(f=>f.path));
for(const p of [1,2]){const j=JSON.parse(fs.readFileSync(`.ua/intermediate/batch-3-part-${p}.json`,'utf8'));for(const nd of j.nodes)if(nd.type==='file')files.delete(nd.filePath);}
console.log('missing file nodes:',[...files]);
