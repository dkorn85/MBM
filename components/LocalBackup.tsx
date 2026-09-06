"use client";
import {useRef,useState} from 'react';
import {BACKUP_LIMIT,parseBackup,backupSummary,type LocalBackup as Backup} from '@/lib/backup';
import {exportLocalBackup,importLocalBackup} from '@/lib/storage';

export default function LocalBackup(){
  const [pending,setPending]=useState<Backup|null>(null);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const input=useRef<HTMLInputElement>(null);
  const summary=pending?backupSummary(pending):null;
  function download(){
    try{
      const backup=exportLocalBackup();const url=URL.createObjectURL(new Blob([JSON.stringify(backup,null,2)],{type:'application/json'}));
      const a=document.createElement('a');a.href=url;a.download=`yipyip-sicherung-${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
      setMessage('Deine Sicherung ist als Datei zum Speichern bereit.');
    }catch(e){setMessage(e instanceof Error?e.message:'Die Sicherung konnte nicht erstellt werden.');}
  }
  async function choose(file:File|undefined){
    setPending(null);setMessage('');if(!file)return;setBusy(true);
    try{if(file.size>BACKUP_LIMIT)throw new Error('Diese Datei ist zu groß. Bitte wähle eine YipYip-Sicherung bis 4 MB.');setPending(parseBackup(await file.text()));}
    catch{setMessage('Die Datei konnte nicht gelesen werden. Bitte wähle eine gültige YipYip-Sicherung bis 4 MB.');}
    finally{setBusy(false);if(input.current)input.current.value='';}
  }
  function restore(){
    if(!pending)return;
    try{importLocalBackup(pending);setPending(null);setMessage('Dein gespeicherter Stand wurde übernommen.');}
    catch(e){setMessage(e instanceof Error?e.message:'Dein Stand konnte nicht übernommen werden.');}
  }
  return <section className="space-y-5 border-t border-border pt-8" aria-labelledby="backup-title">
    <h2 id="backup-title" className="text-2xl">Deinen Weg mitnehmen</h2>
    <p>Du kannst deinen Lernstand und deine Notizen als Datei sichern und auf einem anderen Gerät oder unter der neuen YipYip-Adresse wieder öffnen. Die Datei bleibt bei dir und wird nicht hochgeladen.</p>
    <p className="text-sm">Sie enthält auch deine persönlichen Notizen. Bewahre sie an einem passenden Ort auf. Einwilligungen werden nicht mitkopiert.</p>
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={download} className="border border-current px-4 py-3">Sicherung speichern</button>
      <button type="button" disabled={busy} onClick={()=>input.current?.click()} className="border border-current px-4 py-3 disabled:opacity-50">{busy?'Datei wird gelesen …':'Sicherung öffnen'}</button>
      <input ref={input} type="file" accept="application/json,.json" className="hidden" aria-label="YipYip-Sicherung auswählen" onChange={e=>void choose(e.target.files?.[0])}/>
    </div>
    {pending&&summary&&<div className="space-y-4 border border-current p-5" role="region" aria-label="Sicherung prüfen">
      <p>Sicherung vom {new Date(pending.createdAt).toLocaleDateString('de-DE')}: {summary.modules} Modulstände, {summary.notes} Notizen, {summary.days} Tageseinträge.</p>
      <p>Die {summary.sections} enthaltenen Datenbereiche ersetzen die entsprechenden Daten auf diesem Gerät. Speichere deinen aktuellen Stand vorher, wenn du ihn behalten möchtest.</p>
      <div className="flex flex-wrap gap-3"><button type="button" onClick={restore} className="border border-current px-4 py-3">Diese Sicherung übernehmen</button><button type="button" onClick={()=>setPending(null)} className="px-4 py-3 underline">Abbrechen</button></div>
    </div>}
    <p role="status" aria-live="polite" className="text-sm">{message}</p>
  </section>;
}
