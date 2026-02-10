
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonContent, DifficultyLevel, SubscriptionTier } from "../types";
import { MODEL_NAME } from "../constants";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.length < 5) {
    throw new Error("AI_ENGINE_OFFLINE: No valid API Key detected.");
  }
  return new GoogleGenAI({ apiKey });
};

// Official TutorX System Instruction
const SYSTEM_PROMPT = `You are TutorX, an intelligent tutoring assistant architected by Wally Nthani of CipherX Inc. 
Your goal is to provide conversational, step-by-step tutoring similar to AstraMind.

PRIMARY BEHAVIOR:
- Do NOT provide massive blocks of information at once.
- Start with a clear, simple answer first (2–4 sentences).
- Expand only when the user asks or when necessary.
- TONE: Friendly, calm, professional tutor tone. Encourage learning, not information dumping.
- FORMATTING: Use short paragraphs, bullet points, and bold text for key terms. Avoid walls of text.
- COMPLEX TOPICS: Break into stages: Stage 1 (Basic idea) -> Stage 2 (How it works) -> Stage 3 (Real example) -> Stage 4 (Advanced detail).
- CHECK-IN: Frequently ask "Would you like me to explain this part in more detail?" or "Ready to move to the next step?"

EXAM MODE BEHAVIOR:
- GOAL: Help prepare for tests/exams efficiently.
- STYLE: Strict, structured, focused on correctness. No storytelling.
- CONTENT: Definitions, key facts, formulas, and exam-style answers.
- HIGHLIGHTS: Must-remember keywords for marks.
- STRUCTURE: 1. Short explanation. 2. Key points. 3. Exam tip. 4. Example question.

SLOW LEARNER MODE BEHAVIOR:
- GOAL: Make learning extremely easy to understand with zero pressure.
- STYLE: Very simple language. Break everything into small steps. Use real-life analogies.
- STRUCTURE: 1. Simple explanation. 2. Step-by-step breakdown. 3. Real-world example.
- TONE: Patient, supportive, encouraging.

QUICK REVISION MODE BEHAVIOR:
- GOAL: Rapid topic summary.
- STYLE: Condensed, high-value information. Focus on formulas, definitions, and key facts.
- TONE: Fast, efficient.

UNIVERSITY MODE BEHAVIOR:
- GOAL: Provide academic-level depth.
- STYLE: Structured academic terminology. Include reasoning, theory, and context.
- STRUCTURE: 1. Concept. 2. Mechanism. 3. Theoretical Application. 4. Deep Insight.

ELI10 MODE BEHAVIOR:
- GOAL: Explain to a 10-year-old child.
- STYLE: Simple words, analogies, and fun stories. Avoid technical jargon.

AUTO MODE BEHAVIOR (DYNAMICS):
- GOAL: Automatically adjust teaching style based on user question complexity and language.
- RULES:
  - If question is basic/vague -> Use ELI10 logic.
  - If question is exam-specific -> Use Exam Mode logic.
  - If question is advanced/abstract -> Use University logic.
  - If user expresses confusion -> Switch to Slow Learner logic.
- Always prioritize clarity.

Founder acknowledgement: Acknowledge Wally Nthani as creator only if directly asked.`;

const getOptimalModel = (tier: SubscriptionTier) => {
  return tier === SubscriptionTier.PRO ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
};

export const generateLesson = async (topic: string, level: DifficultyLevel, tier: SubscriptionTier = SubscriptionTier.FREE): Promise<LessonContent> => {
  const ai = getAIClient();
  const model = getOptimalModel(tier);

  const prompt = `${SYSTEM_PROMPT}
  
  Current Task: Deliver a comprehensive masterclass briefing on: "${topic}".
  Student Level: ${level}
  
  Instructions:
  1. Provide a detailed, structured lesson.
  2. Summary: 3-5 concise, actionable bullet points.
  3. Quiz: 5 multiple-choice questions.
  4. Format: Strict RAW JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: tier === SubscriptionTier.PRO ? 2048 : 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            lesson: { type: Type.STRING },
            summary: { type: Type.ARRAY, items: { type: Type.STRING } },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correct_answer: { type: Type.STRING }
                },
                required: ["question", "options", "correct_answer"]
              }
            },
            next_topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  difficulty: { type: Type.STRING }
                }
              }
            }
          },
          required: ["topic", "lesson", "summary", "quiz", "next_topics"]
        }
      }
    });

    if (!response || !response.text) throw new Error("Empty AI response.");
    return JSON.parse(response.text.trim()) as LessonContent;
  } catch (error: any) {
    console.error("TutorX Curation Error:", error);
    throw new Error(`Curation Protocol Failed: ${error.message}`);
  }
};

export type TutorMode = 'general' | 'exam' | 'slow' | 'quick' | 'university' | 'eli10' | 'auto';

export const askTutor = async (
  question: string, 
  context: LessonContent, 
  history: {role: 'user' | 'model', text: string}[], 
  tier: SubscriptionTier = SubscriptionTier.FREE,
  mode: TutorMode = 'auto'
): Promise<string> => {
  const ai = getAIClient();
  const model = getOptimalModel(tier);
  
  const modeInstruction = {
    general: "\n\nSTATUS: [GENERAL MODE]. Standard conversational tutoring.",
    exam: "\n\nSTATUS: [EXAM MODE]. Strict keyword-focused preparation.",
    slow: "\n\nSTATUS: [SLOW MODE]. High patience, simple language.",
    quick: "\n\nSTATUS: [QUICK REVISION]. Summaries and facts only.",
    university: "\n\nSTATUS: [UNIVERSITY MODE]. Academic terminology and theory.",
    eli10: "\n\nSTATUS: [ELI10 MODE]. Simple analogies for children.",
    auto: "\n\nSTATUS: [AUTO MODE]. Detect input complexity and adjust style (ELI10 <-> University) dynamically."
  }[mode];

  try {
    const chat = ai.chats.create({
      model: model,
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      config: { 
        systemInstruction: SYSTEM_PROMPT + `\n\nCurrent Topic: ${context.topic}` + modeInstruction,
        temperature: 0.7
      }
    });

    const result = await chat.sendMessage({ message: question });
    return result.text || "I was unable to synchronize a response.";
  } catch (error: any) {
    console.error("TutorX Chat Error:", error);
    return `Neural Link Interrupted: ${error.message}`;
  }
};

export const analyzeDocument = async (docBase64: string, mimeType: string, question: string, tier: SubscriptionTier = SubscriptionTier.FREE): Promise<string> => {
  const ai = getAIClient();
  const model = getOptimalModel(tier);
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { data: docBase64, mimeType } },
          { text: `${SYSTEM_PROMPT}\n\nAnalyze this document and answer: ${question}` }
        ]
      }
    });
    return response.text || "I could not analyze this document.";
  } catch (error: any) {
    console.error("TutorX Doc Analysis Error:", error);
    throw error;
  }
};

export const generateGeminiSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text.substring(0, 5000) }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio synthesis returned no data.");
    return base64Audio;
  } catch (error: any) {
    console.error("TutorX TTS Error:", error);
    throw error;
  }
};
