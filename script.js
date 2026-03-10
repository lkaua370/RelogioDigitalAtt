const hourHand = document.getElementById('hour');
const minuteHand = document.getElementById('minute');
const secondHand = document.getElementById('second');
const dateDisplay = document.getElementById('date');
const soundToggle = document.getElementById('soundToggle');
const iconMute = document.getElementById('icon-mute');
const iconUnmute = document.getElementById('icon-unmute');

// Áudio opcional de background/ambient (um som sintético espacial genérico de baixa frequência)
// Como não temos arquivos locais, criaremos um som estilo Drone via Web Audio API 
let audioCtx;
let oscillator;
let gainNode;
let isSoundPlaying = false;

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    
    // Som grave suave contínuo (drone sci-fi)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(55, audioCtx.currentTime); // 55Hz (A1)
    
    // Modulação bem suave
    const lfo = audioCtx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.1, audioCtx.currentTime); // 0.1Hz bem lento
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(5, audioCtx.currentTime); // varia +- 5Hz
    
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    lfo.start();

    gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime); // Volume intencionalmente BAIXO
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
}

soundToggle.addEventListener('click', () => {
    if (!audioCtx) initAudio();
    
    isSoundPlaying = !isSoundPlaying;
    
    if (isSoundPlaying) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        iconMute.style.display = 'none';
        iconUnmute.style.display = 'block';
        soundToggle.classList.add('active');
        gainNode.gain.setTargetAtTime(0.04, audioCtx.currentTime, 0.5); // Fade in
    } else {
        iconMute.style.display = 'block';
        iconUnmute.style.display = 'none';
        soundToggle.classList.remove('active');
        gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5); // Fade out
    }
});

function updateClock() {
    const now = new Date();
    
    // Usamos milliseconds para gerar um valor fracionado que permite movimento CONTÍNUO
    const milliseconds = now.getMilliseconds();
    const seconds = now.getSeconds() + (milliseconds / 1000);
    const minutes = now.getMinutes() + (seconds / 60);
    const hours = now.getHours() + (minutes / 60);

    // Cálculo em graus contínuos! Não há mais o "Tick" pulando
    const secondsDegrees = (seconds / 60) * 360;
    const minutesDegrees = (minutes / 60) * 360;
    const hoursDegrees = ((hours % 12) / 12) * 360;

    // Aplicamos as rotações
    secondHand.style.transform = `translateX(-50%) rotate(${secondsDegrees}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minutesDegrees}deg)`;
    hourHand.style.transform = `translateX(-50%) rotate(${hoursDegrees}deg)`;

    // Transição removida no CSS para aceitar o requestAnimationFrame rodando rápido sem delays

    // Mostrar a data
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    let dayNum = Math.floor(now.getDate());
    dayNum = dayNum < 10 ? '0' + dayNum : dayNum;

    // Atualiza o DOM a cada frame apenas se o segundo base (sem ms) virar? 
    // Pra data, não precisa atualizar a cada ms, mas como ler string é rapido, deixamos direto
    dateDisplay.textContent = `${days[now.getDay()]} // ${dayNum} ${months[now.getMonth()]}`;
    
    // Usamos frame animation pro ponteiro rodar lisinho a 60fps
    requestAnimationFrame(updateClock);
}

// Inicializar e rodar o relógio a 60 FPS
requestAnimationFrame(updateClock);


// --- SISTEMA DE PARTÍCULAS ESPACIAIS (Poeira Lenta) ---
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particlesArray = [];
const numberOfParticles = 80; // Suave, sem poluir visual

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles(); // refaz se mudar a tela
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        // Velocidade incrivelmente lenta flutuante
        this.weight = Math.random() * 0.2 - 0.1; 
        this.directionX = Math.random() * 0.4 - 0.2;
    }
    update() {
        this.y -= this.weight;
        this.x += this.directionX;

        // Se sair da tela repõe do outro lado
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
    }
    draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
}

function initParticles() {
    particlesArray = [];
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();
