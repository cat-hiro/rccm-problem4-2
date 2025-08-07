let currentQuestionIndex = 0;
let userAnswers = [];
let correctAnswers = 0;
let filteredQuestions = [];
let answered = false;

function initializeApp() {
    // questionDataは既にall-questions.jsで定義済み

    // ローディング表示
    document.getElementById('loading').style.display = 'block';
    document.getElementById('questionContent').style.display = 'none';
    
    // 少し遅延してから問題を読み込み（ローディング効果）
    setTimeout(() => {
        filterQuestions();
        loadQuestion();
        updateProgress();
        
        // ローディングを隠して問題を表示
        document.getElementById('loading').style.display = 'none';
        document.getElementById('questionContent').style.display = 'block';
    }, 500);
}

function filterQuestions() {
    const selectedYear = document.getElementById('yearSelect').value;
    if (selectedYear === 'all') {
        filteredQuestions = [...questionData];
        // 全年度の場合はシャッフル
        shuffleArray(filteredQuestions);
    } else {
        filteredQuestions = questionData.filter(q => q.year === selectedYear);
    }
    
    currentQuestionIndex = 0;
    userAnswers = new Array(filteredQuestions.length).fill(null);
    correctAnswers = 0;
    answered = false;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadQuestion() {
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
            // 既に回答済みの場合
            choiceDiv.classList.add('disabled');
            if (index === question.correct) {
                choiceDiv.classList.add('correct');
            } else if (index === userAnswers[currentQuestionIndex]) {
                choiceDiv.classList.add('incorrect');
            }
        } else {
            // 未回答の場合、クリックイベントを設定
            choiceDiv.onclick = () => selectChoice(index);
        }

        choicesContainer.appendChild(choiceDiv);
    });

    // ボタンの状態を更新
    document.getElementById('prevBtn').style.display = currentQuestionIndex > 0 ? 'block' : 'none';
    document.getElementById('nextBtn').style.display = answered ? 'block' : 'none';

    // 結果エリアの表示/非表示
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

    // 正解をチェック
    if (index === question.correct) {
        correctAnswers++;
    }

    // 選択肢の表示を更新
    document.querySelectorAll('.choice').forEach((choice, choiceIndex) => {
        choice.onclick = null; // クリックを無効化
        choice.classList.add('disabled');
        
        if (choiceIndex === question.correct) {
            choice.classList.add('correct');
        } else if (choiceIndex === index && index !== question.correct) {
            choice.classList.add('incorrect');
        }
    });

    // 結果を表示
    showAnswerResult();
    
    // 次の問題ボタンを表示
    document.getElementById('nextBtn').style.display = 'block';

    updateProgress();
}

function showAnswerResult() {
    const question = filteredQuestions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    const isCorrect = userAnswer === question.correct;

    // 結果エリアを表示
    const resultArea = document.getElementById('resultArea');
    const resultStatus = document.getElementById('resultStatus');
    const explanationText = document.getElementById('explanationText');

    resultArea.classList.add('show');

    // 正解・不正解の表示
    if (isCorrect) {
        resultStatus.textContent = '✅ 正解！';
        resultStatus.className = 'result-status correct';
    } else {
        resultStatus.textContent = '❌ 不正解';
        resultStatus.className = 'result-status incorrect';
    }

    // 解説を表示
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

// 年度選択の変更イベント
document.getElementById('yearSelect').addEventListener('change', function() {
    // ローディング表示
    document.getElementById('loading').style.display = 'block';
    document.getElementById('questionContent').style.display = 'none';
    
    setTimeout(() => {
        filterQuestions();
        loadQuestion();
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('questionContent').style.display = 'block';
    }, 300);
});

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
