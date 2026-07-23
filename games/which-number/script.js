// ======================
// ELEMENTS
// ======================

const screens = {
    start: document.getElementById("startScreen"),
    guess: document.getElementById("guessScreen"),
    challenge: document.getElementById("challengeScreen"),
    result: document.getElementById("resultScreen")
};

const modeButtons = document.querySelectorAll(".mode-btn");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

const modeDescription = document.getElementById("modeDescription");
const difficultyInfo = document.getElementById("difficultyInfo");

const playBtn = document.getElementById("playBtn");

const attemptInfo = document.getElementById("attemptInfo");
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");
const guessHistory = document.getElementById("guessHistory");

const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");
const playAgainBtn = document.getElementById("playAgainBtn");
const resultHomeBtn = document.getElementById("resultHomeBtn");

const homeButtons = document.querySelectorAll(".home-btn");

// ======================
// GAME SETTINGS
// ======================

let selectedMode = "guess";

let gameSettings = {
    range: 100,
    attempts: 10
};

// Guess The Number
let secretNumber = 0;
let currentAttempts = 0;

// ======================
// SCREEN CONTROL
// ======================

function showScreen(screenName) {

    Object.values(screens).forEach(screen => {
        screen.classList.remove("active");
    });

    screens[screenName].classList.add("active");
    document.querySelector('.vatsal-related')?.setAttribute('hidden', '');
}

// ======================
// MODE SELECTION
// ======================

modeButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        modeButtons.forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        selectedMode = btn.dataset.mode;

        if (selectedMode === "guess") {

            modeDescription.textContent =
                "Find the hidden number before you run out of attempts.";

        } else {

            modeDescription.textContent =
                "Think of a number and see if the AI can find it.";

        }

        updateDifficultyInfo();
    });

});

// ======================
// DIFFICULTY
// ======================

difficultyButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        difficultyButtons.forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        gameSettings.range =
            Number(btn.dataset.range);

        gameSettings.attempts =
            Number(btn.dataset.attempts);

        updateDifficultyInfo();

    });

});

function updateDifficultyInfo() {

    if (selectedMode === "guess") {

        difficultyInfo.textContent =
            `1-${gameSettings.range} • ${gameSettings.attempts} tries`;

    } else {

        let maxGuesses =
            Math.ceil(
                Math.log2(gameSettings.range)
            );

        difficultyInfo.textContent =
            `1-${gameSettings.range} • AI solves in ≤ ${maxGuesses} guesses`;
    }

}

// ======================
// START GAME
// ======================

playBtn.addEventListener("click", () => {

   if (selectedMode === "guess") {

    startGuessGame();

} else {

    startChallengeGame();

}

});

// ======================
// GUESS THE NUMBER
// ======================

function startGuessGame() {

    secretNumber =
        Math.floor(
            Math.random() * gameSettings.range
        ) + 1;

    currentAttempts = 0;

    guessHistory.innerHTML = "";

    guessInput.value = "";

    attemptInfo.textContent =
        `Attempts: 0 / ${gameSettings.attempts}`;

    showScreen("guess");

}

// ======================
// SUBMIT GUESS
// ======================

guessBtn.addEventListener("click", submitGuess);

guessInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {
        submitGuess();
    }

});
// ======================
// NUMPAD (GUESS INPUT)
// ======================

const numpad = document.getElementById("numpad");
const numClear = document.getElementById("numClear");
const numBackspace = document.getElementById("numBackspace");

numpad.querySelectorAll(".num-btn[data-num]").forEach(btn => {

    btn.addEventListener("click", () => {

        const maxLength = String(gameSettings.range).length;

        if (guessInput.value.length >= maxLength) {
            return;
        }

        guessInput.value += btn.dataset.num;

    });

});

numBackspace.addEventListener("click", () => {

    guessInput.value = guessInput.value.slice(0, -1);

});

numClear.addEventListener("click", () => {

    guessInput.value = "";

});

