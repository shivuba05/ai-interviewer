import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini Client
export function getGeminiModel(customApiKey?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  // Default to fast, reliable gemini-1.5-flash (or gemini-2.0-flash if supported)
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

// Clean and parse JSON from LLM response safely
export function parseGeminiJson<T>(text: string): T {
  let cleaned = text.trim();
  // Strip markdown code fences like ```json ... ```
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned) as T;
}

export interface QuestionRequest {
  jobRole: string;
  interviewType: string;
  experienceLevel: string;
  difficulty: string;
  count: number;
  language: string;
  resumeText?: string;
  apiKey?: string;
}

export interface GeneratedQuestion {
  order: number;
  question: string;
  expectedPoints: string[];
  difficulty: string;
  category: string;
}

export async function generateInterviewQuestions(req: QuestionRequest): Promise<{ questions: GeneratedQuestion[]; isFallback?: boolean }> {
  const model = getGeminiModel(req.apiKey);
  
  if (!model) {
    return {
      questions: getFallbackQuestions(req),
      isFallback: true,
    };
  }

  const prompt = `
You are a senior hiring manager and expert technical interviewer conducting an interview for the role of "${req.jobRole}".
Interview Type: ${req.interviewType}
Candidate Experience Level: ${req.experienceLevel}
Difficulty Level: ${req.difficulty}
Total Questions Required: ${req.count}
Interview Language: ${req.language} (The question text MUST be in ${req.language})
${req.resumeText ? `Candidate Resume / Experience Context:\n"""${req.resumeText.slice(0, 3000)}"""\nGenerate questions tailored directly to the candidate's projects, listed skills, and technologies mentioned above.` : ''}

Generate exactly ${req.count} high-quality, realistic interview questions.
Return ONLY valid JSON in the exact format below, with NO markdown backticks or extra commentary:
[
  {
    "order": 1,
    "question": "The question text in ${req.language}",
    "expectedPoints": ["Key point 1", "Key point 2", "Key point 3"],
    "difficulty": "${req.difficulty}",
    "category": "${req.interviewType}"
  }
]
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const questions = parseGeminiJson<GeneratedQuestion[]>(responseText);
    return { questions, isFallback: false };
  } catch (error) {
    console.error('Gemini question generation error, using fallback:', error);
    return {
      questions: getFallbackQuestions(req),
      isFallback: true,
    };
  }
}

export interface FollowUpRequest {
  jobRole: string;
  question: string;
  candidateAnswer: string;
  language: string;
  currentDifficulty: string;
  apiKey?: string;
}

export async function generateFollowUpQuestion(req: FollowUpRequest): Promise<{ followUp: string; adjustedDifficulty: string }> {
  const model = getGeminiModel(req.apiKey);
  if (!model) {
    return {
      followUp: `That's an interesting point regarding your approach. Could you elaborate on how you would handle trade-offs or scalability challenges with that solution in a production environment?`,
      adjustedDifficulty: req.currentDifficulty,
    };
  }

  const prompt = `
You are an expert interviewer for the position of "${req.jobRole}".
Current Question: "${req.question}"
Candidate's Answer: "${req.candidateAnswer}"
Language: ${req.language}
Current Difficulty: ${req.currentDifficulty}

Analyze the candidate's answer. If the answer was strong, generate an insightful, deeper follow-up question that increases difficulty. If the answer was weak or incomplete, ask a guiding question to probe their fundamental understanding.
Also specify if the difficulty should be "Easy", "Medium", or "Hard".

Return ONLY a JSON object:
{
  "followUp": "The follow up question in ${req.language}",
  "adjustedDifficulty": "Easy|Medium|Hard",
  "reason": "Brief reason for follow up"
}
`;

  try {
    const result = await model.generateContent(prompt);
    const data = parseGeminiJson<{ followUp: string; adjustedDifficulty: string }>(result.response.text());
    return data;
  } catch (error) {
    console.error('Gemini follow-up generation error:', error);
    return {
      followUp: `Can you walk through a concrete scenario where you applied that concept and what challenges you faced?`,
      adjustedDifficulty: req.currentDifficulty,
    };
  }
}

