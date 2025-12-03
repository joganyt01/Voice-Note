import { db } from "./firebase-init.js";
import { collection, addDoc, getDocs, deleteDoc, doc }
from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const notasRef = collection(db, "comments", "test", "comentarios");



const card = document.querySelector('.voice-card');
const bar1 = document.getElementById('bar1');
const btn = document.getElementById('boton'); // botón play
const music = document.getElementById("music");


let isPlaying = false;
let wasPaused = false;
let lastProgress = 0;

window.addEventListener('load', () => {
  const splash = document.querySelector('.splash-screen');
  setTimeout(() => {
    splash.style.display = 'none';
  }, 3500); // tiempo total antes de desaparecer
});


// Click en el botón: solo play/pause (no manipulamos clases aquí)
btn.addEventListener('click', () => {
  if (music.paused) {
    music.play();
  } else {
    music.pause();
  }
});

// Cuando el audio comienza (evento fiable)
music.addEventListener('play', () => {
  isPlaying = true;
  bar1.classList.add('active');
  card.classList.add('active');

  // mostrar el icono de "pausa" (la clase paused hace que se muestre pause.png)
  btn.classList.add('paused');

  // si venía pausado, animamos ese regreso (efecto rebote)
  if (wasPaused) {
    bar1.style.transition = 'width 0.4s cubic-bezier(.68,-0.55,.27,1.55)';
    bar1.style.setProperty("--progress", `${lastProgress}%`);
    wasPaused = false;
  }
});

// Cuando el audio se pausa
music.addEventListener('pause', () => {
  isPlaying = false;

  // guardo progreso para el "rebote" posterior
  lastProgress = (music.currentTime / music.duration) * 100 || 0;
  wasPaused = true;

  // reino la barra a 0 con transición
  bar1.style.transition = 'width 0.35s ease-in';
  bar1.style.setProperty("--progress", `0%`);

  bar1.classList.remove('active');
  card.classList.remove('active');

  // mostrar icono de "play" (quitamos la clase paused)
  btn.classList.remove('paused');
});

// Cuando termina
music.addEventListener('ended', () => {
  isPlaying = false;
  wasPaused = false;
  bar1.classList.remove('active');
  card.classList.remove('active');
  bar1.style.setProperty("--progress", "0%");
  btn.classList.remove('paused'); // vuelve a mostrar play
});

// Mientras suena, actualizamos progreso real
music.addEventListener("timeupdate", () => {
  if (isPlaying && music.duration) {
    const progress = (music.currentTime / music.duration) * 100;
    bar1.style.setProperty("--progress", `${progress}%`);
  }
});

// Permitir buscar tocando la barra
bar1.addEventListener("click", (e) => {
  const rect = bar1.getBoundingClientRect(); // posición de la barra
  const clickX = e.clientX - rect.left;      // posición del click dentro de la barra
  const width = rect.width;                  // ancho total de la barra
  const percentage = (clickX / width) * 100; // porcentaje clickeado

  // mover la reproducción
  if (music.duration) {
    music.currentTime = (percentage / 100) * music.duration;
    bar1.style.setProperty("--progress", `${percentage}%`);
  }
});

let isScrubbing = false;

// Cuando presionas el mouse en la barra
bar1.addEventListener("mousedown", (e) => {
  isScrubbing = true;
  updateProgress(e);
});

// Cuando mueves el mouse mientras mantienes presionado
window.addEventListener("mousemove", (e) => {
  if (isScrubbing) updateProgress(e);
});

// Cuando sueltas el mouse
window.addEventListener("mouseup", () => {
  isScrubbing = false;
});

// También funciona en pantallas táctiles
bar1.addEventListener("touchstart", (e) => {
  isScrubbing = true;
  updateProgress(e.touches[0]);
});
window.addEventListener("touchmove", (e) => {
  if (isScrubbing) updateProgress(e.touches[0]);
});
window.addEventListener("touchend", () => {
  isScrubbing = false;
});

// Función para actualizar la posición del progreso
function updateProgress(e) {
  const rect = bar1.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const width = rect.width;
  const percentage = Math.min(Math.max((x / width) * 100, 0), 100);

  if (music.duration) {
    music.currentTime = (percentage / 100) * music.duration;
    bar1.style.setProperty("--progress", `${percentage}%`);
  }
}
const videoPlayer = document.querySelector('.video-player');
const video = videoPlayer.querySelector('.video-element');
const btn1 = videoPlayer.querySelector('.video-btn');
const progress = videoPlayer.querySelector('.video-progress-bar');
const progressContainer = videoPlayer.querySelector('.video-progress');
let isDragging = false;
let animationFrame;

