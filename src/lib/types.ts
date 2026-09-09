export type Role = "student" | "admin";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  password: string;
  registerNo?: string;
  department?: string;
  year?: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correct: number; // index
  marks: number;
}

export interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: number; // minutes
  questions: QuizQuestion[];
  isHidden?: boolean;
  questionCount?: number;
}

export interface TestCase {
  input: string;
  expected: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  marks: number;
  samples: TestCase[];
  hiddenTests?: TestCase[];
  referenceSolution?: string;
  isHidden?: boolean;
}

export interface Submission {
  id: string;
  studentId: string;
  problemId: string;
  language: string;
  code: string;
  status: "Auto-Graded";
  marks: number;
  maxMarks: number;
  passed: number;
  total: number;
  testResults: { name: string; hidden: boolean; pass: boolean; got: string; expected: string }[];
  feedback?: string;
  timestamp: number;
}

export interface QuizResult {
  id: string;
  quizId: string;
  studentId: string;
  score: number;          // provisional (auto-calculated)
  total: number;
  timestamp: number;
  answers: Record<string, number>;
  status: "Pending Review" | "Reviewed";
  finalScore?: number;
  feedback?: string;
}