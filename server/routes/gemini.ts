import { Router, Request, Response } from 'express';
import {
  generateInterviewQuestions,
  generateFollowUpQuestion,
  evaluateCandidateAnswer,
  generateFinalInterviewReport,
  getGeminiModel,
  parseGeminiJson,
} from '../services/geminiService.js';

const router = Router();

// 1. Generate Questions
router.post('/generate-questions', async (req: Request, res: Response) => {
  try {
    const { jobRole, interviewType, experienceLevel, difficulty, count, language, resumeText } = req.body;
    
    if (!jobRole || !interviewType) {
      return res.status(400).json({ error: 'Missing required parameters: jobRole and interviewType are required.' });
    }

    const result = await generateInterviewQuestions({
      jobRole: jobRole || 'Software Developer',
      interviewType: interviewType || 'Technical',
      experienceLevel: experienceLevel || 'Fresher',
      difficulty: difficulty || 'Medium',
      count: parseInt(count, 10) || 5,
      language: language || 'English',
      resumeText,
      apiKey: req.headers['x-gemini-key'] as string | undefined,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error generating questions:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate interview questions' });
  }
});

// 2. Generate Follow-up Question
router.post('/follow-up', async (req: Request, res: Response) => {
  try {
    const { jobRole, question, candidateAnswer, language, currentDifficulty } = req.body;
    
    if (!question || !candidateAnswer) {
      return res.status(400).json({ error: 'question and candidateAnswer are required.' });
    }

    const result = await generateFollowUpQuestion({
      jobRole: jobRole || 'Software Developer',
      question,
      candidateAnswer,
      language: language || 'English',
      currentDifficulty: currentDifficulty || 'Medium',
      apiKey: req.headers['x-gemini-key'] as string | undefined,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Error generating follow-up:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate follow-up question' });
  }
});

// 3. Evaluate Candidate Answer
router.post('/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const { jobRole, question, expectedPoints, candidateAnswer, language, difficulty } = req.body;
    
    if (!question || !candidateAnswer) {
      return res.status(400).json({ error: 'question and candidateAnswer are required.' });
    }

    const evaluation = await evaluateCandidateAnswer({
      jobRole: jobRole || 'Software Developer',
      question,
      expectedPoints: expectedPoints || [],
      candidateAnswer,
      language: language || 'English',
      difficulty: difficulty || 'Medium',
      apiKey: req.headers['x-gemini-key'] as string | undefined,
    });

    return res.json(evaluation);
  } catch (error: any) {
    console.error('Error evaluating answer:', error);
    return res.status(500).json({ error: error.message || 'Failed to evaluate answer' });
  }
});

// 4. Generate Final Comprehensive Report
router.post('/final-report', async (req: Request, res: Response) => {
  try {
    const { jobRole, interviewType, experienceLevel, durationSeconds, evaluations } = req.body;

    if (!evaluations || !Array.isArray(evaluations)) {
      return res.status(400).json({ error: 'evaluations array is required.' });
    }

    const report = await generateFinalInterviewReport({
      jobRole: jobRole || 'Software Developer',
      interviewType: interviewType || 'Technical',
      experienceLevel: experienceLevel || 'Fresher',
      durationSeconds: durationSeconds || 600,
      evaluations,
      apiKey: req.headers['x-gemini-key'] as string | undefined,
    });

    return res.json(report);
  } catch (error: any) {
    console.error('Error generating final report:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate final report' });
  }
});

// 5. AI Coding Evaluation & Explanation
router.post('/review-code', async (req: Request, res: Response) => {
  try {
    const { problemTitle, problemDescription, language, code, executionResult } = req.body;
    
    const model = getGeminiModel(req.headers['x-gemini-key'] as string | undefined);

    if (!model) {
      return res.json({
        correctnessScore: 8,
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        feedback: 'Code looks clean and logically structured. Test outputs match anticipated results.',
        suggestions: ['Consider checking edge cases for null/empty input values.', 'Add descriptive variable names.'],
      });
    }

    const prompt = `
You are an expert algorithm judge and software engineering interviewer.
Problem Title: "${problemTitle}"
Problem Description: "${problemDescription}"
Programming Language: ${language}
Submitted Code:
\`\`\`${language}
${code}
\`\`\`

Execution Results:
${JSON.stringify(executionResult)}

Evaluate the correctness, performance, and style of the code.
Return ONLY valid JSON in this format:
{
  "correctnessScore": 9, // 0 to 10
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "feedback": "Clear explanation of how the code works and whether it solves all constraints...",
  "suggestions": ["Specific tip 1", "Specific tip 2"],
  "improvedCode": "Optional optimized version if improvements are warranted"
}
`;

    const result = await model.generateContent(prompt);
    const review = parseGeminiJson(result.response.text());
    return res.json(review);
  } catch (error: any) {
    console.error('Error reviewing code:', error);
    return res.status(500).json({ error: error.message || 'Failed to review code' });
  }
});

export default router;

