import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Code2,
  Clock,
  Cpu,
  Layers,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { CodingProblem, DifficultyLevel } from '../types';
import { executeCodeApi, reviewCodeApi } from '../lib/api';

const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'prob-1',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description:
      'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1, 2]',
      },
    ],
    starterCode: {
      python: `# Two Sum\ndef two_sum(nums, target):\n    # Write your solution here\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\n# Test execution:\nprint("Output:", two_sum([2, 7, 11, 15], 9))\n`,
      c: `// Two Sum in C\n#include <stdio.h>\n\nint main() {\n    int nums[] = {2, 7, 11, 15};\n    int target = 9;\n    int size = 4;\n    \n    for (int i = 0; i < size; i++) {\n        for (int j = i + 1; j < size; j++) {\n            if (nums[i] + nums[j] == target) {\n                printf("[%d, %d]\\n", i, j);\n                return 0;\n            }\n        }\n    }\n    return 0;\n}\n`,
      'c++': `// Two Sum in C++\n#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < nums.size(); ++i) {\n        int complement = target - nums[i];\n        if (seen.find(complement) != seen.end()) {\n            return {seen[complement], i};\n        }\n        seen[nums[i]] = i;\n    }\n    return {};\n}\n\nint main() {\n    vector<int> nums = {2, 7, 11, 15};\n    int target = 9;\n    vector<int> ans = twoSum(nums, target);\n    cout << "[" << ans[0] << ", " << ans[1] << "]" << endl;\n    return 0;\n}\n`,
      java: `// Two Sum in Java\nimport java.util.HashMap;\nimport java.util.Map;\n\npublic class Main {\n    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n\n    public static void main(String[] args) {\n        int[] nums = {2, 7, 11, 15};\n        int target = 9;\n        int[] ans = twoSum(nums, target);\n        System.out.println("[" + ans[0] + ", " + ans[1] + "]");\n    }\n}\n`,
      javascript: `// Two Sum in JavaScript\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) {\n            return [map.get(diff), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));\n`,
    },
  },
  {
    id: 'prob-2',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    description:
      'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets, and in the correct order.',
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    starterCode: {
      python: `# Valid Parentheses\ndef is_valid(s: str) -> bool:\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n\nprint("()[]{} ->", is_valid("()[]{}"))\nprint("(] ->", is_valid("(]"))\n`,
      c: `// Valid Parentheses in C\n#include <stdio.h>\n#include <stdbool.h>\n#include <string.h>\n\nbool isValid(char* s) {\n    char stack[1000];\n    int top = -1;\n    for (int i = 0; s[i] != '\\0'; i++) {\n        char c = s[i];\n        if (c == '(' || c == '{' || c == '[') {\n            stack[++top] = c;\n        } else {\n            if (top == -1) return false;\n            char open = stack[top--];\n            if (c == ')' && open != '(') return false;\n            if (c == '}' && open != '{') return false;\n            if (c == ']' && open != '[') return false;\n        }\n    }\n    return top == -1;\n}\n\nint main() {\n    printf("()[]{} -> %s\\n", isValid("()[]{}") ? "true" : "false");\n    return 0;\n}\n`,
      'c++': `// Valid Parentheses in C++\n#include <iostream>\n#include <stack>\n#include <unordered_map>\n\nusing namespace std;\n\nbool isValid(string s) {\n    stack<char> st;\n    unordered_map<char, char> closeToOpen = {\n        {')', '('}, {'}', '{'}, {']', '['}\n    };\n    for (char c : s) {\n        if (closeToOpen.count(c)) {\n            if (!st.empty() && st.top() == closeToOpen[c]) {\n                st.pop();\n            } else {\n                return false;\n            }\n        } else {\n            st.push(c);\n        }\n    }\n    return st.empty();\n}\n\nint main() {\n    cout << boolalpha << isValid("()[]{}") << endl;\n    return 0;\n}\n`,
      java: `// Valid Parentheses in Java\nimport java.util.Stack;\n\npublic class Main {\n    public static boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n\n    public static void main(String[] args) {\n        System.out.println(isValid("()[]{}"));\n    }\n}\n`,
      javascript: `// Valid Parentheses in JS\nfunction isValid(s) {\n    const stack = [];\n    const map = { ')': '(', '}': '{', ']': '[' };\n    for (let char of s) {\n        if (char in map) {\n            if (stack.pop() !== map[char]) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}\n\nconsole.log(isValid("()[]{}"));\n`,
    },
  },
  {
    id: 'prob-3',
    title: 'Maximum Subarray (Kadane’s)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description:
      'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\nA subarray is a contiguous non-empty sequence of elements within an array.',
    examples: [
      {
        input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.',
      },
    ],
    starterCode: {
      python: `# Maximum Subarray - Kadane's Algorithm\ndef max_sub_array(nums):\n    max_sum = nums[0]\n    current_sum = 0\n    for n in nums:\n        current_sum = max(n, current_sum + n)\n        max_sum = max(max_sum, current_sum)\n    return max_sum\n\nnums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nprint("Max Subarray Sum:", max_sub_array(nums))\n`,
      c: `// Kadane's Algorithm in C\n#include <stdio.h>\n\nint maxSubArray(int* nums, int numsSize) {\n    int max_sum = nums[0];\n    int current = 0;\n    for (int i = 0; i < numsSize; i++) {\n        current = (nums[i] > current + nums[i]) ? nums[i] : current + nums[i];\n        if (current > max_sum) max_sum = current;\n    }\n    return max_sum;\n}\n\nint main() {\n    int nums[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};\n    printf("Max Sum: %d\\n", maxSubArray(nums, 9));\n    return 0;\n}\n`,
      'c++': `// Kadane's Algorithm in C++\n#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    int max_sum = nums[0];\n    int current = 0;\n    for (int n : nums) {\n        current = max(n, current + n);\n        max_sum = max(max_sum, current);\n    }\n    return max_sum;\n}\n\nint main() {\n    vector<int> nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};\n    cout << "Max Sum: " << maxSubArray(nums) << endl;\n    return 0;\n}\n`,
      java: `// Kadane's Algorithm in Java\npublic class Main {\n    public static int maxSubArray(int[] nums) {\n        int maxSum = nums[0];\n        int current = 0;\n        for (int n : nums) {\n            current = Math.max(n, current + n);\n            maxSum = Math.max(maxSum, current);\n        }\n        return maxSum;\n    }\n\n    public static void main(String[] args) {\n        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};\n        System.out.println("Max Sum: " + maxSubArray(nums));\n    }\n}\n`,
      javascript: `// Kadane's Algorithm in JS\nfunction maxSubArray(nums) {\n    let maxSum = nums[0];\n    let curr = 0;\n    for (let n of nums) {\n        curr = Math.max(n, curr + n);\n        maxSum = Math.max(maxSum, curr);\n    }\n    return maxSum;\n}\n\nconsole.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));\n`,
    },
  },
];

