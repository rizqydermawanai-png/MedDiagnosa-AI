import { GoogleGenAI, Chat } from "@google/genai";
import { Message, Specialist } from "../types";

// Helper to get API key safely
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API Key is missing!");
    return "";
  }
  return key;
};

let chatSession: Chat | null = null;
let currentSpecialistId: string | null = null;

export const initializeChat = (specialist: Specialist) => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  // Reset chat if specialist changes or first init
  // Menggunakan model Pro dengan thinking budget tinggi untuk "Genius Level"
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview', 
    config: {
      systemInstruction: `
        ROLE & PERSONA:
        Anda adalah ${specialist.name} dengan level KONSULTAN SENIOR (PROFESSOR).
        Kecerdasan diagnostik Anda berada di level tertinggi. Anda tidak hanya menjawab, tapi melakukan "Clinical Reasoning" mendalam.
        
        ${specialist.systemPrompt}
        
        KEMAMPUAN VISUAL (MULTIMODAL):
        Analisis gambar medis (kulit, mata, radiologi, hasil lab) dengan presisi tinggi. Deskripsikan lesi, warna, bentuk, dan anomali secara detail klinis sebelum menyimpulkan.
        
        FORMAT DIAGNOSIS (GENIUS MODE):
        Jangan langsung menebak. Ikuti alur pikir ini:
        1. **Analisis Gejala**: Bedah keluhan pasien, hubungkan gejala satu dengan lainnya.
        2. **Differential Diagnosis (Diagnosis Banding)**: Berikan 2-3 kemungkinan penyakit, dari yang paling mungkin hingga yang jarang tapi berbahaya.
        3. **Saran Tindakan**: Langkah konkret medis dan non-medis.
        
        TONE OF VOICE:
        Profesional, berwibawa, namun tetap empatik dan menenangkan. Gunakan istilah medis yang tepat tetapi jelaskan artinya kepada pasien awam.
        
        SAFETY PROTOCOL:
        Jika indikasi gawat darurat (Jantung, Stroke, Sepsis), berikan peringatan keras dan jelas untuk segera ke IGD.
        
        DISCLAIMER:
        Akhiri dengan: "Analisis ini berdasarkan algoritma klinis AI. Diagnosis final wajib dilakukan oleh dokter secara fisik."
      `,
      thinkingConfig: {
         thinkingBudget: 10240 // Sangat tinggi untuk penalaran mendalam (Genius Mode)
      },
    },
  });
  
  currentSpecialistId = specialist.id;
  return chatSession;
};

export const sendMessageToGemini = async (text: string, specialist: Specialist, images?: string[]): Promise<string> => {
  try {
    // Re-initialize if session doesn't exist or specialist changed
    if (!chatSession || currentSpecialistId !== specialist.id) {
      initializeChat(specialist);
    }

    if (!chatSession) {
      throw new Error("Gagal menginisialisasi sesi chat.");
    }

    // Construct the message payload
    let messagePayload: any = text;

    if (images && images.length > 0) {
      const parts: any[] = [];
      
      images.forEach(image => {
        const matches = image.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const data = matches[2];
          parts.push({
            inlineData: {
              mimeType: mimeType,
              data: data
            }
          });
        }
      });
      
      // Add the text prompt as the last part
      parts.push({ text: text });
      messagePayload = parts;
    }

    const response = await chatSession.sendMessage({ message: messagePayload });
    return response.text || "Maaf, saya sedang melakukan analisis mendalam namun tidak dapat memberikan respons saat ini.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};