import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { processMessage } from "./services/geminiService.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());

// Verificação do Webhook da Meta
app.get("/whatsapp-webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("Webhook verificado!");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Recepção das mensagens (POST)
app.post("/whatsapp-webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message && message.text?.body) {
      const sender = message.from;
      const text = message.text.body;
      console.log(`Mensagem recebida de ${sender}: ${text}`);

      await processMessage(sender, text);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
