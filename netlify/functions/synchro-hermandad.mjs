import axios from 'axios';

export const handler = async (event, context) => {
  const SHEET_ID = '1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE';
  const TAB_NAME = 'Miembros'; 
  const API_KEY = 'AIzaSyAl2JwBaQIWFvbanCMmFEUhKFEJsw5Df0c'; 
  
  // USA EL API ID (el de los guiones: 3176efe9-7499-4bd0-9bcc-8e0a53e5f12c)
  const SITE_ID = '3176efe9-7499-4bd0-9bcc-8e0a53e5f12c'; 
  const NETLIFY_TOKEN = process.env.NETLIFY_AUTH_TOKEN;

  try {
    const googleUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TAB_NAME}?key=${API_KEY}`;
    const googleRes = await axios.get(googleUrl);
    const filas = googleRes.data.values; 

    // IMPORTANTE: Esta es la URL de la API oficial que NO falla con los tokens personales
    // Hemos quitado el "/identity" intermedio que a veces causa el 404
    const identityUrl = `https://api.netlify.com/api/v1/sites/${SITE_ID}/identity/users`;

    const identityRes = await axios.get(identityUrl, {
      headers: { Authorization: `Bearer ${NETLIFY_TOKEN}` }
    });
    const usuariosNetlify = identityRes.data.users;

    let actualizados = 0;

    for (let i = 1; i < filas.length; i++) {
      const [email, dni, nombre, apellidos, tel, tipo, alta, c2023, c2024, c2025, c2026] = filas[i];
      if (!email) continue;

      const deudaCount = [c2023, c2024, c2025, c2026].filter(v => v && v.toUpperCase() === 'NO').length;
      const usuario = usuariosNetlify.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (usuario) {
        // Actualizar datos
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
      body: JSON.stringify({ message: `Sincronización OK. Usuarios: ${actualizados}` }) 
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: error.message, 
        pista: "Asegúrate de que NETLIFY_AUTH_TOKEN está en las variables de entorno de Netlify",
        data: error.response?.data 
      }) 
    };
  }
};
