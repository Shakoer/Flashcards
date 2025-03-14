let flashcards = {};
let currentDeck = [];
let currentIndex = 0;
let showAnswer = false;
let progress = JSON.parse(localStorage.getItem("flashcardProgress")) || {};

const deckColors = {
    "Physical Science": { bg: "#a44ab2", text: "#ffffff" },  
    "Life Science": { bg: "#99ff99", text: "#000000" },
    "Accounting": { bg: "#ff9999", text: "#000000" },
    "Arabic": { bg: "#005430", text: "#ffffff" },  
    "French": { bg: "royalblue", text: "#ffffff" } 
};

fetch("flashcards.json")
    .then(response => response.json())
    .then(data => {
        flashcards = data;
        populateDeckSelector();
    });

function populateDeckSelector() {
    const selector = document.getElementById("deckSelector");
    selector.innerHTML = Object.keys(flashcards)
        .map(deck => `<option value="${deck}">${deck}</option>`)
        .join("");
    selector.addEventListener("change", startDeck);
    startDeck();
}

function startDeck() {
    const selectedDeck = document.getElementById("deckSelector").value;
    currentDeck = flashcards[selectedDeck].filter(card => !progress[card.Q]); 
    shuffleDeck();
    nextCard();

    const flashcard = document.getElementById("flashcard");
    const deckStyle = deckColors[selectedDeck] || { bg: "#ffffff", text: "#000000" }; 

    flashcard.style.backgroundColor = deckStyle.bg;
    flashcard.style.color = deckStyle.text; 

    updateProgressUI();
}

function shuffleDeck() {
    currentDeck.sort(() => Math.random() - 0.5);
}

function nextCard() {
    if (currentDeck.length === 0) {
        document.getElementById("flashcard").innerText = "You've learned all cards in this deck!";
        document.getElementById("markLearned").style.display = "none";
        return;
    }
    currentIndex = Math.floor(Math.random() * currentDeck.length);
    showAnswer = false;
    updateCard();
}

function updateCard() {
    const flashcard = document.getElementById("flashcard");
    const question = currentDeck[currentIndex].Q;

    flashcard.classList.remove("hidden");
    flashcard.innerText = showAnswer 
        ? currentDeck[currentIndex].A 
        : (progress[question] ? "✅ " : "") + currentDeck[currentIndex].Q;
}

document.getElementById("flashcard").addEventListener("click", () => {
    const flashcard = document.getElementById("flashcard");

    flashcard.classList.add("grow");
    setTimeout(() => {
        flashcard.classList.remove("grow");

        if (!showAnswer) {
            showAnswer = true;
        } else {
            nextCard();
        }

        updateCard();
    }, 200);
});

document.getElementById("markLearned").addEventListener("click", () => {
    if (!currentDeck.length) return;

    const question = currentDeck[currentIndex].Q;
    progress[question] = true; 
    localStorage.setItem("flashcardProgress", JSON.stringify(progress));

    currentDeck.splice(currentIndex, 1); 
    nextCard();
    updateProgressUI();
});

function updateProgressUI() {
    const selectedDeck = document.getElementById("deckSelector").value;
    const totalCards = flashcards[selectedDeck].length;
    const learnedCards = Object.keys(progress).length;
    const percentage = ((learnedCards / totalCards) * 100).toFixed(1);

    document.getElementById("progress").innerText = `Progress: ${percentage}% (${learnedCards}/${totalCards} cards)`;
}

document.getElementById("resetProgress").addEventListener("click", () => {
    if (confirm("Are you sure you want to reset your progress?")) {
        progress = {};
        localStorage.removeItem("flashcardProgress");
        startDeck();
    }
});