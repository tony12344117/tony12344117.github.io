// 전체 앱 로직을 포함한 JavaScript (오이 토스트 앱)

const masterId = "정후교";
const masterPw = "302118";

const UI = {
  loginPage: document.getElementById("login-page"),
  registerPage: document.getElementById("register-page"),
  mainPage: document.getElementById("main-page"),
  welcomeText: document.getElementById("welcome-text"),
  sidebar: document.getElementById("sidebar"),
  toggleSidebarBtn: document.getElementById("toggle-sidebar"),
  userList: document.getElementById("user-list"),
  balanceDisplay: document.getElementById("balance"),
  messageDisplay: document.getElementById("message"),
  transferForm: document.getElementById("transfer-form"),
  logoutBtn: document.getElementById("logout-btn"),
  adminPanel: document.getElementById("admin-panel"),
  historyDisplay: document.getElementById("history"),
  leaderboardDisplay: document.getElementById("leaderboard")
};

let currentUser = null;

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function loadUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function saveHistory(history) {
  localStorage.setItem("history", JSON.stringify(history));
}

function loadHistory() {
  return JSON.parse(localStorage.getItem("history")) || [];
}

function showPage(page) {
  UI.loginPage.style.display = "none";
  UI.registerPage.style.display = "none";
  UI.mainPage.style.display = "none";
  page.style.display = "block";
}

function updateBalance() {
  const users = loadUsers();
  UI.balanceDisplay.innerText = `🥒 ${users[currentUser].balance} 오이`;
}

function updateUserList() {
  const users = loadUsers();
  UI.userList.innerHTML = Object.keys(users).map(
    user => `<option value="${user}">${user}</option>`
  ).join("");
}

function updateHistory() {
  const history = loadHistory();
  UI.historyDisplay.innerHTML = history.map(h =>
    `<li>${h}</li>`
  ).join("");
}

function updateLeaderboard() {
  const users = loadUsers();
  const sorted = Object.entries(users).sort((a,b)=>b[1].balance - a[1].balance);
  UI.leaderboardDisplay.innerHTML = sorted.map(([user, data], i) =>
    `<li>${i+1}. ${user} - 🥒 ${data.balance} 오이</li>`
  ).join("");
}

function showAdminPanel() {
  if (currentUser !== masterId) return;
  UI.adminPanel.style.display = "block";
  const users = loadUsers();
  UI.adminPanel.innerHTML = Object.keys(users).map(user => `
    <div>
      ${user} - 🥒 ${users[user].balance} 오이
      <button onclick="modifyUser('${user}', 'add')">+10</button>
      <button onclick="modifyUser('${user}', 'subtract')">-10</button>
      <button onclick="toggleBan('${user}')">
        ${users[user].banned ? '해제' : '정지'}
      </button>
    </div>
  `).join("");
}

function modifyUser(user, action) {
  const users = loadUsers();
  if (!users[user]) return;
  if (action === "add") users[user].balance += 10;
  else if (action === "subtract") users[user].balance = Math.max(0, users[user].balance - 10);
  saveUsers(users);
  updateBalance();
  showAdminPanel();
  updateLeaderboard();
}

function toggleBan(user) {
  const users = loadUsers();
  users[user].banned = !users[user].banned;
  saveUsers(users);
  showAdminPanel();
}

// 등록
document.getElementById("register-form").onsubmit = e => {
  e.preventDefault();
  const id = document.getElementById("register-id").value;
  const pw = document.getElementById("register-pw").value;
  if (!id || !pw) return;
  const users = loadUsers();
  if (users[id]) return alert("이미 존재하는 아이디입니다");
  users[id] = { password: pw, balance: 0, banned: false };
  saveUsers(users);
  alert("계정이 생성되었습니다");
  showPage(UI.loginPage);
};

// 로그인
document.getElementById("login-form").onsubmit = e => {
  e.preventDefault();
  const id = document.getElementById("login-id").value;
  const pw = document.getElementById("login-pw").value;
  const users = loadUsers();
  if (!users[id] || users[id].password !== pw) return alert("로그인 실패");
  if (users[id].banned) return alert("정지된 계정입니다");
  currentUser = id;
  showPage(UI.mainPage);
  UI.welcomeText.innerText = `🥒 환영합니다, ${id}님! 여기는 오이 토스트 입니다.`;
  updateBalance();
  updateUserList();
  updateLeaderboard();
  showAdminPanel();
  updateHistory();
};

// 사이드바 토글
UI.toggleSidebarBtn.onclick = () => {
  UI.sidebar.classList.toggle("open");
};

// 송금
UI.transferForm.onsubmit = e => {
  e.preventDefault();
  const target = document.getElementById("recipient").value;
  const amount = parseInt(document.getElementById("amount").value);
  const msg = document.getElementById("message-input").value.slice(0, 80);
  if (!target || !amount || amount <= 0 || !msg) return;
  const users = loadUsers();
  if (users[currentUser].balance < amount) return alert("잔액 부족");
  users[currentUser].balance -= amount;
  users[target].balance += amount;
  saveUsers(users);
  updateBalance();
  updateLeaderboard();
  const history = loadHistory();
  history.unshift(`${currentUser} → ${target}에게 🥒 ${amount} 오이 보냄: ${msg}`);
  saveHistory(history);
  updateHistory();
  alert("송금 완료");
};

// 로그아웃
UI.logoutBtn.onclick = () => {
  currentUser = null;
  showPage(UI.loginPage);
};

// 초기화
showPage(UI.registerPage);

