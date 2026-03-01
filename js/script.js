"use strict";

/* ─────────────────────────────────────────────────────────────────
   CONFIGURAÇÃO DO FIREBASE
   Cole sua configuração do Firebase abaixo para ativar o banco de
   dados em tempo real. Se deixar vazio, o quiz usará localStorage.
───────────────────────────────────────────────────────────────── */
const firebaseConfig = {
  apiKey: "AIzaSyAR1TFbeAIwNV4cGyp0LzfqRaJSK1mWsyQ",
  authDomain: "quiz-jooj-aniversario.firebaseapp.com",
  databaseURL: "https://quiz-jooj-aniversario-default-rtdb.firebaseio.com/",
  projectId: "quiz-jooj-aniversario",
  storageBucket: "quiz-jooj-aniversario.firebasestorage.app",
  messagingSenderId: "200152011682",
  appId: "1:200152011682:web:2ea19a2e111d5f61a1d8fb",
};

/* ─────────────────────────────────────────────────────────────────
   INICIALIZAÇÃO DO FIREBASE (com fallback automático)
───────────────────────────────────────────────────────────────── */
let db = null;
let useFirebase = false;

(function initFirebase() {
  try {
    if (firebaseConfig.apiKey && firebaseConfig.databaseURL) {
      firebase.initializeApp(firebaseConfig);
      db = firebase.database();
      useFirebase = true;
      console.log("[Quiz] Firebase conectado com sucesso.");
    } else {
      console.log(
        "[Quiz] Firebase não configurado. Usando localStorage como fallback.",
      );
    }
  } catch (e) {
    console.warn(
      "[Quiz] Erro ao inicializar Firebase:",
      e.message,
      "— usando localStorage.",
    );
  }
})();

/* ─────────────────────────────────────────────────────────────────
   BANCO DE DADOS — FUNÇÕES PRINCIPAIS
───────────────────────────────────────────────────────────────── */

/**
 * Salva a pontuação de um jogador.
 * @param {string} name  - Nome do jogador
 * @param {number} score - Pontuação obtida
 * @returns {Promise<void>}
 */
async function saveScore(name, score, duration) {
  const entry = {
    name: name.trim(),
    score: score,
    timestamp: duration,
  };

  console.log("[DEBUG] Tentando salvar pontuação:", entry);

  if (useFirebase) {
    try {
      const ref = db.ref("ranking").push();
      console.log("[DEBUG] Firebase push ref criado:", ref.toString());
      await ref.set(entry);
      console.log("[DEBUG] Firebase entry salva com sucesso!");
    } catch (e) {
      console.error("[DEBUG] Erro ao salvar no Firebase:", e);
    }
  } else {
    // localStorage fallback
    const data = getLocalRanking();
    data.push(entry);
    localStorage.setItem("quiz_jooj_ranking", JSON.stringify(data));
    console.log("[DEBUG] Ranking local atualizado:", data);
  }
}

/**
 * Carrega e retorna o ranking ordenado (maior pontuação primeiro;
 * em caso de empate, quem terminou antes fica na frente).
 * @returns {Promise<Array<{name, score, timestamp}>>}
 */

async function loadRanking() {
  let entries = [];
  console.log("[DEBUG] Carregando ranking...");

  if (useFirebase) {
    try {
      const snap = await db.ref("ranking").once("value");
      console.log("[DEBUG] Snapshot do Firebase recebido:", snap.val());

      snap.forEach((child) => {
        const val = child.val();
        console.log("[DEBUG] Lendo child:", child.key, val);
        entries.push(val);
      });
    } catch (e) {
      console.error("[DEBUG] Erro ao ler ranking do Firebase:", e);
    }
  } else {
    entries = getLocalRanking();
    console.log("[DEBUG] Ranking local carregado:", entries);
  }

  // Ordena: maior score primeiro; empate → menor timestamp primeiro
  entries.sort((a, b) => b.score - a.score || a.timestamp - b.timestamp);
  console.log("[DEBUG] Ranking ordenado:", entries);

  return entries;
}

