import ollama from 'ollama'
import dotenv from "dotenv"

dotenv.config()

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "https://ollama.com/api/generate";
const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "your-model";

if(!OLLAMA_API_KEY) {
    throw new Error(`Please provide OLLAMA API KEY`)
}

if(!OLLAMA_MODEL) {
    throw new Error(`Please provide OLLAMA MODEL`)
}

type OllamaOptions = {
  system?: string;
  temperature?: number;
  think?: "low" | "medium" | "high" | boolean;
  [key: string]: any;
};

const generateWithOllama = async (
  prompt: string,
  options: OllamaOptions = {}
): Promise<string> => {

  if (!OLLAMA_API_URL) {
    throw new Error("Please provide the OLLAMA API URL");
  }

  if (!OLLAMA_MODEL) {
    throw new Error("Please provide the OLLAMA MODEL");
  }

  if (!prompt || typeof prompt !== "string") {
    throw new Error("A valid prompt is required");
  }

  const { system, think = "low", temperature = 0.7, ...rest } = options;

  const response = await ollama.generate({
    model: OLLAMA_MODEL,
    prompt,
    think,
    stream: false,
    system: `
      You are an expert social media content strategist.
      Write engaging, authentic social media content.
      Never use generic AI-sounding language.
    `,
    options: {
      temperature,
      ...rest, 
    },
  });

  if (!response) throw new Error("Ollama API error: No response was received");

  return response.response;
};

export default generateWithOllama;