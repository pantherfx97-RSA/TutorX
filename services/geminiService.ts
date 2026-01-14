
import { GoogleGenAI, Type } from "@google/genai";
import { LessonContent, DifficultyLevel } from "../types";
import { MODEL_NAME } from "../constants";

export const generateLesson = async (topic: string, level: DifficultyLevel): Promise<LessonContent> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      model: MODEL_NAME,
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
    throw new Error(`Failed to curate lesson: ${error.message || "Unknown Error"}`);
  }
};

export const askTutor = async (question: string, context: LessonContent, history: {role: 'user' | 'model', text: string}[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are TutorX AI, a helpful and expert teaching assistant. 
  The student has just finished a masterclass on "${context.topic}". 
  Your goal is to answer their follow-up questions accurately, concisely, and encouragingly.
  Use the following lesson content as your primary reference: ${context.lesson.substring(0, 3000)}.
  If the question is unrelated to learning or the topic, gently guide them back to the subject.`;

  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    // Send the message with history (transformed to the correct format if needed, but simple sendMessage handles string)
    // Note: In some SDK versions history is passed in create, but we can also just send the prompt with context.
    const result = await chat.sendMessage({ message: question });
    return result.text || "I'm sorry, I couldn't process that question.";
  } catch (error: any) {
    console.error("TutorX Chat Error:", error);
    return "The AI Tutor is temporarily unavailable. Please try again in a moment.";
  }
};
