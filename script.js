
const words = ["ابتكار", "إبداع", "مستقبل", "قيادة", "تواصل"];
let wordIndex = 0;

function startTraining() {
    const name = document.getElementById("userName").value.trim();
    const level = document.getElementById("userLevel").value;
    if (name.length < 2) {
        alert("الرجاء إدخال اسمك الكامل");
        return;
    }
    localStorage.setItem("userName", name);
    document.getElementById("userDisplayName").textContent = name;
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    document.getElementById("menuBox").style.display = "block";
}

function showSection(id) {
    playSound("click");
    document.querySelectorAll("#mainContent .box").forEach(box => {
        box.style.display = "none";
    });
    document.getElementById(id).style.display = "block";
}

function backToMenu() {
    playSound("click");
    showSection("menuBox");
}

function breathe() {
    const circle = document.getElementById("circleBox");
    const text = document.getElementById("breatheText");
    circle.style.animation = "breathe 6s infinite";
    text.textContent = "تنفس ببطء...";
    setTimeout(() => {
        circle.style.animation = "none";
        text.textContent = "انتهى التمرين.";
        playSound("success");
    }, 18000);
}

function nextWord() {
    if (wordIndex < words.length) {
        document.getElementById("currentWord").textContent = words[wordIndex++];
    } else {
        document.getElementById("currentWord").textContent = "👏 أحسنت! انتهت الكلمات.";
        playSound("success");
        wordIndex = 0;
    }
}

function evaluate() {
    const score = Math.floor(Math.random() * 100) + 1;
    let msg = "";
    if (score > 80) msg = "ممتاز! لديك مهارات قوية 👏";
    else if (score > 50) msg = "جيد! لكن تحتاج لتدريب أكثر";
    else msg = "ابدأ من جديد وثق بنفسك! 💪";
    document.getElementById("evalResults").innerHTML = `<p>نتيجتك: ${score} من 100</p><p>${msg}</p>`;
    playSound("success");
}

function playSound(id) {
    document.getElementById("audio" + id.charAt(0).toUpperCase() + id.slice(1)).play();
}

// استعادة الاسم إن وُجد
window.onload = function() {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
        document.getElementById("userName").value = savedName;
    }
}