// ---- PLAY / PAUSE con click en el contenedor ----
videoPlayer.addEventListener('click', (e) => {
  // Evita que el click en la barra interrumpa el video
  if (e.target.closest('.video-progress')) return;

  if (video.paused) {
    video.play();
    btn1.classList.remove('play');
    btn1.classList.add('pause');
    videoPlayer.classList.remove('paused');
  } else {
    video.pause();
    btn1.classList.remove('pause');
    btn1.classList.add('play');
    videoPlayer.classList.add('paused');
  }
});

// ---- FUNCIÓN DE ACTUALIZACIÓN DE LA BARRA ----
function updateProgressBar() {
  const progressPercent = (video.currentTime / video.duration) * 100;
  progress.style.width = `${progressPercent}%`;

  if (!video.paused && !video.ended && !isDragging) {
    animationFrame = requestAnimationFrame(updateProgressBar);
  }
}

// ---- EVENTOS DE VIDEO ----
video.addEventListener('play', () => {
  videoPlayer.classList.remove('paused');
  cancelAnimationFrame(animationFrame);
  updateProgressBar();
});

video.addEventListener('pause', () => {
  videoPlayer.classList.add('paused');
  cancelAnimationFrame(animationFrame);
});

video.addEventListener('ended', () => {
  cancelAnimationFrame(animationFrame);
  progress.style.width = '0%';
  btn1.classList.remove('pause');
  btn1.classList.add('play');
  videoPlayer.classList.add('paused');
});

// ---- CONTROL DE PROGRESO (click + drag) ----
function setVideoProgress(e) {
  const rect = progressContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  const percent = Math.min(Math.max(clickX / width, 0), 1);
  video.currentTime = percent * video.duration;
  progress.style.width = `${percent * 100}%`;
}

// Click en la barra
progressContainer.addEventListener('click', (e) => {
  setVideoProgress(e);
});

// Drag (arrastrar sostenido)
progressContainer.addEventListener('mousedown', (e) => {
  isDragging = true;
  setVideoProgress(e);
});

document.addEventListener('mousemove', (e) => {
  if (isDragging) {
    setVideoProgress(e);
  }
});

document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    if (!video.paused) updateProgressBar();
  }
});

const likeBtn = document.querySelectorAll('.carita');
likeBtn.forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('liked');
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const splash = document.querySelector(".splash-screen");
const loginContainer = document.getElementById("login"); // contenedor padre del login
const feed = document.getElementById("feed");
const botonIniciar = document.getElementById("iniciar");
const logoutBtn = document.getElementById("logout");
const sendButton = document.querySelector(".send-comment");
const commentInputField = document.getElementById("commentText"); // id según HTML


  sendButton.addEventListener("click", () => {
  const texto = commentInputField.value.trim();
  if (!texto) return;

  sendTextComment(texto);

});

document.addEventListener("keydown",(e)=>{
  if(e.key=="Enter"){
     e.preventDefault(); 

    const texto = commentInputField.value.trim();
    if (!texto) return;

    sendTextComment(texto);

    commentInputField.value = ""; // ← limpiar input
  }
})

  loadCommentsFromFirestoreAndRender();


const users = [
 { user: 'johan', contra: '12345', name: 'Johan', foto: 'assets/img/johan.jpg' },
  { user: 'yisus', contra: '123', name: 'Yisus', foto: 'assets/img/yisus.jpg' },
  { user: 'kevin', contra: '000', name: 'Kevin', foto: 'assets/img/kevin.jpg' },
  { user: 'trofeo', contra: '321', name: 'Trofeo', foto: 'assets/img/trofeo.jpg'},
   { user: 'Invitado', contra: '0110', name: 'Invitado 1', foto: 'assets/img/invitado.png'},
    { user: 'Invitado1', contra: '1001', name: 'Invitado 2', foto: 'assets/img/invitado.png'},
      {user: 'Invitado2', contra: '412', name: 'Invitado 3', foto: 'assets/img/invitado.png'},
       {user: 'Invitado3', contra: '312', name: 'Invitado 4', foto: 'assets/img/invitado.png'},
         {user: 'yeison', contra: '888', name: 'Yeison', foto: 'assets/img/yeison.jpg'},
           {user: 'edwin', contra: '666', name: 'Edwin', foto: 'assets/img/edwin.jpg'},
            {user: 'angel', contra: '555', name: 'Angel', foto: 'assets/img/angel.jpg'}
];