function submitGuess() {

    let guess = Number(guessInput.value);

    if (
        !guess ||
        guess < 1 ||
        guess > gameSettings.range
    ) {

        alert(
            `Enter a number between 1 and ${gameSettings.range}`
        );

        return;
    }

    currentAttempts++;

    attemptInfo.textContent =
        `Attempts: ${currentAttempts} / ${gameSettings.attempts}`;

    // Correct
    if (guess === secretNumber) {

        showResult(
            "Correct!",
            `Number: ${secretNumber}<br><br>Attempts Used: ${currentAttempts}`
        );

        return;
    }

   let feedback =
    guess < secretNumber
        ? "Higher"
        : "Lower";

addGuessHistory(
    `<strong>YOU</strong><br>Is your number ${guess}?<br><br><strong>AI</strong><br>${feedback}`
);

    guessInput.value = "";

    // Lose
    if (
        currentAttempts >= gameSettings.attempts
    ) {

        showResult(
            "Out of Attempts",
            `The number was ${secretNumber}`
        );

    }

}

// ======================
// HISTORY
// ======================

function addGuessHistory(text) {

    const item =
        document.createElement("div");

    item.className = "history-item";

    item.innerHTML = text;

    guessHistory.prepend(item);

while(guessHistory.children.length > 6){
    guessHistory.removeChild(
        guessHistory.lastChild
    );
}

}

// ======================
// RESULT
// ======================

function showResult(title, text) {

    resultTitle.textContent = title;

    resultText.innerHTML = text;

    showScreen("result");

    /* VatsalLolGameComplete call removed */

}

// ======================
// PLAY AGAIN
// ======================

playAgainBtn.addEventListener("click", () => {

    if (selectedMode === "guess") {

        startGuessGame();

    } else {

        startChallengeGame();

    }

});

// ======================
// HOME
// ======================

homeButtons.forEach(btn => {

    btn.addEventListener("click", () => {

        showScreen("start");

    });

});

resultHomeBtn.addEventListener("click", () => {

    showScreen("start");

});

// ======================
// INITIALIZE
// ======================

updateDifficultyInfo();
// ======================
// AI MODE ELEMENTS
// ======================

const rangeInfo =
    document.getElementById("rangeInfo");

const chatHistory =
    document.getElementById("chatHistory");

const currentGuessText =
    document.getElementById("currentGuess");

const lowerBtn =
    document.getElementById("lowerBtn");

const higherBtn =
    document.getElementById("higherBtn");

const correctBtn =
    document.getElementById("correctBtn");
// ======================
// AI MODE DATA
// ======================

let aiMin = 1;
let aiMax = 100;

let aiGuess = 50;
let aiGuessCount = 0;


// ======================
// START AI GAME
// ======================

function startChallengeGame() {

    aiMin = 1;
    aiMax = gameSettings.range;

    aiGuessCount = 0;

    chatHistory.innerHTML = "";

    makeAIGuess();

    showScreen("challenge");

}


// ======================
// AI GUESS
// ======================

function makeAIGuess() {

    aiGuess = Math.floor(
        (aiMin + aiMax) / 2
    );

    aiGuessCount++;

    rangeInfo.textContent =
        `Range: ${aiMin} - ${aiMax}`;

    currentGuessText.textContent =
        `Is your number ${aiGuess}?`;

}
// ======================
// CHAT
// ======================

function addChat(text) {

    const div =
        document.createElement("div");

    div.className = "chat-message";

    div.innerHTML = text;

    chatHistory.appendChild(div);

while(chatHistory.children.length > 6){
    chatHistory.removeChild(chatHistory.firstChild);
}

    chatHistory.scrollTop =
        chatHistory.scrollHeight;

}

// ======================
// HIGHER
// ======================

higherBtn.addEventListener("click", () => {

   addChat(
    `<strong>AI</strong><br>Is your number ${aiGuess}?<br><br><strong>YOU</strong><br>Higher`
);
    aiMin = aiGuess + 1;

    validateRange();

});


// ======================
// LOWER
// ======================

lowerBtn.addEventListener("click", () => {

   addChat(
    `<strong>AI</strong><br>Is your number ${aiGuess}?<br><br><strong>YOU</strong><br>Lower`
);

    aiMax = aiGuess - 1;

    validateRange();

});

// ======================
// CORRECT
// ======================

correctBtn.addEventListener("click", () => {

    addChat(
    `<strong>AI</strong><br>Is your number ${aiGuess}?<br><br><strong>YOU</strong><br>Correct`
);

    showResult(
        "Number Identified",
        `Guesses: ${aiGuessCount}`
    );

});
// ======================
// VALIDATE
// ======================

function validateRange() {

    if (aiMin > aiMax) {

        showResult(
            "Responses Conflict",
            "Your answers became impossible. Please start a new game."
        );

        return;
    }

    makeAIGuess();

}











