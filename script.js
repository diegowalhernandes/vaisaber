const SUPABASE_URL = "https://bfkiipxuilltkjrrztmx.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJma2lpcHh1aWxsdGtqcnJ6dG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMjE2NzUsImV4cCI6MjA4ODY5NzY3NX0.auc6AGduIrb-05947GH8mUysRfIa9zlHiVdPNQso5kU"

let perguntasJogo = []
let perguntaAtual = 0
let pontos = 0

const premios = [100, 200, 300, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 750000, 1000000]

// ── Embaralhamento Fisher-Yates (sem viés estatístico) ──
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// ── Busca perguntas do Supabase ──
async function startGame() {

  document.getElementById("startScreen").style.display = "none"
  document.getElementById("gameScreen").style.display = "block"
  document.getElementById("question").innerText = "Carregando perguntas..."
  document.getElementById("answers").innerHTML = ""

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/quiz?select=*`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    })

    if (!response.ok) throw new Error("Erro ao buscar perguntas")

    const data = await response.json()
    console.log("Dados recebidos:", data)
    console.log("Total:", data.length)

    const facil   = data.filter(q => q.dificuldade === "facil")
    const medio   = data.filter(q => q.dificuldade === "medio")
    const dificil = data.filter(q => q.dificuldade === "dificil")


  perguntasJogo = shuffle(data).slice(0, 15).map(q => ({
    pergunta: q.pergunta,
    resposta: q.resposta,
    opcoes: [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d]
  }))

    perguntaAtual = 0
    pontos = 0
    document.getElementById("score").innerText = "Pontos: 0"

    loadQuestion()

  } catch (error) {
    document.getElementById("question").innerText = "⚠️ Não foi possível carregar as perguntas. Verifique sua conexão e tente novamente."
    console.error(error)
  }
}

// ── Carrega a pergunta atual ──
function loadQuestion() {
  const q = perguntasJogo[perguntaAtual]

  document.getElementById("question").innerText = q.pergunta
  document.getElementById("progress").innerText = "Pergunta " + (perguntaAtual + 1) + " de 15"

  const answers = document.getElementById("answers")
  answers.innerHTML = ""

  // Embaralha as opções a cada pergunta
  const opcosEmbaralhadas = shuffle(q.opcoes)

  opcosEmbaralhadas.forEach(opcao => {
    const btn = document.createElement("button")
    btn.innerText = opcao
    btn.onclick = () => checkAnswer(btn, opcao, q.resposta)
    answers.appendChild(btn)
  })
}

// ── Verifica resposta ──
function checkAnswer(btn, opcao, resposta) {
  const buttons = document.querySelectorAll("#answers button")
  buttons.forEach(b => b.disabled = true)

  if (opcao === resposta) {
    btn.classList.add("correct")
    pontos = premios[perguntaAtual]
    document.getElementById("score").innerText = "Pontos: " + pontos.toLocaleString("pt-BR")

    setTimeout(() => {
      perguntaAtual++
      if (perguntaAtual >= 15) {
        winGame()
      } else {
        loadQuestion()
      }
    }, 800)

  } else {
    btn.classList.add("wrong")
    buttons.forEach(b => {
      if (b.innerText === resposta) b.classList.add("correct")
    })
    setTimeout(endGame, 1200)
  }
}

// ── Tela de vitória ──
function winGame() {
  document.getElementById("gameScreen").style.display = "none"
  document.getElementById("endScreen").style.display = "block"
  document.getElementById("finalMessage").innerText = "🏆 Você ganhou 1 milhão!"
  document.getElementById("finalScore").innerText = "Pontuação: R$ " + pontos.toLocaleString("pt-BR")
}

// ── Tela de derrota ──
function endGame() {
  document.getElementById("gameScreen").style.display = "none"
  document.getElementById("endScreen").style.display = "block"
  document.getElementById("finalMessage").innerText = "❌ Fim de jogo"
  document.getElementById("finalScore").innerText = "Você ganhou: R$ " + pontos.toLocaleString("pt-BR")
}

// ── Reiniciar ──
function restartGame() {
  perguntaAtual = 0
  pontos = 0
  document.getElementById("endScreen").style.display = "none"
  document.getElementById("startScreen").style.display = "block"
}