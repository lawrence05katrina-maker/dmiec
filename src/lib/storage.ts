import type { User, Quiz, QuizResult, CodingProblem, Submission } from "./types";

const KEYS = {
  users: "dmi_users",
  quizzes: "dmi_quizzes",
  quizResults: "dmi_quizResults",
  problems: "dmi_problems",
  submissions: "dmi_submissions",
  session: "dmi_session",
  seeded: "dmi_seeded_v2",
} as const;

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(k: string, v: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(v));
}

export const store = {
  getUsers: () => read<User[]>(KEYS.users, []),
  setUsers: (v: User[]) => write(KEYS.users, v),
  getQuizzes: () => read<Quiz[]>(KEYS.quizzes, []),
  setQuizzes: (v: Quiz[]) => write(KEYS.quizzes, v),
  getQuizResults: () => read<QuizResult[]>(KEYS.quizResults, []),
  setQuizResults: (v: QuizResult[]) => write(KEYS.quizResults, v),
  getProblems: () => read<CodingProblem[]>(KEYS.problems, []),
  setProblems: (v: CodingProblem[]) => write(KEYS.problems, v),
  getSubmissions: () => read<Submission[]>(KEYS.submissions, []),
  setSubmissions: (v: Submission[]) => write(KEYS.submissions, v),
  getSession: () => read<{ userId: string } | null>(KEYS.session, null),
  setSession: (v: { userId: string } | null) => write(KEYS.session, v),
};

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function seed() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(KEYS.seeded)) return;

  const users: User[] = [
    { id: "admin1", role: "admin", name: "Administrator", email: "admin@dmi.edu", password: "admin123" },
    { id: "stu1", role: "student", name: "Aarav Kumar", email: "aarav@dmi.edu", password: "student123", registerNo: "IT2021001", department: "IT" },
    { id: "stu2", role: "student", name: "Priya Sharma", email: "priya@dmi.edu", password: "student123", registerNo: "IT2021002", department: "IT" },
  ];

  const quizzes: Quiz[] = [
    {
      id: "q1", title: "JavaScript Basics", topic: "JavaScript", difficulty: "Easy", timeLimit: 5,
      questions: [
        { id: "q1a", text: "Which keyword declares a constant?", options: ["let", "var", "const", "def"], correct: 2, marks: 5 },
        { id: "q1b", text: "typeof null returns?", options: ["null", "object", "undefined", "number"], correct: 1, marks: 5 },
        { id: "q1c", text: "Which is not a JS framework?", options: ["React", "Vue", "Django", "Svelte"], correct: 2, marks: 5 },
      ],
    },
    {
      id: "q2", title: "Data Structures", topic: "DSA", difficulty: "Medium", timeLimit: 8,
      questions: [
        { id: "q2a", text: "Time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correct: 1, marks: 10 },
        { id: "q2b", text: "Which is LIFO?", options: ["Queue", "Stack", "Heap", "Tree"], correct: 1, marks: 10 },
      ],
    },
    {
      id: "q3", title: "Python Fundamentals", topic: "Python", difficulty: "Easy", timeLimit: 5,
      questions: [
        { id: "q3a", text: "Which is used for comments?", options: ["//", "#", "/* */", "--"], correct: 1, marks: 5 },
        { id: "q3b", text: "len('abc')?", options: ["2", "3", "4", "Error"], correct: 1, marks: 5 },
      ],
    },
  ];

  const problems: CodingProblem[] = [
    {
      id: "p1", title: "Sum of Two Numbers", difficulty: "Easy", category: "Logic", marks: 10,
      description: "Read two integers from stdin and print their sum.",
      inputFormat: "Two space-separated integers on one line.",
      outputFormat: "A single integer, their sum.",
      constraints: "-10^9 <= a, b <= 10^9",
      samples: [
        { input: "2 3", expected: "5" },
        { input: "10 -4", expected: "6" },
      ],
      hiddenTests: [
        { input: "0 0", expected: "0" },
        { input: "1000000000 1000000000", expected: "2000000000" },
        { input: "-5 5", expected: "0" },
      ],
    },
    {
      id: "p2", title: "Reverse a String", difficulty: "Easy", category: "DSA", marks: 10,
      description: "Read a single line string and print it reversed.",
      inputFormat: "One line containing a string.",
      outputFormat: "The reversed string.",
      constraints: "1 <= len <= 1000",
      samples: [{ input: "hello", expected: "olleh" }],
      hiddenTests: [
        { input: "abcd", expected: "dcba" },
        { input: "racecar", expected: "racecar" },
        { input: "DMI IT", expected: "TI IMD" },
      ],
    },
    {
      id: "p3", title: "FizzBuzz", difficulty: "Medium", category: "Logic", marks: 20,
      description: "Print numbers from 1 to N. For multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', for both print 'FizzBuzz'.",
      inputFormat: "A single integer N.",
      outputFormat: "N lines of output.",
      constraints: "1 <= N <= 100",
      samples: [{ input: "5", expected: "1\n2\nFizz\n4\nBuzz" }],
      hiddenTests: [
        { input: "3", expected: "1\n2\nFizz" },
        { input: "15", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz" },
      ],
    },
    {
      id: "p4", title: "Debug the Loop", difficulty: "Hard", category: "Debugging", marks: 30,
      description: "Given an integer N, print the sum of numbers 1..N. (Fix the classic off-by-one in your solution!)",
      inputFormat: "A single integer N.",
      outputFormat: "The sum 1+2+...+N.",
      constraints: "1 <= N <= 10000",
      samples: [{ input: "10", expected: "55" }],
      hiddenTests: [
        { input: "1", expected: "1" },
        { input: "100", expected: "5050" },
        { input: "10000", expected: "50005000" },
      ],
    },
  ];

  store.setUsers(users);
  store.setQuizzes(quizzes);
  store.setProblems(problems);
  store.setSubmissions([]);
  store.setQuizResults([]);
  window.localStorage.setItem(KEYS.seeded, "1");
}