/** Lê o ranking do localStorage */
function getLocalRanking() {
  try {
    return JSON.parse(localStorage.getItem("quiz_jooj_ranking") || "[]");
  } catch {
    return [];
  }
}

/* ─────────────────────────────────────────────────────────────────
   PERGUNTAS DO QUIZ
   Estrutura: { question, options: [string x4], answer: índice 0-3 }
───────────────────────────────────────────────────────────────── */
const questions = [
  {
    question: "Qual é o nome completo do Jooj?",
    options: [
      "Jorge Fernando Alves Pereira",
      "Jorge Fernando Alvares Pereira",
      "Jorge Fernando Pereira Alvares",
      "Nicolas Neto",
    ],
    answer: 0,
  },
  {
    question: "Qual o dia do aniversário do Jooj?",
    options: ["03/03", "02/03", "28/02", "04/03"],
    answer: 0,
  },
  {
    question: "Quantos anos o Jooj vai fazer?",
    options: ["25", "26", "24", "Todas as opções"],
    answer: 1,
  },
  {
    question: "Qual é a cor favorita do Jooj?",
    options: ["#FFD800", "#f2ff79", "#FFAA00", "#FF7700"],
    answer: 2,
  },
  {
    question: "Qual a comida favorita do Jooj?",
    options: ["Pizza", "Churrasco", "Hambúrguer", "Comida Japonesa"],
    answer: 3,
  },
  {
    question:
      "Quantas vezes os pais do Jooj já se separaram? (Contando tanto as que foram no cartório quanto as que não foram)",
    options: ["13", "9", "0", "7"],
    answer: 0,
  },
  {
    question:
      "Quantas vezes o Jooj já fez a Mari fazer xixi no chão da cozinha de tanto rir?",
    options: ["3", "2", "que?", "nenhuma... quem faz xixi de tanto rir?"],
    answer: 1,
  },
  {
    question: "Qual é o estilo musical preferido do Jooj?",
    options: ["Sertanejo", "Rock", "Rap", "Pop"],
    answer: 2,
  },
  {
    question: "Qual é o maior medo do Jooj?",
    options: [
      "Altura",
      "Barata",
      "Escuro",
      "Estar no mar nadando e ver uma baleia chegando perto",
    ],
    answer: 3,
  },
  {
    question: "Qual é o esporte favorito do Jooj?",
    options: ["Futebol", "Basquete", "Vôlei", "Tênis"],
    answer: 1,
  },
  {
    question: "Qual é o sonho de viagem do Jooj?",
    options: ["Japão", "Nova York", "Paris", "Dubai"],
    answer: 0,
  },
  {
    question: "Qual é o nome do primeiro personagem de RPG do Jooj?",
    options: ["Roberto", "Gael", "Lafel", "Ergath"],
    answer: 2,
  },
  {
    question: "Quais doenças o Jooj tem laudadas?",
    options: [
      "Tourette, Depressão, Dislexia, Borderline",
      "Tourette, Ansiedade, TDAH, Borderline",
      "Ansiedade, Depressão, TDAH, Dislexia",
      "Tourette, Ansiedade, TDAH, Dislexia",
    ],
    answer: 3,
  },
  {
    question: "Qual superpoder o Jooj teria?",
    options: ["Teleporte", "Voar", "Super força", "Supervelocidade"],
    answer: 0,
  },
  {
    question: "Qual é a habilidade secreta do Jooj que ninguém sabe?",
    options: [
      "Equilibrar talheres na cabeça",
      "Dormir em qualquer lugar",
      "Imitar a voz da Mari",
      "Não sei",
    ],
    answer: 3,
  },
  {
    question: "Qual é a cor do próximo gato que o Jooj quer?",
    options: ["Preto", "Laranja", "Frajola (Alfredo)", "Cinza"],
    answer: 0,
  },
  {
    question: "Qual das opções de número o Jooj iria escolher?",
    options: ["78", "14", "7", "64"],
    answer: 0,
  },
  {
    question: "Qual é o filme favorito do Jooj?",
    options: [
      "Spider-Man: No Way Home",
      "Um Cabra Bom de Bola",
      "Deu a Louca na Chapeuzinho",
      "A Escolha Perfeita",
    ],
    answer: 0,
  },
  {
    question: "Odeio gente falsa que na frente,...",
    options: [
      "Na frente é uma coisa, com a gente por de trás fica falando da gente de falar por a frente, fala por de trás",
      "Na frente é de um jeito, por trás já fala outra, mas jura que tá sendo sincera",
      "Sorri pra gente, mas atrás inventa história como se fosse novela",
      "Na frente elogia, por trás critica, e ainda acha que ninguém percebe",
    ],
    answer: 0,
  },
  {
    question: "Qual é o pão favorito do Jooj?",
    options: ["Australiano", "Frances", "Brioche", "Cará"],
    answer: 0,
  },
  {
    question: "Quais são os empregos dos sonhos do Jooj?",
    options: [
      "Desenvolvedor de jogos e Dublador",
      "Desenvolvedor de jogos e Dançarino",
      "Dublador e Jogador de basquete",
      "Dançarino e Jogador de basquete",
    ],
    answer: 0,
  },
  {
    question: "Qual vai ser o nome da minha primeira filha? (Humana)",
    options: [
      "Rafaela",
      "Melissa",
      "Yasmin",
      "Ster",
    ],
    answer: 0,
  },
  {
    question: "Qual o nome da minha moto?",
    options: [
      "Rafaela",
      "Melissa",
      "Yasmin",
      "Ster",
    ],
    answer: 0,
  },
];

