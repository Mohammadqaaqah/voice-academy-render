
const words = ["استراتيجية", "التكنولوجيا", "الاستثمار", "الابتكار", "الشراكة"];
let wordIndex = 0;

function startTraining() {
    const name = document.getElementById("userName").value.trim();
    const level = document.getElementById("userLevel").value;
    if (!name || name.length < 3) {
        alert("يرجى إدخال اسمك بشكل صحيح");
        return;
    }
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    document.getElementById("userDisplayName").textContent = name;
}

function startBreathing() {
    hideAll();
    document.getElementById("breathingBox").style.display = "block";
}

function breathe() {
    const circle = document.getElementById("circleBox");
    const text = document.getElementById("breatheText");
    circle.style.animation = "breathe 6s infinite";
    text.textContent = "تنفس بعمق...";

    setTimeout(() => {
        circle.style.animation = "none";
        text.textContent = "انتهى التمرين.";
    }, 18000);
}

function startPronunciation() {
    hideAll();
    document.getElementById("pronunciationBox").style.display = "block";
    wordIndex = 0;
    document.getElementById("currentWord").textContent = words[wordIndex];
}

function nextWord() {
    wordIndex++;
    if (wordIndex < words.length) {
        document.getElementById("currentWord").textContent = words[wordIndex];
    } else {
        document.getElementById("currentWord").textContent = "أحسنت! انتهت الكلمات.";
    }
}

function showScenarios() {
    hideAll();
    document.getElementById("scenarioBox").style.display = "block";
}

function hideAll() {
    document.getElementById("breathingBox").style.display = "none";
    document.getElementById("pronunciationBox").style.display = "none";
    document.getElementById("scenarioBox").style.display = "none";
}
