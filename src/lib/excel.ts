import * as XLSX from "xlsx";
import type { Quiz, QuizQuestion, CodingProblem } from "./types";
import { uid } from "./storage";

export async function readSheet(file: File): Promise<Record<string, unknown>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sh = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sh, { defval: "" });
}

function pick(row: Record<string, unknown>, keys: string[]): string {
  for (const k of keys) {
    const hit = Object.keys(row).find((x) => x.trim().toLowerCase() === k.toLowerCase());
    if (hit && row[hit] !== undefined && row[hit] !== null && String(row[hit]).length > 0) return String(row[hit]);
  }
  return "";
}

export function rowsToQuestions(rows: Record<string, unknown>[]): QuizQuestion[] {
  const out: QuizQuestion[] = [];
  for (const r of rows) {
    const text = pick(r, ["Question", "Q", "Text"]);
    if (!text) continue;
    const options = [
      pick(r, ["OptionA", "A", "Option A"]),
      pick(r, ["OptionB", "B", "Option B"]),
      pick(r, ["OptionC", "C", "Option C"]),
      pick(r, ["OptionD", "D", "Option D"]),
    ];
    const correctRaw = pick(r, ["CorrectAnswer", "Correct", "Answer"]).trim().toUpperCase();
    let correct = 0;
    if (["A", "B", "C", "D"].includes(correctRaw)) correct = "ABCD".indexOf(correctRaw);
    else if (/^[1-4]$/.test(correctRaw)) correct = Number(correctRaw) - 1;
    else {
      const idx = options.findIndex((o) => o.trim().toLowerCase() === correctRaw.toLowerCase());
      if (idx >= 0) correct = idx;
    }
    const marks = Number(pick(r, ["Marks", "Points", "Score"])) || 1;
    out.push({ id: uid(), text, options, correct, marks });
  }
  return out;
}

export function rowsToProblems(rows: Record<string, unknown>[]): CodingProblem[] {
  const out: CodingProblem[] = [];
  for (const r of rows) {
    const title = pick(r, ["Title", "Name"]);
    if (!title) continue;
    const sampleIn = pick(r, ["SampleInput", "Sample Input", "Input"]);
    const sampleOut = pick(r, ["SampleOutput", "Sample Output", "Output", "Expected"]);
    const hiddenIn = pick(r, ["HiddenTestInput", "Hidden Input"]);
    const hiddenOut = pick(r, ["HiddenTestOutput", "Hidden Output"]);
    out.push({
      id: uid(),
      title,
      difficulty: (pick(r, ["Difficulty"]) as CodingProblem["difficulty"]) || "Easy",
      category: pick(r, ["Category"]) || "Logic",
      marks: Number(pick(r, ["Points", "Marks"])) || 10,
      description: pick(r, ["Description", "Statement"]),
      inputFormat: pick(r, ["InputFormat", "Input Format"]) || "See samples.",
      outputFormat: pick(r, ["OutputFormat", "Output Format"]) || "See samples.",
      constraints: pick(r, ["Constraints"]) || "",
      samples: sampleIn || sampleOut ? [{ input: sampleIn, expected: sampleOut }] : [],
      hiddenTests: hiddenIn || hiddenOut ? [{ input: hiddenIn, expected: hiddenOut }] : [],
      referenceSolution: pick(r, ["ReferenceSolution", "Reference Solution", "Solution"]),
    });
  }
  return out;
}

// Build a template Quiz shell from parsed rows.
export function buildQuizFromRows(rows: Record<string, unknown>[], meta: Partial<Quiz>): Quiz {
  return {
    id: uid(),
    title: meta.title || "Imported Quiz",
    topic: meta.topic || "General",
    difficulty: meta.difficulty || "Easy",
    timeLimit: meta.timeLimit || 10,
    questions: rowsToQuestions(rows),
    isHidden: false,
  };
}