/* ─────────────────────────────────────────────────────────────────
   ESTADO DO QUIZ
───────────────────────────────────────────────────────────────── */
const state = {
  playerName: "",
  currentQuestion: 0,
  answers: new Array(questions.length).fill(null), // índice da opção escolhida
  feedbackShown: false,
  shuffledOptions: new Array(questions.length).fill(null), // armazena opções embaralhadas
  startTime: null,
};

/* ─────────────────────────────────────────────────────────────────
   NAVEGAÇÃO ENTRE TELAS
───────────────────────────────────────────────────────────────── */
function goToScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.remove("active"));
  const target = document.getElementById(id);
  target.classList.add("active");
  // Reinicia animação
  target.style.animation = "none";
  target.offsetHeight; // reflow
  target.style.animation = "";
}

/* ─────────────────────────────────────────────────────────────────
   TELA DE NOME → iniciar quiz
───────────────────────────────────────────────────────────────── */
function startQuiz() {
  const input = document.getElementById("player-name-input");
  const name = input.value.trim();

  if (!name) {
    input.focus();
    input.style.borderColor = "#FF4444";
    input.style.boxShadow = "0 0 0 3px #FF444425";
    showToast("⚠️ Digite seu nome para continuar!");
    setTimeout(() => {
      input.style.borderColor = "";
      input.style.boxShadow = "";
    }, 1800);
    return;
  }

  // Reseta estado
  state.playerName = name;
  state.currentQuestion = 0;

  // Embaralhar as perguntas
  shuffleArray(questions);

  state.answers = new Array(questions.length).fill(null);
  state.feedbackShown = false;
  state.startTime = Date.now();

  questions.forEach((q, idx) => {
    state.shuffledOptions[idx] = shuffleOptions(q.options);
  });

  goToScreen("screen-quiz");
  renderQuestion();
}

