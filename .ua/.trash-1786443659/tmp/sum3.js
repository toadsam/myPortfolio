const path=require('path');
const r=require(path.resolve('.ua/tmp/ua-file-extract-results-3.json'));
console.log('analyzed',r.filesAnalyzed,'skipped',JSON.stringify(r.filesSkipped));
for(const f of r.results){
  console.log('==',f.path,'lines',f.totalLines,'/ne',f.nonEmptyLines,JSON.stringify(f.metrics));
  const fn=(f.functions||[]).map(x=>`${x.name}[${x.startLine}-${x.endLine}](${(x.params||[]).join(',')})`);
  console.log('  fn:',fn.join(' | '));
  const cl=(f.classes||[]).map(x=>`${x.name}[${x.startLine}-${x.endLine}]{${(x.methods||[]).join(',')}}`);
  if(cl.length)console.log('  cl:',cl.join(' | '));
  console.log('  ex:',(f.exports||[]).map(x=>x.name+(x.isDefault?'*':'')).join(','));
}