export interface EvaluateAnswerRequest {
  jobRole: string;
  question: string;
  expectedPoints: string[];
  candidateAnswer: string;
  language: string;
  difficulty: string;
  apiKey?: string;
}

export interface AnswerEvaluation {
  score: number; // 0 to 10
  relevanceScore: number; // 0 to 10
  technicalScore: number; // 0 to 10
  communicationScore: number; // 0 to 10
  clarityScore: number; // 0 to 10
  completenessScore: number; // 0 to 10
  problemSolvingScore: number; // 0 to 10
  positiveFeedback: string;
  areasForImprovement: string;
  suggestedBetterAnswer: string;
}

export async function evaluateCandidateAnswer(req: EvaluateAnswerRequest): Promise<AnswerEvaluation> {
  const cleanedAns = (req.candidateAnswer || '').trim();
  const lowerAns = cleanedAns.toLowerCase();

  // If answer is empty, blank, or an explicit skip/don't know
  const isBlankOrSkipped =
    !cleanedAns ||
    cleanedAns.length < 3 ||
    lowerAns === 'skip' ||
    lowerAns === 'skipped' ||
    lowerAns === 'pass' ||
    lowerAns === 'next' ||
    lowerAns === 'no' ||
    lowerAns === 'idk' ||
    lowerAns === "i don't know" ||
    lowerAns === "i dont know" ||
    lowerAns === 'no answer' ||
    lowerAns === 'n/a' ||
    lowerAns === 'none';

  if (isBlankOrSkipped) {
    return {
      score: 0,
      relevanceScore: 0,
      technicalScore: 0,
      communicationScore: 0,
      clarityScore: 0,
      completenessScore: 0,
      problemSolvingScore: 0,
      positiveFeedback: 'No response was provided for this question.',
      areasForImprovement: 'Review foundational concepts for this topic and attempt answering with core definitions.',
      suggestedBetterAnswer: req.expectedPoints && req.expectedPoints.length > 0
        ? `A solid answer should cover: ${req.expectedPoints.join(', ')}.`
        : 'An ideal answer should define the fundamental concept, discuss practical use-cases, and outline key design trade-offs.',
    };
  }

  const model = getGeminiModel(req.apiKey);

  if (!model) {
    return getFallbackEvaluation(req);
  }

  const prompt = `
You are an expert technical interviewer and AI hiring coach.
Job Role: ${req.jobRole}
Question: "${req.question}"
Key Expected Points: ${JSON.stringify(req.expectedPoints)}
Candidate's Answer: "${req.candidateAnswer}"
Language: ${req.language}
Difficulty: ${req.difficulty}

Carefully evaluate the candidate's answer across the following criteria:
1. Relevance of the answer (0-10)
2. Technical correctness (0-10)
3. Communication quality (0-10)
4. Answer clarity (0-10)
5. Completeness (0-10)
6. Problem-solving approach (0-10)
Overall Score (0-10, weighted average)

IMPORTANT:
- If the answer is incorrect, irrelevant, or minimal (e.g. only 1-3 words like "yes", "okay", "code"), score it between 0 and 2.
- Score fairly based on actual accuracy and depth. Do NOT give high scores to empty or weak answers.

Provide constructive, professional feedback highlighting what they did well, where they can improve, and an exemplary suggested answer.
Return ONLY valid JSON matching this schema:
{
  "score": 0.0,
  "relevanceScore": 0.0,
  "technicalScore": 0.0,
  "communicationScore": 0.0,
  "clarityScore": 0.0,
  "completenessScore": 0.0,
  "problemSolvingScore": 0.0,
  "positiveFeedback": "...",
  "areasForImprovement": "...",
  "suggestedBetterAnswer": "..."
}
`;

  try {
    const result = await model.generateContent(prompt);
    const evaluation = parseGeminiJson<AnswerEvaluation>(result.response.text());
    return evaluation;
  } catch (error) {
    console.error('Gemini evaluation error:', error);
    return getFallbackEvaluation(req);
  }
}

