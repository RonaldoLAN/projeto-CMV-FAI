import admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 não definida.");
}

const serviceAccountJson = Buffer.from(
  process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
  "base64"
).toString("utf8");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
  });
}

const db = admin.firestore();

export async function saveTicket({ sender, mensagem_original, sala, tipo_problema }) {
  const path = `artifacts/${process.env.APP_ID}/public/data/suporte_chamados`;
  const docRef = db.collection(path).doc();

  const ticket = {
    sender,
    mensagem_original,
    sala,
    tipo_problema,
    data_hora_abertura: Timestamp.now(),
    status: "PENDENTE",
    data_hora_fechamento: null,
    tecnico_fechamento: null,
  };

  await docRef.set(ticket);
  console.log("Ticket salvo:", ticket);
}
