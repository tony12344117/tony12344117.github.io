// 🥒 script.js — 오이 토스트 거래소 전체 스크립트

let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = localStorage.getItem('currentUser');
let history = JSON.parse(localStorage.getItem('history')) || [];
let bans = JSON.parse(localStorage.getItem('bans')) || [];

const masterId = "정후교";
const masterPw = "302118";

if (currentUser && users[currentUser]) showApp();

function save() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('history', JSON.stringify(history));
  localStorage.setItem('bans', JSON.stringify(bans));
}

function toggleAuth() {
  document.getElementById("register").style.display =
    document.getElementById("register").style.display === "none" ? "block" : "none";
  document.getElementById("login").style.display =
    document.getElementById("login").style.display === "none" ? "block" : "none";
}

function register() {
  const u = regUsername.value.trim();
  const p = regPassword.value;
  if (!u || !p || u.length < 2) return alert("실명을 정확히 입력하세요!");
  if (users[u]) return alert("이미 존재하는 계정입니다");
  users[u] = { password: p, balance: 0, banned: false };
  save();
  alert("가입 완료! 로그인해주세요.");
  toggleAuth();
}

function login() {
  const u = loginUsername.value.trim();
  const p = loginPassword.value;
  if (!users[u]) return alert("존재하지 않는 계정입니다");
  if (users[u].banned) return alert("정지된 계정입니다");
  if (users[u].password !== p) return alert("비밀번호가 틀립니다");
  currentUser = u;
  localStorage.setItem("currentUser", u);
  showApp();
}

function logout() {
  localStorage.removeItem("currentUser");
  location.reload();
}

function showApp() {
  loginContainer.style.display = "none";
  app.style.display = "block";
  if (currentUser === masterId) adminTools.style.display = "block";
  showBalance();
}

document.getElementById("menu-toggle").onclick = () => {
  sidebar.classList.toggle("hidden");
};

function showBalance() {
  main.innerHTML = `<h2>🥒 ${currentUser}님의 현재 오이 잔액은 ${users[currentUser].balance} 🥒입니다!</h2>`;
}

function showTransfer() {
  let userOptions = Object.keys(users)
    .filter(u => u !== currentUser && !users[u].banned)
    .map(u => `<option value="${u}">${u}</option>`).join("");

  main.innerHTML = `
    <h2>💸 송금하기</h2>
    <select id="toUser">${userOptions}</select>
    <input type="number" id="amount" placeholder="금액" min="1">
    <input type="text" id="msg" placeholder="메시지 (80자 제한)" maxlength="80">
    <button onclick="sendMoney()">보내기</button>
  `;
}

function sendMoney() {
  const to = document.getElementById("toUser").value;
  const amt = parseInt(document.getElementById("amount").value);
  const msg = document.getElementById("msg").value.trim();
  if (!to || !amt || amt <= 0) return alert("올바른 정보를 입력하세요");
  if (users[currentUser].balance < amt) return alert("오이가 부족합니다!");
  users[currentUser].balance -= amt;
  users[to].balance += amt;
  history.push({ from: currentUser, to, amt, msg, time: new Date().toLocaleString() });
  save();
  alert("송금 완료!");
  showBalance();
}

function showDeposit() {
  main.innerHTML = `<h2>💰 입금</h2><p>학교에서 사업 시간에 <b>${masterId}</b>에게 직접 찾아와 말하세요 🏫</p>`;
}

function showWithdraw() {
  main.innerHTML = `<h2>🏦 출금</h2><p>학교에 와서 <b>${masterId}</b>에게 직접 말하세요 🏫</p>`;
}

function showAdjust() {
  let options = Object.keys(users).map(u => `<option value="${u}">${u}</option>`).join("");
  main.innerHTML = `
    <h2>🛠️ 잔액 조정</h2>
    <select id="targetUser">${options}</select>
    <input type="number" id="adjustAmt" placeholder="증가(+) 또는 감소(-) 금액">
    <button onclick="adjustBalance()">적용</button>
  `;
}

function adjustBalance() {
  const u = document.getElementById("targetUser").value;
  const a = parseInt(document.getElementById("adjustAmt").value);
  if (!u || isNaN(a)) return alert("올바른 정보를 입력하세요");
  users[u].balance += a;
  save();
  alert("적용되었습니다");
  showBalance();
}

function showHistory() {
  main.innerHTML = `<h2>📜 거래 내역</h2>`;
  history.slice().reverse().forEach(h => {
    main.innerHTML += `<p>${h.time} — ${h.from} → ${h.to}: ${h.amt} 🥒 <br>💬 ${h.msg}</p><hr>`;
  });
}

function showBan() {
  let options = Object.keys(users)
    .filter(u => u !== masterId)
    .map(u => `<option value="${u}">${u} (${users[u].banned ? '정지됨' : '정상'})</option>`).join('');

  main.innerHTML = `
    <h2>🔒 계정 정지/해제</h2>
    <select id="banUser">${options}</select>
    <button onclick="toggleBan()">변경</button>
  `;
}

function toggleBan() {
  const u = document.getElementById("banUser").value;
  users[u].banned = !users[u].banned;
  save();
  alert(`계정 상태가 변경되었습니다: ${users[u].banned ? '정지됨' : '정상'}`);
  showBan();
}

function showLeaderboard() {
  const ranked = Object.entries(users)
    .filter(([u, d]) => !d.banned)
    .sort((a, b) => b[1].balance - a[1].balance);

  main.innerHTML = `<h2>🏆 유저 순위표</h2>`;
  ranked.forEach(([u, d], i) => {
    main.innerHTML += `<p>${i + 1}위: ${u} — ${d.balance} 🥒</p>`;
  });
}