export interface FinalReportRequest {
  jobRole: string;
  interviewType: string;
  experienceLevel: string;
  durationSeconds: number;
  evaluations: {
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }[];
  apiKey?: string;
}

export interface FinalReportResponse {
  overallScore: number; // 0 to 100
  strengths: string[];
  weaknesses: string[];
  technicalKnowledgeAssessment: string;
  communicationFeedback: string;
  improvementSuggestions: string[];
  recommendedTopics: string[];
  summary: string;
}

export async function generateFinalInterviewReport(req: FinalReportRequest): Promise<FinalReportResponse> {
  // If no evaluations or all evaluations are 0
  const validEvaluations = (req.evaluations || []).filter((e) => e && (e.answer || '').trim().length > 0 && e.score > 0);
  if (!req.evaluations || req.evaluations.length === 0 || validEvaluations.length === 0) {
    return {
      overallScore: 0,
      strengths: ['Initiated the interview round'],
      weaknesses: ['Did not answer any interview questions'],
      technicalKnowledgeAssessment: 'No answers were submitted to evaluate technical proficiency.',
      communicationFeedback: 'No verbal or written responses recorded for evaluation.',
      improvementSuggestions: [
        'Prepare the fundamental concepts for this role and attempt answering each question.',
        'Use practice mode to build confidence before completing the full interview.',
      ],
      recommendedTopics: ['Job Role Fundamentals', 'Interview Practice Basics'],
      summary: 'No answers were submitted during this interview session. Final score: 0 / 100.',
    };
  }

  const model = getGeminiModel(req.apiKey);

  if (!model) {
    return getFallbackFinalReport(req);
  }

  const prompt = `
You are the Head of Engineering and Interview Board President.
Generate a comprehensive, executive-level final interview report for a candidate who just completed a "${req.interviewType}" interview for the role of "${req.jobRole}" (${req.experienceLevel} level).
Interview Duration: ${Math.floor(req.durationSeconds / 60)} minutes.

Questions and Candidate Responses with individual evaluations:
${JSON.stringify(req.evaluations, null, 2)}

CALCULATION RULE:
The overallScore (0 to 100) must strictly reflect the average of the individual question scores provided in the evaluations list. If questions have 0 marks, overallScore must be proportionally reduced.

Provide an exhaustive, constructive, and motivating assessment.
Return ONLY valid JSON matching this schema:
{
  "overallScore": 0.0,
  "strengths": ["..."],
  "weaknesses": ["..."],
  "technicalKnowledgeAssessment": "Detailed paragraph evaluating technical depth...",
  "communicationFeedback": "Detailed paragraph on articulation, pace, clarity...",
  "improvementSuggestions": ["..."],
  "recommendedTopics": ["..."],
  "summary": "Executive summary of the candidate's interview performance."
}
`;

  try {
    const result = await model.generateContent(prompt);
    return parseGeminiJson<FinalReportResponse>(result.response.text());
  } catch (error) {
    console.error('Gemini final report error:', error);
    return getFallbackFinalReport(req);
  }
}

