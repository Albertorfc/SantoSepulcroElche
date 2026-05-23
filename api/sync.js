import admin from 'firebase-admin';
import axios from 'axios';
import { GoogleAuth } from 'google-auth-library';

// 1. Inicializar Firebase
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY 
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, '') 
    : undefined;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey,
    })
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  const SHEET_ID = '1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE';
  const TAB_NAME = 'Miembros'; 

  try {
    // 2. Autenticación con Google usando las mismas credenciales de Firebase
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').replace(/"/g, ''),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const token = tokenResponse.token;

    // 3. Llamada a la API de Google usando el TOKEN (Ya no hace falta API_KEY)
    const googleUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TAB_NAME}`;
    const googleRes = await axios.get(googleUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const filas = googleRes.data.values;
    if (!filas) throw new Error("No se encontraron datos en el Excel");

    let actualizados = 0;

    // 4. Procesar y guardar en Firebase (el resto del código igual)
    for (let i = 1; i < filas.length; i++) {
      const [email, dni, nombre, apellidos, tel, tipo, alta, c2023, c2024, c2025, c2026] = filas[i];
      if (!email || !email.includes('@')) continue;

      const deudaCount = [c2023, c2024, c2025, c2026].filter(v => v && v.toUpperCase() === 'NO').length;

      await db.collection('hermanos').doc(email.toLowerCase().trim()).set({
        email: email.toLowerCase().trim(),
        nombre_completo: `${nombre || ''} ${apellidos || ''}`.trim(),
        dni: dni || '',
        deuda: deudaCount,
        ultima_sincro: new Date().toISOString()
      }, { merge: true });

      actualizados++;
    }

    res.status(200).json({ success: true, message: `Sincronización privada completada: ${actualizados} hermanos.` });

  } catch (error) {
    res.status(500).json({ 
      error: "Fallo en la sincronización privada", 
      detalle: error.message 
    });
  }
}
