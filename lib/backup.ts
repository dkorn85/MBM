// Pure validation. Personal data is never sent to a service.
export const BACKUP_LIMIT = 4 * 1024 * 1024;
export const BACKUP_KEYS = ["modulStatus", "journal", "spuerwerte", "experimente", "selbsttest", "loop", "modus", "praxis", "auswahl", "memory"] as const;
export type BackupKey = typeof BACKUP_KEYS[number];
export type LocalBackup = {
  format: "yipyip.local-backup";
  version: 1;
  createdAt: string;
  data: Partial<Record<BackupKey, unknown>>;
};
type RecordValue = Record<string, unknown>;
function ensure(value: unknown): asserts value { if (!value) throw new Error("Die Datei enthält keine gültige YipYip-Sicherung."); }
function record(value: unknown): value is RecordValue {
  return value !== null && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}
const string = (v: unknown) => typeof v === "string" && v.length <= 100000;
const date = (v: unknown) => typeof v === "string" && v.length <= 40 && Number.isFinite(Date.parse(v));
const score = (v: unknown) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 10;
const oneOf = (v: unknown, values: string[]) => typeof v === "string" && values.includes(v);
function fields(value: unknown, required: Record<string, (v: unknown) => boolean>, optional: Record<string, (v: unknown) => boolean> = {}): value is RecordValue {
  return record(value) && Object.keys(value).every(k => Object.hasOwn(required, k) || Object.hasOwn(optional, k)) && Object.entries(required).every(([k, test]) => Object.hasOwn(value, k) && test(value[k])) && Object.entries(optional).every(([k, test]) => !Object.hasOwn(value, k) || test(value[k]));
}
function dictionary(value: unknown, test: (v: unknown) => boolean): boolean { return record(value) && Object.keys(value).length <= 20000 && Object.values(value).every(test); }
function list(value: unknown, test: (v: unknown) => boolean): boolean { return Array.isArray(value) && value.length <= 20000 && value.every(test); }
function safeTree(value: unknown, depth = 0): void {
  ensure(depth <= 12);
  if (typeof value === "string") { ensure(string(value)); return; }
  if (value && typeof value === "object") {
    ensure(Array.isArray(value) || record(value));
    for (const [key, child] of Object.entries(value)) {
      ensure(!["__proto__", "prototype", "constructor"].includes(key) && key.length <= 300);
      safeTree(child, depth + 1);
    }
  }
}
const validators: Record<BackupKey, (value: unknown) => boolean> = {
  modulStatus: v => dictionary(v, x => oneOf(x, ["offen", "begonnen", "abgeschlossen"])),
  journal: v => list(v, x => fields(x, {modulId:string, frage:string, text:string, erstellt:date})),
  spuerwerte: v => list(v, x => fields(x, {modulId:string, wann:x=>oneOf(x,["vorher","nachher"]), wert:score, erstellt:date})),
  experimente: v => list(v, x => fields(x, {modulId:string, titel:string, haupt:string, gemerkt:date}, {optional:string})),
  selbsttest: v => record(v) && Object.entries(v).every(([key, x]) => ["baseline", "nachher"].includes(key) && fields(x, {wann:y=>y===key, achsen:y=>dictionary(y,score), erstellt:date}, {anliegen:string, absicht:string})),
  loop: v => record(v) && Object.entries(v).length <= 20000 && Object.entries(v).every(([key,x]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && date(key) && fields(x, {datum:y=>y===key}, {spuerKoerper:score, spuerStimmung:score, gluecksmoment:string, ankerGemacht:y=>typeof y==='boolean'})),
  modus: v => oneOf(v,["follow","roam"]),
  praxis: v => fields(v, {}, {werkzeug:string, anker:string}),
  auswahl: v => dictionary(v,string),
  memory: v => list(v, x => fields(x, {id:string, text:string, art:y=>oneOf(y,["muster","ressource","vorliebe","kontext"]), erstellt:date, aktualisiert:date})) && (v as unknown[]).length <= 40,
};
export function parseBackup(text: string): LocalBackup {
  ensure(new TextEncoder().encode(text).length <= BACKUP_LIMIT);
  const value: unknown = JSON.parse(text);safeTree(value);
  ensure(fields(value, {format:x=>x==='yipyip.local-backup', version:x=>x===1, createdAt:date, data:record}));
  const data = value.data as RecordValue;
  ensure(Object.keys(data).length > 0);
  for (const [key, entry] of Object.entries(data)) ensure(Object.hasOwn(validators,key) && validators[key as BackupKey](entry));
  return value as LocalBackup;
}
export function backupSummary(backup: LocalBackup) {
  const d=backup.data;
  return {
    modules: record(d.modulStatus) ? Object.keys(d.modulStatus).length : 0,
    notes: Array.isArray(d.journal) ? d.journal.length : 0,
    days: record(d.loop) ? Object.keys(d.loop).length : 0,
    sections: Object.keys(d).length,
  };
}
