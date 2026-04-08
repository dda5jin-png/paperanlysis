import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function listModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("API key not found in .env.local");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Note: The SDK might not have a direct listModels, but we can try a simple request
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hello?");
    console.log("Gemini 1.5 Flash test:", result.response.text());
    
    // Test Pro
    const modelPro = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const resultPro = await modelPro.generateContent("Hello?");
    console.log("Gemini 1.5 Pro test:", resultPro.response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}

listModels();
