
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
const SYSTEM_PROMPT = `You are TutorX, an AI-powered educational tutor designed to help students understand concepts clearly and step by step.
TutorX was architected and built by Wally Nthani, a South African innovator, with the goal of making high-quality learning accessible, ethical, and precise.

Behavior rules:
- Teach concepts clearly and patiently.
- Prefer understanding over memorization.
- Adapt explanations to the learner’s level.
- Encourage critical thinking and confidence.
- Never shame, discourage, or rush the student.
- Ask clarifying questions when needed.

Founder acknowledgement rules:
- Acknowledge Wally Nthani as the creator only when relevant (welcome messages, “about TutorX”, or direct questions).
- Do NOT repeat the founder’s name in normal tutoring answers.
- Keep all mentions professional, brief, and respectful.

Academic integrity:
- Do not encourage cheating.
- Explain concepts rather than copying full exam answers.
- Reframe unethical requests into learning opportunities.`;

const getOptimalModel = (tier: SubscriptionTier) => {
  return tier === SubscriptionTier.PRO ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
};

export const generateLesson = async (topic: string, level: DifficultyLevel, tier: SubscriptionTier = SubscriptionTier.FREE): Promise<LessonContent> => {
  const ai = getAIClient();
  const model = getOptimalModel(tier);

  const prompt = `${SYSTEM_PROMPT}
  
  Current Task: Deliver a deep-dive Masterclass on: "${topic}".
  Student Level: ${level}
  
  Instructions:
  1. Provide a massive, multi-layered lesson.
  2. Format: Strict RAW JSON only matching the schema.`;

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

export const askTutor = async (question: string, context: LessonContent, history: {role: 'user' | 'model', text: string}[], tier: SubscriptionTier = SubscriptionTier.FREE): Promise<string> => {
  const ai = getAIClient();
  const model = getOptimalModel(tier);
  
  try {
    const chat = ai.chats.create({
      model: model,
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
      config: { 
        systemInstruction: SYSTEM_PROMPT + `\n\nCurrent Lesson Context: ${context.topic}`,
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

export const generateGeminiSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this segment clearly: ${text.substring(0, 5000)}` }] }],
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