// -------------------- MENÚ DESPLEGABLE --------------------
const menuDropdown = document.querySelector(".menu-dropdown");
const dropdownContent = document.querySelector(".dropdown-content");
if (menuDropdown && dropdownContent) {
  menuDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
    menuDropdown.classList.toggle("active");
  });
  document.addEventListener("click", (e) => {
    if (!menuDropdown.contains(e.target)) menuDropdown.classList.remove("active");
  });
}

// -------------------- FUNCIONES AUXILIARES --------------------
function removePendingPreview() {
  const preview = document.querySelector(".pending-audio-preview");
  if (preview) preview.remove();
}

function clearPendingAudio() {
  if (window.pendingAudioBlob) window.pendingAudioBlob = null;
}



// -------------------- ESTADO INICIAL --------------------
if (loginContainer) loginContainer.style.display = "none";
if (feed) feed.style.display = "none";



// Revisar si hay sesión guardada
const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActivo'));
if (usuarioGuardado) {
  actualizarPerfil(usuarioGuardado);
  showFeedInstant();
  if (splash) splash.style.display = "none";
} else {
  // Mostrar login después del splash
  if (splash) {
    setTimeout(() => {
      splash.style.display = "none";
      if (loginContainer) {
        loginContainer.style.display = "flex";
        loginContainer.classList.add('fadein');
        setTimeout(() => loginContainer.classList.remove('fadein'), 600);
      }
    }, 5000);
  } else {
    if (loginContainer) loginContainer.style.display = "flex";
  }
}



// -------------------- LOGIN --------------------
if (botonIniciar) botonIniciar.addEventListener("click", loginHandler);
document.addEventListener("keydown", (e) => { if (e.key === "Enter") loginHandler(); });

function loginHandler() {
  const usuario = document.getElementById('usuario').value.trim();
  const clave = document.getElementById('clave').value.trim();
  const usuarioValido = users.find(u => u.user === usuario && u.contra === clave);

  if (usuarioValido) {
    localStorage.setItem('usuarioActivo', JSON.stringify(usuarioValido));
    actualizarPerfil(usuarioValido);

    if (loginContainer) loginContainer.classList.add('fadeout');
    setTimeout(() => {
      if (loginContainer) {
        loginContainer.style.display = "none";
        loginContainer.classList.remove('fadeout');
      }
      showFeed();
    }, 450);
  } else {
    alert("❌ Usuario o contraseña incorrectos");
  }
}

// -------------------- LOGOUT --------------------
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem('usuarioActivo');
    removePendingPreview();
    clearPendingAudio?.();

    if (feed) feed.classList.add('fadeout');
    setTimeout(() => {
      if (feed) {
        feed.style.display = "none";
        feed.classList.remove('fadeout');
      }
      if (loginContainer) {
        loginContainer.style.display = "flex";
        loginContainer.classList.add('fadein');
        setTimeout(() => loginContainer.classList.remove('fadein'), 600);
      }
    }, 350);
  });
}


// -------------------- FEED --------------------
function showFeed() {
  if (!feed) return;
  feed.style.display = "block";
  feed.classList.add('fadein');
  setTimeout(() => {
    feed.classList.remove('fadein');
    initLikes();
  }, 600);
}

function showFeedInstant() {
  if (!feed) return;
  feed.style.display = "block";
  requestAnimationFrame(() => initLikes());
}

// -------------------- PERFIL --------------------
function actualizarPerfil(usuario) {
  const nombreUsuario = document.querySelector('.perfil-nombre');
  const fotoUsuario = document.querySelector('.perfil-foto');
  if (nombreUsuario) nombreUsuario.textContent = usuario.name || usuario.user;
  if (fotoUsuario) fotoUsuario.src = usuario.foto || 'assets/img/johan.jpg';
}