/* ─────────────────────────────────────────────────────────────────
   RENDERIZAÇÃO DA PERGUNTA
───────────────────────────────────────────────────────────────── */
function renderQuestion() {
  const idx = state.currentQuestion;
  const q = questions[idx];
  const total = questions.length;

  // Progresso e texto
  document.getElementById("progress-fill").style.width =
    `${((idx + 1) / total) * 100}%`;
  document.getElementById("question-counter").textContent =
    `${idx + 1} / ${total}`;
  document.getElementById("question-text").textContent = q.question;

  const grid = document.getElementById("options-grid");
  grid.innerHTML = "";

  const options = state.shuffledOptions[idx];

  options.forEach(({ opt, originalIdx }) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";

    // Se for a pergunta da cor favorita
    if (q.question.includes("cor favorita")) {
      btn.innerHTML = `<span style="
    display:flex;
    align-items:center;
    justify-content:center;
    width:120px;       /* dobro da largura */
    height:60px;       /* mesma altura */
    margin:auto;
    border-radius:12px;
    background-color:${opt};
    color:#000;
    font-weight:700;
    border:2px solid #FFF;
    text-shadow:0 0 2px #FFF;
  ">${opt}</span>`;
    } else {
      btn.innerHTML = `<span>${opt}</span>`;
    }

    btn.onclick = () => selectOption(idx, originalIdx);

    // Restaura seleção anterior
    if (state.answers[idx] !== null) {
      btn.disabled = true;
      if (originalIdx === state.answers[idx]) {
        btn.classList.add(originalIdx === q.answer ? "correct" : "incorrect");
      } else if (originalIdx === q.answer) {
        btn.classList.add("correct");
      }
    }

    grid.appendChild(btn);
  });

  document.getElementById("btn-prev").disabled = idx === 0;
  const btnNext = document.getElementById("btn-next");
  btnNext.textContent = idx === total - 1 ? "✅ Finalizar" : "Próxima →";
}

/* ─────────────────────────────────────────────────────────────────
   SELECIONAR OPÇÃO
───────────────────────────────────────────────────────────────── */
function selectOption(questionIdx, selectedIdx) {
  const q = questions[questionIdx];

  if (state.answers[questionIdx] !== null) return;

  state.answers[questionIdx] = selectedIdx;

  const options = state.shuffledOptions[questionIdx];
  options.forEach(({ originalIdx }, i) => {
    const btn = document.querySelectorAll(".option-btn")[i];
    btn.disabled = true;
    if (originalIdx === selectedIdx) {
      btn.classList.add(selectedIdx === q.answer ? "correct" : "incorrect");
    } else if (originalIdx === q.answer) {
      btn.classList.add("correct"); // mostra a correta
    }
  });
}

/* ─────────────────────────────────────────────────────────────────
   NAVEGAÇÃO ENTRE PERGUNTAS
───────────────────────────────────────────────────────────────── */
function nextQuestion() {
  const idx = state.currentQuestion;

  // Impede avançar sem selecionar
  if (state.answers[idx] === null) {
    showToast("⚠️ Selecione uma resposta antes de continuar!");
    // Anima o grid para chamar atenção
    const grid = document.getElementById("options-grid");
    grid.style.animation = "none";
    grid.offsetHeight;
    grid.style.animation = "shake 0.4s ease";
    return;
  }

  if (idx < questions.length - 1) {
    state.currentQuestion++;
    renderQuestion();
  } else {
    finishQuiz();
  }
}

function prevQuestion() {
  if (state.currentQuestion > 0) {
    state.currentQuestion--;
    renderQuestion();
  }
}

/* ─────────────────────────────────────────────────────────────────
   FINALIZAR QUIZ
───────────────────────────────────────────────────────────────── */
async function finishQuiz() {
  // Calcula pontuação
  const score = state.answers.reduce(
    (acc, ans, i) => acc + (ans === questions[i].answer ? 1 : 0),
    0,
  );

  const duration = Date.now() - state.startTime; // tempo total em ms

  // Salva no banco
  try {
    await saveScore(state.playerName, score, duration);
  } catch (e) {
    console.error("[Quiz] Erro ao salvar pontuação:", e);
  }

  // Exibe resultado
  document.getElementById("result-name").textContent = state.playerName;
  document.getElementById("result-score").textContent =
    `${score} / ${questions.length}`;
  document.getElementById("result-message").textContent =
    getResultMessage(score);

  updateResultImage(score);
  goToScreen("screen-result");
  renderRankingInto("result-ranking-list");
}

