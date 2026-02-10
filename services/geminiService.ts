
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LessonContent, DifficultyLevel, SubscriptionTier, TutorMode } from "../types";
import { MODEL_NAME } from "../constants";

// Helper to initialize GoogleGenAI strictly following naming and security protocols
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.length < 5) {
    throw new Error("AI_ENGINE_OFFLINE: No valid API Key detected.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Official TutorX System Instruction
const SYSTEM_PROMPT = `You are TutorX, a world-class intelligent tutoring assistant architected by Wally Nthani for CipherX Inc.

STRICT TYPOGRAPHY & VISUAL PROTOCOL:
1. **Visual Hierarchy**: Use ### **[TITLE]** for primary headings.
2. **Emphasis**: Wrap every single important term or new concept in **double asterisks** (**like this**).
3. **Emojis**: Start every paragraph or section with a relevant emoji to anchor the visual focus.
   - 💡 for insights.
   - 📝 for definitions.
   - 🎯 for objectives.
   - 🚀 for summaries.
   - 🧠 for analogies.
   - 🧪 for scientific facts.
4. **Spacing**: Use double line breaks between sections. Avoid dense blocks of text.
5. **Tone**: Be encouraging and high-clarity.

MODES:
- EXAM MODE: Focus on keywords that earn marks. Use 📝.
- SLOW LEARNER: Simple language, heavy analogies, patient steps. Use 🧠.
- QUICK REVISION: Bullet points and core formulas only. Use ⚡.
- UNIVERSITY: High-level theory, academic terminology, and context. Use 🎓.
- ELI10: Storytelling logic and whimsical analogies. Use 👶.
- AUTO: Adapt complexity dynamically.

ALWAYS use Markdown. ALWAYS bold key terms.
Founder acknowledgement: Acknowledge Wally Nthani ONLY if directly asked.`;

const getOptimalModel = (tier: SubscriptionTier) => {
  return tier === SubscriptionTier.PRO ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
};

export const generateLesson = async (promptData: string, level: DifficultyLevel, tier: SubscriptionTier = SubscriptionTier.FREE): Promise<LessonContent> => {
  const ai = getAIClient();
  const model = getOptimalModel(tier);

  const fullPrompt = `${SYSTEM_PROMPT}
  
  CURRENT TASK: Deliver a masterclass briefing.
  
  Input Data: ${promptData}
  
  Instructions:
  1. Detailed lesson text with bold headings and subheadings.
  2. Summary: 3-5 critical takeaways with emojis.
  3. Quiz: 5 MCQs.
  4. Format: RAW JSON ONLY.`;

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
    console.error("TutorX Curation Error:", error);
    throw new Error(`Curation Protocol Failed: ${error.message}`);
  }
};

export const askTutor = async (
  question: string, 
  context: LessonContent, 
  history: {role: 'user' | 'model', text: string}[], 
  tier: SubscriptionTier = SubscriptionTier.FREE,
  mode: TutorMode = 'auto'
): Promise<string> => {
  const ai = getAIClient();
  const model = getOptimalModel(tier);
  
  const modeInstruction = `\n\nNEURAL STATE: [${mode.toUpperCase()} MODE]. Respond using high-fidelity Markdown, bold headings, and emojis.`;

  try {
    const chat = ai.chats.create({
      model: model,
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      config: { 
        systemInstruction: SYSTEM_PROMPT + `\n\nCurrent Topic: ${context.topic}` + modeInstruction,
        temperature: 0.7
      }
    });
    const result = await chat.sendMessage({ message: question });
    return result.text || "Neural connection timeout.";
  } catch (error: any) {
    console.error("TutorX Chat Error:", error);
    return `Neural link interrupted. Please check your connection.`;
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
    console.error("TutorX TTS Error:", error);
    throw error;
  }
};
