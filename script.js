
let questions = [];
let currentIndex = 0;
let answeredQuestions = new Set();

async function loadQuestions() {
  const res = await fetch('questions.json');
  questions = await res.json();
  resetQuestions();
}

function resetQuestions() {
  answeredQuestions.clear();
  shuffleArray(questions);
  currentIndex = 0;
  showQuestion();
  document.getElementById("result").innerHTML = "";
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function showQuestion() {
  if (answeredQuestions.size === questions.length) {
    document.getElementById("question-text").innerText = "全ての問題が終了しました！";
    document.getElementById("choices").innerHTML = "";
    document.getElementById("question-image").style.display = "none";
    return;
  }

  while (answeredQuestions.has(currentIndex)) {
    currentIndex = (currentIndex + 1) % questions.length;
  }

  const q = questions[currentIndex];
  document.getElementById("question-text").innerText = q.question;

  const img = document.getElementById("question-image");
  if (q.image) {
    img.src = q.image;
    img.style.display = "block";
  } else {
    img.style.display = "none";
  }

  const choicesContainer = document.getElementById("choices");
  choicesContainer.innerHTML = "";

  q.choices.forEach((choice, index) => {
    const btn = document.createElement("button");
    btn.innerText = choice;
    btn.onclick = () => checkAnswer(index, q);
    choicesContainer.appendChild(btn);
  });

  document.getElementById("result").innerHTML = "";
}

function checkAnswer(selectedIndex, q) {
  const result = document.getElementById("result");
  if (selectedIndex === q.answer) {
    result.innerHTML = `✅ 正解！<br>${q.explanation}<br>(${q.year})`;
    answeredQuestions.add(currentIndex);
  } else {
    result.innerHTML = `❌ 不正解。<br>${q.explanation}<br>(${q.year})`;
  }
}

document.getElementById("next-button").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % questions.length;
  showQuestion();
});

document.getElementById("reset-button").addEventListener("click", resetQuestions);

loadQuestions();
