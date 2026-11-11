"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity, ArrowRight, BarChart3, CalendarDays, Check, CheckCircle2, ChevronLeft,
  ChevronRight, Cloud, CloudOff, Dumbbell, ExternalLink, Footprints, HeartPulse,
  Info, Link2, Loader2, LockKeyhole, RefreshCw, Save, Settings2, ShieldCheck,
  Target, TrendingDown, Utensils, Weight
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  DAYS, FULL_DAYS, STRENGTH_DAYS, WORKOUTS, WEEKS, MEALS, DEFAULT_START, EMPTY_DATA,
  FitnessData, FullDay, Day, StrengthDay, Nutrition, Measure, View,
  exerciseKey, dayKey, weekKey, plannedSets, exerciseRow, sessionRow, dailyRow,
  measureRow, weekForDate, currentDay, dateFor, brDate, suggestion, SHEET_ID
} from "@/lib/fitness-plan";
import { authorizeGoogle, loadGoogleLibrary, readSheet, writeSheet, SheetWrite, parsePending, getCachedGoogleToken, clearCachedGoogleToken } from "@/lib/sheets-client";
import CountdownTimer from "@/components/betterme/CountdownTimer";

const DATA_KEY="betterme:fitness-v3";
const PENDING_KEY="betterme:pending-v3";
const CLIENT_KEY="betterme:google-client-id";
const AUTHORIZED_KEY="betterme:google-authorized-before";
const GOOGLE_SHEETS="https://docs.google.com/spreadsheets/d/"+SHEET_ID+"/edit";
const ENV_CLIENT=process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID||"";
const TABS:{id:View;href:string;label:string;icon:typeof Activity}[]=[
  {id:"inicio",href:"/",label:"Início",icon:Activity},
  {id:"treino",href:"/treino",label:"Treinos",icon:Dumbbell},
  {id:"dieta",href:"/dieta",label:"Nutrição",icon:Utensils},
  {id:"progresso",href:"/insights",label:"Evolução",icon:BarChart3},
  {id:"configuracoes",href:"/configuracoes",label:"Ajustes",icon:Settings2},
];
const toValue=(s:string)=>s.trim()===""?undefined:Number(s.replace(",","."));
const fmt=(num:number,digits=1)=>num.toLocaleString("pt-BR",{maximumFractionDigits:digits,minimumFractionDigits:0});
const field="w-full min-w-0 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-3 text-sm text-white outline-none transition focus:border-lime/60 focus:ring-2 focus:ring-lime/10 placeholder:text-ink-mute";
const btn="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-lime px-4 py-2 text-sm font-bold text-[#0c1110] transition hover:bg-lime-glow active:scale-[.98] disabled:opacity-40";
const card="rounded-[22px] border border-white/[.08] bg-[#151a19] shadow-[0_12px_40px_rgba(0,0,0,.12)]";
const chip=(active:boolean)=>active?"border-lime bg-lime text-[#0b100d]":"border-white/10 bg-white/[.04] text-ink-dim hover:text-white hover:border-white/20";
function Card({children,className=""}:{children:React.ReactNode;className?:string}){return <section className={card+" "+className}>{children}</section>}
function SectionTitle({eyebrow,title,side}:{eyebrow:string;title:string;side?:React.ReactNode}){return <div className="mb-4 flex items-end justify-between gap-3"><div><p className="mb-1 text-[10px] font-bold uppercase tracking-[.2em] text-lime">{eyebrow}</p><h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{title}</h2></div>{side}</div>}
function Pct({value}:{value:number}){return <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]"><div className="h-full rounded-full bg-lime transition-all duration-300" style={{width:String(Math.max(0,Math.min(100,value)))+"%"}}/></div>}
function NumInput({label,value,onChange,placeholder,step="any"}:{label:string;value?:number;onChange:(value:number|undefined)=>void;placeholder?:string;step?:string}){return <label className="block min-w-0"><span className="mb-1.5 block text-[11px] font-medium text-ink-dim">{label}</span><input className={field} inputMode="decimal" type="number" min="0" step={step} placeholder={placeholder||"—"} value={value??""} onChange={e=>{const n=toValue(e.target.value);onChange(n!==undefined&&Number.isFinite(n)?n:undefined)}}/></label>}
function Placeholder({text}:{text:string}){return <div className="flex min-h-[175px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[.015] p-5 text-center"><BarChart3 className="h-7 w-7 text-ink-mute"/><p className="max-w-xs text-xs leading-relaxed text-ink-dim">{text}</p></div>}
function statusTone(status:string){return status==="Concluído"?"text-lime bg-lime/10 border-lime/20":status==="Parcial"?"text-amber-300 bg-amber-300/10 border-amber-300/20":"text-ink-dim bg-white/5 border-white/10"}