/* ─────────────────────────────────────────────────────────────────
   MENSAGEM DINÂMICA DE RESULTADO
───────────────────────────────────────────────────────────────── */
function getResultMessage(score) {
  const total = questions.length;
  const pct = score / total;

  if (pct <= 0.33) {
    return `Hmm... ${score} ponto(s)? Parece que você conhece o Jooj menos do que o vizinho dele! 😅 Estude mais!`;
  } else if (pct <= 0.6) {
    return `${score} pontos! Você conhece o Jooj razoavelmente bem, mas ainda tem muito a descobrir. Quase lá! 🤔`;
  } else if (pct <= 0.86) {
    return `Uau! ${score} pontos! Você é praticamente um especialista em Jooj. Impressionante! 🔥`;
  } else {
    return `🏆 LENDÁRIO! ${score} de ${total}! Você conhece o Jooj melhor do que ele mesmo! Merece o trono! 👑`;
  }
}

/* ─────────────────────────────────────────────────────────────────
   RENDERIZAÇÃO DO RANKING
───────────────────────────────────────────────────────────────── */
async function renderRankingInto(listId) {
  const list = document.getElementById(listId);
  list.innerHTML =
    '<li class="ranking-empty"><span class="spinner"></span> Carregando...</li>';

  try {
    const entries = await loadRanking();

    if (!entries.length) {
      list.innerHTML =
        '<li class="ranking-empty">Nenhuma pontuação registrada ainda. Seja o primeiro! 🚀</li>';
      return;
    }

    list.innerHTML = "";
    entries.forEach((entry, i) => {
      const li = document.createElement("li");
      li.className = `ranking-item${i === 0 ? " first-place" : ""}`;

      const pos = i === 0 ? "👑" : `#${i + 1}`;

      // Calcula tempo de resposta em minutos e segundos
      const minutes = Math.floor(entry.timestamp / 60000);
      const seconds = Math.floor((entry.timestamp % 60000) / 1000);
      const timeStr = `${minutes}m ${seconds}s`;

      li.innerHTML = `
    <span class="rank-pos">${pos}</span>
    <span class="rank-name">${escapeHTML(entry.name)}</span>
    <span class="rank-score">${entry.score} / ${questions.length}</span>
    <span class="rank-time" style="color:#999;font-size:0.85rem;margin-left:8px;">${timeStr}</span>
  `;
      list.appendChild(li);
    });
  } catch (e) {
    list.innerHTML =
      '<li class="ranking-empty">Erro ao carregar ranking. Tente novamente.</li>';
    console.error("[Quiz] Erro ao carregar ranking:", e);
  }
}

/* ─────────────────────────────────────────────────────────────────
   TELA DE RANKING SEPARADA
───────────────────────────────────────────────────────────────── */
function openRanking() {
  goToScreen("screen-ranking");
  renderRankingInto("full-ranking-list");
}

/* ─────────────────────────────────────────────────────────────────
   NOVO PARTICIPANTE
───────────────────────────────────────────────────────────────── */
function newParticipant() {
  document.getElementById("player-name-input").value = "";
  goToScreen("screen-name");
}

/* ─────────────────────────────────────────────────────────────────
   UTILITÁRIOS
───────────────────────────────────────────────────────────────── */

/** Exibe um toast de notificação temporário */
function showToast(msg, duration = 2400) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), duration);
}

/** Escapa HTML para evitar XSS */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Embaralha o array de perguntas (in-place) */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/** Embaralha um array e retorna um novo array com índices originais */
function shuffleOptions(options) {
  const arr = options.map((opt, i) => ({ opt, originalIdx: i }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function updateResultImage(score) {
  const img = document.getElementById("result-img");

  if (score <= 5) {
    img.src = "assets/03.png";
  } else if (score <= 10) {
    img.src = "assets/06.png";
  } else if (score <= 15) {
    img.src = "assets/08.png";
  } else {
    img.src = "assets/10.png";
  }
}
