import axios from 'axios';

export const handler = async (event, context) => {
  const SHEET_ID = '1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE';
  const TAB_NAME = 'Miembros'; 
  const API_KEY = 'AIzaSyAl2JwBaQIWFvbanCMmFEUhKFEJsw5Df0c'; 
  
  // Nombre de tu sitio (lo que va antes de .netlify.app)
  const SITE_NAME = 'santosepulcroelche'; 
  const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN;

  try {
    // 1. Google Sheets
    const googleRes = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TAB_NAME}?key=${API_KEY}`);
    const filas = googleRes.data.values; 

    if (!filas) throw new Error("Excel vacío");

    // 2. Obtener usuarios usando el dominio del sitio
    // Esta ruta es la administrativa de Identity y suele ser más robusta
    const identityUrl = `https://${SITE_NAME}.netlify.app/.netlify/identity/admin/users`;

    const identityRes = await axios.get(identityUrl, {
      headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` }
    });
    
    const usuariosNetlify = identityRes.data.users || identityRes.data;
    let actualizados = 0;

    for (let i = 1; i < filas.length; i++) {
      const [email, dni, nombre, apellidos, tel, tipo, alta, c2023, c2024, c2025, c2026] = filas[i];
      if (!email) continue;

      const deudaCount = [c2023, c2024, c2025, c2026].filter(v => v && v.toUpperCase() === 'NO').length;
      const usuario = usuariosNetlify.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

      if (usuario) {
        const updateUrl = `${identityUrl}/${usuario.id}`;
        await axios.put(updateUrl, {
          user_metadata: {
            full_name: `${nombre} ${apellidos}`,
            tipo: tipo,
            alta: alta,
            deuda: deudaCount
          }
        }, {
          headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` }
        });
        actualizados++;
      }
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ message: "OK", actualizados: actualizados }) 
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: error.message,
        url_fallida: error.config?.url,
        respuesta_server: error.response?.data 
      }) 
    };
  }
};
