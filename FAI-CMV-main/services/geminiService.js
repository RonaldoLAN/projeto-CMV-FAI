import axios from "axios";
import { saveTicket } from "./firestoreService.js";

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function processMessage(sender, text) {
  const classification = await askGemini(
    `Responda apenas com SIM ou NÃO. A mensagem abaixo é sobre suporte a salas de aula?\n"${text}"`
  );

  if (classification.trim().toUpperCase() !== "SIM") {
    console.log("Mensagem ignorada (fora de escopo).");
    return;
  }

  const extractionPrompt = `
  Analise a mensagem a seguir e extraia o número da sala de aula e uma descrição concisa do problema.
  Retorne o resultado no formato JSON: {"sala": "...", "tipo_problema": "..."}.
  Mensagem: "${text}"
  `;

  const structuredData = await askGemini(extractionPrompt, true);
  const { sala, tipo_problema } = JSON.parse(structuredData);

  await saveTicket({
    sender,
    mensagem_original: text,
    sala,
    tipo_problema,
  });
}

async function askGemini(prompt, jsonMode = false) {
  const res = await axios.post(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { headers: { "Content-Type": "application/json" } }
  );

  const text = res.data.candidates[0].content.parts[0].text;

  if (jsonMode) {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;
    return text.slice(jsonStart, jsonEnd);
  }

  return text;
}