// Fallback Questions Bank
function getFallbackQuestions(req: QuestionRequest): GeneratedQuestion[] {
  const role = req.jobRole.toLowerCase();
  let baseQuestions: { q: string; points: string[]; diff: string }[] = [];

  if (req.interviewType === 'HR') {
    baseQuestions = [
      {
        q: 'Tell me about yourself, your educational background, and what inspired you to pursue a career in technology.',
        points: ['Educational journey', 'Key projects or internships', 'Passion for continuous learning', 'Alignment with tech industry'],
        diff: 'Easy',
      },
      {
        q: 'Describe a challenging team project you worked on. How did you resolve disagreements or handle tight deadlines?',
        points: ['Situation and Task', 'Collaboration and communication', 'Conflict resolution steps', 'Successful outcome'],
        diff: 'Medium',
      },
      {
        q: 'Where do you see yourself in 3 to 5 years, and how does this role align with your long-term career aspirations?',
        points: ['Skill growth goals', 'Leadership or technical mentorship', 'Contribution to the company vision'],
        diff: 'Easy',
      },
      {
        q: 'How do you handle constructive criticism or feedback when a project you worked hard on requires major revisions?',
        points: ['Open mindset', 'Separating ego from code/work', 'Actionable implementation of feedback'],
        diff: 'Medium',
      },
      {
        q: 'Why should our company hire you over other qualified candidates applying for this position?',
        points: ['Unique blend of technical and soft skills', 'Proactive work ethic', 'Cultural fit and dedication'],
        diff: 'Medium',
      },
    ];
  } else if (req.interviewType === 'Coding') {
    baseQuestions = [
      {
        q: 'Given an array of integers, how would you find two numbers that sum up to a specific target? Explain time and space complexity.',
        points: ['Brute force O(N^2)', 'Hash Map approach O(N) time and O(N) space', 'Handling duplicates and edge cases'],
        diff: 'Easy',
      },
      {
        q: 'How would you detect a cycle in a singly linked list? Describe Floyd’s Tortoise and Hare algorithm.',
        points: ['Fast and slow pointer concept', 'O(1) auxiliary space', 'Proof of termination'],
        diff: 'Medium',
      },
      {
        q: 'Explain how you would implement a LRU (Least Recently Used) Cache with O(1) get and put operations.',
        points: ['Doubly linked list + Hash Map', 'Node eviction and node movement to head', 'Thread safety considerations'],
        diff: 'Hard',
      },
      {
        q: 'Given a string containing parentheses "()[]{}", explain how to validate whether the brackets are properly nested.',
        points: ['Stack data structure', 'LIFO matching', 'Edge cases with empty or unbalanced strings'],
        diff: 'Easy',
      },
      {
        q: 'How would you find the maximum subarray sum in an array containing positive and negative integers? (Kadane’s Algorithm)',
        points: ['Dynamic programming sub-problem', 'Tracking max ending here and max so far', 'O(N) time complexity'],
        diff: 'Medium',
      },
    ];
  } else if (req.interviewType === 'Aptitude') {
    baseQuestions = [
      {
        q: 'A train 240 meters long passes a pole in 24 seconds. How long will it take to pass a platform 650 meters long?',
        points: ['Train speed = 240 / 24 = 10 m/s', 'Total distance = 240 + 650 = 890m', 'Time = 890 / 10 = 89 seconds'],
        diff: 'Medium',
      },
      {
        q: 'If 6 men or 8 women can complete a piece of work in 86 days, in how many days can 7 men and 5 women complete the same work?',
        points: ['Work equivalence equation', 'Rate of work calculation', 'Total days computation'],
        diff: 'Hard',
      },
      {
        q: 'In a code language, if COMPUTER is coded as RFUVQNPC, how is MEDICINE written in that code?',
        points: ['Pattern identification (reverse + letter shifts)', 'Systematic step-by-step transformation'],
        diff: 'Medium',
      },
      {
        q: 'A shopkeeper marks an article 25% above the cost price and allows a discount of 12% on the marked price. What is his profit percentage?',
        points: ['Let CP = 100, MP = 125', 'SP = 125 * (1 - 0.12) = 110', 'Profit = 10%'],
        diff: 'Easy',
      },
      {
        q: 'Three pipes A, B, and C can fill a tank in 6 hours. After working together for 2 hours, C is closed, and A and B fill the remaining part in 7 hours. How long will C take alone?',
        points: ['Combined work in 2 hours = 1/3', 'Remaining 2/3 done by A+B in 7 hours', 'C rate = 1/6 - 2/21 = 1/14 -> 14 hours'],
        diff: 'Hard',
      },
    ];
  } else {
    // Technical Interview
    if (role.includes('python')) {
      baseQuestions = [
        {
          q: 'Explain the Global Interpreter Lock (GIL) in Python. How does it impact multithreaded CPU-bound versus I/O-bound applications?',
          points: ['CPython memory management and reference counting', 'Impact on single-core execution for threads', 'Multiprocessing vs asyncio solutions'],
          diff: 'Medium',
        },
        {
          q: 'What is the difference between list comprehensions, generator expressions, and standard loops in terms of memory efficiency?',
          points: ['Yield vs list materialization', 'Lazy evaluation iterator protocol', 'Memory footprint for large datasets'],
          diff: 'Easy',
        },
        {
          q: 'How do decorators work in Python? Write or explain a custom decorator that measures the execution time of a function.',
          points: ['First-class functions and closures', 'functools.wraps preservation of metadata', 'kwargs and args forwarding'],
          diff: 'Medium',
        },
        {
          q: 'How does memory management and garbage collection work in Python (reference counting vs cyclic garbage collector)?',
          points: ['PyObject reference counts', 'Generational garbage collection (Generation 0, 1, 2)', 'gc module and cyclic references'],
          diff: 'Hard',
        },
        {
          q: 'What are context managers in Python and how do you implement one using either a class or contextlib.contextmanager?',
          points: ['__enter__ and __exit__ dunder methods', 'Resource cleanup guarantee (files, sockets, DB locks)', 'Handling exceptions during exit'],
          diff: 'Medium',
        },
      ];
    } else if (role.includes('data') || role.includes('analyst')) {
      baseQuestions = [
        {
          q: 'Explain the difference between WHERE and HAVING clauses in SQL, with a realistic analytical example.',
          points: ['Row-level filtering before aggregation vs group-level filtering after GROUP BY', 'Usage of aggregate functions like COUNT, AVG with HAVING'],
          diff: 'Easy',
        },
        {
          q: 'What are SQL window functions like ROW_NUMBER(), RANK(), and DENSE_RANK()? How do they differ?',
          points: ['OVER (PARTITION BY ... ORDER BY ...)', 'Ties handling (skipping numbers in RANK vs continuous in DENSE_RANK)'],
          diff: 'Medium',
        },
        {
          q: 'How do you handle missing or corrupted data in Pandas? When would you impute versus drop records?',
          points: ['isna(), fillna(), dropna()', 'Mean/median imputation vs forward fill', 'Impact on distribution and statistical bias'],
          diff: 'Medium',
        },
        {
          q: 'Explain the difference between correlation and causation. What statistical techniques can you use to test for causal relationships?',
          points: ['Confounding variables', 'A/B testing and randomized controlled trials', 'Regression analysis and p-value significance'],
          diff: 'Medium',
        },
        {
          q: 'How would you optimize a slow-running SQL query joining three multi-million row tables in a data warehouse?',
          points: ['Explain plan inspection', 'Indexing strategies and partitioning keys', 'Filtering before joins and avoiding SELECT *'],
          diff: 'Hard',
        },
      ];
    } else if (role.includes('web') || role.includes('frontend')) {
      baseQuestions = [
        {
          q: 'Explain the JavaScript event loop, microtask queue, and macrotask queue. How do Promises and setTimeout execute?',
          points: ['Call stack execution', 'Microtasks (Promises, queueMicrotask) prioritized before macrotasks (setTimeout, setInterval)', 'Render cycle timing'],
          diff: 'Medium',
        },
        {
          q: 'How does React’s Virtual DOM and reconciliation algorithm (Fiber) work to optimize UI updates?',
          points: ['Diffing heuristic (key prop, component type)', 'Interruptible rendering units (Fiber nodes)', 'Commit phase vs render phase'],
          diff: 'Medium',
        },
        {
          q: 'What strategies do you use for optimizing web application performance (Core Web Vitals)?',
          points: ['LCP, FID/INP, CLS optimization', 'Code splitting, dynamic imports, lazy loading', 'Asset caching, CDN, image modern formats (webp, avif)'],
          diff: 'Medium',
        },
        {
          q: 'Explain CSS specificity and the modern CSS box model. What is the difference between content-box and border-box?',
          points: ['Specificity hierarchy (inline, id, class, tag)', 'border-box includes padding and border in width/height', 'Flexbox/Grid layout contexts'],
          diff: 'Easy',
        },
        {
          q: 'How do you secure a web application against Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF)?',
          points: ['Content Security Policy (CSP)', 'Sanitizing user input and DOMPurify', 'SameSite cookies, CSRF tokens, HttpOnly flags'],
          diff: 'Hard',
        },
      ];
    } else {
      // General Software Developer
      baseQuestions = [
        {
          q: 'Explain the SOLID principles of object-oriented design and provide a real-world example of the Single Responsibility Principle.',
          points: ['Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion', 'Maintainability and decoupling benefits'],
          diff: 'Easy',
        },
        {
          q: 'What is the difference between monolithic architecture and microservices? What are the key challenges of microservices?',
          points: ['Independent deployment vs unified codebase', 'Distributed transactions, network latency, data consistency (CAP theorem)', 'Service discovery and observability'],
          diff: 'Medium',
        },
        {
          q: 'How do database indexes (B-Trees and Hash indexes) work internally, and what are the trade-offs of adding too many indexes?',
          points: ['O(log N) lookup vs full table scan', 'Write performance degradation on INSERT/UPDATE/DELETE', 'Storage overhead and index bloat'],
          diff: 'Medium',
        },
        {
          q: 'Explain how RESTful APIs differ from GraphQL. When would you choose one over the other in enterprise engineering?',
          points: ['Over-fetching and under-fetching prevention in GraphQL', 'Standard caching headers in REST vs single endpoint in GraphQL', 'Tooling and schema complexity'],
          diff: 'Medium',
        },
        {
          q: 'Describe how you design a resilient system that can handle sudden 10x traffic spikes without cascading failure.',
          points: ['Rate limiting and circuit breakers', 'Horizontal auto-scaling and load balancing', 'Asynchronous message queues (Kafka, RabbitMQ) and caching (Redis)'],
          diff: 'Hard',
        },
      ];
    }
  }

  // Slice or repeat to match req.count
  const questions: GeneratedQuestion[] = [];
  for (let i = 0; i < req.count; i++) {
    const item = baseQuestions[i % baseQuestions.length];
    questions.push({
      order: i + 1,
      question: item.q,
      expectedPoints: item.points,
      difficulty: item.diff,
      category: req.interviewType,
    });
  }
  return questions;
}

