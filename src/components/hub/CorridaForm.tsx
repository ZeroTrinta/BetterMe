"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Timer, Route, Zap, Check } from "lucide-react";
import { formatPace } from "@/lib/utils";
import { registrarCorrida, todayKey } from "@/lib/firestore";

interface Props {
  onSaved: () => void;
}

export function CorridaForm({ onSaved }: Props) {
  const [km, setKm] = useState("");
  const [min, setMin] = useState("");
  const [seg, setSeg] = useState("");
  const [notas, setNotas] = useState("");
  const [salvando, setSalvando] = useState(false);

  const duracaoMin = useMemo(() => {
    const m = parseFloat(min.replace(",", ".") || "0");
    const s = parseFloat(seg.replace(",", ".") || "0");
    return m + s / 60;
  }, [min, seg]);

  const distancia = parseFloat(km.replace(",", ".") || "0");
  const ritmo = distancia > 0 && duracaoMin > 0 ? duracaoMin / distancia : 0;
  const velocidade = duracaoMin > 0 ? (distancia / (duracaoMin / 60)) : 0;

  const podeSalvar = distancia > 0 && duracaoMin > 0 && !salvando;

  const salvar = async () => {
    if (!podeSalvar) return;
    setSalvando(true);
    await registrarCorrida({
      data: todayKey(),
      distancia_km: distancia,
      duracao_min: duracaoMin,
      ritmo_min_km: ritmo,
      notas: notas.trim() || undefined,
    });
    setSalvando(false);
    onSaved();
  };

  return (
    <div>
      <div className="pt-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-lime/80">
          Nova corrida
        </p>
        <h2 className="font-display text-3xl text-ink">Registrar treino</h2>
        <p className="mt-1 text-xs text-ink-dim">
          Puxe do seu smartwatch e cadastre aqui.
        </p>
      </div>

      {/* Distância */}
      <section className="mt-5">
        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
          Distância
        </p>
        <div className="glass flex items-center gap-3 rounded-2xl p-4">
          <Route className="h-5 w-5 text-lime" />
          <input
            inputMode="decimal"
            placeholder="0,00"
            value={km}
            onChange={(e) => setKm(e.target.value)}
            className="flex-1 bg-transparent font-display text-3xl text-ink outline-none placeholder:text-ink-mute"
          />
          <span className="text-sm text-ink-dim">km</span>
        </div>
      </section>

      {/* Duração */}
      <section className="mt-3">
        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
          Duração
        </p>
        <div className="glass flex items-center gap-3 rounded-2xl p-4">
          <Timer className="h-5 w-5 text-lime" />
          <input
            inputMode="numeric"
            placeholder="00"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-14 bg-transparent text-center font-display text-3xl text-ink outline-none placeholder:text-ink-mute"
          />
          <span className="text-ink-dim">:</span>
          <input
            inputMode="numeric"
            placeholder="00"
            value={seg}
            onChange={(e) => setSeg(e.target.value)}
            className="w-14 bg-transparent text-center font-display text-3xl text-ink outline-none placeholder:text-ink-mute"
          />
          <span className="ml-auto text-sm text-ink-dim">min</span>
        </div>
      </section>

      {/* Ritmo derivado */}
      <section className="mt-3 grid grid-cols-2 gap-2">
        <div className="glass rounded-2xl p-3">
          <Zap className="h-4 w-4 text-lime" />
          <p className="mt-2 font-display text-xl text-ink">
            {ritmo > 0 ? formatPace(ritmo) : "--:--"}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-ink-mute">
            Ritmo
          </p>
        </div>
        <div className="glass rounded-2xl p-3">
          <Route className="h-4 w-4 text-lime" />
          <p className="mt-2 font-display text-xl text-ink">
            {velocidade > 0 ? `${velocidade.toFixed(1)} km/h` : "--"}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-ink-mute">
            Velocidade
          </p>
        </div>
      </section>

      {/* Notas */}
      <section className="mt-3">
        <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-ink-dim">
          Notas (opcional)
        </p>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Como foi a corrida? Tempo, sensações..."
          rows={2}
          className="glass w-full resize-none rounded-2xl p-4 text-sm outline-none placeholder:text-ink-mute"
        />
      </section>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={salvar}
        disabled={!podeSalvar}
        className={
          podeSalvar
            ? "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-lime py-4 font-medium text-bg shadow-[0_0_32px_rgba(123,184,255,0.35)]"
            : "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/[0.04] py-4 font-medium text-ink-mute"
        }
      >
        <Check className="h-4 w-4" strokeWidth={3} />
        {salvando ? "Salvando..." : "Registrar corrida"}
      </motion.button>
    </div>
  );
}
