import { google } from 'googleapis';

export const handler = async (event, context) => {

  try {

    const user = context.clientContext?.user;

    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'No autenticado'
        })
      };
    }

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

    const googleRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: TAB_NAME
    });

    const filas = googleRes.data.values;

    const emailUsuario = user.email.toLowerCase().trim();

    for (let i = 1; i < filas.length; i++) {

      const [
        email,
        dni,
        nombre,
        apellidos,
        tel,
        tipo,
        alta,
        c2023,
        c2024,
        c2025,
        c2026
      ] = filas[i];

      if (!email) continue;

      if (email.toLowerCase().trim() === emailUsuario) {

        const deudaCount = [c2023, c2024, c2025, c2026]
          .filter(v => v && v.toUpperCase() === 'NO')
          .length;

        return {
          statusCode: 200,
          body: JSON.stringify({
            ok: true,
            perfil: {
              email,
              dni,
              nombre,
              apellidos,
              tel,
              tipo,
              alta,
              deuda: deudaCount
            }
          })
        };
      }
    }

    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Miembro no encontrado'
      })
    };

  } catch (error) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };

  }

};