// -------------------- LIKES --------------------
function initLikes() {
  const likesData = JSON.parse(localStorage.getItem("likesData")) || {};
  const posts = document.querySelectorAll(".post");

  posts.forEach((post, index) => {
    const likeBtn = post.querySelector(".action-btn.carita");
    if (!likeBtn) return;

    const postId = `post-${index}`;
    if (!likesData[postId]) likesData[postId] = { count: 0, users: [] };

    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!usuarioActivo) {
      updateLikeUI(likeBtn, likesData[postId].count, false);
      return;
    }

    const userLiked = likesData[postId].users.includes(usuarioActivo.user);
    updateLikeUI(likeBtn, likesData[postId].count, userLiked);

    likeBtn.addEventListener("click", () => {
      const user = usuarioActivo.user;
      const postLikes = likesData[postId];

      if (postLikes.users.includes(user)) {
        postLikes.users = postLikes.users.filter(u => u !== user);
        postLikes.count = Math.max(0, postLikes.count - 1);
      } else {
        postLikes.users.push(user);
        postLikes.count += 1;
      }

      localStorage.setItem("likesData", JSON.stringify(likesData));
      const likedNow = postLikes.users.includes(user);
      updateLikeUI(likeBtn, postLikes.count, likedNow);
    });
  });
}

function updateLikeUI(button, count, liked) {
  button.innerHTML = `<img src="assets/icons/${liked ? "hearth-fill.png" : "hearth.png"}" alt=""> ${count}`;
  if (liked) button.classList.add("liked");
  else button.classList.remove("liked");
}

// -------------------- LOGO MÓVIL --------------------
if (window.innerWidth <= 768) {
  const logoSection = document.querySelector(".sidebar .logo-section");
  const BarTop = document.getElementById('bar-top');
  if (logoSection && BarTop) {
    const clone = logoSection.cloneNode(true);
    clone.classList.add("floating-logo");
    BarTop.appendChild(clone);
  }
}


});

/* ---------- Grabación + envío de comentario (texto o audio) ---------- */
const micButton = document.querySelector(".mic-button");
const sendButton = document.querySelector(".send-comment");
const commentList = document.querySelector(".comments-list");
const commentInputField = document.getElementById("commentText"); // id según HTML

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let pendingAudioBlob = null; // Esta es la clave: audio grabado pendiente de enviar
let pendingAudioURL = null;
let stream = null;

// Inicializar micrófono (pide permiso)
async function initMic() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      // Crear blob y URL, guardar como "pendiente"
      pendingAudioBlob = new Blob(audioChunks, { type: "audio/webm" });
      audioChunks = [];
      if (pendingAudioURL) {
        URL.revokeObjectURL(pendingAudioURL);
        pendingAudioURL = null;
      }
      pendingAudioURL = URL.createObjectURL(pendingAudioBlob);

      // Mostrar una vista previa dentro del área de input (si quieres)
      showPendingAudioPreview(pendingAudioURL);
    };
  } catch (err) {
    console.error("No se pudo acceder al micrófono:", err);
    micButton.disabled = true;
  }
}

// Muestra una mini-vista previa con botón para cancelar
function showPendingAudioPreview(url) {
// Si ya existe una previa, eliminarla
  removePendingPreview();

  const wrapper = document.querySelector(".input-wrapper");
  if (!wrapper) return;

  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo')) || { foto: 'assets/img/johan.jpg' };

  const preview = document.createElement("div");
  preview.className = "pending-audio-preview";
  preview.innerHTML = `
    <div class="voice-card shake-horizontal" style="width:160px; height:60px; margin-right:8px; margin-top:5px; position:relative; overflow:hidden;">
      <div class="voice-bg" 
           style="
             background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('${usuarioActivo.foto}');
             background-size: cover;
             background-position: center;
             filter: blur(2px) brightness(0.8);
             position: absolute;
             inset: 0;
             z-index: 0;
             border-radius: 12px;
           "></div>

      <div style="position:relative; z-index:2; display:flex; align-items:center; height:100%; padding-left:6px; width:100%;">
        <button class="voice-play"  style="width:50px; height:30px; margin-left:9px;"></button>
        <div class="voice-bar"  aria-hidden="true" style="height:4px; margin-left:10px; margin-right:10px; width:100%;"></div>
        <audio src="${url}"></audio>
      </div>
    </div>
    <button type="button" class="cancel-audio" title="Eliminar grabación">✕</button>
  `;

  wrapper.appendChild(preview);

  // Inicializa la funcionalidad del reproductor para esta vista previa
  const newCard = preview.querySelector('.voice-card');
  initVoiceCard(newCard);

  // Botón para cancelar grabación pendiente
  preview.querySelector(".cancel-audio").addEventListener("click", () => {
    removePendingPreview();
    clearPendingAudio();
  });
}

