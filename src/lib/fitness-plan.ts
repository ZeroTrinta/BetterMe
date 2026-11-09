export const SHEET_ID = "16CmKhI08ToWywfIybGsPqW_V5zQcClt0ajh-ELKfW08";
export const DEFAULT_START = "2026-11-16";
export const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"] as const;
export const STRENGTH_DAYS = ["Segunda", "Terça", "Quinta", "Sexta"] as const;
export const FULL_DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"] as const;
export type Day = typeof DAYS[number];
export type StrengthDay = typeof STRENGTH_DAYS[number];
export type FullDay = typeof FULL_DAYS[number];
export type View = "inicio" | "treino" | "dieta" | "progresso" | "configuracoes";
export type Exercise = { name: string; focus: string; sets: number; min: number; max: number; alternative: string; tip: string; seconds?: boolean };
export const WORKOUTS: Record<StrengthDay, Exercise[]> = {
  Segunda: [
    { name:"Barra fixa pronada",focus:"Costas e bíceps",sets:4,min:4,max:8,alternative:"Barra com pés apoiados ou negativas",tip:"Suba sem balançar; mantenha 1–3 repetições na reserva." },
    { name:"Flexão tradicional",focus:"Peito e tríceps",sets:4,min:8,max:15,alternative:"Flexão inclinada",tip:"Corpo alinhado; cotovelos confortáveis." },
    { name:"Flexão pike",focus:"Ombros",sets:3,min:6,max:10,alternative:"Pike com mãos elevadas",tip:"Quadril alto, pescoço neutro." },
    { name:"Retração escapular na barra",focus:"Escápulas",sets:2,min:8,max:12,alternative:"Com os pés apoiados",tip:"Braços estendidos, ombros controlados." },
    { name:"Prancha frontal (seg)",focus:"Core",sets:3,min:30,max:45,alternative:"Prancha com joelhos",tip:"Tempo em segundos; evite arquear a lombar.",seconds:true },
  ],
  Terça: [
    { name:"Agachamento búlgaro",focus:"Quadríceps e glúteos",sets:3,min:8,max:12,alternative:"Afundo reverso com apoio",tip:"Use um apoio firme; cada série vale por perna." },
    { name:"Agachamento lento",focus:"Quadríceps",sets:3,min:12,max:20,alternative:"Agachamento simples",tip:"Desça controlando por 3 segundos." },
    { name:"Terra unilateral sem peso",focus:"Posterior e equilíbrio",sets:3,min:8,max:12,alternative:"Terra bilateral",tip:"Mantenha o quadril alinhado; cada série vale por perna." },
    { name:"Panturrilha unilateral/bilateral",focus:"Panturrilha",sets:3,min:15,max:25,alternative:"Bilateral com apoio",tip:"Amplitude confortável e sem impulso." },
    { name:"Dead bug (por lado)",focus:"Core",sets:3,min:10,max:12,alternative:"Movimento curto",tip:"Faça cada lado com controle." },
  ],
  Quinta: [
    { name:"Barra fixa supinada",focus:"Costas e bíceps",sets:4,min:4,max:8,alternative:"Barra assistida com pés",tip:"Palmas voltadas para você; sem tranco." },
    { name:"Flexão mãos próximas",focus:"Peito e tríceps",sets:3,min:8,max:12,alternative:"Flexão tradicional",tip:"Mãos em posição confortável, não precisam se tocar." },
    { name:"Sustentação na barra (seg)",focus:"Costas e pegada",sets:2,min:10,max:20,alternative:"Negativas controladas",tip:"Segure com o queixo acima da barra; tempo em segundos.",seconds:true },
    { name:"Flexão pés elevados",focus:"Peito e ombros",sets:3,min:6,max:12,alternative:"Flexão tradicional",tip:"Apoio baixo e estável." },
    { name:"Hollow hold (seg)",focus:"Core",sets:3,min:20,max:40,alternative:"Dead bug",tip:"Tempo em segundos; lombar controlada.",seconds:true },
  ],
  Sexta: [
    { name:"Afundo reverso",focus:"Pernas",sets:4,min:8,max:12,alternative:"Afundo com apoio",tip:"Cada série vale por perna." },
    { name:"Step-up",focus:"Pernas e glúteos",sets:3,min:8,max:12,alternative:"Degrau baixo",tip:"Degrau fixo e antiderrapante." },
    { name:"Ponte glúteo unilateral",focus:"Glúteos",sets:3,min:10,max:15,alternative:"Ponte bilateral",tip:"Não arqueie a lombar; cada série vale por perna." },
    { name:"Isometria na parede (seg)",focus:"Quadríceps",sets:3,min:30,max:60,alternative:"Isometria mais alta",tip:"Tempo em segundos; interrompa se houver dor.",seconds:true },
    { name:"Elevação joelhos na barra",focus:"Core",sets:3,min:6,max:12,alternative:"Abdominal reverso no chão",tip:"Sem balanço." },
  ],
};
export const WEEKS = [
  { phase:"Adaptação",cap:2,walks:3,minutes:25,focus:"Conheça seus limites e priorize execução." },
  { phase:"Adaptação",cap:3,walks:3,minutes:30,focus:"Aumente gradualmente as séries principais." },
  { phase:"Adaptação",cap:3,walks:4,minutes:30,focus:"Consolide repetições com controle." },
  { phase:"Recuperação",cap:2,walks:4,minutes:30,focus:"Menos volume; recuperação de articulações." },
  { phase:"Construção",cap:4,walks:4,minutes:35,focus:"Volume completo, sem correr para a falha." },
  { phase:"Construção",cap:4,walks:4,minutes:35,focus:"Busque uma repetição adicional quando puder." },
  { phase:"Construção",cap:4,walks:4,minutes:40,focus:"Experimente uma variação mais difícil, com técnica." },
  { phase:"Recuperação",cap:2,walks:4,minutes:30,focus:"Descarregue o volume para recuperar." },
  { phase:"Intensificação",cap:4,walks:4,minutes:40,focus:"Inclua uma pausa controlada nos movimentos." },
  { phase:"Intensificação",cap:4,walks:4,minutes:40,focus:"Progrida a força e monitore o esforço." },
  { phase:"Intensificação",cap:4,walks:4,minutes:45,focus:"Consolide suas melhores séries técnicas." },
  { phase:"Avaliação",cap:3,walks:4,minutes:35,focus:"Reduza volume e compare seus resultados." },
];
export const MEALS = [
  { title:"Café da manhã", description:"3 ovos, pão integral 60 g, banana 100 g",calories:450,protein:25 },
  { title:"Almoço", description:"Arroz 170 g, feijão 150 g, frango 160 g, salada, azeite 10 g",calories:720,protein:62 },
  { title:"Lanche",description:"Iogurte proteico 170 g, aveia 40 g, uma maçã",calories:335,protein:20 },
  { title:"Jantar",description:"Carne magra 160 g, batata 180 g, feijão 100 g, legumes, azeite 10 g",calories:640,protein:50 },
  { title:"Ceia",description:"Leite desnatado 250 ml, castanhas 30 g",calories:270,protein:14 },
];
export type Nutrition = { calories?: number; protein?: number; water?: number; sleep?: number };
export type Measure = { waist?: number; pullups?: number; pushups?: number; note?: string };
export type Session = { status: string; duration?: number };
export type FitnessData = {
  startDate: string;
  exercises: Record<string, number[]>;
  sessions: Record<string, Session>;
  weights: Record<string, number>;
  nutrition: Record<string, Nutrition>;
  measures: Record<string, Measure>;
};
export const EMPTY_DATA: FitnessData = { startDate:DEFAULT_START,exercises:{},sessions:{},weights:{},nutrition:{},measures:{} };
export const exerciseKey = (week:number,day:StrengthDay,index:number) => String(week) + ":" + day + ":" + index;
export const dayKey = (week:number,day:FullDay) => String(week) + ":" + day;
export const weekKey = (week:number) => String(week);
export const plannedSets = (week:number,ex:Exercise) => Math.min(WEEKS[Math.max(0,Math.min(11,week-1))].cap,ex.sets);
export const exerciseRow = (week:number,day:StrengthDay,index:number) => 2 + (week-1)*20 + STRENGTH_DAYS.indexOf(day)*5 + index;
export const sessionRow = (week:number,day:Day) => 2 + (week-1)*5 + DAYS.indexOf(day);
export const dailyRow = (week:number,day:FullDay) => 2 + (week-1)*7 + FULL_DAYS.indexOf(day);
export const measureRow = (week:number) => week + 1;
export const localDate = (iso:string) => new Date(iso + "T12:00:00");
export function weekForDate(startDate:string, date:Date=new Date()) {
  const start=localDate(startDate); const now=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);
  return Math.max(1,Math.min(12,Math.floor((now.getTime()-start.getTime())/604800000)+1));
}
export function currentDay():Day {
  const d=new Date().getDay();
  return DAYS[Math.max(0,Math.min(4,d===0?0:d-1))];
}
export function dateFor(startDate:string,week:number,day:FullDay) {
  const d=localDate(startDate); d.setDate(d.getDate()+(week-1)*7+FULL_DAYS.indexOf(day));return d;
}
export const brDate = (d:Date) => d.toLocaleDateString("pt-BR",{day:"2-digit",month:"short"});
export function suggestion(week:number,ex:Exercise,values:number[]) {
  const planned=plannedSets(week,ex);
  const done=values.filter(x=>Number.isFinite(x)&&x>0);
  if(!done.length) return {text:"Ainda não registrado",tone:"neutral" as const};
  if(done.length<planned) return {text:"Finalize as séries",tone:"neutral" as const};
  if(done.slice(0,planned).every(x=>x>=ex.max))return {text:"Pronto para progredir",tone:"good" as const};
  if(done.slice(0,planned).every(x=>x>=ex.min))return {text:"Busque +1 repetição",tone:"progress" as const};
  return {text:"Adapte a variação",tone:"warning" as const};
}
