// script.js

const masterId = "정후교";
const masterPw = "302118";
let currentUser = null;
let isMaster = false;

// LocalStorage 유틸
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// 화면 전환
function showSignup() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("signup-screen").classList.remove("hidden");
}
function showLogin() {
  document.getElementById("signup-screen").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
}

// 회원가입 (초기 오이 0으로 변경)
function signup() {
  const id = document.getElementById("signup-id").value.trim();
  const pw = document.getElementById("signup-pw").value;
  const users = getUsers();

  if (!id || !pw) {
    alert("아이디와 비밀번호를 모두 입력하세요.");
    return;
  }
  if (users[id] || id === masterId) {
    alert("이미 존재하는 아이디입니다.");
    return;
  }

  // 초기 balance를 0으로 설정
  users[id] = { pw, balance: 0 };
  saveUsers(users);
  alert("가입 성공! 초기 오이는 0으로 설정됩니다.");
  showLogin();
}

// 로그인
function login() {
  const id = document.getElementById("login-id").value.trim();
  const pw = document.getElementById("login-pw").value;
  const users = getUsers();

  if (id === masterId && pw === masterPw) {
    isMaster = true;
    currentUser = id;
  } else if (users[id] && users[id].pw === pw) {
    isMaster = false;
    currentUser = id;
  } else {
    alert("로그인 실패: 아이디 또는 비밀번호 확인");
    return;
  }

  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("signup-screen").classList.add("hidden");
  document.getElementById("home-screen").classList.remove("hidden");
  document.getElementById("welcome-text").innerText = `환영합니다, ${currentUser}님!`;
  showTab("balance");
}

// 로그아웃
function logout() {
  currentUser = null;
  isMaster = false;
  location.reload();
}

// 사이드바 토글
function toggleSidebar() {
  document.getElementById("menu").classList.toggle("hidden");
}

// 탭 전환 & 컨텐츠 렌더링
function showTab(tab) {
  const users = getUsers();
  let html = "";

  if (tab === "balance") {
    const bal = users[currentUser]?.balance || 0;
    html = `<h2>💰 내 잔액</h2>
            <p>${bal.toLocaleString()} 오이</p>`;
  }

  if (tab === "transfer") {
    html = `<h2>💸 송금</h2>
      <select id="recipient">${Object.keys(users)
        .filter(u => u !== currentUser)
        .map(u => `<option value="${u}">${u}</option>`).join("")}
      </select>
      <input type="number" id="amount" placeholder="금액" />
      <button onclick="sendMoney()">보내기</button>`;
  }

  if (tab === "members") {
    html = `<h2>👥 회원 목록</h2><ul>${Object.entries(users)
      .map(([u, d]) => `<li>${u}${isMaster ? ` - ${d.balance.toLocaleString()} 오이` : ""}</li>`)
      .join("")}</ul>`;

    if (isMaster) {
      html += `
        <h3>잔액 조작</h3>
        <input id="edit-id" placeholder="대상 아이디" />
        <input id="edit-amount" type="number" placeholder="+/- 오이" />
        <button onclick="editBalance()">수정</button>

        <h3>계정 삭제</h3>
        <input id="del-id" placeholder="삭제할 아이디" />
        <button onclick="deleteUser()">삭제</button>`;
    }
  }

  if (tab === "ranking") {
    const ranking = Object.entries(users)
      .sort((a, b) => b[1].balance - a[1].balance);
    html = `<h2>🏆 오이 부자 순위</h2><ol>${ranking
      .map(([u, d]) => `<li>${u} - ${d.balance.toLocaleString()} 오이</li>`)
      .join("")}</ol>`;
  }

  document.getElementById("tab-content").innerHTML = html;
}

// 송금 처리
function sendMoney() {
  const to = document.getElementById("recipient").value;
  const amt = parseInt(document.getElementById("amount").value, 10);
  const users = getUsers();

  if (!users[to] || isNaN(amt) || amt <= 0) {
    alert("유효한 수신자와 금액을 입력하세요.");
    return;
  }
  if (users[currentUser].balance < amt) {
    alert("잔액이 부족합니다.");
    return;
  }

  users[currentUser].balance -= amt;
  users[to].balance += amt;
  saveUsers(users);
  alert(`${to}님에게 ${amt.toLocaleString()} 오이를 보냈습니다.`);
  showTab("balance");
}

// 회원 삭제
function deleteUser() {
  const id = document.getElementById("del-id").value.trim();
  const users = getUsers();

  if (!id || !users[id] || id === masterId) {
    alert("삭제할 수 없는 아이디입니다.");
    return;
  }

  delete users[id];
  saveUsers(users);
  alert(`${id} 계정이 삭제되었습니다.`);
  showTab("members");
}

// 잔액 조작
function editBalance() {
  const id = document.getElementById("edit-id").value.trim();
  const delta = parseInt(document.getElementById("edit-amount").value, 10);
  const users = getUsers();

  if (!users[id] || isNaN(delta)) {
    alert("유효한 아이디와 금액을 입력하세요.");
    return;
  }

  users[id].balance = Math.max(0, (users[id].balance || 0) + delta);
  saveUsers(users);
  alert(`${id}님의 잔액이 ${delta >= 0 ? "+" : ""}${delta.toLocaleString()} 오이로 수정되었습니다.`);
  showTab("members");
}

// 초기 마스터 삽입
(function initMaster() {
  const users = getUsers();
  if (!users[masterId]) {
    users[masterId] = { pw: masterPw, balance: 0 };
    saveUsers(users);
  }
})();
