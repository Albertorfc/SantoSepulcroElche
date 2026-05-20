import axios from 'axios';
import { google } from 'googleapis';

export const handler = async (event, context) => {

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });

  const sheets = google.sheets({
    version: 'v4',
    auth
  });
  
  const SHEET_ID = '1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE';
  const TAB_NAME = 'Miembros'; 
  const API_KEY = 'AIzaSyAl2JwBaQIWFvbanCMmFEUhKFEJsw5Df0c'; 
  const SITE_ID = '3176efe9-7499-4bd0-9bcc-8e0a53e5f12c'; 
  
  // Tu token nfp_ (limpio de espacios)
  const TOKEN = 'TOKENTOKENTOKEN'.trim(); 

  try {
    // 1. Google Sheets
    const googleRes = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TAB_NAME}?key=${API_KEY}`);
    const filas = googleRes.data.values; 

    // 2. API OFICIAL DE NETLIFY (Esta sí acepta tokens nfp_)
const identityUrl =
  `https://api.netlify.com/api/v1/${SITE_ID}/identity/users`;
    const identityRes = await axios.get(identityUrl, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    
    const usuariosNetlify = identityRes.data.users || identityRes.data;
    let actualizados = 0;

    for (let i = 1; i < filas.length; i++) {
      const [email, dni, nombre, apellidos, tel, tipo, alta, c2023, c2024, c2025, c2026] = filas[i];
      if (!email) continue;

      const deudaCount = [c2023, c2024, c2025, c2026].filter(v => v && v.toUpperCase() === 'NO').length;
      const usuario = usuariosNetlify.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

      if (usuario) {
        const updateUrl =
  `https://api.netlify.com/api/v1/${SITE_ID}/identity/users/${usuario.id}`;
await axios.put(
  updateUrl,
  {
    user_metadata: {
      full_name: `${nombre} ${apellidos}`,
      tipo,
      alta,
      deuda: deudaCount
    }
  },
  {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    }
  }
);
        actualizados++;
      }
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ message: "Sincronización finalizada", actualizados }) 
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: error.message,
        servidor_dijo: error.response?.data,
        url_fallida: error.config?.url
      }) 
    };
  }
};
