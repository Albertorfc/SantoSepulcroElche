import axios from 'axios';

export const handler = async (event, context) => {
  const SHEET_ID = '1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE';
  const TAB_NAME = 'Miembros'; 
  const API_KEY = 'AIzaSyAl2JwBaQIWFvbanCMmFEUhKFEJsw5Df0c'; 
  const SITE_NAME = 'santosepulcroelche'; 
  
  // ASEGÚRATE DE QUE ESTE TOKEN ES EL QUE EMPIEZA POR nfp_
  // Y QUE NO TIENE ESPACIOS AL PRINCIPIO NI AL FINAL
  const TOKEN_DIRECTO = 'nfp_dFGWM6JELLP6YHdJTP6nsaRSJRFMa3uu2af6'; 

  try {
    const googleRes = await axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TAB_NAME}?key=${API_KEY}`);
    const filas = googleRes.data.values; 

    // Usamos el endpoint de administración
    const identityUrl = `https://${SITE_NAME}.netlify.app/.netlify/identity/admin/users`;

    const identityRes = await axios.get(identityUrl, {
      headers: { 
        // CAMBIO CRUCIAL: Prueba a enviarlo sin 'Bearer' o asegúrate de que el formato es exacto
        'Authorization': `Bearer ${TOKEN_DIRECTO.trim()}`,
        'Content-Type': 'application/json'
      }
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
          headers: { 
            'Authorization': `Bearer ${TOKEN_DIRECTO.trim()}` 
          }
        });
        actualizados++;
      }
    }

    return { 
      statusCode: 200, 
      body: JSON.stringify({ message: "Sincronización OK", actualizados: actualizados }) 
    };

  } catch (error) {
    // Este log nos dirá si el token llegó a enviarse bien
    console.error("Error detectado:", error.response?.data);
    
    return { 
      statusCode: 500, 
      body: JSON.stringify({ 
        error: error.message,
        servidor_dijo: error.response?.data,
        pista: "Revisa que el token en el código no tenga comillas extra o espacios"
      }) 
    };
  }
};