function getFallbackEvaluation(req: EvaluateAnswerRequest): AnswerEvaluation {
  const text = (req.candidateAnswer || '').trim();
  const words = text.split(/\s+/).filter(Boolean);
  const answerLen = words.length;

  // Strict check for empty, minimal, or skipped answers
  if (answerLen === 0) {
    return {
      score: 0,
      relevanceScore: 0,
      technicalScore: 0,
      communicationScore: 0,
      clarityScore: 0,
      completenessScore: 0,
      problemSolvingScore: 0,
      positiveFeedback: 'No response submitted.',
      areasForImprovement: 'Attempt answering each question to demonstrate your understanding.',
      suggestedBetterAnswer: 'An ideal response should define the topic and provide clear real-world examples.',
    };
  }

  let score = 0;
  if (answerLen < 4) score = 1.0;
  else if (answerLen < 10) score = 3.0;
  else if (answerLen < 25) score = 5.5;
  else if (answerLen < 50) score = 7.5;
  else score = 8.8;

  return {
    score: Math.min(10, Math.max(0, score)),
    relevanceScore: Math.min(10, Math.max(0, score + 0.2)),
    technicalScore: Math.min(10, Math.max(0, score - 0.2)),
    communicationScore: Math.min(10, Math.max(0, score + 0.3)),
    clarityScore: Math.min(10, Math.max(0, score + 0.1)),
    completenessScore: Math.min(10, Math.max(0, score - 0.3)),
    problemSolvingScore: Math.min(10, Math.max(0, score)),
    positiveFeedback: score >= 5
      ? 'Good job structuring your response. You directly addressed the question and conveyed your ideas clearly.'
      : 'You initiated an attempt. Focus on providing structured explanations.',
    areasForImprovement: score >= 5
      ? 'Consider diving deeper into underlying edge cases, performance trade-offs, and architectural implications.'
      : 'Explain the core principles in greater detail and provide concrete implementation steps.',
    suggestedBetterAnswer: 'A comprehensive answer should explicitly highlight key architectural principles: 1) State the core concept clearly; 2) Discuss practical trade-offs; 3) Provide a production-tested example demonstrating reliability and scalability.',
  };
}

