// ==========================================================================
// 1. ANIMASI LOADING SCREEN TIMEOUT
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
        }
        // Inisialisasi ulang posisi lanyard setelah loading screen hilang
        if (typeof initLanyard === 'function') {
            initLanyard();
        }
    }, 2000);
});

// ==========================================================================
// 2. NAVIGASI ANTAR HALAMAN (HOME <-> VANZ Z AI)
// ==========================================================================
const btnHome = document.getElementById('btn-home');
const btnAi = document.getElementById('btn-ai');
const pageHome = document.getElementById('page-home');
const pageAi = document.getElementById('page-ai');

if (btnHome && btnAi && pageHome && pageAi) {
    btnHome.addEventListener('click', () => {
        btnHome.classList.add('active');
        btnAi.classList.remove('active');
        pageHome.classList.add('active');
        pageAi.classList.remove('active');
    });

    btnAi.addEventListener('click', () => {
        btnAi.classList.add('active');
        btnHome.classList.remove('active');
        pageAi.classList.add('active');
        pageHome.classList.remove('active');
    });
}

// ==========================================================================
// 3. PENGATURAN SWITCH TEMA (DARK / LIGHT MODE)
// ==========================================================================
const themeBtn = document.getElementById('theme-btn');
const body = document.body;

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            body.setAttribute('data-theme', 'light');
            themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
        } else {
            body.setAttribute('data-theme', 'dark');
            themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
        }
    });
}

// ==========================================================================
// 4. LOGIKA DRAG AND DROP + FISIKA ELASTIS (LETOY/SPRING PHYSICS)
// ==========================================================================
const draggable = document.getElementById('draggable-tag');
const scene = document.getElementById('lanyard-scene');
const pathL = document.getElementById('l-rope-L');
const pathR = document.getElementById('l-rope-R');
const dRing = document.getElementById('l-dring');

// Variabel Posisi & Fisika Karet
let isDragging = false;
let offsetX = 0, offsetY = 0;

// Posisi Real-time Kartu saat ini
let cardX = 0, cardY = 0;
// Posisi Default (Rumah asal kartu tempat dia harus balik kembali)
let homeX = 0, homeY = 140;

// Variabel Kecepatan untuk kalkulasi ayunan elastis (Spring Physics)
let vx = 0, vy = 0;
const spring = 0.045; // Tingkat kekencangan karet (makin kecil makin molor)
const friction = 0.82; // Redaman ayunan (makin besar makin lama berayunnya)

function initLanyard() {
    if (!draggable || !scene) return;

    const sRect = scene.getBoundingClientRect();
    const dRect = draggable.getBoundingClientRect();

    // Tentukan titik tengah home area
    homeX = (sRect.width - dRect.width) / 2;
    homeY = 130;

    // Set posisi awal kartu ke posisi home
    cardX = homeX;
    cardY = homeY;
    draggable.style.left = cardX + 'px';
    draggable.style.top = cardY + 'px';

    updateLanyardPhysics();
    animateSpring();
}

// Fungsi Menggambar Lengkungan Tali SVG secara dinamis
function updateLanyardPhysics() {
    if (!scene || !pathL || !pathR || !dRing) return;

    const sRect = scene.getBoundingClientRect();
    
    // Titik tumpuan atas tali lanyard (Gantungan kiri & kanan)
    const anchorLX = sRect.width * 0.38;
    const anchorRX = sRect.width * 0.62;
    const anchorY = 0;

    // Titik tengah lubang d-ring pas di atas kartu id badge
    const cardW = draggable.offsetWidth;
    const targetX = cardX + (cardW / 2);
    const targetY = cardY - 6;

    // Geser besi klip d-ring mengikuti kartu
    dRing.setAttribute('transform', `translate(${targetX}, ${targetY})`);

    // Rumus Kurva Bezier untuk kelenturan tali kiri dan kanan
    const cp1LX = anchorLX;
    const cp1LY = anchorY + (targetY - anchorY) * 0.4;
    const cp2LX = targetX - 25;
    const cp2LY = targetY - 15;

    const cp1RX = anchorRX;
    const cp1RY = anchorY + (targetY - anchorY) * 0.4;
    const cp2RX = targetX + 25;
    const cp2RY = targetY - 15;

    pathL.setAttribute('d', `M ${anchorLX} ${anchorY} C ${cp1LX} ${cp1LY}, ${cp2LX} ${cp2LY}, ${targetX} ${targetY}`);
    pathR.setAttribute('d', `M ${anchorRX} ${anchorY} C ${cp1RX} ${cp1RY}, ${cp2RX} ${cp2RY}, ${targetX} ${targetY}`);
}

