import dotenv from "dotenv";

process.env.NODE_ENV = "test";
dotenv.config();

process.env.EMAIL_FROM ??= "Test <no-reply@test.com>";
process.env.OLLAMA_API_KEY ??= "test-ollama-api-key";
process.env.OLLAMA_MODEL ??= "test-model";
process.env.JWT_SECRET ??= "test-secret";
process.env.JWT_EXPIRE ??= "1d";