export const CodingArenaPage: React.FC = () => {
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(CODING_PROBLEMS[0]);
  const [language, setLanguage] = useState<'python' | 'c' | 'c++' | 'java'>('python');
  const [code, setCode] = useState(selectedProblem.starterCode.python);
  const [customInput, setCustomInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [aiReview, setAiReview] = useState<any>(null);

  const handleSelectProblem = (prob: CodingProblem) => {
    setSelectedProblem(prob);
    const starter = prob.starterCode[language] || prob.starterCode.python;
    setCode(starter);
    setExecutionResult(null);
    setAiReview(null);
  };

  const handleLanguageChange = (newLang: 'python' | 'c' | 'c++' | 'java') => {
    setLanguage(newLang);
    const starter = selectedProblem.starterCode[newLang] || selectedProblem.starterCode.python;
    setCode(starter);
    setExecutionResult(null);
    setAiReview(null);
  };

  const handleResetCode = () => {
    const starter = selectedProblem.starterCode[language] || selectedProblem.starterCode.python;
    setCode(starter);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setExecutionResult(null);
    try {
      const result = await executeCodeApi({
        language,
        code,
        stdin: customInput,
      });
      setExecutionResult(result);
    } catch (err: any) {
      setExecutionResult({
        stderr: err.message || 'Execution failed',
        stdout: '',
        exitCode: 1,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleAiReview = async () => {
    setIsReviewing(true);
    try {
      const review = await reviewCodeApi({
        problemTitle: selectedProblem.title,
        problemDescription: selectedProblem.description,
        language,
        code,
        executionResult,
      });
      setAiReview(review);
    } catch (err: any) {
      console.warn('AI review error:', err);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-navy-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Coding Interview Arena</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Container Sandbox Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Solve algorithmic problems in C, C++, Python, and Java. Compile safely and receive instant Gemini AI code reviews.
          </p>
        </div>

        {/* Problem Selector Dropdown */}
        <div className="flex items-center space-x-3">
          <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Problem:</label>
          <select
            value={selectedProblem.id}
            onChange={(e) => {
              const found = CODING_PROBLEMS.find((p) => p.id === e.target.value);
              if (found) handleSelectProblem(found);
            }}
            className="px-3.5 py-1.5 bg-navy-900 border border-navy-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-brand-500"
          >
            {CODING_PROBLEMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Column: Problem Description & Test Cases (5 cols) */}
        <div className="lg:col-span-5 bg-navy-900/80 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6 overflow-y-auto max-h-[750px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{selectedProblem.title}</h2>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                selectedProblem.difficulty === 'Easy'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {selectedProblem.difficulty}
              </span>
            </div>

            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Category: <span className="text-brand-300">{selectedProblem.category}</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedProblem.description}
            </p>

            {/* Examples */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Test Case Examples</h3>
              {selectedProblem.examples.map((ex, i) => (
                <div key={i} className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-xs font-mono space-y-1">
                  <p className="text-slate-400"><strong className="text-slate-300">Input:</strong> {ex.input}</p>
                  <p className="text-slate-400"><strong className="text-slate-300">Output:</strong> {ex.output}</p>
                  {ex.explanation && (
                    <p className="text-slate-500 font-sans text-[11px] pt-1">{ex.explanation}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Custom Stdin Box */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Standard Input (stdin):
              </label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Optional input passed to program..."
                rows={2}
                className="w-full p-2.5 bg-navy-950 border border-navy-800 rounded-xl text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Console (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          {/* Editor Header Bar */}
          <div className="p-3 bg-navy-900 border border-navy-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
            {/* Language Tabs */}
            <div className="flex items-center space-x-1">
              {(['python', 'c', 'c++', 'java'] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                    language === lang
                      ? 'bg-brand-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-navy-800'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Editor Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleResetCode}
                className="p-1.5 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-400 hover:text-white border border-navy-700 transition"
                title="Reset Code Template"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={handleAiReview}
                disabled={isReviewing}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{isReviewing ? 'Analyzing...' : 'AI Code Review'}</span>
              </button>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning ? 'Running...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="rounded-2xl overflow-hidden border border-navy-800 shadow-2xl bg-[#1e1e1e] flex-grow min-h-[350px]">
            <Editor
              height="380px"
              language={language === 'c++' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
              }}
            />
          </div>

          {/* Output Console / AI Review Pane */}
          <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
              <span className="flex items-center space-x-1.5 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5 text-brand-400" />
                <span>Execution Output Console</span>
              </span>
              {executionResult && (
                <span className={`px-2 py-0.5 rounded text-[10px] ${
                  executionResult.exitCode === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  Exit Code: {executionResult.exitCode}
                </span>
              )}
            </div>

            {/* Output Display */}
            <div className="p-3 rounded-xl bg-navy-900 border border-navy-850 font-mono text-xs text-slate-200 min-h-[70px] max-h-40 overflow-y-auto whitespace-pre-wrap">
              {isRunning ? (
                <span className="text-slate-400 animate-pulse">Compiling and executing in isolated container sandbox...</span>
              ) : executionResult ? (
                <>
                  {executionResult.stdout && <div className="text-emerald-400">{executionResult.stdout}</div>}
                  {executionResult.stderr && <div className="text-rose-400">{executionResult.stderr}</div>}
                  {!executionResult.stdout && !executionResult.stderr && (
                    <span className="text-slate-500">Program executed with empty output.</span>
                  )}
                </>
              ) : (
                <span className="text-slate-600">Click "Run Code" to compile and execute your program.</span>
              )}
            </div>

            {/* AI Review Card */}
            {aiReview && (
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2 text-xs animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 flex items-center space-x-1.5 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Gemini AI Code Evaluation</span>
                  </span>
                  <div className="flex items-center space-x-3 text-slate-300 font-mono">
                    <span>Time: <strong className="text-cyan-300">{aiReview.timeComplexity}</strong></span>
                    <span>Space: <strong className="text-brand-300">{aiReview.spaceComplexity}</strong></span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                      {aiReview.correctnessScore}/10
                    </span>
                  </div>
                </div>

                <p className="text-slate-200 leading-relaxed font-sans">{aiReview.feedback}</p>

                {aiReview.suggestions && aiReview.suggestions.length > 0 && (
                  <ul className="list-disc list-inside text-slate-300 space-y-0.5 pl-1 pt-1">
                    {aiReview.suggestions.map((s: string, idx: number) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

