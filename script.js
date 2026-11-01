// Banco de preguntas clasificado por dificultad para simular la progresión del concurso
const easyQuestions = [
    { question: "¿Qué lenguaje se utiliza principalmente para dar estilos y diseño a las páginas web?", options: ["HTML", "CSS", "Python", "Git"], answer: 1 },
    { question: "¿Qué etiqueta de HTML se usa por estándar para incluir JS externo?", options: ["<script>", "<js>", "<javascript>", "<code>"], answer: 0 },
    { question: "¿Cuál es la extensión estándar para los archivos de hojas de estilo?", options: [".html", ".js", ".css", ".py"], answer: 2 },
    { question: "¿Qué etiqueta HTML se utiliza para crear un enlace o hipervínculo?", options: ["<link>", "<a>", "<href>", "<url>"], answer: 1 },
    { question: "¿En qué año se lanzó oficialmente el lenguaje JavaScript?", options: ["1991", "1995", "2000", "1985"], answer: 1 }
];

const mediumQuestions = [
    { question: "¿Cuál es el rol principal de JavaScript en una aplicación web?", options: ["Estructurar contenido", "Gestionar BD", "Añadir interactividad y lógica", "Configurar servidor"], answer: 2 },
    { question: "¿Qué herramienta se utilizó para levantar el servidor local de desarrollo?", options: ["Node.js", "Python (http.server)", "Apache", "Docker"], answer: 1 },
    { question: "¿Cuál es el sistema de control de versiones distribuido más popular?", options: ["Subversion", "Git", "Mercurial", "CVS"], answer: 1 },
    { question: "¿Qué puerto utiliza por defecto el servidor local de Python?", options: ["3000", "8080", "8000", "5000"], answer: 2 },
    { question: "¿Qué comando de Git se usa para subir cambios al repositorio remoto?", options: ["git pull", "git commit", "git push", "git init"], answer: 2 }
];

const hardQuestions = [
    { question: "¿Qué significa CSS en el desarrollo web?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheet"], answer: 1 },
    { question: "¿Cuál de los siguientes es un motor de base de datos relacional?", options: ["MongoDB", "MySQL", "Redis", "Firebase"], answer: 1 },
    { question: "¿Qué protocolo se utiliza de forma segura para transferir páginas web?", options: ["FTP", "HTTP", "HTTPS", "SMTP"], answer: 2 },
    { question: "¿Qué estructura de datos almacena elementos en formato clave-valor?", options: ["Array", "Objeto / Diccionario", "Bucle", "Variable"], answer: 1 },
    { question: "¿Qué operador se utiliza para comparar valor y tipo estricto en JavaScript?", options: ["==", "=", "===", "!=="], answer: 2 }
];

let questions = [];
let currentQuestion = 0;
let score = 0;
let currentPlayer = "";

// Estado de comodines
let used5050 = false;
let usedCall = false;
let usedAudience = false;
let callTimer = null;

// Elementos DOM
const registerScreen = document.getElementById("register-screen");
const gameScreen = document.getElementById("game-screen");
const recordsScreen = document.getElementById("records-screen");
const playerForm = document.getElementById("player-form");
const playerNameInput = document.getElementById("player-name");
const playerLastnameInput = document.getElementById("player-lastname");
const welcomeUser = document.getElementById("welcome-user");

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedbackMsg = document.getElementById("feedback-msg");
const levelIndicator = document.getElementById("level-indicator");
const totalQuestionsEl = document.getElementById("total-questions");

const btn5050 = document.getElementById("btn-5050");
const btnCall = document.getElementById("btn-call");
const btnAudience = document.getElementById("btn-audience");

const callModal = document.getElementById("call-modal");
const timerText = document.getElementById("timer-text");
const friendAdvice = document.getElementById("friend-advice");

const audienceModal = document.getElementById("audience-modal");
const audienceResults = document.getElementById("audience-results");

const finalTitle = document.getElementById("final-title");
const finalScoreText = document.getElementById("final-score-text");
const recordsList = document.getElementById("records-list");

