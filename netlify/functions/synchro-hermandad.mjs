import axios from 'axios';

export const handler = async (event, context) => {
  // Configuración del Excel
  const SHEET_ID = '1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE';
  const TAB_NAME = 'Miembros'; 
  const API_KEY = 'AIzaSyAl2JwBaQIWFvbanCMmFEUhKFEJsw5Df0c'; 
  
  // Configuración de Netlify (SITE_ID lo pone Netlify solo)
  const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN;
  const SITE_ID = process.env.SITE_ID;

  try {
    // 1. Leer datos de Google Sheets
    const googleUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TAB_NAME}?key=${API_KEY}`;
    const googleRes = await axios.get(googleUrl);
    const filas = googleRes.data.values; 

    if (!filas) throw new Error("No se encontraron filas en el Excel");

    // 2. Obtener lista de usuarios de Netlify Identity
    // Usamos axios directamente para evitar errores de la librería oficial
    const identityUrl = `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users`;
    const identityRes = await axios.get(identityUrl, {
      headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` }
    });
    const usuariosNetlify = identityRes.data.users;

    let actualizados = 0;

    // 3. Sincronizar (empezamos en fila 1 para saltar cabeceras)
    for (let i = 1; i < filas.length; i++) {
      const [email, dni, nombre, apellidos, tel, tipo, alta, c2023, c2024, c2025, c2026] = filas[i];

      if (!email) continue;

      // Calcular deuda
      const deudaCount = [c2023, c2024, c2025, c2026].filter(v => v && v.toUpperCase() === 'NO').length;

      // Buscar si el usuario existe en Netlify
      const usuario = usuariosNetlify.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (usuario) {
        // Actualizar metadatos en Netlify vía API
        const updateUrl = `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users/${usuario.id}`;
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
      body: JSON.stringify({ message: `Éxito. Hermanos actualizados: ${actualizados}` }) 
    };

  } catch (error) {
    console.error(error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message, detail: error.response?.data || "Sin detalles" }) 
    };
  }
};
