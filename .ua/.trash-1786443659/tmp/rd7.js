const fs=require('fs');
const r=JSON.parse(fs.readFileSync('.ua/tmp/ua-file-extract-results-7.json','utf8'));
console.log('analyzed',r.filesAnalyzed,'skipped',JSON.stringify(r.filesSkipped));
for(const f of r.results){
  console.log('=== '+f.path+' lines='+f.totalLines+'/'+f.nonEmptyLines+' m='+JSON.stringify(f.metrics));
  console.log(' fn: '+(f.functions||[]).map(x=>x.name+'['+x.startLine+'-'+x.endLine+']('+(x.params||[]).join(',')+')').join(' | '));
  console.log(' cl: '+(f.classes||[]).map(x=>x.name+'['+x.startLine+'-'+x.endLine+']').join(' | '));
  console.log(' ex: '+(f.exports||[]).map(x=>x.name).join(', '));
}
