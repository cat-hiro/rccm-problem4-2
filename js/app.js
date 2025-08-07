let currentQuestionIndex = 0;
let userAnswers = [];
let correctAnswers = 0;
let filteredQuestions = [];
let answered = false;
let correctQuestionIds = new Set();

const STORAGE_KEY = 'rccm-correct-questions';

function initializeApp() {
    // questionDataは all-questions-complete.js で定義済み
    
    loadCorrectQuestions();

    document.getElementById('loading').style.display = 'block';
    document.getElementById('questionContent').style.display = 'none';
    
    setTimeout(() => {
        filterQuestions();
        loadQuestion();
        updateProgress();
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('questionContent').style.display = 'block';
    }, 500);
}

function loadCorrectQuestions() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        correctQuestionIds = new Set(JSON.parse(saved));
    }
}

function saveCorrectQuestions() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...correctQuestionIds]));
}

function resetProgress() {
    if (confirm('学習進捗をリセットしますか？正解済みの問題も再び出題されるようになります。')) {
        correctQuestionIds.clear();
        saveCorrectQuestions();
        
        currentQuestionIndex = 0;
        userAnswers = [];
        correctAnswers = 0;
        answered = false;
        
        document.getElementById('completedMessage').style.display = 'none';
        document.getElementById('questionContent').style.display = 'block';
        
        filterQuestions();
        loadQuestion();
        updateProgress();
    }
}

function getQuestionId(question) {
    return `${question.year}-${question.number}`;
}

function filterQuestions() {
    const selectedYear = document.getElementById('yearSelect').value;
    let questions;
    
    if (selectedYear === 'all') {
        questions = [...questionData];
        shuffleArray(questions);
    } else {
        questions = questionData.filter(q => q.year === selectedYear);
    }
    
    filteredQuestions = questions.filter(q => !correctQuestionIds.has(getQuestionId(q)));
    
    currentQuestionIndex = 0;
    userAnswers = new Array(filteredQuestions.length).fill(null);
    correctAnswers = 0;
    answered = false;
    
    if (filteredQuestions.length === 0) {
        showCompletedMessage();
    }
}

function showCompletedMessage() {
    document.getElementById('questionContent').style.display = 'none';
    document.getElementById('completedMessage').style.display = 'block';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadQuestion() {
    if (filteredQuestions.length === 0) {
        showCompletedMessage();
        return;
    }
    
    if (currentQuestionIndex >= filteredQuestions.length) {
        showResults();
        return;
    }

    const question = filteredQuestions[currentQuestionIndex];
    answered = userAnswers[currentQuestionIndex] !== null;

    document.getElementById('questionNumber').textContent = `問題 ${question.number}`;
    document.getElementById('questionYear').textContent = question.yearDisplay;
    document.getElementById('questionText').textContent = question.question;

    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';

    question.choices.forEach((choice, index) => {
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'choice';
        choiceDiv.innerHTML = `<span class="choice-label">${String.fromCharCode(97 + index)}.</span>${choice}`;
        
        if (answered) {
            choiceDiv.classList.add('disabled');
            if (index === question.correct) {
                choiceDiv.classList.add('correct');
            } else if (index === userAnswers[currentQuestionIndex]) {
                choiceDiv.classList.add('incorrect');
            }
        } else {
            choiceDiv.onclick = () => selectChoice(index);
        }

        choicesContainer.appendChild(choiceDiv);
    });

    document.getElementById('prevBtn').style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    document.getElementById('nextBtn').style.display = answered ? 'block' : 'none';

    const resultArea = document.getElementById('resultArea');
    if (answered) {
        resultArea.classList.add('show');
        showAnswerResult();
    } else {
        resultArea.classList.remove('show');
    }

    updateProgress();
}

function selectChoice(index) {
    if (answered) return;

    answered = true;
    const question = filteredQuestions[currentQuestionIndex];
    userAnswers[currentQuestionIndex] = index;

    const isCorrect = index === question.correct;
    if (isCorrect) {
        correctAnswers++;
        correctQuestionIds.add(getQuestionId(question));
        saveCorrectQuestions();
    }

    document.querySelectorAll('.choice').forEach((choice, choiceIndex) => {
        choice.onclick = null;
        choice.classList.add('disabled');
        
        if (choiceIndex === question.correct) {
            choice.classList.add('correct');
        } else if (choiceIndex === index && index !== question.correct) {
            choice.classList.add('incorrect');
        }
    });

    showAnswerResult();
    document.getElementById('nextBtn').style.display = 'block';
    updateProgress();
}

function showAnswerResult() {
    const question = filteredQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    const isCorrect = userAnswer === question.correct;

    const resultArea = document.getElementById('resultArea');
    const resultStatus = document.getElementById('resultStatus');
    const explanationText = document.getElementById('explanationText');

    resultArea.classList.add('show');

    if (isCorrect) {
        resultStatus.textContent = '✅ 正解！';
        resultStatus.className = 'result-status correct';
    } else {
        const correctLetter = String.fromCharCode(97 + question.correct);
        resultStatus.textContent = `❌ 不正解（正解は ${correctLetter}）`;
        resultStatus.className = 'result-status incorrect';
    }

    explanationText.textContent = question.explanation;
}

function nextQuestion() {
    currentQuestionIndex++;
    answered = false;
    loadQuestion();
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        answered = userAnswers[currentQuestionIndex] !== null;
        loadQuestion();
    }
}

function updateProgress() {
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = filteredQuestions.length;
    
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    const correctCount = userAnswers.reduce((count, answer, index) => {
        if (answer !== null && index < filteredQuestions.length && answer === filteredQuestions[index].correct) {
            return count + 1;
        }
        return count;
    }, 0);
    
    const percentage = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    document.getElementById('scorePercent').textContent = percentage;
}

function showResults() {
    const percentage = Math.round((correctAnswers / filteredQuestions.length) * 100);
    const finalScoreElement = document.getElementById('finalScore');
    const resultMessageElement = document.getElementById('resultMessage');

    finalScoreElement.textContent = `${correctAnswers}/${filteredQuestions.length} (${percentage}%)`;

    if (percentage >= 80) {
        finalScoreElement.className = 'result-score excellent';
        resultMessageElement.textContent = '素晴らしい成績です！よく理解されています。';
    } else if (percentage >= 60) {
        finalScoreElement.className = 'result-score good';
        resultMessageElement.textContent = '良い成績です！もう少し頑張りましょう。';
    } else {
        finalScoreElement.className = 'result-score poor';
        resultMessageElement.textContent = '復習が必要です。基礎から見直しましょう。';
    }

    document.getElementById('questionContent').style.display = 'none';
    document.getElementById('resultSummary').style.display = 'block';
}

function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = new Array(filteredQuestions.length).fill(null);
    correctAnswers = 0;
    answered = false;

    document.getElementById('questionContent').style.display = 'block';
    document.getElementById('resultSummary').style.display = 'none';

    loadQuestion();
}

document.getElementById('yearSelect').addEventListener('change', function() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('questionContent').style.display = 'none';
    document.getElementById('completedMessage').style.display = 'none';
    
    setTimeout(() => {
        filterQuestions();
        loadQuestion();
        
        document.getElementById('loading').style.display = 'none';
        if (filteredQuestions.length > 0) {
            document.getElementById('questionContent').style.display = 'block';
        }
    }, 300);
});

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
