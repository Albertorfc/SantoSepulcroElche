import { NetlifyAPI } from 'netlify';
import axios from 'axios';

export const handler = async (event, context) => {
  // Tus credenciales (estas se quedan igual)
  const SHEET_ID = '1hp_36PFo3y0draB20sSoBxgNFiyoFSr5QL7uyb2PzXE';
  const TAB_NAME = 'Miembros'; 
  const API_KEY = 'AIzaSyAl2JwBaQIWFvbanCMmFEUhKFEJsw5Df0c'; 
  
  try {
    // Construimos la URL
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${TAB_NAME}?key=${API_KEY}`;
    
    const response = await axios.get(url);
    const filas = response.data.values; 

    if (!filas) throw new Error("No hay datos en el Excel");

    // SITE_ID lo pilla Netlify automáticamente del entorno
    const client = new NetlifyAPI(process.env.NETLIFY_AUTH_TOKEN);
    const siteId = process.env.SITE_ID; 

    // Listamos los usuarios una sola vez para no saturar la API
    const users = await client.listUsersForSite({ site_id: siteId });

    for (let i = 1; i < filas.length; i++) {
      const fila = filas[i];
      const email = fila[0];
      const nombre = fila[2];
      const apellidos = fila[3];
      const tipo = fila[5];
      const alta = fila[6];

      if (!email) continue;

      // Cálculo de deuda (Columnas 7 a 10)
      let deudaCount = 0;
      [fila[7], fila[8], fila[9], fila[10]].forEach(valor => {
        if (valor && valor.toUpperCase() === 'NO') deudaCount++;
      });

      // Buscamos al hermano
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

    return { 
      statusCode: 200, 
      body: JSON.stringify({ message: "Sincronización realizada con éxito" }) 
    };

  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
