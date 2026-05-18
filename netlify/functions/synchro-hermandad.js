const { NetlifyAPI } = require('netlify');
const axios = require('axios');

exports.handler = async (event, context) => {
  const SHEET_ID = '1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE';
  const TAB_NAME = 'Miembros'; 
  const API_KEY = 'AIzaSyAl2JwBaQIWFvbanCMmFEUhKFEJsw5Df0c'; 
  
  try {
    // 1. Leer datos de Google Sheets (Corregida la sintaxis de la URL)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TAB_NAME}?key=${API_KEY}`;
    const response = await axios.get(url);
    const filas = response.data.values; 

    const client = new NetlifyAPI(process.env.NETLIFY_AUTH_TOKEN);
    const siteId = process.env.SITE_ID;

    // 2. Sincronizar
    for (let i = 1; i < filas.length; i++) {
      // OJO: He ajustado el orden según tu Excel: Email es la 5ª columna (índice 4)
      // Si en tu Excel el Email es la COLUMNA A, el orden que pusiste es correcto.
      // Si el Email está en la COLUMNA E, el orden debe ser:
      const [dni, nombre, apellidos, tel, email, tipo, alta, c2023, c2024, c2025, c2026] = filas[i];

      if (!email) continue;

      const años = [c2023, c2024, c2025, c2026];
      const deudaCount = años.filter(v => v && v.toUpperCase() === 'NO').length;

      const users = await client.listUsersForSite({ site_id: siteId });
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (user) {
        await client.updateUser({
          site_id: siteId,
          user_id: user.id,
          body: {
            user_metadata: {
              full_name: `${nombre} ${apellidos}`,
              tipo: tipo,
              alta: alta,
              deuda: deudaCount
            }
          }
        });
      }
    }

    return { statusCode: 200, body: "Sincronización completada" };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
