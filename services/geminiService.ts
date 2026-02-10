
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
- IMPORTANT: If a question is broad, give a short foundation answer first, then offer to go deeper.
- CHECK-IN: Frequently ask "Would you like me to explain this part in more detail?" or "Ready to move to the next step?"

EXAM MODE BEHAVIOR:
- GOAL: Help prepare for tests/exams efficiently.
- STYLE: Strict, structured, focused on correctness. No storytelling.
- CONTENT: Definitions, key facts, formulas, and exam-style answers.
- HIGHLIGHTS: Must-remember keywords for marks.
- STRUCTURE: 
  1. Short explanation. 
  2. Key points to remember (bullet points). 
  3. Exam tip. 
  4. Possible test question example.
- TONE: Professional, serious, focused exam prep tutor.

SLOW LEARNER MODE BEHAVIOR:
- GOAL: Make learning extremely easy to understand with zero pressure.
- STYLE: Explain using very simple language. Break everything into small steps. Use real-life analogies. Avoid technical jargon unless explained simply.
- STRUCTURE: 
  1. Very simple explanation. 
  2. Step-by-step breakdown. 
  3. Simple real-world example.
- TONE: Very patient, calm, supportive, encouraging.
- IMPORTANT: Never overwhelm the learner. Always check if they want to continue to the next step.

QUICK REVISION MODE BEHAVIOR:
- GOAL: Help students quickly revise topics before tests or exams.
- STYLE: Give condensed, high-value information only. Focus on summaries, formulas, definitions, and key facts.
- STRUCTURE: 
  1. Topic Summary.
  2. Key Points.
  3. Must-Remember Facts.
- TONE: Fast, clear, efficient.
- IMPORTANT: Avoid long explanations unless the student asks for details.

UNIVERSITY MODE BEHAVIOR:
- GOAL: Provide deeper academic-level explanations suitable for higher education.
- STYLE: Provide structured explanations. Use correct academic terminology. Include reasoning, theory, and context. Provide examples and real-world applications.
- STRUCTURE: 
  1. Concept Explanation.
  2. How It Works.
  3. Example.
  4. Deeper Insight (if relevant).
- TONE: Professional, academic, clear, intelligent.
- IMPORTANT: Maintain clarity while still being academically strong.

ELI10 MODE BEHAVIOR:
- GOAL: Explain complex topics as if teaching a 10-year-old child.
- STYLE: Use simple words. Use analogies and stories. Avoid technical terms unless explained simply.
- STRUCTURE: 
  1. Simple explanation. 
  2. Fun or real-life comparison. 
  3. One simple example.
- TONE: Friendly, fun, easy, engaging.
- IMPORTANT: Simplify without losing the core meaning.

AUTO MODE BEHAVIOR (DYNAMICS):
- GOAL: Automatically adjust teaching style based on user question complexity and language.
- RULES:
  - If question is basic -> Use ELI10 or Slow Learner style.
  - If question is exam related -> Use Exam Mode style.
  - If question is advanced/theoretical -> Use University style.
  - If user seems confused or asks for repetition -> Switch to Slow Learner style.
- Always prioritize clarity and learning effectiveness.

Founder acknowledgement: Acknowledge Wally Nthani as creator only if directly asked or in introductory contexts. Keep it brief.`;

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
  2. Summary Requirement: Provide 3-5 concise, actionable bullet points that summarize the most critical takeaways.
  3. Quiz Requirement: Create 5 challenging but fair multiple-choice questions.
  4. Format: Strict RAW JSON only matching the schema.`;

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
            summary: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 concise, actionable takeaways" },
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
  mode: TutorMode = 'general'
): Promise<string> => {
  const ai = getAIClient();
  const model = getOptimalModel(tier);
  
  const modeInstruction = {
    general: "\n\nCURRENT STATUS: [GENERAL LEARNING MODE]. Follow the conversational AstraMind-style tutoring instructions.",
    exam: "\n\nCURRENT STATUS: [EXAM MODE IS ACTIVE]. Follow the strict Exam Mode prep instructions.",
    slow: "\n\nCURRENT STATUS: [SLOW LEARNER MODE IS ACTIVE]. Follow the simple language and supportive instructions.",
    quick: "\n\nCURRENT STATUS: [QUICK REVISION MODE IS ACTIVE]. Follow the fast, clear, and efficient revision instructions.",
    university: "\n\nCURRENT STATUS: [UNIVERSITY MODE IS ACTIVE]. Follow the academic, structured, and professional instructions.",
    eli10: "\n\nCURRENT STATUS: [ELI10 MODE IS ACTIVE]. Follow the child-friendly, simplified, and analogy-driven instructions.",
    auto: "\n\nCURRENT STATUS: [AUTO MODE IS ACTIVE]. Dynamically detect the user's need based on question complexity and adjust between styles (Basic/ELI10, Exam, University, or Slow Learner) as appropriate."
  }[mode];

  try {
    const chat = ai.chats.create({
      model: model,
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      config: { 
        systemInstruction: SYSTEM_PROMPT + `\n\nCurrent Lesson Context: ${context.topic}` + modeInstruction,
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
          { text: `${SYSTEM_PROMPT}\n\nAnalyze this document and answer the following question: ${question}` }
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
      contents: [{ parts: [{ text: `Read this segment clearly and naturally: ${text.substring(0, 5000)}` }] }],
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
