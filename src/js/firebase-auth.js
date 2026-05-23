// 1. Importamos las herramientas necesarias
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. Tu configuración (Copiada de tu mensaje)
const firebaseConfig = {
  apiKey: "AIzaSyCgaiqCOnMuLUX1zFD6Guj5TJI_bHMRx9E",
  authDomain: "santosepulcroelche-c4160.firebaseapp.com",
  projectId: "santosepulcroelche-c4160",
  storageBucket: "santosepulcroelche-c4160.firebasestorage.app",
  messagingSenderId: "786691964355",
  appId: "1:786691964355:web:39e649b96d154da9df9176",
  measurementId: "G-KBCQ5VQ6QX"
};

// 3. Inicializamos
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 4. La lógica que cambia los botones
onAuthStateChanged(auth, (user) => {
  const container = document.getElementById('auth-status-container');
  const containerMobile = document.getElementById('auth-status-mobile');
  
  if (user) {
    // Si hay usuario, cambiamos el contenido de los contenedores
    if (container) {
      container.innerHTML = `<a href="/miembros/" class="nav-button-alt active">Mi Perfil</a>`;
    }
    if (containerMobile) {
      containerMobile.innerHTML = `<a href="/miembros/" class="mobile-nav-button active">Mi Perfil</a>`;
    }
  }
});
