// App state
let currentIndex = 0;
let currentMode = "learn";
let learnedWords = new Set();
let testAnswers = [];
let vocabData = null;

// Elements
const flashcard = document.getElementById('flashcard');
const wordDisplay = document.getElementById('word-display');
const translationDisplay = document.getElementById('translation-display');
const sentenceDisplay = document.getElementById('sentence-display');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const currentCount = document.getElementById('current-count');
const learnedCount = document.getElementById('learned-count');
const shuffleBtn = document.getElementById('shuffle-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const successAnimation = document.getElementById('success-animation');
const testControls = document.getElementById('test-controls');
const testInput = document.getElementById('test-input');
const submitBtn = document.getElementById('submit-btn');

// Fetch vocab data and initialize
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        vocabData = data;
        init();
    })
    .catch(error => console.error('Error loading vocab data:', error));

// Initialize the app
function init() {
    updateCard();
    updateProgress();
    
    // Event listeners
    flashcard.addEventListener('click', () => {
        if (currentMode === "learn") {
            flashcard.classList.toggle('flipped');
            if (flashcard.classList.contains('flipped')) {
                learnedWords.add(currentIndex);
                updateLearnedCount();
            }
        }
    });
    
    prevBtn.addEventListener('click', () => {
        navigate(-1);
    });
    
    nextBtn.addEventListener('click', () => {
        navigate(1);
    });
    
    shuffleBtn.addEventListener('click', shuffleCards);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            updateCard();
            toggleTestMode();
        });
    });

    submitBtn.addEventListener('click', checkAnswer);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            navigate(-1);
        } else if (e.key === 'ArrowRight') {
            navigate(1);
        } else if (e.key === ' ' || e.key === 'Spacebar') {
            if (currentMode === "learn") {
                flashcard.classList.toggle('flipped');
            }
        } else if (e.key === 'Enter' && currentMode === "test") {
            checkAnswer();
        }
    });
}

// Update card content
function updateCard() {
    const word = vocabData.words[currentIndex];
    
    wordDisplay.textContent = word.word;
    translationDisplay.textContent = word.translation;
    sentenceDisplay.textContent = word.sentence;
    
    // Reset flip
    flashcard.classList.remove('flipped');
    
    // Update UI
    updateProgress();
    currentCount.textContent = `Card ${currentIndex + 1} of ${vocabData.words.length}`;
    
    // Clear test input
    if (testInput) testInput.value = "";
}

// Navigate between cards
function navigate(direction) {
    currentIndex = (currentIndex + direction + vocabData.words.length) % vocabData.words.length;
    updateCard();
}

// Update progress bar
function updateProgress() {
    const progress = ((currentIndex + 1) / vocabData.words.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Update learned count
function updateLearnedCount() {
    learnedCount.textContent = `${learnedWords.size} learned`;
}

// Shuffle cards
function shuffleCards() {
    const words = vocabData.words;
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }
    
    currentIndex = 0;
    updateCard();
    showEffect("Shuffled!");
}

// Show animation effect
function showEffect(message) {
    successAnimation.classList.add('show');
    successAnimation.querySelector('.animation-text').textContent = message;
    
    setTimeout(() => {
        successAnimation.classList.remove('show');
    }, 800);
}

// Toggle test mode UI
function toggleTestMode() {
    if (currentMode === "test") {
        testControls.style.display = "flex";
        flashcard.style.pointerEvents = "none"; // Disable flipping in test mode
    } else {
        testControls.style.display = "none";
        flashcard.style.pointerEvents = "auto";
    }
}

// Check user's answer in test mode
function checkAnswer() {
    if (currentMode !== "test") return;
    
    const userAnswer = testInput.value.trim();
    const correctAnswer = vocabData.words[currentIndex].translation;
    
    if (userAnswer === correctAnswer) {
        showEffect("Correct! ✓");
        learnedWords.add(currentIndex);
        updateLearnedCount();
        setTimeout(() => navigate(1), 800); // Move to next card after animation
    } else {
        showEffect("Wrong! ✗");
        flashcard.classList.add('flipped'); // Show correct answer
    }
}