function removePendingPreview() {
  const prev = document.querySelector(".pending-audio-preview");
  if (prev && prev.parentElement) prev.parentElement.removeChild(prev);
}

// limpia pending
function clearPendingAudio() {
  if (pendingAudioURL) {
    URL.revokeObjectURL(pendingAudioURL);
    pendingAudioURL = null;
  }
  pendingAudioBlob = null;
}

// Iniciar / detener grabación (soporte mouse y touch)
function startRecording() {
  if (!mediaRecorder) return;
  audioChunks = [];
  mediaRecorder.start();
  isRecording = true;
  micButton.classList.add('recording'); // para animación visual
   const microfone= new Audio("assets/audios/microfono.mp3");
  microfone.play();
}
function stopRecording() {
  if (!mediaRecorder || !isRecording) return;
  mediaRecorder.stop();
  isRecording = false;
  micButton.classList.remove('recording');
}

// Eventos (mousedown / touchstart)
micButton.addEventListener('mousedown', (e) => { e.preventDefault(); startRecording(); });
micButton.addEventListener('mouseup', (e) => { e.preventDefault(); stopRecording(); });
micButton.addEventListener('mouseleave', (e) => { // si sueltas fuera del botón, también parar
  if (isRecording) stopRecording();
});
micButton.addEventListener('touchstart', (e) => { e.preventDefault(); startRecording(); });
micButton.addEventListener('touchend', (e) => { e.preventDefault(); stopRecording(); });

// Enviar: si hay pendingAudioBlob lo enviamos como comentario, si no, texto
sendButton.addEventListener('click', (e) => {
  e.preventDefault();

  // prioridad: audio pendiente
  if (pendingAudioBlob) {
    sendAudioComment(pendingAudioBlob);
    removePendingPreview();
    clearPendingAudio();
    return;
  }

  // si no hay audio, enviar texto (si hay)
  const text = commentInputField.value.trim();
  if (text) {
    sendTextComment(text);
    commentInputField.value = '';
  } else {
    // nada que enviar
    // opcional: indicar al usuario que grabe o escriba
    // alert('Escribe un comentario o graba un audio.');
  }
});

// Mostrar un comentario de texto en DOM (NO lo vuelve a guardar en Firestore)
function addTextCommentToDOM(texto, user = 'Tú', foto = 'assets/img/johan.jpg',id = null) {
  
  if (!commentList) {
    console.error("ERROR: No se pasó el commentList correcto a addTextCommentToDOM");
    return;
  }

  const node = document.createElement('div');
  node.classList.add('user-info', 'margen');

  if (id) node.dataset.id = id;

  node.innerHTML = `
    <img src="${foto}" class="user-avatar">
    <div class="comment-text"><strong>${user}</strong> ${texto}</div>
    <div class="comment-options delete-btn"></div>
  `;

  // Evento para eliminar
  node.querySelector(".comment-options").addEventListener("click", async () => {

    if (node.dataset.id) {
      await deleteDoc(doc(db, "comments", "test", "comentarios", node.dataset.id));
    }

    node.remove();

    // 🔥 ACTUALIZAR CONTADOR DESPUÉS DE ELIMINAR
    const section = commentList.closest('.comments-section');
    const toggleBtn = section ? section.querySelector('.toggle-comments') : null;

    if (toggleBtn) {
      toggleBtn.textContent = `Ocultar comentarios (${commentList.children.length})`;
    }
  });

  // Agregar a la lista correcta
  commentList.appendChild(node);

  // Actualizar botón de la sección correcta al agregar
  const section = commentList.closest('.comments-section');
  const toggleBtn = section ? section.querySelector('.toggle-comments') : null;

  if (toggleBtn) {
    toggleBtn.textContent = `Ocultar comentarios (${commentList.children.length})`;
    commentList.style.display = 'flex';
  }

  return node;
}
// Cargar todos los comentarios guardados en Firestore (textos y audios)
async function loadCommentsFromFirestoreAndRender() {
  const comments = await cargarNotas();
  console.log("Comentarios desde Firestore:", comments);

  const contenedor = document.querySelector(".comments-list");
  contenedor.innerHTML = ""; // limpiar lista

 comments.forEach(comment => {
  if (comment.tipo && comment.tipo.toLowerCase() === "audio") {
    addAudioCommentToDOM(
      comment.contenido,
      comment.user || "Anónimo",
      comment.foto || "assets/img/johan.jpg",
      comment.id // <--- AGREGAR ESTO
    );
  } else {
    addTextCommentToDOM(
      comment.contenido,
      comment.user || "Anónimo",
      comment.foto || "assets/img/johan.jpg",
      comment.id // <--- AGREGAR ESTO
    );
  }
});

}


