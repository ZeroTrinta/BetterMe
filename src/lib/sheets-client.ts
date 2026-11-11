import { DAYS, FULL_DAYS, STRENGTH_DAYS, SHEET_ID, DEFAULT_START, EMPTY_DATA, FitnessData, exerciseKey, dayKey, weekKey } from "./fitness-plan";

export type SheetWrite = { range:string; values:(string|number|null)[][] };
type Response = { valueRanges?:Array<{range:string;values?:unknown[][]}> };
type Token = { access_token?:string;expires_in?:number;error?:string;error_description?:string };
type GoogleClient = { requestAccessToken:(options?:{prompt?:string})=>void };
type Gsi = { accounts:{oauth2:{initTokenClient:(options:{client_id:string;scope:string;callback:(token:Token)=>void})=>GoogleClient}} };
declare global { interface Window { google?:Gsi } }

const SCOPE="https://www.googleapis.com/auth/spreadsheets";
const SESSION_KEY="betterme:google-access-session-v1";
type StoredSession={ token:string; expiresAt:number; clientId:string };
/**
 * Keep only a short-lived access token in sessionStorage. This survives same-tab
 * refreshes but never stores a refresh token or Google client secret.
 */
export function getCachedGoogleToken(clientId:string):string|null{
  if(typeof window==="undefined" || !clientId)return null;
  try{
    const raw=sessionStorage.getItem(SESSION_KEY);
    if(!raw)return null;
    const state=JSON.parse(raw) as StoredSession;
    if(state.clientId!==clientId.trim() || state.expiresAt <= Date.now()+60_000){
      sessionStorage.removeItem(SESSION_KEY);return null;
    }
    return state.token;
  }catch{return null}
}
export function clearCachedGoogleToken():void{
  if(typeof window!=="undefined")try{sessionStorage.removeItem(SESSION_KEY)}catch{}
}
function cacheGoogleToken(clientId:string,token:Token):void{
  if(!token.access_token || typeof window==="undefined")return;
  const seconds=Math.max(60,Math.min(token.expires_in||3500,3600));
  const state:StoredSession={
    token:token.access_token,
    clientId:clientId.trim(),
    expiresAt:Date.now()+seconds*1000
  };
  try{sessionStorage.setItem(SESSION_KEY,JSON.stringify(state))}catch{}
}
const ranges=[
 "'Config'!B2",
 "'Diário de Treino'!A2:J241",
 "'Sessões'!A2:F61",
 "'Pesagens'!A2:E85",
 "'Diário Alimentar'!A2:H85",
 "'Medidas'!A2:K13"
];
export function loadGoogleLibrary():Promise<void>{
  if(typeof window==="undefined")return Promise.reject(new Error("O login só funciona no navegador."));
  if(window.google?.accounts?.oauth2)return Promise.resolve();
  return new Promise((resolve,reject)=>{
    let script=document.querySelector<HTMLScriptElement>("script[data-google-identity]");
    if(!script){
      script=document.createElement("script");
      script.src="https://accounts.google.com/gsi/client";script.async=true;script.defer=true;
      script.setAttribute("data-google-identity","true");
      document.head.appendChild(script);
    }
    script.addEventListener("load",()=>resolve(),{once:true});
    script.addEventListener("error",()=>reject(new Error("Não foi possível carregar o login Google.")),{once:true});
  });
}
export function authorizeGoogle(clientId:string):Promise<string>{
  return new Promise((resolve,reject)=>{
    if(!window.google?.accounts?.oauth2){reject(new Error("Login Google ainda carregando. Tente novamente."));return;}
    try{
      const client=window.google.accounts.oauth2.initTokenClient({
        client_id:clientId.trim(),scope:SCOPE,
        callback:res=>{
          if(res.access_token){cacheGoogleToken(clientId,res);resolve(res.access_token)}
          else reject(new Error(res.error_description||res.error||"Permissão não concedida."))
        }
      });
      // Empty prompt preserves previously approved consent. Google may still
      // ask to choose an account or reauthorize when necessary.
      client.requestAccessToken({prompt:""});
    }catch(e){reject(e)}
  });
}
async function request(path:string,token:string,options?:RequestInit){
  const res=await fetch("https://sheets.googleapis.com/v4/spreadsheets/"+encodeURIComponent(SHEET_ID)+path,{
    ...options,headers:{Authorization:"Bearer "+token,"Content-Type":"application/json",...(options?.headers||{})}
  });
  if(!res.ok){
    let message="Erro "+res.status+" ao acessar Google Sheets";
    try{const data=await res.json();message=data.error?.message||message;}catch{}
    if(res.status===401)throw new Error("Sua sessão Google expirou. Conecte novamente. "+message);
    throw new Error(message);
  }
  return res.json();
}
const num=(val:unknown):number|undefined=>{
  if(val===null||val===undefined||val==="")return undefined;
  const n=Number(String(val).replace(",","."));return Number.isFinite(n)?n:undefined;
};
export async function readSheet(token:string):Promise<FitnessData>{
  const qs=new URLSearchParams({valueRenderOption:"UNFORMATTED_VALUE",dateTimeRenderOption:"FORMATTED_STRING"});
  ranges.forEach(range=>qs.append("ranges",range));
  const result:Response=await request("/values:batchGet?"+qs.toString(),token);
  const [config,exercises,sessions,weights,nutrition,measures]=(result.valueRanges||[]).map(v=>v.values||[]);
  const data:FitnessData={...EMPTY_DATA,exercises:{},sessions:{},weights:{},nutrition:{},measures:{}};
  if(config?.[0]?.[0]){
    const value=config[0][0];
    if(typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value)) data.startDate=value;
    else if(typeof value==="string"&&/^\d{2}\/\d{2}\/\d{4}$/.test(value)){const parts=value.split("/");data.startDate=parts[2]+"-"+parts[1]+"-"+parts[0];}
    else if(typeof value==="number"&&Number.isFinite(value)){
      // UNFORMATTED_VALUE returns Google Sheets dates as serial numbers.
      const date=new Date(Date.UTC(1899,11,30)+Math.floor(value)*86400000);
      if(!Number.isNaN(date.getTime()))data.startDate=date.toISOString().slice(0,10);
    }
  }
  (exercises||[]).forEach((row,i)=>{
    const week=Math.floor(i/20)+1,slot=i%20,day=STRENGTH_DAYS[Math.floor(slot/5)],index=slot%5;
    if(week>12)return;
    const values=(row||[]).slice(6,10).map(num);
    if(values.some(v=>v!==undefined))data.exercises[exerciseKey(week,day,index)]=values.map(v=>v||0);
  });
  (sessions||[]).forEach((row,i)=>{
    const week=Math.floor(i/5)+1,day=DAYS[i%5];if(week>12)return;
    if(row?.[3]&&row[3]!=="Não iniciado")data.sessions[dayKey(week,day)]={status:String(row[3]),duration:num(row[4])};
  });
  (weights||[]).forEach((row,i)=>{
    const week=Math.floor(i/7)+1,day=FULL_DAYS[i%7];if(week>12)return;
    const value=num(row?.[3]);if(value!==undefined)data.weights[dayKey(week,day)]=value;
  });
  (nutrition||[]).forEach((row,i)=>{
    const week=Math.floor(i/7)+1,day=FULL_DAYS[i%7];if(week>12)return;
    const values=[num(row?.[3]),num(row?.[4]),num(row?.[5]),num(row?.[6])];
    if(values.some(v=>v!==undefined))data.nutrition[dayKey(week,day)]={calories:values[0],protein:values[1],water:values[2],sleep:values[3]};
  });
  (measures||[]).forEach((row,i)=>{
    const week=i+1;if(week>12)return;
    const waist=num(row?.[3]),pullups=num(row?.[5]),pushups=num(row?.[6]),note=String(row?.[10]||"");
    if(waist!==undefined||pullups!==undefined||pushups!==undefined||note)data.measures[weekKey(week)]={waist,pullups,pushups,note};
  });
  return data;
}
export async function writeSheet(token:string,writes:SheetWrite[]):Promise<void>{
  if(!writes.length)return;
  await request("/values:batchUpdate",token,{method:"POST",body:JSON.stringify({valueInputOption:"USER_ENTERED",data:writes})});
}
export function parsePending(raw:string|null):Record<string,(string|number|null)[][]>{
  try{return raw?JSON.parse(raw):{}}catch{return {}}
}
