const fs=require('fs');
const path=require('path');
const d=require(path.resolve('.ua/intermediate/batches.json'));
const b=(d.batches||d).find(x=>x.batchIndex===3);
fs.writeFileSync('.ua/tmp/ua-file-analyzer-input-3.json', JSON.stringify({projectRoot: process.cwd().split(path.sep).join('/'), batchFiles: b.files, batchImportData: b.batchImportData}, null, 1));
console.log('ok', b.files.length);
