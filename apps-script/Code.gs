/**
 * BetterMe — Google Apps Script edition.
 * Bound to the original 12-week tracker and deployed as a private web app.
 * Deploy: Execute as "Me"; Who has access: "Only myself".
 *
 * Keep this script private and do not publish the web app to "Anyone".
 */
const BETTERME_SHEET_ID = "16CmKhI08ToWywfIybGsPqW_V5zQcClt0ajh-ELKfW08";
const BETTERME_DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const BETTERME_ALL_DAYS = BETTERME_DAYS.concat(["Sábado", "Domingo"]);
const BETTERME_STRENGTH = ["Segunda", "Terça", "Quinta", "Sexta"];
const BETTERME_WEEK_CAPS = [2,3,3,2,4,4,4,2,4,4,4,3];
const BETTERME_BASE_SETS = {Segunda:[4,4,3,2,3],Terça:[3,3,3,3,3],Quinta:[4,3,2,3,3],Sexta:[4,3,3,3,3]};
const BETTERME_MEAL_VALUES = [[450,25],[720,62],[335,20],[640,50],[270,14]];

function doGet() {
  return HtmlService.createHtmlOutputFromFile("Index")
    .setTitle("BetterMe · Calistenia e Evolução")
    .addMetaTag("viewport", "width=device-width, initial-scale=1, viewport-fit=cover");
}
function bettermeBook_() {
  return SpreadsheetApp.openById(BETTERME_SHEET_ID);
}
function bettermeSheet_(book, name) {
  const sheet = book.getSheetByName(name);
  if (!sheet) throw new Error("A aba '" + name + "' não foi encontrada na planilha.");
  return sheet;
}
function bettermeValidWeek_(week) {
  if (!Number.isInteger(week) || week < 1 || week > 12)
    throw new Error("Semana inválida. Use um número entre 1 e 12.");
  return week;
}
function bettermeValidDay_(day, days) {
  const index = days.indexOf(day);
  if (index < 0) throw new Error("Dia inválido.");
  return index;
}
function bettermeNumber_(v, min, max, decimal) {
  if (v === "" || v === null || v === undefined) return "";
  if (typeof v !== "number" || !Number.isFinite(v) || v < min || v > max ||
      (!decimal && !Number.isInteger(v))) {
    throw new Error("Um dos valores está fora do intervalo permitido.");
  }
  return v;
}
function bettermeDate_(value) {
  let result;
  if (value instanceof Date && !isNaN(value.getTime())) {
    result = Utilities.formatDate(value, "America/Sao_Paulo", "yyyy-MM-dd");
  } else if (typeof value === "number") {
    result = Utilities.formatDate(new Date(Date.UTC(1899,11,30) + value * 86400000), "UTC", "yyyy-MM-dd");
  } else if (typeof value === "string") {
    if (/^\d{4}-\d\d-\d\d$/.test(value)) result = value;
    else if (/^\d\d\/\d\d\/\d{4}$/.test(value)) {
      const chunks = value.split("/");
      result = chunks[2] + "-" + chunks[1] + "-" + chunks[0];
    }
  }
  return result || "2026-11-16";
}
function bettermeKey_(week, day) {
  return String(week) + ":" + day;
}
function bettermeSafeNumber_(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
/** Parse the reserved K-column meal indices; unknown or corrupt data is ignored. */
function bettermeMealIds_(raw) {
  let ids = raw;
  if (typeof raw === "string") {
    if (!raw.trim()) return [];
    try { ids = JSON.parse(raw); } catch (_) { return []; }
  }
  if (!Array.isArray(ids)) return [];
  return Array.from(new Set(ids.filter(v =>
    Number.isInteger(v) && v >= 0 && v < BETTERME_MEAL_VALUES.length
  ))).sort((a,b)=>a-b);
}
function bettermeMealTotals_(ids) {
  return ids.reduce((acc,index)=>{
    acc[0] += BETTERME_MEAL_VALUES[index][0];
    acc[1] += BETTERME_MEAL_VALUES[index][1];
    return acc;
  },[0,0]);
}

/** Returns only user-editable data, not formulas or personal Google credentials. */
function getSnapshot() {
  const book = bettermeBook_();
  const config = bettermeSheet_(book, "Config").getRange("B2").getValue();
  const workoutRows = bettermeSheet_(book, "Diário de Treino").getRange("G2:J241").getValues();
  const sessionRows = bettermeSheet_(book, "Sessões").getRange("D2:E61").getValues();
  const weightRows = bettermeSheet_(book, "Pesagens").getRange("D2:D85").getValues();
  const foodRows = bettermeSheet_(book, "Diário Alimentar").getRange("D2:G85").getValues();
  const mealRows = bettermeSheet_(book, "Diário Alimentar").getRange("K2:K85").getValues();
  const measureRows = bettermeSheet_(book, "Medidas").getRange("D2:K13").getValues();

  const result = {
    startDate: bettermeDate_(config),
    exercises: {},
    sessions: {},
    weights: {},
    nutrition: {},
    meals: {},
    measures: {},
    syncedAt: Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm")
  };

  for (let i = 0; i < workoutRows.length; i++) {
    const week = Math.floor(i / 20) + 1;
    const slot = i % 20;
    const day = BETTERME_STRENGTH[Math.floor(slot / 5)];
    const exercise = slot % 5;
    const values = workoutRows[i].map(bettermeSafeNumber_);
    if (values.some(v => v !== null)) {
      result.exercises[week + ":" + day + ":" + exercise] = values;
    }
  }
  for (let i = 0; i < sessionRows.length; i++) {
    const week = Math.floor(i / 5) + 1, day = BETTERME_DAYS[i % 5];
    const row = sessionRows[i];
    if (row[0] && row[0] !== "Não iniciado") {
      result.sessions[bettermeKey_(week,day)] = {
        status:String(row[0]),
        duration:bettermeSafeNumber_(row[1])
      };
    }
  }
  for (let i = 0; i < weightRows.length; i++) {
    const w = bettermeSafeNumber_(weightRows[i][0]);
    if (w !== null) {
      const week = Math.floor(i / 7) + 1;
      result.weights[bettermeKey_(week,BETTERME_ALL_DAYS[i % 7])] = w;
    }
  }
  for (let i = 0; i < foodRows.length; i++) {
    const values = foodRows[i].map(bettermeSafeNumber_);
    const week = Math.floor(i / 7) + 1;
    const dayKey = bettermeKey_(week,BETTERME_ALL_DAYS[i % 7]);
    if (values.some(v => v !== null)) {
      result.nutrition[dayKey] = {
        calories:values[0],protein:values[1],water:values[2],sleep:values[3]
      };
    }
    const selected = bettermeMealIds_(mealRows[i][0]);
    if (selected.length) result.meals[dayKey] = selected;
  }
  for (let i = 0; i < measureRows.length; i++) {
    const row = measureRows[i];
    const waist = bettermeSafeNumber_(row[0]), pullups = bettermeSafeNumber_(row[2]);
    const pushups = bettermeSafeNumber_(row[3]), note = String(row[7] || "");
    if (waist !== null || pullups !== null || pushups !== null || note) {
      result.measures[String(i+1)] = {waist,pullups,pushups,note};
    }
  }
  return result;
}

/**
 * Save a single typed entry. Only approved input columns are writable.
 * Serialized with LockService to avoid lost updates from overlapping clicks.
 */
function saveEntry(payload) {
  if (!payload || typeof payload !== "object") throw new Error("Registro inválido.");
  const kind = String(payload.type || "");
  const week = kind === "startDate" ? null : bettermeValidWeek_(Number(payload.week));
  const book = bettermeBook_();
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    let changed = 0;
    if (kind === "workout") {
      const dayOffset = bettermeValidDay_(payload.day, BETTERME_STRENGTH);
      const list = payload.entries;
      if (!Array.isArray(list) || list.length !== 5) throw new Error("Treino deve ter 5 exercícios.");
      let allDone = true;
      for (let i = 0; i < 5; i++) {
        const entry = list[i];
        if (!entry || Number(entry.index) !== i ||
            !Array.isArray(entry.values) || entry.values.length !== 4) {
          throw new Error("Séries inválidas.");
        }
        const vals = entry.values.map(v => bettermeNumber_(v,0,900,false));
        const row = 2 + (week - 1) * 20 + dayOffset * 5 + i;
        const planned = Math.min(BETTERME_WEEK_CAPS[week-1], BETTERME_BASE_SETS[payload.day][i]);
        if (vals.slice(0,planned).filter(v => v !== "" && v > 0).length < planned) allDone = false;
        bettermeSheet_(book, "Diário de Treino").getRange(row,7,1,4).setValues([vals]);
        changed += 4;
      }
      const sessionDayIndex = bettermeValidDay_(payload.day, BETTERME_DAYS);
      const row = 2 + (week - 1) * 5 + sessionDayIndex;
      bettermeSheet_(book, "Sessões").getRange(row,4).setValue(allDone ? "Concluído" : "Parcial");
      changed++;
    } else if (kind === "recovery") {
      const dayIndex = bettermeValidDay_(payload.day, BETTERME_DAYS);
      if (payload.day !== "Quarta") throw new Error("Recuperação só pode ser registrada na quarta.");
      bettermeSheet_(book, "Sessões").getRange(2 + (week - 1) * 5 + dayIndex,4).setValue("Concluído");
      changed++;
    } else if (kind === "meal") {
      // Idempotent selection list prevents duplicate calories on request retries.
      const dayIndex = bettermeValidDay_(payload.day, BETTERME_ALL_DAYS);
      const next = payload.selections;
      if (!Array.isArray(next) || next.length > BETTERME_MEAL_VALUES.length ||
          next.some(v=>!Number.isInteger(v) || v<0 || v>=BETTERME_MEAL_VALUES.length) ||
          new Set(next).size !== next.length) {
        throw new Error("Seleção de refeições inválida.");
      }
      const selected = bettermeMealIds_(next);
      const row = 2 + (week - 1) * 7 + dayIndex;
      const foodSheet = bettermeSheet_(book, "Diário Alimentar");
      const previous = bettermeMealIds_(foodSheet.getRange(row,11).getValue());
      const previousTotals = bettermeMealTotals_(previous);
      const selectedTotals = bettermeMealTotals_(selected);
      const recorded = foodSheet.getRange(row,4,1,2).getValues()[0];
      const kcal = Math.max(0,(bettermeSafeNumber_(recorded[0])||0)-previousTotals[0]+selectedTotals[0]);
      const protein = Math.max(0,(bettermeSafeNumber_(recorded[1])||0)-previousTotals[1]+selectedTotals[1]);
      if (kcal > 10000 || protein > 1000) throw new Error("Total diário ultrapassou o limite.");
      // No-op is safe when a prior successful save is retried.
      const wasEmpty = previous.length === 0 && !recorded[0] && !recorded[1];
      const values = selected.length === 0 && wasEmpty ? ["",""] : [kcal,protein];
      foodSheet.getRange(row,4,1,2).setValues([values]);
      foodSheet.getRange(row,11).setValue(selected.length ? JSON.stringify(selected) : "");
      changed += 3;
      SpreadsheetApp.flush();
      return {ok:true,updatedCells:changed,calories:values[0],protein:values[1],selections:selected};
    } else if (kind === "nutrition") {
      const dayIndex = bettermeValidDay_(payload.day, BETTERME_ALL_DAYS);
      const row = 2 + (week - 1) * 7 + dayIndex;
      const values = [
        bettermeNumber_(payload.calories,0,10000,true),
        bettermeNumber_(payload.protein,0,1000,true),
        bettermeNumber_(payload.water,0,20,true),
        bettermeNumber_(payload.sleep,0,24,true)
      ];
      const meals = bettermeMealIds_(bettermeSheet_(book,"Diário Alimentar").getRange(row,11).getValue());
      const base = bettermeMealTotals_(meals);
      if (values[0] === "" && base[0] > 0) values[0] = base[0];
      if (values[1] === "" && base[1] > 0) values[1] = base[1];
      if ((values[0]!=="" && values[0]<base[0]) ||
          (values[1]!=="" && values[1]<base[1])) {
        throw new Error("Os totais não podem ser menores que as refeições já marcadas.");
      }
      bettermeSheet_(book, "Diário Alimentar").getRange(row,4,1,4).setValues([values]);
      changed += 4;
    } else if (kind === "weight") {
      const dayIndex = bettermeValidDay_(payload.day, BETTERME_ALL_DAYS);
      const row = 2 + (week - 1) * 7 + dayIndex;
      bettermeSheet_(book, "Pesagens").getRange(row,4).setValue(bettermeNumber_(payload.weight,30,350,true));
      changed++;
    } else if (kind === "measure") {
      const row = week + 1;
      const waist = bettermeNumber_(payload.waist,40,250,true);
      const pullups = bettermeNumber_(payload.pullups,0,500,false);
      const pushups = bettermeNumber_(payload.pushups,0,500,false);
      const rawNote = String(payload.note || "").trim().slice(0,400);
      // Never let an arbitrary note execute as a spreadsheet formula.
      const note = /^[=+\-@]/.test(rawNote) ? "\u0027" + rawNote : rawNote;
      const measures = bettermeSheet_(book, "Medidas");
      measures.getRange(row,4).setValue(waist);
      measures.getRange(row,6,1,2).setValues([[pullups,pushups]]);
      measures.getRange(row,11).setValue(note);
      changed += 4;
    } else if (kind === "startDate") {
      const raw = String(payload.startDate || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new Error("Data inválida.");
      const d = new Date(raw + "T12:00:00Z");
      if (isNaN(d.getTime()) || d.toISOString().slice(0,10) !== raw || d.getUTCDay() !== 1) {
        throw new Error("Informe uma segunda-feira válida.");
      }
      bettermeSheet_(book, "Config").getRange("B2").setValue(d);
      changed++;
    } else {
      throw new Error("Operação não permitida.");
    }
    SpreadsheetApp.flush();
    return {ok:true,updatedCells:changed};
  } finally {
    lock.releaseLock();
  }
}
