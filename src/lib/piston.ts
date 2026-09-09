import { BASE_URL } from "@/config/apiConfig";

export const LANGUAGES: { label: string; language: string; version: string; monaco: string; template: string }[] = [
  { label: "Python", language: "python", version: "3.10.0", monaco: "python", template: "# read input with input()\ndata = input()\nprint(data)\n" },
  { label: "JavaScript", language: "javascript", version: "18.15.0", monaco: "javascript", template: "// read stdin\nconst data = require('fs').readFileSync(0, 'utf8').trim();\nconsole.log(data);\n" },
  { label: "TypeScript", language: "typescript", version: "5.0.3", monaco: "typescript", template: "const data: string = require('fs').readFileSync(0, 'utf8').trim();\nconsole.log(data);\n" },
  { label: "C", language: "c", version: "10.2.0", monaco: "c", template: "#include <stdio.h>\nint main(){ int a,b; scanf(\"%d %d\",&a,&b); printf(\"%d\",a+b); return 0; }\n" },
  { label: "C++", language: "cpp", version: "10.2.0", monaco: "cpp", template: "#include <bits/stdc++.h>\nusing namespace std;\nint main(){ int a,b; cin>>a>>b; cout<<a+b; }\n" },
  { label: "Java", language: "java", version: "15.0.2", monaco: "java", template: "import java.util.*;\npublic class Main { public static void main(String[] a){ Scanner s=new Scanner(System.in); System.out.println(s.nextLine()); } }\n" },
  { label: "C#", language: "csharp", version: "6.12.0", monaco: "csharp", template: "using System;\nclass P { static void Main(){ Console.WriteLine(Console.ReadLine()); } }\n" },
  { label: "Go", language: "go", version: "1.16.2", monaco: "go", template: "package main\nimport (\"bufio\";\"fmt\";\"os\")\nfunc main(){ r:=bufio.NewReader(os.Stdin); s,_:=r.ReadString('\\n'); fmt.Print(s) }\n" },
  { label: "Ruby", language: "ruby", version: "3.0.1", monaco: "ruby", template: "puts gets\n" },
  { label: "PHP", language: "php", version: "8.2.3", monaco: "php", template: "<?php echo trim(fgets(STDIN));\n" },
  { label: "Kotlin", language: "kotlin", version: "1.8.20", monaco: "kotlin", template: "fun main(){ println(readLine()) }\n" },
  { label: "Swift", language: "swift", version: "5.3.3", monaco: "swift", template: "if let l = readLine() { print(l) }\n" },
  { label: "Rust", language: "rust", version: "1.68.2", monaco: "rust", template: "use std::io::{self,BufRead};\nfn main(){ let s=io::stdin().lock().lines().next().unwrap().unwrap(); println!(\"{}\",s); }\n" },
];

export interface RunResult {
  stdout: string;
  stderr: string;
  output: string;
  code: number | null;
}

function authHeaders() {
  const token = localStorage.getItem("admin_token");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export async function runCode(languageLabel: string, code: string, stdin: string): Promise<RunResult> {
  const res = await fetch(`${BASE_URL}/api/execute`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ languageLabel, code, stdin }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Code execution failed: " + res.status);
  }
  return res.json();
}