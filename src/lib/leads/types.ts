export const SOURCES = [
  "parcoursup",
  "site",
  "jpo",
  "salon",
  "social",
  "lycee",
  "parrainage",
] as const;
export const PROGRAMMES = ["info", "cyber", "design", "audiovisuel", "jv3d", "marketing"] as const;
export const LEVELS = ["b1", "b2", "b3", "m1", "m2"] as const;
/** Funnel stages in order; a lead's `stage` is the furthest one it reached. */
export const STAGES = ["lead", "contacted", "interview", "admitted", "enrolled"] as const;

export type Source = (typeof SOURCES)[number];
export type Programme = (typeof PROGRAMMES)[number];
export type Level = (typeof LEVELS)[number];
export type Stage = (typeof STAGES)[number];

export type Lead = {
  /** Anonymous: no name, no contact detail. */
  id: string;
  /** ISO date, YYYY-MM-DD. */
  createdAt: string;
  /** Intake year: a campaign runs from 1 October of the year before to 30 September. */
  year: number;
  source: Source;
  programme: Programme;
  level: Level;
  stage: Stage;
  status: "open" | "enrolled" | "lost";
  rep: string;
};
