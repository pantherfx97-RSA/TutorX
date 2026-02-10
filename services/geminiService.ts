
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { LessonContent, DifficultyLevel, SubscriptionTier, TutorMode } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.length < 5) {
    throw new Error("AI_ENGINE_OFFLINE: No valid API Key detected.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const SYSTEM_PROMPT = `You are TutorX, a world-class intelligent tutoring assistant architected by W Nthani for CipherX Inc.

STRICT TYPOGRAPHY & VISUAL PROTOCOL:
1. **Visual Hierarchy**: Use ### **[TITLE]** for primary headings.
2. **Emphasis**: Wrap every single important term or new concept in **double asterisks** (**like this**).
3. **Emojis**: Start every paragraph or section with a relevant emoji to anchor the visual focus.
4. **Spacing**: Use double line breaks between sections.
5. **Tone**: Be encouraging and high-clarity.`;

const MATH_GURU_PROMPT = `You are TutorX in MATHS GURU MODE.

ROLE:
You are an expert mathematics tutor that solves problems step-by-step according to school syllabus learning methods.

GOAL:
Help learners understand HOW to solve the problem, not just give the final answer.

MATHEMATICAL FORMATTING PROTOCOL (CRITICAL):
1. **NO LATEX**: Never use dollar signs ($) or raw LaTeX commands.
2. **UNICODE SYMBOLS**: Use proper mathematical Unicode characters (x², y³, 2ⁿ, ×, ÷, ±, ≠, ≈, √, π, Σ, Δ).
3. **VISUAL CLARITY**: Use white space and line breaks to make equations stand out.

TEACHING METHOD structure:
1. ### **PROBLEM UNDERSTANDING**
2. ### **GIVEN INFORMATION**
3. ### **METHOD SELECTION**
4. ### **STEP-BY-STEP SOLUTION**
5. ### **FINAL ANSWER**`;

const getOptimalModel = (tier: SubscriptionTier) => {
  return tier === SubscriptionTier.PRO ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
};

export const generateLesson = async (promptData: string, level: DifficultyLevel, tier: SubscriptionTier = SubscriptionTier.FREE): Promise<LessonContent> => {
  const ai = getAIClient();
  const model = getOptimalModel(tier);

  const fullPrompt = `${SYSTEM_PROMPT}
  CURRENT TASK: Deliver a masterclass briefing.
  Input Data: ${promptData}
  Format: RAW JSON ONLY.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
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
    throw new Error(`Curation Protocol Failed: ${error.message}`);
  }
};

export async function* askTutorStream(
  question: string, 
  context: LessonContent | { topic: string }, 
  history: {role: 'user' | 'model', text: string}[], 
  tier: SubscriptionTier = SubscriptionTier.FREE,
  mode: TutorMode = 'auto'
) {
  const ai = getAIClient();
  const model = getOptimalModel(tier);
  
  try {
    const chat = ai.chats.create({
      model: model,
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      config: { 
        systemInstruction: SYSTEM_PROMPT + `\n\nCurrent Topic: ${context.topic}\n\nNEURAL STATE: [${mode.toUpperCase()} MODE].`,
        temperature: 0.7
      }
    });
    const result = await chat.sendMessageStream({ message: question });
    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      yield c.text;
    }
  } catch (error: any) {
    yield `Neural link interrupted. Please check your connection.`;
  }
}

export async function* askMathGuruStream(
  question: string,
  image?: { data: string; mimeType: string },
  tier: SubscriptionTier = SubscriptionTier.FREE
) {
  const ai = getAIClient();
  const model = getOptimalModel(tier);

  const parts: any[] = [{ text: question || "Please solve this math problem." }];
  if (image) {
    parts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContentStream({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: MATH_GURU_PROMPT,
        temperature: 0.1,
      }
    });
    for await (const chunk of response) {
      const c = chunk as GenerateContentResponse;
      yield c.text;
    }
  } catch (error: any) {
    yield `Neural link failed: ${error.message}`;
  }
}

export const askTutor = async (
  question: string, 
  context: LessonContent | { topic: string }, 
  history: {role: 'user' | 'model', text: string}[], 
  tier: SubscriptionTier = SubscriptionTier.FREE,
  mode: TutorMode = 'auto'
): Promise<string> => {
  const ai = getAIClient();
  const model = getOptimalModel(tier);
  
  try {
    const chat = ai.chats.create({
      model: model,
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      config: { 
        systemInstruction: SYSTEM_PROMPT + `\n\nCurrent Topic: ${context.topic}\n\nNEURAL STATE: [${mode.toUpperCase()} MODE].`,
        temperature: 0.7
      }
    });
    const result = await chat.sendMessage({ message: question });
    return result.text || "Neural connection timeout.";
  } catch (error: any) {
    return `Neural link interrupted. Please check your connection.`;
  }
};

export const askMathGuru = async (
  question: string,
  image?: { data: string; mimeType: string },
  tier: SubscriptionTier = SubscriptionTier.FREE
): Promise<string> => {
  const ai = getAIClient();
  const model = getOptimalModel(tier);

  const parts: any[] = [{ text: question || "Please solve this math problem." }];
  if (image) {
    parts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
        systemInstruction: MATH_GURU_PROMPT,
        temperature: 0.1,
      }
    });
    return response.text || "Neural link interrupted.";
  } catch (error: any) {
    return `Neural link failed: ${error.message}`;
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
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio synthesis error.");
    return base64Audio;
  } catch (error: any) {
    throw error;
  }
};
