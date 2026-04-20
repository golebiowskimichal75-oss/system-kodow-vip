let ADMIN_PASSWORD = localStorage.getItem('adminPassword') || "admin123";
const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1495873957574873133/-r54lqxF_YnWd_VVKbkoPW-RLZfcpKysJl6JusjBQTjQgBEsk1AZUlEVZNTJ3_hSD0Sl";

// Funkcja do pokazywania ładnych komunikatów zamiast alertów
function showMsg(elementId, text, isError = true) {
    const el = document.getElementById(elementId);
    el.innerText = text;
    el.style.color = isError ? "#ff4d4d" : "#28a745";
    
    // Animacja potrząsania jeśli jest błąd
    if(isError) {
        const parent = el.parentElement;
        parent.classList.add('shake');
        setTimeout(() => parent.classList.remove('shake'), 500);
    }

    // Znikanie napisu po 3 sekundach
    setTimeout(() => { el.innerText = ""; }, 3000);
}

function checkLogin() {
    let passInput = document.getElementById('adminPass');
    if (passInput.value === ADMIN_PASSWORD) {
        document.getElementById('login-section').style.display = "none";
        document.getElementById('admin-section').style.display = "block";
        updateUI();
    } else {
        showMsg("loginError", "❌ Błędne hasło panelu!");
    }
}

function generateCode() {
    let newCode = "";
    for(let i=0; i<16; i++) newCode += Math.floor(Math.random()*10);
    let rank = document.getElementById('codeRank').value;
    let codes = JSON.parse(localStorage.getItem('activeCodesRanked')) || [];
    codes.push({ key: newCode, type: rank });
    localStorage.setItem('activeCodesRanked', JSON.stringify(codes));
    document.getElementById('codeDisplay').innerText = newCode;
    updateUI();
}

function updateUI() {
    let codes = JSON.parse(localStorage.getItem('activeCodesRanked')) || [];
    document.getElementById('codeCounter').innerText = codes.length;
    let history = "";
    codes.slice(-3).reverse().forEach(c => history += `<small>${c.key} [${c.type}]</small><br>`);
    document.getElementById('historyList').innerHTML = history;
}

function redeemCode() {
    let nick = document.getElementById('discordNick').value;
    let input = document.getElementById('userCode').value;
    let codes = JSON.parse(localStorage.getItem('activeCodesRanked')) || [];
    let idx = codes.findIndex(c => c.key === input);

    if (!nick) {
        showMsg("statusMsg", "⚠️ Wpisz najpierw swój Nick!");
        return;
    }

    if (idx !== -1) {
        let activated = codes[idx];
        fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: `🚀 **AKTYWACJA!**\n**Użytkownik:** ${nick}\n**Ranga:** ${activated.type}` })
        });
        codes.splice(idx, 1);
        localStorage.setItem('activeCodesRanked', JSON.stringify(codes));
        
        // EFEKT SUKCESU (Konfetti)
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        
        document.getElementById('test-section').style.display = "none";
        document.getElementById('premium-content').style.display = "block";
        document.getElementById('rankInfo').innerText = "Ranga: " + activated.type;
    } else {
        showMsg("statusMsg", "❌ Błędny lub zużyty kod!");
    }
}

function logout() { 
    document.getElementById('admin-section').style.display = "none";
    document.getElementById('login-section').style.display = "block";
    document.getElementById('adminPass').value = "";
}

function changeAdminPassword() {
    let p = document.getElementById('newPassInput').value;
    if(p.length > 3) { 
        ADMIN_PASSWORD = p; 
        localStorage.setItem('adminPassword', p); 
        alert("Hasło zmienione!"); // Tu zostawiłem alert, bo to rzadka akcja
        logout(); 
    } else {
        alert("Za krótkie hasło!");
    }
}

// Odśwież UI na starcie
updateUI();