// Loop Animasi untuk menghitung efek pegas/membal pas dilepas
function animateSpring() {
    if (!isDragging) {
        // Rumus Hooke's Law untuk gerak elastis pegas balik ke rumah (homeX, homeY)
        let ax = (homeX - cardX) * spring;
        let ay = (homeY - cardY) * spring;

        vx += ax;
        vy += ay;
        vx *= friction;
        vy *= friction;

        cardX += vx;
        cardY += vy;

        draggable.style.left = cardX + 'px';
        draggable.style.top = cardY + 'px';

        updateLanyardPhysics();
    }
    requestAnimationFrame(animateSpring);
}

// Handler Drag & Drop Event (Mouse & HP Touchscreen)
if (draggable && scene) {
    const startDrag = (e) => {
        isDragging = true;
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const rect = draggable.getBoundingClientRect();
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
    };

    const doDrag = (e) => {
        if (!isDragging) return;
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const sRect = scene.getBoundingClientRect();
        
        let newLeft = clientX - sRect.left - offsetX;
        let newTop = clientY - sRect.top - offsetY;

        // Batasi gerakan kartu agar tidak melompat keluar dari kotak sandbox scene
        const maxLeft = sRect.width - draggable.offsetWidth;
        const maxTop = sRect.height - draggable.offsetHeight;

        if (newLeft < 0) newLeft = 0;
        if (newLeft > maxLeft) newLeft = maxLeft;
        if (newTop < 60) newTop = 60; // Batasi atas biar klip d-ring ga ilang keatas
        if (newTop > maxTop) newTop = maxTop;

        cardX = newLeft;
        cardY = newTop;

        draggable.style.left = cardX + 'px';
        draggable.style.top = cardY + 'px';

        updateLanyardPhysics();
    };

    const endDrag = () => {
        isDragging = false;
    };

    // Event listener PC
    draggable.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', endDrag);

    // Event listener Layar Sentuh HP
    draggable.addEventListener('touchstart', startDrag, { passive: true });
    document.addEventListener('touchmove', doDrag, { passive: true });
    document.addEventListener('touchend', endDrag);

    window.addEventListener('resize', () => {
        if(!isDragging) {
            const sRect = scene.getBoundingClientRect();
            homeX = (sRect.width - draggable.offsetWidth) / 2;
        }
    });
}

// ==========================================================================
// 5. INTEGRASI CHAT INTERFACES CLAUDE DENGAN AUTO PROMPT VANZZ AI
// ==========================================================================
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');

const autoPrompt = "Kamu adalah VanzZ Ai, sebuah asisten kecerdasan buatan pintar yang diciptakan oleh developer handal bernama Vanz. Jawablah setiap pertanyaan user dengan gaya bahasa anak muda yang santai, gaul, agak berwibawa, keren, memakai lo-gue, dan ringkas.";

async function pemicuAI() {
    const userText = chatInput.value.trim();
    if (!userText) return;

    appendMessage(userText, 'user');
    chatInput.value = '';

    const loadingId = appendMessage('VanzZ Ai sedang berpikir...', 'bot');

    try {
        const fullPrompt = `${autoPrompt}\n\nPertanyaan: ${userText}`;
        const requestUrl = `https://api.azbry.com/api/ai/claude?q=${encodeURIComponent(fullPrompt)}`;
        const respon = await fetch(requestUrl);
        const data = await respon.json();

        const botMessageElement = document.getElementById(loadingId);
        
        if (data && data.result) {
            botMessageElement.innerText = data.result;
        } else if (data && data.message) {
            botMessageElement.innerText = "Sistem Error: " + data.message;
        } else {
            botMessageElement.innerText = "Gagal memproses jawaban dari otak AI.";
        }

    } catch (error) {
        console.error("Gagal Fetch API:", error);
        const botMessageElement = document.getElementById(loadingId);
        botMessageElement.innerText = "Waduh, server VanzZ Ai tampaknya lagi offline nih, Bang!";
    }
}

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    const uniqueId = 'msg-' + Date.now() + Math.random().toString(36).substr(2, 4);
    
    msgDiv.classList.add('chat-msg', sender);
    msgDiv.id = uniqueId;
    msgDiv.innerText = text;
    
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return uniqueId;
}

if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', pemicuAI);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') pemicuAI();
    });
}
