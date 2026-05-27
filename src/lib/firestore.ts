import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  addDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  HistoricoAlimentacao,
  HistoricoTreino,
  CompraMercado,
  Refeicao,
  TipoTreino,
} from "@/types";
import { format } from "date-fns";

/* ---------- helpers ---------- */
export const todayKey = () => format(new Date(), "yyyy-MM-dd");
export const monthKey = (d: Date = new Date()) => format(d, "yyyy-MM");

/* ---------- DIETA ---------- */
const DIETA_COL = "historico_alimentacao";

export async function getDietaDoDia(dateKey: string = todayKey()): Promise<HistoricoAlimentacao> {
  const ref = doc(db, DIETA_COL, dateKey);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return {
      data: dateKey,
      cafe_manha: false,
      almoco: false,
      pre_treino: false,
      jantar: false,
    };
  }
  return { data: dateKey, ...(snap.data() as Omit<HistoricoAlimentacao, "data">) };
}

export async function toggleRefeicao(
  refeicao: Refeicao,
  valor: boolean,
  dateKey: string = todayKey()
) {
  const ref = doc(db, DIETA_COL, dateKey);
  await setDoc(
    ref,
    { [refeicao]: valor, data: dateKey, atualizado_em: serverTimestamp() },
    { merge: true }
  );
}

export async function getDietaIntervalo(
  startKey: string,
  endKey: string
): Promise<HistoricoAlimentacao[]> {
  const q = query(
    collection(db, DIETA_COL),
    where("data", ">=", startKey),
    where("data", "<=", endKey),
    orderBy("data", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ data: d.id, ...(d.data() as any) }));
}

/* ---------- TREINO ---------- */
const TREINO_COL = "historico_treino";

export async function registrarTreino(tipo: TipoTreino, dateKey: string = todayKey()) {
  const ref = doc(db, TREINO_COL, `${dateKey}_${tipo}`);
  await setDoc(ref, {
    data: dateKey,
    tipo_treino: tipo,
    registrado_em: Timestamp.now(),
  });
}

export async function getTreinosIntervalo(
  startKey: string,
  endKey: string
): Promise<HistoricoTreino[]> {
  const q = query(
    collection(db, TREINO_COL),
    where("data", ">=", startKey),
    where("data", "<=", endKey),
    orderBy("data", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as HistoricoTreino);
}

/* ---------- MERCADO ---------- */
const MERCADO_COL = "compras_mercado";

export async function registrarCompra(valor: number, descricao?: string) {
  const hoje = new Date();
  await addDoc(collection(db, MERCADO_COL), {
    data: format(hoje, "yyyy-MM-dd"),
    mes: monthKey(hoje),
    valor_pago: valor,
    descricao: descricao ?? "",
    registrado_em: Timestamp.now(),
  });
}

export async function getComprasMes(mes: string = monthKey()): Promise<CompraMercado[]> {
  const q = query(collection(db, MERCADO_COL), where("mes", "==", mes));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as CompraMercado);
}

export async function getTodasCompras(): Promise<CompraMercado[]> {
  const snap = await getDocs(collection(db, MERCADO_COL));
  return snap.docs.map((d) => d.data() as CompraMercado);
}