// Manejo del formulario de inicio: Progresión de dificultad (Fáciles -> Medias -> Difíciles)
playerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = playerNameInput.value.trim();
    const lastname = playerLastnameInput.value.trim();
    
    if (name && lastname) {
        currentPlayer = `${name} ${lastname}`;
        welcomeUser.textContent = `Jugador: ${currentPlayer}`;
        
        const shuffledEasy = [...easyQuestions].sort(() => Math.random() - 0.5);
        const shuffledMedium = [...mediumQuestions].sort(() => Math.random() - 0.5);
        const shuffledHard = [...hardQuestions].sort(() => Math.random() - 0.5);

        questions = [...shuffledEasy, ...shuffledMedium, ...shuffledHard];
        totalQuestionsEl.textContent = questions.length;

        registerScreen.style.display = "none";
        gameScreen.style.display = "flex";
        loadQuestion();
    }
});

function loadQuestion() {
    feedbackMsg.textContent = "";
    if (callModal) callModal.style.display = "none";
    if (audienceModal) audienceModal.style.display = "none";
    clearInterval(callTimer);

    if (levelIndicator) {
        levelIndicator.textContent = currentQuestion + 1;
    }
    
    const q = questions[currentQuestion];
    questionText.textContent = q.question;
    optionsContainer.innerHTML = "";

    q.options.forEach((optionText, index) => {
        const btn = document.createElement("button");
        const letter = String.fromCharCode(65 + index); // A, B, C, D
        
        btn.classList.add("option-btn");
        btn.dataset.index = index;
        
        // Solución robusta usando textContent para evitar conflictos con etiquetas HTML en las opciones
        const prefixSpan = document.createElement("span");
        prefixSpan.className = "option-prefix";
        prefixSpan.textContent = `${letter}: `;
        
        btn.appendChild(prefixSpan);
        btn.appendChild(document.createTextNode(optionText));

        btn.style.visibility = "visible";
        btn.disabled = false;

        btn.addEventListener("click", () => selectOption(index, q.answer));
        optionsContainer.appendChild(btn);
    });

    updateLifelineButtons();
}

function updateLifelineButtons() {
    if (btn5050) btn5050.disabled = used5050;
    if (btnCall) btnCall.disabled = usedCall;
    if (btnAudience) btnAudience.disabled = usedAudience;
}

// COMODÍN 1: 50/50
if (btn5050) {
    btn5050.addEventListener("click", () => {
        if (used5050) return;
        used5050 = true;
        btn5050.disabled = true;

        const q = questions[currentQuestion];
        const buttons = Array.from(optionsContainer.querySelectorAll("button"));
        let hiddenCount = 0;

        buttons.sort(() => Math.random() - 0.5).forEach(btn => {
            const idx = parseInt(btn.dataset.index);
            if (idx !== q.answer && hiddenCount < 2) {
                btn.style.visibility = "hidden";
                hiddenCount++;
            }
        });
    });
}

