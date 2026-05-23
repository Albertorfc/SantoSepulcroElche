import admin from 'firebase-admin';
import axios from 'axios';

if (!admin.apps.length) {
  // Limpiamos la clave por si acaso Vercel la guardó con comillas extra
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
  // Asegúrate de que estas variables están bien o cámbialas por process.env si las tienes en Vercel
  const SHEET_ID = '1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE';
  const TAB_NAME = 'Miembros'; 
  const API_KEY = 'AIzaSyAl2JwBaQIWFvbanCMmFEUhKFEJsw5Df0c'; 

  try {
    const googleUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TAB_NAME}?key=${API_KEY}`;
    const googleRes = await axios.get(googleUrl);
    const filas = googleRes.data.values;

    // Si Google no devuelve filas, lanzamos error específico
    if (!filas || filas.length === 0) {
      return res.status(400).json({ 
        error: "Google Sheets no ha devuelto datos. Revisa el nombre de la pestaña o la API KEY." 
      });
    }

    let actualizados = 0;

    for (let i = 1; i < filas.length; i++) {
      const [email, dni, nombre, apellidos, tel, tipo, alta, c2023, c2024, c2025, c2026] = filas[i];
      
      // Si la fila no tiene email, la saltamos
      if (!email || !email.includes('@')) continue;

      const deudaCount = [c2023, c2024, c2025, c2026].filter(v => v && v.toUpperCase() === 'NO').length;

      await db.collection('hermanos').doc(email.toLowerCase().trim()).set({
        email: email.toLowerCase().trim(),
        nombre_completo: `${nombre || ''} ${apellidos || ''}`.trim(),
        dni: dni || '',
        telefono: tel || '',
        tipo: tipo || 'General',
        alta: alta || '',
        deuda: deudaCount,
        ultima_sincro: new Date().toISOString()
      }, { merge: true });

      actualizados++;
    }

    return res.status(200).json({ 
      success: true, 
      message: `¡Sincronización OK! Se han actualizado ${actualizados} hermanos en Firebase.` 
    });

  } catch (error) {
    // Si falla, queremos saber por qué
    return res.status(500).json({ 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
}
