import { GoogleGenerativeAI } from "@google/generative-ai";

export const summarizeWithGemini = async (apiKey, text, lang = 'tr') => {
  if (!apiKey) throw new Error("API Key is required");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const isTR = lang === 'tr';
  const prompt = `
    Analyze the following customer correspondence/notes and summarize it in a structured JSON format.
    The response MUST be in ${isTR ? 'Turkish (Türkçe)' : 'English'}.
    The response must only be a valid JSON object, no other text.
    
    JSON structure:
    {
      "mainPoints": ["point 1", "point 2", ...],
      "sentiment": "Sentiment status (e.g. Positive, Negative, Mixed)",
      "actionItems": ["action 1", "action 2", ...]
    }

    Text to analyze:
    "${text}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let responseText = response.text();
    
    // Clean up markdown code blocks if present
    responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Analiz sırasında bir hata oluştu: " + error.message);
  }
};
