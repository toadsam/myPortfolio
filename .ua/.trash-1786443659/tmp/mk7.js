const fs=require('fs');
const path=require('path');
const d=JSON.parse(fs.readFileSync('.ua/intermediate/batches.json','utf8'));
const b=(d.batches||d).find(x=>x.batchIndex===7);
const root=process.cwd().split(path.sep).join('/');
const out={projectRoot:root, batchFiles:b.files, batchImportData:b.batchImportData};
fs.writeFileSync('.ua/tmp/ua-file-analyzer-input-7.json', JSON.stringify(out,null,1));
console.log('ok', root, b.files.length);
