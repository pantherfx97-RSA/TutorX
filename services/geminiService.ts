
import { GoogleGenAI, Type } from "@google/genai";
import { LessonContent, DifficultyLevel } from "../types";

export const generateLesson = async (topic: string, level: DifficultyLevel): Promise<LessonContent> => {
  // Always create a new instance inside the call to get the latest key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview'; // Upgraded for complex reasoning tasks

  const prompt = `You are TutorX, an elite AI Architect and Master Educator. 
  Current Mission: Deliver a comprehensive, deep-dive Masterclass on the topic: "${topic}".
  Student Level: ${level}
  
  Instructions for the 'lesson' field:
  1. DO NOT give a brief summary. Provide an extensive, multi-layered explanation (600-1000 words).
  2. Structure: 
     - "The Foundation": Define the topic and its historical/theoretical origin.
     - "The Core Mechanics": Deep dive into how it works, using analogies for complex parts.
     - "Advanced Intricacies": Explore the nuances that only experts know.
     - "Real-World Application": Provide 2-3 concrete case studies or examples of this in action today.
     - "The Future": Briefly explain where this topic is heading.
  3. Tone: Professional, encouraging, and intellectually stimulating.
  
  Instructions for other fields:
  - Summary: 5 critical "Golden Rules" or takeaways.
  - Quiz: 3 challenging questions that test deep understanding, not just definitions.
  - Next Topics: Logical progression paths based on this masterclass.
  
  Format: Strict RAW JSON only. No markdown formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 0 },
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

    if (!response || !response.text) {
      throw new Error("Empty response from AI engine.");
    }

    return JSON.parse(response.text) as LessonContent;
  } catch (error: any) {
    console.error("TutorX AI Error:", error);
    // Specific error handling for missing key or entity issues
    if (error.message.includes("API Key") || error.message.includes("403") || error.message.includes("401")) {
      throw new Error("AI Engine Authentication Failed: Please check your API Key configuration.");
    }
    throw new Error(`Failed to curate lesson: ${error.message || "Unknown Error"}`);
  }
};

export const askTutor = async (question: string, context: LessonContent, history: {role: 'user' | 'model', text: string}[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `You are TutorX AI, a helpful and expert teaching assistant. 
  The student has just finished a masterclass on "${context.topic}". 
  Your goal is to answer their follow-up questions accurately, concisely, and encouragingly.
  Use the following lesson content as your primary reference: ${context.lesson.substring(0, 3000)}.
  If the question is unrelated to learning or the topic, gently guide them back to the subject.`;

  try {
    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const result = await chat.sendMessage({ message: question });
    return result.text || "I'm sorry, I couldn't process that question.";
  } catch (error: any) {
    console.error("TutorX Chat Error:", error);
    if (error.message.includes("API Key")) {
      return "Authentication error. Please re-configure your AI key in the settings.";
    }
    return "The AI Tutor is temporarily unavailable. Please try again in a moment.";
  }
};