// Funciones para insertar comentario en la lista (ajusta según tu estructura)
async function sendTextComment(texto) {

  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo')) || { 
    user: 'Tú', 
    foto: 'assets/img/johan.jpg'
  };

  try {
    // PRIMERO guardar en Firestore
    const docRef = await addDoc(notasRef, {
      tipo: "texto",
      contenido: texto,
      user: usuarioActivo.user,
      foto: usuarioActivo.foto,
      fecha: new Date().toISOString()
    });

    console.log("Comentario guardado con ID:", docRef.id);

    // DESPUÉS sí ponerlo en pantalla con su ID
    addTextCommentToDOM(texto, usuarioActivo.user, usuarioActivo.foto, docRef.id);

    return docRef.id;

  } catch (err) {
    console.error("Error guardando comentario:", err);
  }
}




// Para audio:
async function sendAudioComment(blob) {
  const usuarioActivo = JSON.parse(localStorage.getItem('usuarioActivo')) || {
    user: "Tú",
    foto: "assets/img/johan.jpg"
  };

  const reader = new FileReader();

  reader.onloadend = async () => {
    const base64Audio = reader.result;

    // 1. Guardar primero en Firestore
    try {
      const docRef = await addDoc(notasRef, {
        tipo: "audio",
        contenido: base64Audio,
        user: usuarioActivo.user,
        foto: usuarioActivo.foto,
        fecha: new Date().toISOString()
      });

      console.log("Audio guardado en Firestore:", docRef.id);

      // 2. Mostrar en DOM con ID
      addAudioCommentToDOM(
        base64Audio,
        usuarioActivo.user,
        usuarioActivo.foto,
        docRef.id
      );

    } catch (err) {
      console.error("Error guardando audio:", err);
    }
  };

  reader.readAsDataURL(blob);
}


function addAudioCommentToDOM(url, user, foto, id = null){
  
  const node = document.createElement('div');
  node.className = 'user-info margen';
  if (id) node.dataset.id = id;
  node.innerHTML = `
    <img src="${foto}" class="user-avatar">
    <div class="comment-text">
      <strong>${user}</strong>
      <div style="margin-top:6px;">
        <div class="voice-card shake-vertical" style="width:160px; height:60px; position:relative; overflow:hidden; border-radius:12px;">
          <div class="voice-bg"
            style="
              background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url('${foto}');
              background-size: cover;
              background-position: center;
              filter: blur(2px) brightness(0.8);
              position: absolute;
              inset: 0;
              z-index: 0;
              border-radius: 12px;
            ">
          </div>

          <div style="position:relative; z-index:2; display:flex; align-items:center; height:100%; padding-left:6px; width:100%;">
            <button class="voice-play" id="boton" style="width:50px; height:30px; margin-left:9px;"></button>
            <div class="voice-bar" id="bar1" aria-hidden="true" style="height:4px; margin-left:10px; margin-right:10px; width:100%; background:#555; border-radius:2px; overflow:hidden;">
              <div class="voice-progress" style="height:100%; width:0%; background:#00d9ff;"></div>
            </div>
            <audio src="${url}"></audio>
          </div>
          <button class="voice-delete" title="Eliminar comentario">✕</button>

        </div>
      </div>
    </div>
  `;

  commentList.appendChild(node);

  


  // 🔸 Iniciar la funcionalidad del nuevo audio
  const newCard = node.querySelector('.voice-card');
  initVoiceCard(newCard);
  
  // Eliminar comentario
  
   // Eliminar comentario
// Eliminar comentario (DOM + Firestore)
const deleteBtn = node.querySelector('.voice-delete');

deleteBtn.addEventListener('click', async () => {

  // 1. Eliminar de Firestore si tiene ID
  if (node.dataset.id) {
    await deleteDoc(doc(db, "comments", "test", "comentarios", node.dataset.id));
  }

  // 2. Eliminar del DOM
  node.remove();

  // 3. Actualizar contador
  const toggleBtn = document.querySelector('.toggle-comments');
  if (toggleBtn) {
    toggleBtn.textContent = `Ocultar comentarios (${commentList.children.length})`;
  }
});

 
  

  commentList.style.display = 'flex';

  const toggleBtn = document.querySelector('.toggle-comments');
  if (toggleBtn) {
    toggleBtn.textContent = `Ocultar comentarios (${commentList.children.length})`;
  }

  return node;

}

