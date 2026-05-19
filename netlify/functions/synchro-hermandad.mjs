import axios from 'axios';

export const handler = async (event, context) => {
  const SHEET_ID = '1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE';
  const TAB_NAME = 'Miembros'; 
  const API_KEY = 'AIzaSyAl2JwBaQIWFvbanCMmFEUhKFEJsw5Df0c'; 
  
  // USA TU API ID (El de los guiones)
  const SITE_ID = '3176efe9-7499-4bd0-9bcc-8e0a53e5f12c'; 
  const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN;

  try {
    // 1. Google Sheets
    const googleUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TAB_NAME}?key=${API_KEY}`;
    const googleRes = await axios.get(googleUrl);
    const filas = googleRes.data.values; 

    if (!filas) throw new Error("Excel sin datos");

    // 2. Obtener usuarios (Ruta corregida sin /identity/ intermedia)
    // Netlify a veces requiere acceder a través del endpoint de la cuenta o directamente al sitio
    const identityUrl = `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users`;

    const identityRes = await axios.get(identityUrl, {
      headers: { 
        'Authorization': `Bearer ${NETLIFY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Si llegamos aquí, el SITE_ID y el TOKEN son correctos
    const usuariosNetlify = identityRes.data.users || identityRes.data;

    let actualizados = 0;

    for (let i = 1; i < filas.length; i++) {
      const [email, dni, nombre, apellidos, tel, tipo, alta, c2023, c2024, c2025, c2026] = filas[i];
      if (!email) continue;

      const deudaCount = [c2023, c2024, c2025, c2026].filter(v => v && v.toUpperCase() === 'NO').length;
      
      const usuario = usuariosNetlify.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

      if (usuario) {
        // 3. ACTUALIZACIÓN (Usando el endpoint de administración de usuarios)
        const updateUrl = `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users/${usuario.id}`;
        
        await axios.put(updateUrl, {
          user_metadata: {
            full_name: `${nombre} ${apellidos}`,
            tipo: tipo,
            alta: alta,
            deuda: deudaCount
          }
        }, {
          headers: { 
            'Authorization': `Bearer ${NETLIFY_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        actualizados++;
      }
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        message: "Sincronización finalizada", 
        procesados: filas.length - 1,
        actualizados: actualizados 
      }) 
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: error.message,
        status: error.response?.status,
        path: error.config?.url, // Esto nos dirá qué URL exacta está dando el 404
        detalle: error.response?.data
      }) 
    };
  }
};
