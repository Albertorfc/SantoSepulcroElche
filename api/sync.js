import admin from 'firebase-admin';
import axios from 'axios';

// Aquí configuramos Firebase usando las variables de entorno que pondrás en Vercel
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  const SHEET_ID = process.env.SHEET_ID;
  const API_KEY = process.env.GOOGLE_API_KEY;
  const TAB_NAME = 'Miembros';

  try {
    const googleUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TAB_NAME}?key=${API_KEY}`;
    const googleRes = await axios.get(googleUrl);
    const filas = googleRes.data.values;

    let actualizados = 0;

    for (let i = 1; i < filas.length; i++) {
      const [email, dni, nombre, apellidos, tel, tipo, alta, c2023, c2024, c2025, c2026] = filas[i];
      if (!email) continue;

      const deudaCount = [c2023, c2024, c2025, c2026].filter(v => v && v.toUpperCase() === 'NO').length;

      // Guardamos o actualizamos en Firebase Firestore
      await db.collection('hermanos').doc(email.toLowerCase()).set({
        nombre_completo: `${nombre} ${apellidos}`,
        tipo: tipo,
        alta: alta,
        deuda: deudaCount,
        ultima_actualizacion: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      actualizados++;
    }

    res.status(200).json({ message: `Sincronización con Firebase OK. Hermanos: ${actualizados}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
