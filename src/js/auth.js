import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const auth = getAuth();
const db = getFirestore();

// Escuchar cuando el usuario entra o sale
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // 1. El usuario está logueado, cogemos su email
    const userEmail = user.email.toLowerCase();
    
    // 2. Referencia al documento del hermano en la colección que creamos con la sincro
    const docRef = doc(db, "hermanos", userEmail);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const datosHermano = docSnap.data();
      
      // 3. Pintar los datos en la web
      document.getElementById("nombre-usuario").innerText = datosHermano.nombre_completo;
      document.getElementById("cuotas-pendientes").innerText = datosHermano.deuda;
      
      if (datosHermano.deuda > 0) {
        document.getElementById("alerta-pago").style.display = "block";
      }
    } else {
      console.log("No hay datos extra para este email en el Excel.");
    }
  } else {
    // Usuario no logueado, redirigir a login o limpiar pantalla
  }
});
