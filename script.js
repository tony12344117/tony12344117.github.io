const masterId = "정후교";
const masterPw = "302118";
let currentUser = null;
let isMaster = false;

function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
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

  if (!id || !pw) return alert("아이디와 비밀번호를 입력하세요.");
  if (users[id]) return alert("이미 존재하는 아이디입니다.");

  users[id] = { pw, balance: 100 };
  saveUsers(users);
  alert("가입 완료! 로그인 해주세요.");
  showLogin();
}

function login() {
  const id = document.getElementById("login-id").value;
  const pw = document.getElementById("login-pw").value;
  const users = getUsers();

  if (id === masterId && pw === masterPw) {
    isMaster = true;
    currentUser = id;
  } else if (users[id] && users[id].pw === pw) {
    isMaster = false;
    currentUser = id;
  } else {
    alert("로그인 실패: 아이디 또는 비밀번호가 틀립니다.");
    return;
  }

  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("home-screen").classList.remove("hidden");
  document.getElementById("welcome-text").innerText = `환영합니다, ${currentUser}님!`;
  showTab("balance");
}

function logout() {
  currentUser = null;
  isMaster = false;
  location.reload();
}

function toggleSidebar() {
  document.getElementById("menu").classList.toggle("hidden");
}

function showTab(tab) {
  const users = getUsers();
  let html = "";

  if (tab === "balance") {
    html = `<h2>내 잔액</h2><p>${users[currentUser]?.balance || 0} 오이</p>`;
  }

  if (tab === "transfer") {
    html = `<h2>송금</h2>
      <select id="recipient">` +
      Object.keys(users).filter(u => u !== currentUser).map(u => `<option value="${u}">${u}</option>`).join("") +
      `</select>
      <input type="number" id="amount" placeholder="금액" />
      <button onclick="sendMoney()">보내기</button>`;
  }

  if (tab === "members") {
    html = `<h2>가입자 목록</h2><ul>`;
    for (let id in users) {
      html += `<li>${id}`;
      if (isMaster) {
        html += ` - ${users[id].balance} 오이`;
      }
      html += `</li>`;
    }
    html += `</ul>`;

    if (isMaster) {
      html += `
        <h3>잔액 조작</h3>
        <input id="edit-id" placeholder="대상 아이디" />
        <input id="edit-amount" placeholder="± 금액" />
        <button onclick="editBalance()">수정</button>
        <h3>계정 삭제</h3>
        <input id="del-id" placeholder="삭제할 아이디" />
        <button onclick="deleteUser()">삭제</button>
      `;
    }
  }

  if (tab === "ranking") {
    const ranking = Object.entries(users).sort((a, b) => b[1].balance - a[1].balance);
    html = `<h2>오이 부자 순위</h2><ol>`;
    for (let [id, user] of ranking) {
      html += `<li>${id} - ${user.balance} 오이</li>`;
    }
    html += `</ol>`;
  }

  document.getElementById("tab-content").innerHTML = html;
}

function sendMoney() {
  const users = getUsers();
  const to = document.getElementById("recipient").value;
  const amount = parseInt(document.getElementById("amount").value);

  if (!users[to] || isNaN(amount) || amount <= 0) return alert("유효한 수신자 또는 금액을 입력하세요.");
  if (users[currentUser].balance < amount) return alert("잔액 부족");

  users[currentUser].balance -= amount;
  users[to].balance += amount;

  saveUsers(users);
  alert(`${to}님에게 ${amount} 오이를 보냈습니다.`);
  showTab("balance");
}

function deleteUser() {
  const id = document.getElementById("del-id").value;
  const users = getUsers();

  if (id === masterId) return alert("마스터 계정은 삭제할 수 없습니다.");
  if (!users[id]) return alert("존재하지 않는 사용자입니다.");

  delete users[id];
  saveUsers(users);
  alert(`${id} 계정 삭제 완료`);
  showTab("members");
}

function editBalance() {
  const id = document.getElementById("edit-id").value;
  const amount = parseInt(document.getElementById("edit-amount").value);
  const users = getUsers();

  if (!users[id]) return alert("존재하지 않는 사용자입니다.");
  if (isNaN(amount)) return alert("숫자를 입력하세요.");

  users[id].balance += amount;
  if (users[id].balance < 0) users[id].balance = 0;

  saveUsers(users);
  alert(`${id}의 잔액을 ${amount >= 0 ? "+" : ""}${amount} 오이 변경`);
  showTab("members");
}
