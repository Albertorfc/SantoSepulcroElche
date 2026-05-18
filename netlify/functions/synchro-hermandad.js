const { NetlifyAPI } = require('netlify');
const axios = require('axios');

exports.handler = async (event, context) => {
  // Solo permitimos que se ejecute si tú quieres (puedes añadir seguridad aquí)
  
  const SHEET_ID = '1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE';
  const TAB_NAME = 'Miembros'; // Nombre de la pestaña
  const API_KEY = 'TU_GOOGLE_SHEETS_API_KEY'; // Necesitas una de Google Cloud
  
  try {
    // 1. Leer datos de Google Sheets
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE}/values/${Miembros}?key=${API_KEY}`;
    const response = await axios.get(url);
    const filas = response.data.values; // Esto nos da el array de hermanos

    // 2. Conectar con la API de Netlify para gestionar usuarios
    const client = new NetlifyAPI(process.env.NETLIFY_AUTH_TOKEN);
    const siteId = process.env.SITE_ID;

    // Saltamos la primera fila (cabeceras)
    for (let i = 1; i < filas.length; i++) {
      const [email, dni, nombre, apellidos, tel, tipo, alta, c2023, c2024, c2025, c2026] = filas[i];

      if (!email) continue;

      // Calcular deuda: Contamos cuántos "No" hay en las columnas de años
      const años = [c2023, c2024, c2025, c2026];
      const deudaCount = años.filter(v => v && v.toUpperCase() === 'NO').length;

      // 3. Buscar usuario en Netlify y actualizar
      // Nota: Esta es la lógica simplificada, Netlify requiere buscar por ID o listar
      const users = await client.listUsersForSite({ site_id: siteId });
      const user = users.find(u => u.email === email);

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
