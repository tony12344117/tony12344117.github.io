let currentUser = null;
const MASTER_ID = "정후교";
const MASTER_PW = "302118";

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function register() {
  const id = document.getElementById("reg-username").value.trim();
  const pw = document.getElementById("reg-password").value;

  if (!id || !pw) return alert("모든 칸을 입력하세요");

  const users = getUsers();
  if (users[id]) return alert("이미 존재하는 아이디입니다");

  users[id] = { password: pw, balance: 0 };
  saveUsers(users);
  alert("계정이 생성되었습니다!");
}

function login() {
  const id = document.getElementById("login-username").value.trim();
  const pw = document.getElementById("login-password").value;

  const users = getUsers();
  if (!users[id] || users[id].password !== pw) return alert("아이디 또는 비밀번호가 틀렸습니다");

  currentUser = id;
  document.getElementById("auth-container").style.display = "none";
  document.getElementById("app").style.display = "block";
  showBalance();
}

function logout() {
  currentUser = null;
  document.getElementById("auth-container").style.display = "block";
  document.getElementById("app").style.display = "none";
}

function toggleSidebar() {
  const bar = document.getElementById("sidebar");
  bar.style.display = bar.style.display === "flex" ? "none" : "flex";
}

function showBalance() {
  const users = getUsers();
  const balance = users[currentUser].balance;
  document.getElementById("content").innerHTML = `<h2>${currentUser}님의 잔액: ${balance} 오이</h2>`;
}

function showTransfer() {
  const users = getUsers();
  let html = `<h3>송금</h3><select id="recipient">`;
  for (let user in users) {
    if (user !== currentUser) html += `<option value="${user}">${user}</option>`;
  }
  html += `</select><br><input type="number" id="amount" placeholder="금액"><br>
  <button onclick="transfer()">송금하기</button>`;
  document.getElementById("content").innerHTML = html;
}

function transfer() {
  const to = document.getElementById("recipient").value;
  const amount = parseInt(document.getElementById("amount").value);
  const users = getUsers();

  if (!amount || amount <= 0 || users[currentUser].balance < amount) {
    return alert("잘못된 금액 또는 잔액 부족");
  }

  users[currentUser].balance -= amount;
  users[to].balance += amount;
  saveUsers(users);
  alert(`${to}님에게 ${amount} 오이를 송금했습니다`);
  showBalance();
}

function showDeposit() {
  document.getElementById("content").innerHTML = "<p>학교에서 사업시간에 정후교한테 찾아와서 말하세요.</p>";
}

function showWithdraw() {
  document.getElementById("content").innerHTML = "<p>학교에 와서 정후교한테 말하세요.</p>";
}

function showMasterPanel() {
  if (currentUser !== MASTER_ID) return alert("접근 권한이 없습니다");

  const users = getUsers();
  let html = `<h3>마스터 기능</h3><select id="targetUser">`;
  for (let user in users) {
    if (user !== MASTER_ID) html += `<option value="${user}">${user}</option>`;
  }
  html += `</select><br>
    <input type="number" id="changeAmount" placeholder="금액"><br>
    <button onclick="addMoney()">+ 오이 추가</button>
    <button onclick="removeMoney()">- 오이 차감</button>
    <button onclick="viewBalance()">잔액 보기</button>`;
  document.getElementById("content").innerHTML = html;
}

function addMoney() {
  const users = getUsers();
  const target = document.getElementById("targetUser").value;
  const amount = parseInt(document.getElementById("changeAmount").value);
  if (!amount || amount <= 0) return alert("금액 오류");

  users[target].balance += amount;
  saveUsers(users);
  alert(`${target}에게 ${amount} 오이 추가 완료`);
}

function removeMoney() {
  const users = getUsers();
  const target = document.getElementById("targetUser").value;
  const amount = parseInt(document.getElementById("changeAmount").value);
  if (!amount || amount <= 0 || users[target].balance < amount) return alert("금액 오류");

  users[target].balance -= amount;
  saveUsers(users);
  alert(`${target}의 오이 ${amount} 차감 완료`);
}

function viewBalance() {
  const users = getUsers();
  const target = document.getElementById("targetUser").value;
  alert(`${target}의 현재 잔액: ${users[target].balance} 오이`);
}
