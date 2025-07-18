
function startTraining() {
    const name = document.getElementById("userName").value.trim();
    const level = document.getElementById("userLevel").value;
    if (!name || name.length < 3) {
        alert("يرجى إدخال اسمك بشكل صحيح (3 أحرف على الأقل)");
        return;
    }
    document.querySelector(".login-box").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
    document.getElementById("userDisplayName").textContent = name;
    console.log("بدأ التدريب للمستخدم:", name, "| المستوى:", level);
}
