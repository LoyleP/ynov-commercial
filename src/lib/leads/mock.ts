import { STAGES, type Lead, type Level, type Programme, type Source } from "./types";

/** The mock data is frozen at this day so the numbers are the same on every render. */
export const MOCK_TODAY = "2026-10-28";
export const REPS = ["Camille", "Julien", "Sarah", "Thomas", "Inès", "Maxime"] as const;
export const YEARS = [2025, 2026, 2027] as const;

const DAY = 86_400_000;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T extends string>(rand: () => number, weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  let roll = rand() * entries.reduce((sum, [, weight]) => sum + weight, 0);
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll < 0) return key;
  }
  return entries[entries.length - 1]![0];
}

const SOURCE_WEIGHTS: Record<Source, number> = {
  parcoursup: 30,
  site: 20,
  jpo: 14,
  salon: 12,
  social: 10,
  lycee: 9,
  parrainage: 5,
};
const PROGRAMME_WEIGHTS: Record<Programme, number> = {
  info: 30,
  cyber: 12,
  design: 16,
  audiovisuel: 12,
  jv3d: 18,
  marketing: 12,
};
const LEVEL_WEIGHTS: Record<Level, number> = { b1: 55, b2: 12, b3: 15, m1: 10, m2: 8 };

// Share of a source's leads arriving in each month of the campaign, October to September.
const BASE_MONTHS = [5, 8, 9, 14, 13, 14, 9, 7, 8, 6, 5, 2];
const SOURCE_MONTHS: Record<Source, number[]> = {
  parcoursup: [0, 0, 1, 24, 26, 22, 12, 6, 6, 2, 1, 0],
  site: BASE_MONTHS,
  jpo: [3, 6, 20, 8, 22, 20, 14, 4, 2, 0, 0, 1],
  salon: [6, 20, 14, 18, 16, 12, 6, 3, 2, 1, 1, 1],
  social: BASE_MONTHS,
  lycee: [4, 10, 12, 16, 18, 16, 10, 6, 4, 2, 1, 1],
  parrainage: BASE_MONTHS,
};

// How well each source and programme converts at the interview step.
const SOURCE_QUALITY: Record<Source, number> = {
  parcoursup: 0.9,
  site: 1,
  jpo: 1.35,
  salon: 1.05,
  social: 0.7,
  lycee: 0.95,
  parrainage: 1.6,
};
const PROGRAMME_QUALITY: Record<Programme, number> = {
  info: 1.1,
  cyber: 1.2,
  design: 0.95,
  audiovisuel: 0.9,
  jv3d: 1,
  marketing: 0.85,
};
// Volume of each campaign relative to the first: the school is growing.
const YEAR_VOLUME: Record<number, number> = { 2025: 2000, 2026: 2250, 2027: 2450 };

function generate(): Lead[] {
  const rand = mulberry32(20_26_10);
  const today = Date.parse(MOCK_TODAY);
  const leads: Lead[] = [];
  for (const year of YEARS) {
    const campaignDone = Date.parse(`${year}-09-30`) < today;
    const volume = YEAR_VOLUME[year]!;
    for (let i = 0; i < volume; i++) {
      const source = pick(rand, SOURCE_WEIGHTS);
      const month = SOURCE_MONTHS[source];
      const slot = pick(
        rand,
        Object.fromEntries(month.map((weight, index) => [String(index), weight || 0.001])),
      );
      const monthIndex = Number(slot);
      const calendarMonth = (monthIndex + 9) % 12; // 0 = January
      const calendarYear = monthIndex < 3 ? year - 1 : year;
      const day = 1 + Math.floor(rand() * 28);
      const createdAt = new Date(Date.UTC(calendarYear, calendarMonth, day))
        .toISOString()
        .slice(0, 10);
      if (Date.parse(createdAt) > today) continue;

      const programme = pick(rand, PROGRAMME_WEIGHTS);
      const level = pick(rand, LEVEL_WEIGHTS);
      const quality = SOURCE_QUALITY[source] * PROGRAMME_QUALITY[programme];
      const age = (today - Date.parse(createdAt)) / DAY;

      // Walk the funnel; each step needs the lead to be old enough to have got there.
      const steps = [
        { p: 0.86, minAge: 1 },
        { p: Math.min(0.9, 0.46 * quality), minAge: 7 },
        { p: 0.72, minAge: 14 },
        { p: Math.min(0.95, 0.62 * Math.sqrt(quality)), minAge: 21 },
      ];
      let reached = 0;
      for (const step of steps) {
        if (age < step.minAge || rand() > step.p) break;
        reached++;
      }
      const stage = STAGES[reached]!;
      const enrolled = stage === "enrolled";
      const status: Lead["status"] = enrolled
        ? "enrolled"
        : campaignDone || age > 60 || rand() < 0.35
          ? "lost"
          : "open";
      leads.push({
        id: `L${year}-${String(i + 1).padStart(4, "0")}`,
        createdAt,
        year,
        source,
        programme,
        level,
        stage,
        status,
        rep: REPS[Math.floor(rand() * REPS.length)]!,
      });
    }
  }
  return leads.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export const MOCK_LEADS: readonly Lead[] = generate();