// Inicializa un reproductor de audio (voice-card individual)
function initVoiceCard(card) {
  const btn = card.querySelector('.voice-play');
  const bar = card.querySelector('.voice-bar');
  const music = card.querySelector('audio');

  if (!btn || !bar || !music) return;

  let isPlaying = false;
  let wasPaused = false;
  let lastProgress = 0;

  btn.addEventListener('click', () => {
    if (music.paused) music.play();
    else music.pause();
  });

  music.addEventListener('play', () => {
    isPlaying = true;
    bar.classList.add('active');
    card.classList.add('active');
    btn.classList.add('paused');
    if (wasPaused) {
      bar.style.transition = 'width 0.4s cubic-bezier(.68,-0.55,.27,1.55)';
      bar.style.setProperty("--progress", `${lastProgress}%`);
      wasPaused = false;
    }
  });

  music.addEventListener('pause', () => {
    isPlaying = false;
    lastProgress = (music.currentTime / music.duration) * 100 || 0;
    wasPaused = true;
    bar.style.transition = 'width 0.35s ease-in';
    bar.style.setProperty("--progress", `0%`);
    bar.classList.remove('active');
    card.classList.remove('active');
    btn.classList.remove('paused');
  });

  music.addEventListener('ended', () => {
    isPlaying = false;
    wasPaused = false;
    bar.classList.remove('active');
    card.classList.remove('active');
    bar.style.setProperty("--progress", "0%");
    btn.classList.remove('paused');
  });

  music.addEventListener('timeupdate', () => {
    if (isPlaying && music.duration) {
      const progress = (music.currentTime / music.duration) * 100;
      bar.style.setProperty("--progress", `${progress}%`);
    }
  });

  // Permitir saltar tocando la barra
  bar.addEventListener("click", (e) => {
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = (clickX / width) * 100;
    if (music.duration) {
      music.currentTime = (percentage / 100) * music.duration;
      bar.style.setProperty("--progress", `${percentage}%`);
    }
  });
}


// utilidades
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// inicializar al cargar
initMic();


async function guardarNota(texto) {
  try {
    await addDoc(notasRef, {
      contenido: texto,
      fecha: new Date().toISOString()
    });

    console.log("Nota guardada correctamente");
  } catch (error) {
    console.error("Error al guardar la nota:", error);
  }
}





async function cargarNotas() {
  const snapshot = await getDocs(notasRef);
  const lista = [];

  snapshot.forEach(doc => {
    lista.push({ id: doc.id, ...doc.data() });
  });

 
  return lista;
}

// Evento global para botones "Mostrar/Ocultar comentarios"
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('toggle-comments')) {

    const section = e.target.closest('.comments-section');
    if (!section) return;

    const commentList = section.querySelector('#commentList, .comment-list, .comments-list');
    if (!commentList) return;

    // Comportamiento de abrir/cerrar
    const isHidden = commentList.style.display === 'none';

    commentList.style.display = isHidden ? 'flex' : 'none';
    const cuenta = commentList.children.length;

    e.target.textContent = isHidden
      ? `Ocultar comentarios (${cuenta})`
      : `Ver comentarios (${cuenta})`;
  }
});

// Vibración real
function vibrarWhatsApp() {
  if (navigator.vibrate) {
    navigator.vibrate(60); // vibración cortica como WhatsApp
  }
}

// --- Eventos táctiles (móvil) ---
// Efecto WhatsApp en botón de grabación
micButton.addEventListener("mousedown", () => {
  micButton.classList.add("recording-active");
});

micButton.addEventListener("mouseup", () => {
  micButton.classList.remove("recording-active");
});

micButton.addEventListener("mouseleave", () => {
  micButton.classList.remove("recording-active");
});

// Versión móvil
micButton.addEventListener("touchstart", () => {
  vibrarWhatsApp();
  micButton.classList.add("recording-active");
});

micButton.addEventListener("touchend", () => {
  micButton.classList.remove("recording-active");
});
