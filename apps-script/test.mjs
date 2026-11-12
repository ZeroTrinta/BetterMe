import { readFileSync } from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const server = readFileSync(new URL("./Code.gs", import.meta.url), "utf8");
const html = readFileSync(new URL("./Index.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/);
assert(script?.[1], "Index.html must contain one inline client script");
new vm.Script(server, { filename: "Code.gs" });
new vm.Script(script[1], { filename: "Index.html <script>" });

const writes=[];
const blanks=(rows,cols)=>Array.from({length:rows},()=>Array(cols).fill(""));
const fake={
  Config:{"B2":new Date("2026-11-16T12:00:00Z")},
  "Diário de Treino":{"G2:J241":blanks(240,4)},
  "Sessões":{"D2:E61":blanks(60,2)},
  Pesagens:{"D2:D85":blanks(84,1)},
  "Diário Alimentar":{"D2:G85":blanks(84,4)},
  Medidas:{"D2:K13":blanks(12,8)}
};
const book = {getSheetByName(name){
  if (!fake[name]) return null;
  return { getRange(...args){
    const where=args.join(":");
    return {
      getValue(){return fake[name][where]??""},
      getValues(){return fake[name][where]??blanks(1,Math.max(1,args[3]||1))},
      setValue(v){writes.push({name,where,value:v});return this},
      setValues(values){writes.push({name,where,value:values});return this}
    };
  }};
}};
const backend={
  SpreadsheetApp:{openById(){return book},flush(){}},
  LockService:{getScriptLock(){return {waitLock(){},releaseLock(){}}}},
  Utilities:{formatDate(date,tz,format){
    if(format==="yyyy-MM-dd")return date.toISOString().slice(0,10);
    return "16/11/2026 12:00";
  }},
  HtmlService:{createHtmlOutputFromFile(){return {setTitle(){return this},addMetaTag(){return this}}}},
  console,Date,Number,Math,String,RegExp,Error
};
vm.runInNewContext(server,backend,{filename:"Code.gs"});
const snapshot=backend.getSnapshot();
assert.equal(snapshot.startDate,"2026-11-16");
assert.deepEqual(Object.keys(snapshot.exercises),[]);
assert.deepEqual(Object.keys(snapshot.sessions),[]);
assert(backend.doGet());
const sets=[{index:0,values:[10,10,10,""]},{index:1,values:[10,10,10,""]},
  {index:2,values:[10,10,10,""]},{index:3,values:[10,10,10,""]},{index:4,values:[10,10,10,""]}];
const saved=backend.saveEntry({type:"workout",week:5,day:"Terça",entries:sets});
assert(saved.ok);
assert(writes.some(w=>w.name==="Sessões"&&w.value==="Concluído"),"3 Tuesday sets complete the week-five workout");
assert(writes.some(w=>w.name==="Diário de Treino"&&w.where==="87:7:1:4"),"Exercise row mapping");
assert.throws(()=>backend.saveEntry({type:"recovery",week:1,day:"Terça"}),/Recuperação/);
backend.saveEntry({type:"measure",week:1,waist:89,pullups:6,pushups:20,note:"=HYPERLINK(1)"});
assert(writes.some(w=>w.name==="Medidas"&&w.where==="2:11"&&String(w.value).startsWith("'")),"Notes must not become sheet formulas");

function memoryStore(){
 const stored=new Map();
 return {stored,getItem(k){return stored.get(k)||null},setItem(k,v){stored.set(k,v)},removeItem(k){stored.delete(k)}};
}
const localStorage=memoryStore(),sessionStorage=memoryStore();
const root={innerHTML:""},toast={textContent:"",classList:{add(){},remove(){}}};
const document={
 getElementById(id){return id==="root"?root:id==="toast"?toast:null},
 querySelector(){return null},addEventListener(){}
};
const remote={
  ...snapshot,
  exercises:{},sessions:{},weights:{},nutrition:{},measures:{}
};
const runner={
 success:null,failure:null,
 withSuccessHandler(fn){this.success=fn;return this},
 withFailureHandler(fn){this.failure=fn;return this},
 getSnapshot(){this.success(remote)},
 saveEntry(payload){this.success({ok:true,updatedCells:5})}
};
const google={script:{run:runner}};
const window={google,scrollTo(){},addEventListener(){}};
const client={document,google,window,localStorage,sessionStorage,navigator:{},
  setInterval(){return 1},setTimeout(){return 1},clearTimeout(){},
  Date,console,Intl,Number,Math,String,RegExp,Error
};
vm.runInNewContext(script[1],client,{filename:"Index.html <script>"});
await new Promise(resolve=>setImmediate(resolve));
assert(root.innerHTML.includes("Uma versão melhor."),"Dashboard rendered");
window.App.open("treino");
assert(root.innerHTML.includes("Descanso entre séries"));
assert(root.innerHTML.includes("Cronômetro da série"),"Timed exercises include timer");
window.App.timer("rest","start");
assert(root.innerHTML.includes("Contando"),"Rest countdown starts");
window.App.setRep("Segunda",0,0,"8");
window.App.saveWorkout();
await new Promise(resolve=>setImmediate(resolve));
const state=JSON.parse(localStorage.getItem("betterme-gas-data-v1"));
assert.equal(state.exercises["1:Segunda:0"][0],8);
assert(root.innerHTML.includes("Treino"));
console.log("BetterMe Apps Script: backend mapping, validation, HTML JavaScript and timers smoke tests passed.");