export default function BetterMeApp({tab}:{tab:View}){
  const [data,setData]=useState<FitnessData>(EMPTY_DATA);
  const [pending,setPending]=useState<Record<string,(string|number|null)[][]>>({});
  const [ready,setReady]=useState(false);
  const [clientId,setClientId]=useState(ENV_CLIENT);
  const [token,setToken]=useState<string|null>(null);
  const [syncing,setSyncing]=useState(false);
  const [toast,setToast]=useState("");
  const [selectedWeek,setSelectedWeek]=useState(1);
  const [trainingDay,setTrainingDay]=useState<Day>("Segunda");
  const [foodDay,setFoodDay]=useState<FullDay>("Segunda");
  const [draftSets,setDraftSets]=useState<Record<string,number[]>>({});
  const [draftFood,setDraftFood]=useState<Nutrition>({});
  const [draftWeight,setDraftWeight]=useState<number|undefined>();
  const [draftMeasure,setDraftMeasure]=useState<Measure>({});

  useEffect(()=>{
    let cancelled=false;
    let savedPending:Record<string,(string|number|null)[][]>={};
    let savedClient=ENV_CLIENT;
    try{
      const prev=localStorage.getItem(DATA_KEY);
      if(prev){const parsed=JSON.parse(prev);setData({...EMPTY_DATA,...parsed});}
      savedPending=parsePending(localStorage.getItem(PENDING_KEY));
      savedClient=localStorage.getItem(CLIENT_KEY)||ENV_CLIENT;
      setPending(savedPending);
      setClientId(savedClient);
    }catch{}
    setReady(true);
    loadGoogleLibrary().catch(()=>{});
    // A temporary access token is kept in sessionStorage, surviving a tab refresh.
    // All pending offline writes are uploaded BEFORE the remote snapshot is read.
    const cached=getCachedGoogleToken(savedClient);
    if(cached){
      setSyncing(true);
      (async()=>{
        const queued=Object.entries(savedPending).map(([range,values])=>({range,values}));
        if(queued.length)await writeSheet(cached,queued);
        const remote=await readSheet(cached);
        if(cancelled)return;
        setToken(cached);setData(remote);setPending({});
      })().catch(error=>{
        if(cancelled)return;
        clearCachedGoogleToken();
        setToken(null);
        setToast(error instanceof Error?error.message:"Não foi possível restaurar a sessão do Google.");
      }).finally(()=>{if(!cancelled)setSyncing(false)});
    }
    return ()=>{cancelled=true};
  },[]);
  useEffect(()=>{if(!ready)return;localStorage.setItem(DATA_KEY,JSON.stringify(data));},[data,ready]);
  useEffect(()=>{if(!ready)return;localStorage.setItem(PENDING_KEY,JSON.stringify(pending));},[pending,ready]);
  useEffect(()=>{if(!ready)return;localStorage.setItem(CLIENT_KEY,clientId);},[clientId,ready]);
  useEffect(()=>{
    if(ready){setSelectedWeek(weekForDate(data.startDate));setTrainingDay(currentDay());const today=new Date().getDay();setFoodDay(FULL_DAYS[today===0?6:today-1])}
  },[ready,data.startDate]);
  useEffect(()=>{
    const key=dayKey(selectedWeek,foodDay);
    setDraftFood({...data.nutrition[key]});
    setDraftWeight(data.weights[key]);
  },[data.nutrition,data.weights,selectedWeek,foodDay]);
  useEffect(()=>setDraftMeasure({...data.measures[weekKey(selectedWeek)]}),[data.measures,selectedWeek]);
  useEffect(()=>{if(!toast)return;const t=window.setTimeout(()=>setToast(""),4000);return()=>clearTimeout(t)},[toast]);

  const saveWrites=useCallback(async (writes:SheetWrite[])=>{
    if(!writes.length)return;
    const entries=Object.fromEntries(writes.map(w=>[w.range,w.values]));
    setPending(prev=>({...prev,...entries}));
    // Saving is a user gesture, so a previously authorized Google account can
    // reauthorize here when the short-lived token has expired.
    const usableToken=token && getCachedGoogleToken(clientId) ? token : null;
    const canReconnect=!!clientId && typeof window!=="undefined"
      && !!window.google?.accounts?.oauth2
      && localStorage.getItem(AUTHORIZED_KEY)==="1";
    if(!usableToken && !canReconnect){
      setToast("Salvo neste dispositivo. Conecte o Google para sincronizar.");
      return;
    }
    setSyncing(true);
    try{
      const key=usableToken||await authorizeGoogle(clientId);
      if(!usableToken)setToken(key);
      // On reconnect, upload older offline changes as well as this save.
      const sending=usableToken?entries:{...pending,...entries};
      await writeSheet(key,Object.entries(sending).map(([range,values])=>({range,values})));
      setPending(prev=>{
        const next={...prev};
        for(const [range,values] of Object.entries(sending)){
          if(JSON.stringify(next[range])===JSON.stringify(values))delete next[range];
        }
        return next;
      });
      setToast("Alterações sincronizadas com o Google Sheets.");
    }catch(e){
      if(e instanceof Error && /401|expirou|UNAUTHENTICATED/i.test(e.message)){
        clearCachedGoogleToken();setToken(null);
        setToast("O acesso Google expirou. Registro salvo neste aparelho; uma autorização pode ser necessária na próxima gravação.");
      }else setToast(e instanceof Error?e.message:"Falha ao sincronizar. Registro salvo localmente.");
    }finally{setSyncing(false)}
  },[token,clientId,pending]);

  const connect=async()=>{
    if(!clientId.trim()){setToast("Configure o ID de cliente OAuth no Google Cloud primeiro.");return;}
    setSyncing(true);
    try{
      await loadGoogleLibrary();
      const key=await authorizeGoogle(clientId);
      setToken(key);
      const writes=Object.entries(pending).map(([range,values])=>({range,values}));
      if(writes.length)await writeSheet(key,writes);
      const remote=await readSheet(key);
      setData(remote);setPending({});localStorage.setItem(AUTHORIZED_KEY,"1");setToast("Planilha conectada e sincronizada.");
    }catch(e){setToast(e instanceof Error?e.message:"Não foi possível conectar ao Google.");}
    finally{setSyncing(false)}
  };
  const refresh=async()=>{
    if(!token)return;
    setSyncing(true);
    try{
      if(Object.keys(pending).length){await writeSheet(token,Object.entries(pending).map(([range,values])=>({range,values})));setPending({})}
      setData(await readSheet(token));setToast("Dados atualizados do Google Sheets.");
    }catch(e){
      if(e instanceof Error && /401|expirou|UNAUTHENTICATED/i.test(e.message)){clearCachedGoogleToken();setToken(null)}
      setToast(e instanceof Error?e.message:"Não foi possível atualizar.");
    }
    finally{setSyncing(false)}
  };
  const currentWeek=weekForDate(data.startDate);
  const phase=WEEKS[selectedWeek-1]||WEEKS[0];
  const totalDone=Object.values(data.sessions).filter(s=>s.status==="Concluído").length;
  const weekDone=DAYS.filter(day=>data.sessions[dayKey(currentWeek,day)]?.status==="Concluído").length;
  const sortedWeights=useMemo(()=>Object.entries(data.weights).map(([key,value])=>{
    const [w,d]=key.split(":");const week=Number(w);const date=dateFor(data.startDate,week,d as FullDay);
    return {date:date.toISOString().slice(0,10),label:brDate(date),week,weight:value};
  }).filter(x=>Number.isFinite(x.weight)&&x.weight>0).sort((a,b)=>a.date.localeCompare(b.date)),[data.weights,data.startDate]);
  const currentWeight=sortedWeights.length?sortedWeights[sortedWeights.length-1].weight:93;
  const startWeight=93;
  const progressPct=Math.round((currentWeek/12)*100);
  const todayKey=dayKey(currentWeek,FULL_DAYS[new Date().getDay()===0?6:new Date().getDay()-1]);
  const todayNutrition=data.nutrition[todayKey];
  const dayStatus=data.sessions[dayKey(selectedWeek,trainingDay)]?.status||"Não iniciado";
  const currentExercises=trainingDay==="Quarta"?[]:WORKOUTS[trainingDay as StrengthDay];
  const getSets=(day:StrengthDay,index:number)=>draftSets[exerciseKey(selectedWeek,day,index)]||data.exercises[exerciseKey(selectedWeek,day,index)]||[];
  const setSets=(day:StrengthDay,index:number,slot:number,value:number|undefined)=>{
    const key=exerciseKey(selectedWeek,day,index);
    const prev=[...getSets(day,index)];
    prev[slot]=value??0;
    setDraftSets(old=>({...old,[key]:prev}));
  };

  const saveTraining=()=>{
    const sessionStatus=trainingDay==="Quarta"?"Concluído":currentExercises.every((ex,index)=>{
      const values=getSets(trainingDay as StrengthDay,index);
      return values.filter(v=>v>0).length>=plannedSets(selectedWeek,ex);
    })?"Concluído":"Parcial";
    const key=dayKey(selectedWeek,trainingDay);
    const exerciseChanges:Record<string,number[]>={};
    const writes:SheetWrite[]=[];
    if(trainingDay!=="Quarta"){
      currentExercises.forEach((ex,index)=>{
        const exKey=exerciseKey(selectedWeek,trainingDay as StrengthDay,index);
        const values=getSets(trainingDay as StrengthDay,index);
        exerciseChanges[exKey]=values;
        const row=exerciseRow(selectedWeek,trainingDay as StrengthDay,index);
        writes.push({range:"'Diário de Treino'!G"+row+":J"+row,values:[[0,1,2,3].map(i=>values[i]||"")]});
      });
    }
    writes.push({range:"'Sessões'!D"+sessionRow(selectedWeek,trainingDay),values:[[sessionStatus]]});
    setData(prev=>({...prev,exercises:{...prev.exercises,...exerciseChanges},sessions:{...prev.sessions,[key]:{status:sessionStatus}}}));
    void saveWrites(writes);
  };
  const saveFood=()=>{
    const key=dayKey(selectedWeek,foodDay),row=dailyRow(selectedWeek,foodDay);
    setData(prev=>({...prev,nutrition:{...prev.nutrition,[key]:draftFood}}));
    void saveWrites([{range:"'Diário Alimentar'!D"+row+":G"+row,values:[[draftFood.calories??"",draftFood.protein??"",draftFood.water??"",draftFood.sleep??""]]}]);
  };
  const saveWeight=()=>{
    const key=dayKey(selectedWeek,foodDay),row=dailyRow(selectedWeek,foodDay);
    setData(prev=>{const weights={...prev.weights};if(draftWeight!==undefined&&draftWeight>0)weights[key]=draftWeight;else delete weights[key];return {...prev,weights}});
    void saveWrites([{range:"'Pesagens'!D"+row,values:[[draftWeight??""]]}]);
  };
  const saveMeasure=()=>{
    const key=weekKey(selectedWeek),row=measureRow(selectedWeek);
    setData(prev=>({...prev,measures:{...prev.measures,[key]:draftMeasure}}));
    void saveWrites([
      {range:"'Medidas'!D"+row,values:[[draftMeasure.waist??""]]},
      {range:"'Medidas'!F"+row+":G"+row,values:[[draftMeasure.pullups??"",draftMeasure.pushups??""]]},
      {range:"'Medidas'!K"+row,values:[[draftMeasure.note??""]]}
    ]);
  };
  const updateStart=async(value:string)=>{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return;
    setData(prev=>({...prev,startDate:value}));
    const parts=value.split("-");
    const serial=Math.round((Date.UTC(Number(parts[0]),Number(parts[1])-1,Number(parts[2]))-Date.UTC(1899,11,30))/86400000);
    await saveWrites([{range:"'Config'!B2",values:[[serial]]}]);
  };
  const NavItem=({item}:{item:typeof TABS[number]})=>{
    const Icon=item.icon;const active=tab===item.id;
    return <Link href={item.href} className={"group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition "+(active?"bg-lime/10 text-lime":"text-ink-dim hover:bg-white/[.05] hover:text-white")} aria-current={active?"page":undefined}><Icon className="h-[19px] w-[19px]"/><span>{item.label}</span>{active&&<div className="ml-auto h-1.5 w-1.5 rounded-full bg-lime"/>}</Link>
  };

  return <div className="mx-auto min-h-screen max-w-[1500px] lg:flex">
    <aside className="hidden w-[242px] shrink-0 flex-col border-r border-white/[.07] px-4 pb-8 pt-8 lg:sticky lg:top-0 lg:flex lg:h-screen">
      <Link href="/" className="flex items-center gap-3 px-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime text-[#0b100d]"><Activity size={23} strokeWidth={2.8}/></div><div><p className="text-lg font-black leading-none tracking-[-.07em]">BETTER<span className="text-lime">ME.</span></p><p className="mt-1 text-[9px] font-semibold tracking-[.22em] text-ink-mute">PERFORMANCE HUB</p></div></Link>
      <p className="mb-3 mt-12 px-3 text-[10px] font-bold uppercase tracking-widest text-ink-mute">Navegação</p>
      <nav className="space-y-1">{TABS.map(item=><NavItem item={item} key={item.id}/>)}</nav>
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.035] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[.17em] text-lime">Ciclo atual</p>
        <p className="mt-2 text-2xl font-bold">Semana {currentWeek}<span className="text-ink-mute">/12</span></p>
        <div className="mt-3"><Pct value={progressPct}/></div>
        <p className="mt-2 text-xs text-ink-dim">{WEEKS[currentWeek-1]?.phase}</p>
      </div>
      <div className="mt-4 flex items-center gap-2 px-3 text-xs text-ink-mute">{token?<Cloud size={14} className="text-lime"/>:<CloudOff size={14}/>} {token?"Sincronizado com Google":"Modo local"}</div>
    </aside>

    <main className="relative min-w-0 flex-1 pb-28 lg:pb-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[360px] bg-[radial-gradient(ellipse_at_top,rgba(186,244,103,.08),transparent_65%)]"/>
      <div className="relative mx-auto max-w-[1120px] px-4 pt-6 sm:px-7 sm:pt-9 lg:px-10">
        <header className="mb-8 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 lg:hidden"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime text-[#0b100d]"><Activity size={21} strokeWidth={2.7}/></div><span className="font-black tracking-tight">BETTER<span className="text-lime">ME.</span></span></Link>
          <div className="hidden lg:block"><p className="text-xs text-ink-dim">Seu progresso, um dia de cada vez.</p></div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={()=>void refresh()} disabled={!token||syncing} title="Atualizar dados" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-ink-dim hover:text-white disabled:opacity-30"><RefreshCw className={"h-4 w-4 "+(syncing?"animate-spin":"")}/></button>
            <Link href="/configuracoes" className={"flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold "+(token?"border-lime/25 bg-lime/10 text-lime":"border-white/10 bg-white/5 text-ink-dim")}><span className={"h-1.5 w-1.5 rounded-full "+(token?"bg-lime":"bg-amber-400")}/>{token?"Google conectado":"Dados locais"}</Link>
          </div>
        </header>

        {tab==="inicio"&&<>
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[.25em] text-lime">A jornada é sua · {new Date().toLocaleDateString("pt-BR",{day:"2-digit",month:"long"})}</p>
            <h1 className="max-w-[760px] text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.04] tracking-[-.065em]">Uma versão melhor.<br/><span className="text-lime">Um dia de cada vez.</span></h1>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-dim">Treinos de calistenia, alimentação e evolução física organizados em um só lugar.</p>
          </div>
          <div className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Card className="p-4 sm:p-5"><p className="mb-2 text-xs text-ink-dim">Peso atual</p><p className="text-3xl font-bold tracking-tight">{fmt(currentWeight)}<span className="ml-1 text-sm font-normal text-ink-dim">kg</span></p><p className="mt-2 text-[11px] text-ink-mute">{sortedWeights.length?"Última pesagem registrada":"Referência inicial: 93 kg"}</p></Card>
            <Card className="p-4 sm:p-5"><p className="mb-2 text-xs text-ink-dim">Treinos da semana</p><p className="text-3xl font-bold tracking-tight">{weekDone}<span className="ml-1 text-sm font-normal text-ink-dim">/5</span></p><p className="mt-2 text-[11px] text-ink-mute">{totalDone} sessões no ciclo</p></Card>
            <Card className="p-4 sm:p-5"><p className="mb-2 text-xs text-ink-dim">Calorias hoje</p><p className="text-3xl font-bold tracking-tight">{todayNutrition?.calories??"—"}<span className="ml-1 text-sm font-normal text-ink-dim">kcal</span></p><p className="mt-2 text-[11px] text-ink-mute">Alvo inicial: 2.450 kcal</p></Card>
            <Card className="p-4 sm:p-5"><p className="mb-2 text-xs text-ink-dim">Proteína hoje</p><p className="text-3xl font-bold tracking-tight">{todayNutrition?.protein??"—"}<span className="ml-1 text-sm font-normal text-ink-dim">g</span></p><p className="mt-2 text-[11px] text-ink-mute">Meta: 170 g</p></Card>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.35fr_.9fr]">
            <Card className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,rgba(192,243,100,.16),transparent_63%),#151a19] p-5 sm:p-7">
              <div className="relative z-10"><div className="mb-5 flex items-center justify-between"><span className="rounded-full border border-lime/20 bg-lime/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-lime">Seu plano</span><span className="text-xs text-ink-dim">12 semanas</span></div>
                <h2 className="text-3xl font-semibold tracking-tight">Semana {currentWeek}<span className="text-ink-mute"> / 12</span></h2>
                <p className="mt-2 text-sm text-ink-dim">{WEEKS[currentWeek-1]?.phase} — {WEEKS[currentWeek-1]?.focus}</p>
                <div className="mb-6 mt-7"><div className="mb-2 flex justify-between text-xs text-ink-dim"><span>Progresso do ciclo</span><span className="font-bold text-lime">{progressPct}%</span></div><Pct value={progressPct}/></div>
                <Link href="/treino" className={btn}>Abrir meu treino <ArrowRight size={17}/></Link>
              </div>
            </Card>
            <Card className="p-5 sm:p-6">
              <SectionTitle eyebrow="Consistência" title="Sua semana" side={<span className="text-xs text-ink-mute">{weekDone}/5 feitos</span>}/>
              <div className="grid grid-cols-5 gap-2">{DAYS.map(day=>{const status=data.sessions[dayKey(currentWeek,day)]?.status;return <div key={day} className="text-center"><div className={"mx-auto flex h-12 w-full max-w-[58px] items-center justify-center rounded-xl border "+(status==="Concluído"?"border-lime/30 bg-lime/15 text-lime":"border-white/10 bg-white/[.035] text-ink-mute")}>{status==="Concluído"?<Check size={18}/>:day.slice(0,1)}</div><p className="mt-2 text-[10px] text-ink-dim">{day.slice(0,3)}</p></div>})}</div>
              <p className="mt-6 text-xs leading-relaxed text-ink-dim">Quarta é dia de caminhada e mobilidade. Sábado e domingo são dias de descanso ou caminhada leve.</p>
            </Card>
            <Card className="p-5 sm:p-6"><SectionTitle eyebrow="Tendência" title="Evolução do peso" side={<Link href="/insights" className="flex items-center gap-1 text-xs text-lime">Detalhes <ArrowRight size={14}/></Link>}/><WeightChart points={sortedWeights}/></Card>
            <Card className="p-5 sm:p-6"><SectionTitle eyebrow="Próximos passos" title="Seu foco agora"/><div className="space-y-4">
              {[{icon:Dumbbell,title:"Registrar as séries",text:"Repetições e progressão no treino." ,href:"/treino"},{icon:Utensils,title:"Preencher alimentação",text:"Calorias, proteína, água e sono.",href:"/dieta"},{icon:Weight,title:"Anotar medidas",text:"Peso e cintura para ver tendências.",href:"/insights"}].map(x=>{const Icon=x.icon;return <Link key={x.title} href={x.href} className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-white/5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[.06] text-lime"><Icon size={18}/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{x.title}</span><span className="block text-xs text-ink-dim">{x.text}</span></span><ArrowRight size={16} className="text-ink-mute"/></Link>})}
            </div></Card>
          </div>
        </>}

        {tab==="treino"&&<>
          <PageIntro tag="Treino do dia" title="Construa sua força." subtitle="Registre cada série. O próximo passo aparece automaticamente quando você estiver pronto."/>
          <WeekPicker week={selectedWeek} setWeek={setSelectedWeek}/>
          <div className="mb-5 grid grid-cols-5 gap-2">{DAYS.map(day=><button key={day} onClick={()=>setTrainingDay(day)} className={"rounded-xl border px-1 py-3 text-xs font-semibold transition "+chip(day===trainingDay)}>{day.slice(0,3)}</button>)}</div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-widest text-lime">{phase.phase}</p><h2 className="mt-1 text-xl font-bold">{trainingDay==="Quarta"?"Recuperação ativa":trainingDay==="Segunda"||trainingDay==="Quinta"?"Treino superior":"Treino inferior"}</h2><p className="mt-1 text-xs text-ink-dim">{phase.focus}</p></div><span className={"rounded-full border px-3 py-1.5 text-xs "+statusTone(dayStatus)}>{dayStatus}</span></div>
          {trainingDay==="Quarta"?<Card className="p-6"><Footprints className="mb-4 text-lime" size={32}/><h3 className="text-xl font-semibold">Caminhada e mobilidade</h3><p className="mt-2 text-sm text-ink-dim">Faça {phase.minutes} minutos de caminhada e aproximadamente 10 minutos de mobilidade de ombros, quadril e tornozelos. Mantenha uma intensidade confortável.</p><button onClick={saveTraining} className={btn+" mt-6"}><CheckCircle2 size={17}/> Marcar recuperação como concluída</button></Card>:<>
            <div className="space-y-3">{currentExercises.map((ex,index)=>{const day=trainingDay as StrengthDay,sets=getSets(day,index),count=plannedSets(selectedWeek,ex),tip=suggestion(selectedWeek,ex,sets);return <Card className="p-4 sm:p-5" key={ex.name}><div className="flex flex-wrap items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime/10 font-bold text-lime">{String(index+1).padStart(2,"0")}</div><div className="min-w-0 flex-1"><p className="text-[10px] uppercase tracking-wider text-lime">{ex.focus}</p><h3 className="mt-1 text-base font-semibold">{ex.name}</h3><p className="mt-1 text-xs text-ink-dim">{count} séries × {ex.min}–{ex.max} {ex.seconds?"segundos":"repetições"}</p></div></div>
              <div className="mt-4 grid grid-cols-4 gap-2">{Array.from({length:count},(_,slot)=><label key={slot} className="block"><span className="mb-1 block text-center text-[10px] text-ink-mute">Série {slot+1}</span><input type="number" inputMode="numeric" min="0" step="1" className={field+" text-center font-semibold"} placeholder="—" value={sets[slot]||""} onChange={event=>setSets(day,index,slot,event.target.value===""?undefined:Number(event.target.value))}/></label>)}</div>
              {ex.seconds && <CountdownTimer
                id={"exercise-"+selectedWeek+"-"+day+"-"+index}
                label="Cronômetro da série"
                initialSeconds={ex.min}
                presets={ex.min===ex.max?[ex.min]:[ex.min,ex.max]}
                canRecord={sets.filter(value=>value>0).length<count}
                recordLabel="Registrar tempo na próxima série"
                onRecord={(seconds)=>{
                  const slot=Array.from({length:count},(_,i)=>i).find(i=>!sets[i]||sets[i]<=0);
                  if(slot!==undefined)setSets(day,index,slot,seconds);
                }}
              />}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><span className={"rounded-full px-2.5 py-1 text-[11px] font-medium "+(tip.tone==="good"?"bg-lime/10 text-lime":tip.tone==="warning"?"bg-amber-400/10 text-amber-300":"bg-white/5 text-ink-dim")}>{tip.text}</span><span className="text-[11px] text-ink-mute">Alternativa: {ex.alternative}</span></div>
              <p className="mt-2 text-[11px] text-ink-mute">{ex.tip}</p>
            </Card>})}</div>
            <Card className="mt-4 p-4 sm:p-5"><h3 className="font-semibold">Descanso entre séries</h3><p className="mt-1 text-xs text-ink-dim">Selecione 60, 90, 120 ou 150 segundos. O contador segue funcionando com o celular bloqueado e ao trocar de página.</p><CountdownTimer id="rest-global" label="Timer de descanso" initialSeconds={90} presets={[60,90,120,150]}/></Card>
            <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-lime/15 bg-lime/[.045] p-4"><p className="max-w-md text-xs leading-relaxed text-ink-dim">A planilha sugerirá progredir quando todas as séries planejadas chegarem ao máximo com boa técnica. Não é obrigação chegar à falha.</p><button onClick={saveTraining} className={btn+" shrink-0"} disabled={syncing}><Save size={17}/> Salvar treino</button></div>
          </>}
          <p className="mt-5 text-xs text-ink-mute">Se sentir dor aguda nas articulações, interrompa o movimento. Não use cadeiras instáveis ou apoios improvisados para barras.</p>
        </>}

        {tab==="dieta"&&<>
          <PageIntro tag="Nutrição" title="Coma para evoluir." subtitle="Metas iniciais de referência: 2.450 kcal e 170 g de proteína. Sem dieta extrema."/>
          <WeekPicker week={selectedWeek} setWeek={setSelectedWeek}/>
          <DayPicker selected={foodDay} onSelect={setFoodDay}/>
          <div className="mb-4 grid grid-cols-2 gap-3"><Card className="p-5"><p className="text-xs text-ink-dim">Calorias registradas</p><div className="mt-2 flex items-baseline gap-1"><p className="text-3xl font-bold">{draftFood.calories??"—"}</p><p className="text-xs text-ink-mute">/ 2.450 kcal</p></div><div className="mt-4"><Pct value={((draftFood.calories||0)/2450)*100}/></div></Card><Card className="p-5"><p className="text-xs text-ink-dim">Proteína registrada</p><div className="mt-2 flex items-baseline gap-1"><p className="text-3xl font-bold">{draftFood.protein??"—"}</p><p className="text-xs text-ink-mute">/ 170 g</p></div><div className="mt-4"><Pct value={((draftFood.protein||0)/170)*100}/></div></Card></div>
          <Card className="mb-6 p-5 sm:p-6"><SectionTitle eyebrow="Check-in diário" title="Registre sua alimentação"/><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><NumInput label="Calorias (kcal)" value={draftFood.calories} onChange={v=>setDraftFood(p=>({...p,calories:v}))}/><NumInput label="Proteína (g)" value={draftFood.protein} onChange={v=>setDraftFood(p=>({...p,protein:v}))}/><NumInput label="Água (L)" value={draftFood.water} onChange={v=>setDraftFood(p=>({...p,water:v}))}/><NumInput label="Sono (horas)" value={draftFood.sleep} onChange={v=>setDraftFood(p=>({...p,sleep:v}))}/></div><div className="mt-4 flex justify-end"><button className={btn} onClick={saveFood}><Save size={17}/> Salvar dia</button></div></Card>
          <SectionTitle eyebrow="Guia alimentar" title="Cardápio de referência" side={<span className="text-xs text-ink-mute">≈ 2.415 kcal / 171 g</span>}/><div className="grid gap-3 md:grid-cols-2">{MEALS.map((meal,index)=><Card key={meal.title} className="p-4"><div className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime/10 text-lime"><span className="font-bold">{String(index+1).padStart(2,"0")}</span></div><div><h3 className="font-semibold">{meal.title}</h3><p className="mt-1 text-xs leading-relaxed text-ink-dim">{meal.description}</p><p className="mt-3 text-xs font-medium text-lime">{meal.calories} kcal · {meal.protein} g proteína</p></div></div></Card>)}</div>
          <p className="mt-5 text-xs leading-relaxed text-ink-mute">As porções são aproximadas, não prescrição individual. A faixa inicial sugerida é 2.400–2.500 kcal; ajuste com base na evolução da cintura, peso e força ao longo de 2–3 semanas.</p>
        </>}

        {tab==="progresso"&&<>
          <PageIntro tag="Evolução" title="O progresso aparece." subtitle="Mais importante que um dia isolado é a tendência das últimas semanas."/>
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4"><Card className="p-4"><p className="text-xs text-ink-dim">Peso atual</p><p className="mt-2 text-2xl font-bold">{fmt(currentWeight)} <span className="text-xs font-normal text-ink-mute">kg</span></p></Card><Card className="p-4"><p className="text-xs text-ink-dim">Variação</p><p className={"mt-2 text-2xl font-bold "+(currentWeight<startWeight?"text-lime":"text-white")}>{currentWeight===startWeight?"—":(currentWeight>startWeight?"+":"")+fmt(currentWeight-startWeight)+" kg"}</p></Card><Card className="p-4"><p className="text-xs text-ink-dim">Sessões feitas</p><p className="mt-2 text-2xl font-bold">{totalDone} <span className="text-xs font-normal text-ink-mute">/ 60</span></p></Card><Card className="p-4"><p className="text-xs text-ink-dim">Meta ilustrativa</p><p className="mt-2 text-2xl font-bold">87–90 <span className="text-xs font-normal text-ink-mute">kg</span></p></Card></div>
          <Card className="mb-6 p-5 sm:p-6"><SectionTitle eyebrow="Tendência" title="Histórico do peso"/><WeightChart points={sortedWeights}/></Card>
          <WeekPicker week={selectedWeek} setWeek={setSelectedWeek}/>
          <DayPicker selected={foodDay} onSelect={setFoodDay}/>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5"><SectionTitle eyebrow="Pesagem" title="Peso no dia"/><NumInput label="Peso em kg" value={draftWeight} onChange={setDraftWeight} placeholder="Ex.: 92,4"/><p className="mt-3 text-xs text-ink-mute">Registre de 3 a 4 manhãs por semana, nas mesmas condições. A planilha calcula a média automaticamente.</p><button className={btn+" mt-5 w-full"} onClick={saveWeight}><Save size={17}/> Salvar pesagem</button></Card>
            <Card className="p-5"><SectionTitle eyebrow="Avaliação semanal" title="Medidas e desempenho"/><div className="grid grid-cols-2 gap-3"><NumInput label="Cintura (cm)" value={draftMeasure.waist} onChange={v=>setDraftMeasure(p=>({...p,waist:v}))}/><NumInput label="Máx. barras" value={draftMeasure.pullups} onChange={v=>setDraftMeasure(p=>({...p,pullups:v}))} step="1"/><NumInput label="Máx. flexões" value={draftMeasure.pushups} onChange={v=>setDraftMeasure(p=>({...p,pushups:v}))} step="1"/></div><label className="mt-3 block text-[11px] text-ink-dim">Notas<input className={field+" mt-1"} placeholder="Como foi esta semana?" value={draftMeasure.note||""} onChange={e=>setDraftMeasure(p=>({...p,note:e.target.value}))}/></label><button className={btn+" mt-5 w-full"} onClick={saveMeasure}><Save size={17}/> Salvar avaliação</button></Card>
          </div>
          <Card className="mt-5 p-5"><SectionTitle eyebrow="Evolução semanal" title="As 12 semanas"/><div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-12">{WEEKS.map((week,i)=>{const w=i+1,done=DAYS.filter(day=>data.sessions[dayKey(w,day)]?.status==="Concluído").length;return <button key={w} onClick={()=>setSelectedWeek(w)} className={"rounded-xl border p-2 text-center "+chip(w===selectedWeek)}><p className="text-[10px]">SEM</p><p className="mt-1 font-bold">{w}</p><p className="mt-1 text-[10px] opacity-70">{done}/5</p></button>})}</div></Card>
        </>}

        {tab==="configuracoes"&&<>
          <PageIntro tag="Sistema" title="Seus dados. Seu controle." subtitle="Use localmente ou conecte sua conta Google para ler e escrever na planilha privada."/>
          <Card className="mb-4 overflow-hidden p-5 sm:p-7"><div className="flex items-start gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-lime/10 text-lime">{token?<Cloud size={22}/>:<LockKeyhole size={22}/>}</span><div><h2 className="text-xl font-semibold">Google Sheets</h2><p className="mt-1 text-xs leading-relaxed text-ink-dim">{token?"Conexão ativa nesta sessão. Alterações salvas pelo site são enviadas à planilha.":"A planilha fica privada. A conexão é restaurada automaticamente quando a autorização temporária ainda está válida. Depois de expirar, o Google pode pedir nova autorização."}</p></div></div>
            <div className="mt-5 space-y-3"><label className="block"><span className="mb-1.5 block text-xs text-ink-dim">ID do cliente OAuth (tipo: aplicativo Web)</span><input value={clientId} onChange={e=>setClientId(e.target.value)} className={field} placeholder="000000000000-...apps.googleusercontent.com"/></label>
              <p className="text-[11px] leading-relaxed text-ink-mute">Não insira senha, chave privada nem segredo do cliente. Este campo aceita apenas o Client ID público.</p>
              <div className="flex flex-wrap gap-2"><button onClick={()=>void connect()} disabled={syncing||!clientId.trim()} className={btn}>{syncing?<Loader2 size={16} className="animate-spin"/>:<Link2 size={16}/>} {token?"Reconectar":"Conectar ao Google"}</button><button onClick={()=>void refresh()} disabled={!token||syncing} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-ink-dim disabled:opacity-40"><RefreshCw size={16}/> Atualizar</button><a href={GOOGLE_SHEETS} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm text-ink-dim"><ExternalLink size={16}/> Abrir planilha</a></div>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs text-ink-dim"><ShieldCheck size={16} className="shrink-0 text-lime"/><span>{Object.keys(pending).length} alterações aguardando sincronização. O token temporário fica somente nesta aba (sessionStorage). Ao expirar, os dados continuam salvos offline até a próxima autorização.</span></div>
            </div>
          </Card>
          <Card className="mb-4 p-5 sm:p-7"><SectionTitle eyebrow="Configuração inicial" title="Ative o acesso Google"/><ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-ink-dim"><li>Abra o <a className="text-lime underline" href="https://console.cloud.google.com/apis/library/sheets.googleapis.com" target="_blank" rel="noreferrer">Google Cloud Console</a>, selecione um projeto e habilite a Google Sheets API.</li><li>Configure a tela de consentimento OAuth. Em modo de teste, adicione sua conta Google como usuário de teste.</li><li>Crie um ID de cliente OAuth para <strong className="text-white">Aplicativo da Web</strong> com origem JavaScript autorizada <code className="text-lime">https://zerotrinta.github.io</code>. Para testes locais, adicione também <code className="text-lime">http://localhost:3000</code>.</li><li>Cole o Client ID acima, conecte com a conta que tem acesso à planilha e confirme as permissões.</li></ol><p className="mt-4 text-xs leading-relaxed text-ink-mute">Nunca publique a planilha para “qualquer pessoa com o link”. O site não precisa de Supabase, Firebase, senha do Google nem chave de serviço.</p></Card>
          <Card className="p-5 sm:p-7"><SectionTitle eyebrow="Personalização" title="Seu ciclo"/><div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-xs text-ink-dim">Data de início (segunda-feira)</span><input className={field} type="date" value={data.startDate} onChange={e=>void updateStart(e.target.value)}/></label><div className="rounded-xl border border-white/10 bg-white/[.03] p-3"><p className="text-xs text-ink-dim">Dados de partida</p><p className="mt-2 font-semibold">26 anos · 1,79 m · 93 kg</p><p className="mt-1 text-xs text-ink-mute">Plano inicial de 12 semanas</p></div></div><p className="mt-4 text-xs text-ink-mute">No modo local, as informações ficam somente neste navegador. Evite limpar os dados do navegador antes de conectar e sincronizar.</p></Card>
        </>}
      </div>
    </main>

    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0d1211]/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-xl lg:hidden"><div className="mx-auto flex max-w-lg justify-between">{TABS.map(item=>{const Icon=item.icon;return <Link href={item.href} key={item.id} className={"flex min-w-[62px] flex-col items-center gap-1 rounded-xl px-1 py-2 "+(tab===item.id?"text-lime":"text-ink-mute")} aria-label={item.label}><Icon size={20} strokeWidth={tab===item.id?2.5:1.8}/><span className="text-[9px] font-medium">{item.label}</span></Link>})}</div></nav>
    {toast&&<div role="status" className="fixed bottom-24 left-1/2 z-[80] w-[min(92vw,420px)] -translate-x-1/2 rounded-2xl border border-white/15 bg-[#202a26] px-4 py-3 text-sm text-white shadow-2xl lg:bottom-6">{toast}</div>}
  </div>;
}
function WeekPicker({week,setWeek}:{week:number;setWeek:(value:number)=>void}){const phase=WEEKS[week-1];return <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-white/[.08] bg-white/[.03] px-4 py-3"><button aria-label="Semana anterior" disabled={week<=1} onClick={()=>setWeek(Math.max(1,week-1))} className="rounded-lg p-2 text-ink-dim disabled:opacity-20"><ChevronLeft size={20}/></button><div className="text-center"><p className="text-sm font-semibold">Semana {week} <span className="text-ink-mute">/ 12</span></p><p className="text-[11px] text-lime">{phase.phase}</p></div><button aria-label="Próxima semana" disabled={week>=12} onClick={()=>setWeek(Math.min(12,week+1))} className="rounded-lg p-2 text-ink-dim disabled:opacity-20"><ChevronRight size={20}/></button></div>}
function DayPicker({selected,onSelect}:{selected:FullDay;onSelect:(value:FullDay)=>void}){return <div className="mb-5 flex gap-2 overflow-x-auto pb-2">{FULL_DAYS.map(day=><button key={day} onClick={()=>onSelect(day)} className={"min-w-[56px] shrink-0 rounded-xl border px-3 py-2.5 text-xs font-semibold "+chip(day===selected)}>{day.slice(0,3)}</button>)}</div>}
function PageIntro({tag,title,subtitle}:{tag:string;title:string;subtitle:string}){return <div className="mb-7"><p className="mb-2 text-xs font-bold uppercase tracking-[.22em] text-lime">{tag}</p><h1 className="text-4xl font-bold tracking-[-.055em] sm:text-5xl">{title}</h1><p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-dim">{subtitle}</p></div>}
function WeightChart({points}:{points:{date:string;label:string;weight:number}[]}){if(points.length<2)return <Placeholder text="Registre pelo menos duas pesagens na aba Evolução para visualizar a tendência do seu peso."/>;return <div className="h-[205px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={points} margin={{top:12,right:12,left:-22,bottom:0}}><defs><linearGradient id="betterme-weight" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#c7f76b" stopOpacity={.3}/><stop offset="100%" stopColor="#c7f76b" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(255,255,255,.065)" strokeDasharray="3 6"/><XAxis dataKey="label" tickLine={false} axisLine={false} tick={{fill:"#89948b",fontSize:10}} minTickGap={22}/><YAxis domain={["dataMin - 2","dataMax + 2"]} tickLine={false} axisLine={false} tick={{fill:"#89948b",fontSize:10}} width={42}/><Tooltip contentStyle={{background:"#1b2520",border:"1px solid #3a473e",borderRadius:12,color:"#fff"}} formatter={(value:number)=>[fmt(value)+" kg","Peso"]}/><Area dataKey="weight" type="monotone" fill="url(#betterme-weight)" stroke="#c7f76b" strokeWidth={3} dot={{fill:"#c7f76b",stroke:"#0d1211",strokeWidth:2,r:3}}/></AreaChart></ResponsiveContainer></div>}