// COMODÍN 2: LLAMAR A UN AMIGO
if (btnCall) {
    btnCall.addEventListener("click", () => {
        if (usedCall) return;
        usedCall = true;
        btnCall.disabled = true;

        callModal.style.display = "block";
        const q = questions[currentQuestion];
        const friendChoice = q.options[q.answer];
        const letter = String.fromCharCode(65 + q.answer);
        
        friendAdvice.textContent = `"¡Hola! Analizando esta pregunta, creo que la respuesta correcta es la ${letter}: ${friendChoice}."`;

        let timeLeft = 60;
        timerText.textContent = `Tiempo restante: ${timeLeft}s`;

        callTimer = setInterval(() => {
            timeLeft--;
            timerText.textContent = `Tiempo restante: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(callTimer);
                timerText.textContent = "¡Tiempo agotado!";
            }
        }, 1000);
    });
}

// COMODÍN 3: AUDIENCIA VIRTUAL
if (btnAudience) {
    btnAudience.addEventListener("click", () => {
        if (usedAudience) return;
        usedAudience = true;
        btnAudience.disabled = true;

        audienceModal.style.display = "block";
        const q = questions[currentQuestion];

        let percentages = [0, 0, 0, 0];
        let basePct = currentQuestion >= 10 ? 40 : 55;
        let correctPct = Math.floor(Math.random() * 20) + basePct;
        percentages[q.answer] = correctPct;

        let remaining = 100 - correctPct;
        for (let i = 0; i < 4; i++) {
            if (i !== q.answer) {
                if (i === 3 || (i === 2 && q.answer === 3)) {
                    percentages[i] = remaining;
                } else {
                    let val = Math.floor(Math.random() * remaining);
                    percentages[i] = val;
                    remaining -= val;
                }
            }
        }

        audienceResults.innerHTML = "";
        q.options.forEach((opt, idx) => {
            const letter = String.fromCharCode(65 + idx);
            const pct = percentages[idx];
            audienceResults.innerHTML += `
                <div style="margin-bottom: 6px; text-align: left;">
                    <span style="font-size: 0.9rem;">Opción ${letter}: <strong>${pct}%</strong></span>
                    <div class="audience-bar-bg">
                        <div class="audience-bar-fill" style="width: ${pct}%;"></div>
                    </div>
                </div>
            `;
        });
    });
}

// VALIDACIÓN DE RESPUESTAS
function selectOption(selectedIndex, correctIndex) {
    clearInterval(callTimer);
    const buttons = optionsContainer.querySelectorAll("button");
    buttons.forEach(btn => btn.disabled = true);
    
    if (btn5050) btn5050.disabled = true;
    if (btnCall) btnCall.disabled = true;
    if (btnAudience) btnAudience.disabled = true;

    if (selectedIndex === correctIndex) {
        buttons.forEach(btn => {
            if (parseInt(btn.dataset.index) === correctIndex) {
                btn.classList.add("correct");
            }
        });
        feedbackMsg.textContent = "¡Respuesta Correcta! 🎉 ¡Avanzas de nivel!";
        feedbackMsg.style.color = "#2ecc71";
        score++;
    } else {
        buttons.forEach(btn => {
            const idx = parseInt(btn.dataset.index);
            if (idx === selectedIndex) btn.classList.add("incorrect");
            if (idx === correctIndex) btn.classList.add("correct");
        });
        feedbackMsg.textContent = "¡Respuesta Incorrecta! Juego terminado. ❌";
        feedbackMsg.style.color = "#e74c3c";
    }

    setTimeout(() => {
        if (selectedIndex === correctIndex && currentQuestion < questions.length - 1) {
            currentQuestion++;
            loadQuestion();
        } else {
            showResults(selectedIndex === correctIndex);
        }
    }, 2500);
}

// GUARDAR Y MOSTRAR RÉCORDS
function showResults(won) {
    clearInterval(callTimer);
    gameScreen.style.display = "none";
    recordsScreen.style.display = "block";

    const isWinner = won && currentQuestion === questions.length - 1;
    finalTitle.textContent = isWinner ? "🏆 ¡Felicidades, ganaste el Millón! 🏆" : "¡Juego Finalizado!";
    finalScoreText.textContent = `${currentPlayer}, acertaste ${score} de ${questions.length} preguntas.`;

    let records = JSON.parse(localStorage.getItem("millonario_records")) || [];
    records.push({ name: currentPlayer, score: score, date: new Date().toLocaleDateString() });
    
    records.sort((a, b) => b.score - a.score);
    localStorage.setItem("millonario_records", JSON.stringify(records));

    recordsList.innerHTML = "";
    records.slice(0, 5).forEach((rec, index) => {
        recordsList.innerHTML += `
            <div class="record-item">
                <span>#${index + 1} - <strong>${rec.name}</strong></span>
                <span>Aciertos: <strong>${rec.score}</strong></span>
            </div>
        `;
    });
}