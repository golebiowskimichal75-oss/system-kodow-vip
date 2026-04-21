let ADMIN_PASSWORD = localStorage.getItem('adminPassword') || "admin123";
// TWÓJ NOWY WEBHOOK
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1495875218294575195/WR7mxjeDF-kmVIye6puISi5nNybKNg9LX_bBcMPp_uJ1Z3OTh33HP7cx_DPlNIjUduF3";

function showMsg(elementId, text, isError = true) {
    const el = document.getElementById(elementId);
    if(!el) return;
    el.innerText = text;
    el.style.color = isError ? "#ff4d4d" : "#28a745";
    if(isError) {
        const parentCard = el.closest('.card');
        parentCard.classList.add('shake');
        setTimeout(() => parentCard.classList.remove('shake'), 500);
    }
    setTimeout(() => { el.innerText = ""; }, 3000);
}

function generateCode() {
    let newCode = "";
    for(let i=0; i<16; i++) newCode += Math.floor(Math.random()*10);
    let rank = document.getElementById('codeRank').value;
    let codes = JSON.parse(localStorage.getItem('activeCodesRanked')) || [];
    codes.push({ key: newCode, type: rank });
    localStorage.setItem('activeCodesRanked', JSON.stringify(codes));
    
    document.getElementById('codeDisplay').innerText = newCode;
    
    // Automatyczne kopiowanie do schowka
    navigator.clipboard.writeText(newCode).then(() => {
        showMsg("loginError", "✅ Skopiowano do schowka!", false);
    }).catch(() => {
        showMsg("loginError", "⚠️ Wygenerowano (brak uprawnień)");
    });
    
    updateUI();
}

function clearHistory() {
    if(confirm("Czy na pewno chcesz usunąć WSZYSTKIE aktywne kody?")) {
        localStorage.removeItem('activeCodesRanked');
        updateUI();
        document.getElementById('codeDisplay').innerText = "WYCZYSZCZONO";
        showMsg("loginError", "✅ Usunięto bazę kodów", false);
    }
}

function updateUI() {
    let codes = JSON.parse(localStorage.getItem('activeCodesRanked')) || [];
    const counter = document.getElementById('codeCounter');
    if(counter) counter.innerText = codes.length;
    
    let history = "";
    codes.slice(-3).reverse().forEach(c => history += `<small>${c.key} [${c.type}]</small><br>`);
    const historyList = document.getElementById('historyList');
    if(historyList) historyList.innerHTML = history || "Brak aktywnych kodów";
}

function redeemCode() {
    let nick = document.getElementById('discordNick').value;
    let input = document.getElementById('userCode').value;
    let codes = JSON.parse(localStorage.getItem('activeCodesRanked')) || [];
    let idx = codes.findIndex(c => c.key === input);

    if (!nick) {
        showMsg("statusMsg", "⚠️ Wpisz swój Nick!");
        return;
    }

    if (idx !== -1) {
        let activated = codes[idx];
        const now = new Date();
        const timeStr = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0');

        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content: `🚀 **AKTYWACJA!**\n**Użytkownik:** ${nick}\n**Ranga:** ${activated.type}\n**Godzina:** ${timeStr}` 
            })
        });

        codes.splice(idx, 1);
        localStorage.setItem('activeCodesRanked', JSON.stringify(codes));
        
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        
        document.getElementById('test-section').style.display = "none";
        document.getElementById('premium-content').style.display = "block";
        document.getElementById('rankInfo').innerText = "Ranga: " + activated.type;
    } else {
        showMsg("statusMsg", "❌ Błędny lub zużyty kod!");
    }
}

function checkLogin() {
    let passInput = document.getElementById('adminPass');
    if (passInput.value === ADMIN_PASSWORD) {
        document.getElementById('login-section').style.display = "none";
        document.getElementById('admin-section').style.display = "block";
        updateUI();
    } else {
        showMsg("loginError", "❌ Błędne hasło!");
    }
}

function changeAdminPassword() {
    let p = document.getElementById('newPassInput').value;
    if(p.length > 3) { 
        ADMIN_PASSWORD = p; 
        localStorage.setItem('adminPassword', p); 
        alert("Hasło zmienione!");
        logout(); 
    }
}

function logout() { 
    document.getElementById('admin-section').style.display = "none";
    document.getElementById('login-section').style.display = "block";
    document.getElementById('adminPass').value = "";
}

updateUI();
