const { NetlifyAPI } = require('netlify');
const axios = require('axios');

exports.handler = async (event, context) => {
  // 1. Definimos las credenciales como texto (con comillas)
  const SHEET_ID = '1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE';
  const TAB_NAME = 'Miembros'; 
  const API_KEY = 'AIzaSyAl2JwBaQIWFvbanCMmFEUhKFEJsw5Df0c'; 
  
  try {
    // 2. Construimos la URL usando las variables de arriba
    // Fíjate que usamos las comillas inclinadas ` (en la tecla junto a la P o la Ñ)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TAB_NAME}?key=${API_KEY}`;
    
    const response = await axios.get(url);
    const filas = response.data.values; 

    if (!filas) throw new Error("No se encontraron datos en el Excel");

    // 3. Conexión con Netlify
    const client = new NetlifyAPI(process.env.NETLIFY_AUTH_TOKEN);
    const siteId = process.env.SITE_ID; 

    // 4. Recorremos el Excel
    for (let i = 1; i < filas.length; i++) {
      const [email, dni, nombre, apellidos, tel, tipo, alta, c2023, c2024, c2025, c2026] = filas[i];

      if (!email) continue;

      // Calculamos la deuda
      const años = [c2023, c2024, c2025, c2026];
      const deudaCount = años.filter(v => v && v.toUpperCase() === 'NO').length;

      // Buscamos al usuario en Netlify Identity
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

    return { statusCode: 200, body: "Sincronización completada con éxito" };
    
  } catch (error) {
    return { statusCode: 500, body: "Error en la función: " + error.message };
  }
};
