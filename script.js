const masterId = "정후교";
const masterPw = "302118";
let currentUser = null;

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}

function showSignup() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("signup-screen").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("signup-screen").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
}

function signup() {
  const id = document.getElementById("signup-id").value;
  const pw = document.getElementById("signup-pw").value;
  const users = getUsers();

  if (users[id]) {
    alert("이미 존재하는 아이디입니다.");
    return;
  }

  users[id] = { pw, balance: 100 }; // 초기 오이
  saveUsers(users);
  alert("가입 성공! 초기 100오이 지급!");
  showLogin();
}

function login() {
  const id = document.getElementById("login-id").value;
  const pw = document.getElementById("login-pw").value;
  const users = getUsers();

  if ((id === masterId && pw === masterPw) || (users[id] && users[id].pw === pw)) {
    currentUser = id;
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("signup-screen").classList.add("hidden");
    document.getElementById("home-screen").classList.remove("hidden");
    document.getElementById("welcome-text").innerText = `환영합니다, ${id}님!`;
    showTab("balance");
  } else {
    alert("로그인 실패");
  }
}

function logout() {
  currentUser = null;
  location.reload();
}

function toggleSidebar() {
  document.getElementById("menu").classList.toggle("hidden");
}

function showTab(tab) {
  const users = getUsers();
  let html = "";

  if (tab === "balance") {
    html = `<h2>💰 현재 오이 잔액</h2><p>${users[currentUser]?.balance || 0} 오이</p>`;
  }

  if (tab === "transfer") {
    html = `<h2>💸 송금</h2>
      <select id="recipient">` +
      Object.keys(users).filter(u => u !== currentUser).map(u => `<option value="${u}">${u}</option>`).join("") +
      `</select>
      <input type="number" id="amount" placeholder="금액" />
      <button onclick="sendMoney()">보내기</button>`;
  }

  if (tab === "members") {
    html = `<h2>👥 가입자 목록</h2><ul>`;
    for (let id in users) {
      html += `<li>${id}`;
      if (currentUser === masterId) {
        html += ` - ${users[id].balance} 오이`;
      }
      html += `</li>`;
    }
    html += `</ul>`;

    if (currentUser === masterId) {
      html += `
        <h3>💼 오이 조작</h3>
        <input id="edit-id" placeholder="대상 아이디" />
        <input id="edit-amount" placeholder="변경할 금액(+, - 가능)" />
        <button onclick="editBalance()">수정</button>
        <h3>❌ 계정 삭제</h3>
        <input id="del-id" placeholder="삭제할 아이디" />
        <button onclick="deleteUser()">삭제</button>
      `;
    }
  }

  if (tab === "ranking") {
    const ranking = Object.entries(users).sort((a, b) => b[1].balance - a[1].balance);
    html = `<h2>🥇 오이 부자 순위</h2><ol>`;
    ranking.forEach(([id, data]) => {
      html += `<li>${id} - ${data.balance} 오이</li>`;
    });
    html += `</ol>`;
  }

  document.getElementById("tab-content").innerHTML = html;
}

function sendMoney() {
  const to = document.getElementById("recipient").value;
  const amount = parseInt(document.getElementById("amount").value);
  const users = getUsers();

  if (amount <= 0 || isNaN(amount)) {
    alert("올바른 금액을 입력해주세요.");
    return;
  }

  if (users[currentUser].balance < amount) {
    alert("잔액이 부족합니다.");
    return;
  }

  users[currentUser].balance -= amount;
  users[to].balance += amount;
  saveUsers(users);
  alert(`${to}님에게 ${amount} 오이를 보냈습니다.`);
  showTab("balance");
}

function deleteUser() {
  const id = document.getElementById("del-id").value;
  const users = getUsers();

  if (id === masterId) {
    alert("마스터 계정은 삭제할 수 없습니다.");
    return;
  }

  if (users[id]) {
    delete users[id];
    saveUsers(users);
    alert(`${id} 계정을 삭제했습니다.`);
    showTab("members");
  } else {
    alert("존재하지 않는 아이디입니다.");
  }
}

function editBalance() {
  const id = document.getElementById("edit-id").value;
  const change = parseInt(document.getElementById("edit-amount").value);
  const users = getUsers();

  if (!users[id]) {
    alert("존재하지 않는 아이디입니다.");
    return;
  }

  if (isNaN(change)) {
    alert("숫자를 입력해주세요.");
    return;
  }

  users[id].balance += change;
  if (users[id].balance < 0) users[id].balance = 0;

  saveUsers(users);
  alert(`${id}님의 오이를 ${change >= 0 ? "추가" : "차감"}했습니다.`);
  showTab("members");
}