function getFallbackFinalReport(req: FinalReportRequest): FinalReportResponse {
  if (!req.evaluations || req.evaluations.length === 0) {
    return {
      overallScore: 0,
      strengths: ['Interview session initiated'],
      weaknesses: ['No questions were answered during the interview'],
      technicalKnowledgeAssessment: 'No answers recorded to evaluate technical fundamentals.',
      communicationFeedback: 'No verbal or written responses were provided.',
      improvementSuggestions: ['Complete each question in the track to receive a thorough evaluation.'],
      recommendedTopics: ['Foundational Concepts', 'Interview Practice Basics'],
      summary: 'No questions were answered during this interview. Final Score: 0 / 100.',
    };
  }

  const validScores = req.evaluations.map((e) => Number(e.score) || 0);
  const totalScore = validScores.reduce((acc, curr) => acc + curr, 0);
  const avgScore = validScores.length > 0 ? totalScore / validScores.length : 0;
  const overall = Math.round(avgScore * 10 * 10) / 10;

  if (overall === 0) {
    return {
      overallScore: 0,
      strengths: ['Initiated the interview round'],
      weaknesses: ['All questions were skipped or submitted with empty responses'],
      technicalKnowledgeAssessment: 'Technical knowledge could not be verified as zero questions received answers.',
      communicationFeedback: 'No verbal or written responses recorded for evaluation.',
      improvementSuggestions: [
        'Review the key fundamentals for this role',
        'Attempt speaking or typing answers, even if partial, to build confidence',
      ],
      recommendedTopics: ['Job Role Fundamentals', 'Interview Practice Basics'],
      summary: 'All questions were left blank or unanswered. Final Score: 0 / 100.',
    };
  }

  return {
    overallScore: overall,
    strengths: [
      'Strong fundamental understanding of core concepts',
      'Clear and structured articulation of ideas',
      'Good practical perspective and problem analysis',
      'Demonstrated composure and structured thinking during questioning',
    ],
    weaknesses: [
      'Could provide more concrete production metrics and real-world numbers',
      'Deeper exploration of edge cases and exception handling is advised',
    ],
    technicalKnowledgeAssessment: `The candidate showed solid technical acumen for a ${req.experienceLevel} ${req.jobRole}. They demonstrated a firm grasp of essential terminology, architecture, and common best practices.`,
    communicationFeedback: `Communication was professional, concise, and focused. The candidate answered questions with steady pacing and good confidence.`,
    improvementSuggestions: [
      'Utilize the STAR method (Situation, Task, Action, Result) for situational responses',
      'Include quantitative impact (e.g. latency reductions, throughput gains) in project descriptions',
      'Deepen knowledge on advanced system scalability and resilience patterns',
    ],
    recommendedTopics: [
      'System Architecture & Design Patterns',
      'Concurrency & Asynchronous Programming',
      'Database Optimization & Caching Strategies',
      'Cloud Native Resiliency & Monitoring',
    ],
    summary: `Overall, the candidate scored ${overall}/100 based on submitted answers. With focused preparation on edge cases and metrics, they are well positioned for success.`,
  };
}

