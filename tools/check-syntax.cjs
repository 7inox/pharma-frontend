const fs=require('node:fs');const path=require('node:path');
const ts=require('C:/Users/LENOVO/AppData/Roaming/npm/node_modules/@angular/cli/node_modules/typescript');
const printer=ts.createPrinter({newLine:ts.NewLineKind.LineFeed});let checked=0;let failed=false;
function walk(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())walk(p);else if(p.endsWith('.ts')){const content=fs.readFileSync(p,'utf8');const ast=ts.createSourceFile(p,content,ts.ScriptTarget.Latest,true);if(ast.parseDiagnostics.length){failed=true;for(const d of ast.parseDiagnostics)console.error(p+': '+ts.flattenDiagnosticMessageText(d.messageText,' '));}else{fs.writeFileSync(p,printer.printFile(ast));checked++;}}}}
walk('src');console.log('Sintaxis TypeScript: '+checked+' archivos; '+(failed?'errores':'sin errores')+'. Esta revisión no sustituye ng build.');process.exitCode=failed?1:0;

