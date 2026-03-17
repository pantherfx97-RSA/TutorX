import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const isRateLimit = error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED';
    
    if (retries <= 0) {
      if (isRateLimit) {
        throw new Error("Neural capacity reached. The AI is currently handling too many requests. Please wait a minute and try again.");
      }
      throw error;
    }

    // If it's a rate limit, use a longer delay
    const nextDelay = isRateLimit ? delay * 3 : delay * 2;
    console.warn(`API call failed (${isRateLimit ? 'Rate Limit' : 'Error'}), retrying in ${nextDelay}ms...`, error);
    
    await new Promise(resolve => setTimeout(resolve, nextDelay));
    return withRetry(fn, retries - 1, nextDelay);
  }
};

export const geminiService = {
  generateSpeech: async (text: string, voiceName: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir' = 'Zephyr') => {
    return withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Read this educational content clearly and professionally: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio;
    });
  },

  generateMasterclass: async (subject: string, level: string, focus: string, onChunk?: (text: string) => void) => {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: `Generate a structured masterclass for ${subject} at ${level} level, focusing on ${focus}.
      
      The masterclass MUST include:
      1. Lesson Breakdown (Modules)
      2. Key Concepts for each module
      3. Detailed Examples
      4. Summary and Next Steps
      
      Use professional Markdown formatting with clear headings and bullet points.`,
    });
    let fullText = '';
    for await (const chunk of response) {
      const text = chunk.text || '';
      fullText += text;
      if (onChunk) onChunk(text);
    }
    return fullText;
  },

  generateLessonStream: async (topic: string, level: string, onChunk: (text: string) => void) => {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: `Generate a detailed lesson for ${topic} at ${level} level. 
      Include introduction, core concepts, examples, and a summary. 
      Use Markdown formatting.`,
    });
    for await (const chunk of response) {
      onChunk(chunk.text || '');
    }
  },

  generateQuiz: async (topic: string, difficulty: string = 'Intermediate', count: number = 5) => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a ${count}-question multiple choice quiz about ${topic} at ${difficulty} level.
      Return the response as a JSON array of objects with the following structure:
      {
        "id": "string",
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "correctAnswer": number (0-3),
        "explanation": "string"
      }`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '[]');
  },

  chatWithTutorStream: async (
    history: { role: string; text: string }[], 
    message: string, 
    onChunk: (text: string) => void,
    subject: string = 'General Help',
    difficulty: string = 'Intermediate',
    learningMode: string = 'Standard'
  ) => {
    const subjectPrompts: Record<string, string> = {
      'Math': 'You are a Math Guru. Use LaTeX for formulas. Explain steps clearly. Focus on logic and proofs.',
      'Science': 'You are a Science Expert. Explain physical laws, biological processes, or chemical reactions with real-world analogies.',
      'English': 'You are a Language & Literature expert. Focus on grammar, style, analysis, and creative expression.',
      'General Help': 'You are a versatile AI Tutor. Provide clear, structured, and helpful explanations across any subject.'
    };

    const modePrompts: Record<string, string> = {
      'ELI10': 'Explain Like I’m 10. Use analogies involving toys, sports, or simple stories. No jargon. Be very encouraging.',
      'Exam Mode': 'Focus on direct, structured answers. Use bullet points for key facts. Highlight common exam pitfalls.',
      'University Mode': 'Provide detailed, academic explanations. Use peer-reviewed terminology and assume a high level of foundational knowledge.',
      'Slow Learner Mode': 'Break everything down into tiny, simplified steps. Check for understanding frequently. Use very gentle language.',
      'Quick Revision Mode': 'Provide concise summaries only. Focus on the most critical points and definitions.',
      'Standard': 'Provide a balanced, structured educational explanation.'
    };

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are TutorX, a premium AI educational architect. 
        
        CURRENT CONTEXT:
        - SUBJECT: ${subject}
        - DIFFICULTY: ${difficulty}
        - LEARNING MODE: ${learningMode}
        
        ${subjectPrompts[subject] || subjectPrompts['General Help']}
        ${modePrompts[learningMode] || modePrompts['Standard']}
        
        CRITICAL RULES:
        1. **EDUCATIONAL & SAFE:** Never provide harmful, inappropriate, or illegal content. If asked, politely decline and redirect to learning.
        2. **STEP-BY-STEP:** Always explain complex topics in a logical, numbered sequence.
        3. **STRUCTURED:** Use Markdown headings (##, ###), bold text, and bullet points for high readability.
        4. **ENCOURAGING:** Encourage the student to think. Ask a follow-up question at the end to test their understanding.
        5. **NO GREETINGS:** Get straight to the explanation.
        
        Format your response like a professional educational guide.`,
      },
    });
    
    const response = await chat.sendMessageStream({ message });
    for await (const chunk of response) {
      onChunk(chunk.text || '');
    }
  },

  analyzeDocument: async (fileName: string, fileContent: string, query: string, onChunk: (text: string) => void) => {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: `You are analyzing a document named "${fileName}". 
      
      Document Content:
      ${fileContent}
      
      User Query:
      ${query}
      
      Instructions:
      1. Summarize the document if requested.
      2. Extract key points.
      3. Answer specific questions based ONLY on the document content.
      4. Use professional Markdown formatting.`,
    });
    for await (const chunk of response) {
      onChunk(chunk.text || '');
    }
  },

  solveMathProblem: async (problem: string) => {
    return withRetry(async () => {
      const model = ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `You are the TutorX Math Guru. Solve the following math problem step-by-step.
        
        CRITICAL BEHAVIOR:
        1. NO GREETINGS: Do not use any introductory pleasantries.
        2. STRAIGHT TO THE POINT: Start immediately with the solution steps.
        
        Problem: ${problem}
        
        Requirements:
        1. Break the solution into clear, numbered steps.
        2. Explain the logic for each step.
        3. Include all relevant formulas used, formatted clearly in Markdown.
        4. End with a section titled "Neural Insight" that explains the underlying mathematical concept or principle.
        
        Use Markdown for formatting.`,
      });
      const response = await model;
      return response.text || '';
    });
  },

  solveMathProblemStream: async (problem: string, onChunk: (text: string) => void) => {
    const response = await ai.models.generateContentStream({
      model: "gemini-3.1-pro-preview",
      contents: `You are the TutorX Math Guru. Solve the following math problem step-by-step.
      
      CRITICAL BEHAVIOR:
      1. NO GREETINGS: Do not use any introductory pleasantries.
      2. STRAIGHT TO THE POINT: Start immediately with the solution steps.
      
      Problem: ${problem}
      
      Requirements:
      1. Break the solution into clear, numbered steps.
      2. Explain the logic for each step.
      3. Include all relevant formulas used, formatted clearly in Markdown.
      4. End with a section titled "Neural Insight" that explains the underlying mathematical concept or principle.
      
      Use Markdown for formatting.`,
    });
    for await (const chunk of response) {
      onChunk(chunk.text || '');
    }
  },

  analyzeImage: async (base64Data: string, mimeType: string, prompt: string) => {
    return withRetry(async () => {
      const model = ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          systemInstruction: "You are TutorX, an AI vision expert. Analyze the provided image and provide a detailed, structured explanation. \n\nCRITICAL BEHAVIOR:\n1. NO GREETINGS: Do not use any introductory pleasantries.\n2. STRAIGHT TO THE POINT: Start immediately with the analysis.\n3. BREAK IT DOWN FIRST: Provide a logical breakdown BEFORE the final conclusion.\n\nIf it's a problem, solve it step-by-step. Use Markdown for formatting.",
        }
      });
      const response = await model;
      return response.text || '';
    });
  },

  analyzeImageStream: async (base64Data: string, mimeType: string, prompt: string, onChunk: (text: string) => void) => {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction: "You are TutorX, an AI vision expert. Analyze the provided image and provide a detailed, structured explanation. \n\nCRITICAL BEHAVIOR:\n1. NO GREETINGS: Do not use any introductory pleasantries.\n2. STRAIGHT TO THE POINT: Start immediately with the analysis.\n3. BREAK IT DOWN FIRST: Provide a logical breakdown BEFORE the final conclusion.\n\nIf it's a problem, solve it step-by-step. Use Markdown for formatting.",
      }
    });
    for await (const chunk of response) {
      onChunk(chunk.text || '');
    }
  },

  askQuestion: async (context: string, question: string, onChunk: (text: string) => void) => {
    const response = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: `Based on the following lesson content, answer the student's question.
      
      Lesson Content:
      ${context}
      
      Student Question:
      ${question}
      
      Provide a clear, concise, and helpful answer using Markdown.`,
    });
    for await (const chunk of response) {
      onChunk(chunk.text || '');
    }
  }
};
