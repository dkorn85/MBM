import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
const {chromium}=await import(process.env.QA_PLAYWRIGHT||'playwright');
const origin=process.env.QA_ORIGIN||'http://127.0.0.1:4410';
const out=process.env.QA_OUT||'/root/.local/state/chazon-renewal-2026-09-06/yipyip-qa';mkdirSync(out,{recursive:true});
const date='2026-09-06T12:00:00.000Z';
const note=text=>({modulId:'willkommen',frage:'Testfrage',text,erstellt:date});
const backup={format:'yipyip.local-backup',version:1,createdAt:date,data:{journal:[note('Übertragene Testnotiz')],modulStatus:{willkommen:'abgeschlossen'},loop:{'2026-09-06':{datum:'2026-09-06',ankerGemacht:true}}}};
const b=await chromium.launch({args:['--no-sandbox']});const report=[];
try{
 for(const width of [390,1440]){
  const c=await b.newContext({viewport:{width,height:900},reducedMotion:'reduce',acceptDownloads:true});
  await c.addInitScript(note=>{localStorage.setItem('mbm.v1.disclaimerGesehen','true');localStorage.setItem('mbm.v1.engineConsent','false');localStorage.setItem('mbm.v1.journal',JSON.stringify([note]));},note('Vorherige Testnotiz'));
  const p=await c.newPage();const errors=[],external=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(new URL(r.url()).origin!==origin&&!r.url().startsWith('blob:'))external.push(r.url());});
  await p.goto(origin+'/mein-weg',{waitUntil:'domcontentloaded'});await p.getByRole('heading',{name:'Deinen Weg mitnehmen'}).waitFor();
  // The saved note appears after client hydration and local storage has loaded.
  await p.getByText('Vorherige Testnotiz',{exact:true}).waitFor();
  const downloadPromise=p.waitForEvent('download');await p.getByRole('button',{name:'Sicherung speichern',exact:true}).click();
  const download=await downloadPromise;const file=out+`/backup-${width}.json`;await download.saveAs(file);const saved=JSON.parse(readFileSync(file));
  assert.equal(saved.data.journal[0].text,'Vorherige Testnotiz');assert.equal(saved.data.engineConsent,undefined);assert.equal(saved.data.disclaimerGesehen,undefined);
  await p.locator('input[type=file]').setInputFiles({name:'yipyip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
  await p.getByRole('region',{name:'Sicherung prüfen'}).waitFor();
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('mbm.v1.journal'))[0].text),'Vorherige Testnotiz');
  await p.getByRole('region',{name:'Sicherung prüfen'}).scrollIntoViewIfNeeded();await p.screenshot({path:out+`/backup-preview-${width}.png`});
  await p.getByRole('button',{name:'Diese Sicherung übernehmen'}).click();
  await p.getByRole('status').filter({hasText:'Dein gespeicherter Stand wurde übernommen.'}).waitFor();
  assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('mbm.v1.journal'))[0].text),'Übertragene Testnotiz');
  assert.equal(await p.evaluate(()=>localStorage.getItem('mbm.v1.engineConsent')),'false');
  await p.locator('input[type=file]').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...backup,data:{engineConsent:true}}))});
  await p.getByRole('status').filter({hasText:'gültige YipYip-Sicherung'}).waitFor();
  assert.equal(await p.getByRole('button',{name:'Diese Sicherung übernehmen'}).count(),0);
  for(const path of ['/','/modul/willkommen','/hilfe']){
   await p.goto(origin+path,{waitUntil:'domcontentloaded'});await p.locator('h1').first().waitFor();
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,path+': overflow');
   await p.screenshot({path:out+`/${path.replaceAll('/','-')||'home'}-${width}.png`});
  }
  assert.deepEqual(errors,[]);assert.deepEqual(external,[],'Unexpected third-party traffic');
  report.push({width,export:true,previewBeforeImport:true,restore:true,consentUnchanged:true,invalidRejected:true,externalRequests:external.length});await c.close();
 }
}finally{await b.close();}
writeFileSync(out+'/report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
