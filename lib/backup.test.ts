import test from 'node:test';
import assert from 'node:assert/strict';
import {parseBackup,backupSummary,BACKUP_LIMIT} from './backup';
import {exportLocalBackup,importLocalBackup} from './storage';

const stamp='2026-09-06T12:00:00.000Z';
const fixture=()=>({format:'yipyip.local-backup',version:1,createdAt:stamp,data:{
 modulStatus:{willkommen:'abgeschlossen'},
 journal:[{modulId:'willkommen',frage:'Testfrage',text:'Lokale Testnotiz',erstellt:stamp}],
 spuerwerte:[{modulId:'alarm',wann:'vorher',wert:3,erstellt:stamp}],
 experimente:[{modulId:'alarm',titel:'Test',haupt:'Test',optional:'Optional',gemerkt:stamp}],
 selbsttest:{baseline:{wann:'baseline',achsen:{koerper:4},absicht:'Test',erstellt:stamp}},
 loop:{'2026-09-06':{datum:'2026-09-06',spuerKoerper:4,ankerGemacht:false}},
 modus:'roam',praxis:{werkzeug:'Test',anker:'Test'},auswahl:{'willkommen.test':'Test'},
 memory:[{id:'test-id',text:'Test',art:'vorliebe',erstellt:stamp,aktualisiert:stamp}],
}});
class FakeStorage {
 values=new Map<string,string>();failAt:string|null=null;
 getItem(key:string){return this.values.get(key)??null;}
 setItem(key:string,value:string){if(this.failAt===key){this.failAt=null;throw new Error('quota');}this.values.set(key,value);}
 removeItem(key:string){this.values.delete(key);}
}
function withStorage(run:(s:FakeStorage)=>void){
 const previous=Object.getOwnPropertyDescriptor(globalThis,'window');const s=new FakeStorage();
 Object.defineProperty(globalThis,'window',{configurable:true,value:{localStorage:s,dispatchEvent(){return true;}}});
 try{run(s);}finally{if(previous)Object.defineProperty(globalThis,'window',previous);else Reflect.deleteProperty(globalThis,'window');}
}
test('all stored data types round-trip without transferring consent',()=>withStorage(s=>{
 const input=parseBackup(JSON.stringify(fixture()));
 for(const [key,value] of Object.entries(input.data))s.setItem('mbm.v1.'+key,JSON.stringify(value));
 s.setItem('mbm.v1.engineConsent','true');s.setItem('mbm.v1.disclaimerGesehen','true');
 const backup=exportLocalBackup();assert.deepEqual(backup.data,input.data);
 assert.deepEqual(backupSummary(backup),{modules:1,notes:1,days:1,sections:10});
 assert(!JSON.stringify(backup).includes('Consent'));assert(!JSON.stringify(backup).includes('disclaimer'));
}));
test('import replaces only included data and preserves target consent and other apps',()=>withStorage(s=>{
 s.setItem('mbm.v1.engineConsent','false');s.setItem('mbm.v1.disclaimerGesehen','true');s.setItem('other.app','keep');s.setItem('mbm.v1.praxis','{"anker":"keep"}');
 const input=parseBackup(JSON.stringify({...fixture(),data:{journal:fixture().data.journal}}));
 importLocalBackup(input);
 assert.equal(s.getItem('mbm.v1.engineConsent'),'false');assert.equal(s.getItem('mbm.v1.disclaimerGesehen'),'true');assert.equal(s.getItem('other.app'),'keep');assert.equal(s.getItem('mbm.v1.praxis'),'{"anker":"keep"}');
 assert.deepEqual(JSON.parse(s.getItem('mbm.v1.journal')!),input.data.journal);
}));
test('a partial quota failure rolls back already written values',()=>withStorage(s=>{
 s.setItem('mbm.v1.modulStatus','{"old":"begonnen"}');s.setItem('mbm.v1.journal','[]');s.setItem('other.app','keep');
 const before=[...s.values].sort();s.failAt='mbm.v1.journal';
 assert.throws(()=>importLocalBackup(parseBackup(JSON.stringify(fixture()))),/vorheriger Stand/);
 assert.deepEqual([...s.values].sort(),before);
}));
test('invalid shapes, consent and prototype keys are rejected',()=>{
 for(const data of [{engineConsent:true},{journal:'wrong'},{spuerwerte:[{modulId:'alarm',wann:'vorher',wert:100,erstellt:stamp}]},{modulStatus:{a:'unknown'}},{unknown:[]}]){
  assert.throws(()=>parseBackup(JSON.stringify({...fixture(),data})));
 }
 assert.throws(()=>parseBackup(`{"format":"yipyip.local-backup","version":1,"createdAt":"${stamp}","data":{"auswahl":{"__proto__":{"polluted":true}}}}`));
 assert.throws(()=>parseBackup(JSON.stringify({...fixture(),version:2})));
 assert.equal(({} as Record<string,unknown>).polluted,undefined);
});
test('oversized files and malformed existing data fail without changing storage',()=>withStorage(s=>{
 assert.throws(()=>parseBackup(' '.repeat(BACKUP_LIMIT+1)));
 s.setItem('mbm.v1.journal','not json');assert.throws(()=>exportLocalBackup());assert.equal(s.getItem('mbm.v1.journal'),'not json');
}));
