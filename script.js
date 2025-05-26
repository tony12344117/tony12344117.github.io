const MASTER_ID = '정후교';
const MASTER_PW = '302118';

let currentUser = null;
let deleteConfirmStage = 0;

function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

function loadUsers() {
  return JSON.parse(localStorage.getItem('users') || '{}');
}

function showLogin() {
  hideAll();
  document.getElementById('login-section').style.display = 'block';
}

function showRegister() {
  hideAll();
  document.getElementById('register-section').style.display = 'block';
}

function showBalance() {
  const users = loadUsers();
  const balance = users[currentUser]?.balance || 0;
  alert(`현재 잔액: ${balance} 오이`);
}

function showSend() {
  hideAll();
  document.getElementById('send-section').style.display = 'block';
}

function showDeposit() {
  alert("학교에서 사업시간에 정후교한테 찾아와서 말하세요.");
}

function showWithdraw() {
  alert("학교에 와서 정후교한테 말하세요.");
}

function showAdjust() {
  hideAll();
  document.getElementById('adjust-section').style.display = 'block';
}

function showDeleteAccount() {
  hideAll();
  deleteConfirmStage = 0;
  document.getElementById('delete-confirm-message').textContent = '';
  document.getElementById('delete-section').style.display = 'block';
}

function confirmDeleteStep1() {
  deleteConfirmStage++;
  const msg = [
    '정말로 계정을 삭제하시겠습니까? 되돌릴 수 없습니다. (2단계)',
    '진짜 마지막입니다. 정말 삭제할까요? (3단계)',
    ''
  ];
  if (deleteConfirmStage < 3) {
    document.getElementById('delete-confirm-message').textContent = msg[deleteConfirmStage - 1];
  } else {
    const users = loadUsers();
    delete users[currentUser];
    saveUsers(users);
    alert("계정이 삭제되었습니다.");
    currentUser = null;
    showLogin();
  }
}

function login() {
  const id = document.getElementById('login-username').value.trim();
  const pw = document.getElementById('login-password').value;
  const users = loadUsers();

  if (id === MASTER_ID && pw === MASTER_PW) {
    if (!users[MASTER_ID]) users[MASTER_ID] = { password: MASTER_PW, balance: 0 };
    currentUser = MASTER_ID;
    showHome(true);
    return;
  }

  if (!users[id] || users[id].password !== pw) {
    alert("아이디 또는 비밀번호가 틀렸습니다.");
    return;
  }

  currentUser = id;
  showHome(false);
}

function register() {
  const id = document.getElementById('register-username').value.trim();
  const pw = document.getElementById('register-password').value;
  const users = loadUsers();

  if (!id || !pw) {
    alert("아이디와 비밀번호를 모두 입력하세요.");
    return;
  }

  if (users[id]) {
    alert("이미 존재하는 아이디입니다.");
    return;
  }

  users[id] = { password: pw, balance: 0 };
  saveUsers(users);
  alert("회원가입 완료!");
  showLogin();
}

function logout() {
  currentUser = null;
  showLogin();
}

function showHome(isAdmin = false) {
  hideAll();
  document.getElementById('home-section').style.display = 'block';
  document.getElementById('welcome-text').textContent = `환영합니다, ${currentUser}님`;
  document.getElementById('admin-btn').style.display = isAdmin ? 'block' : 'none';
}

function sendMoney() {
  const to = document.getElementById('send-to').value.trim();
  const amount = parseInt(document.getElementById('send-amount').value);
  const msg = document.getElementById('send-message').value;
  const users = loadUsers();

  if (!users[to]) {
    alert("받는 사람이 존재하지 않습니다.");
    return;
  }
  if (to === currentUser) {
    alert("자기 자신에게 송금할 수 없습니다.");
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    alert("올바른 금액을 입력하세요.");
    return;
  }
  if (users[currentUser].balance < amount) {
    alert("잔액이 부족합니다.");
    return;
  }

  users[currentUser].balance -= amount;
  users[to].balance += amount;
  saveUsers(users);
  alert(`${to}에게 ${amount} 오이를 송금했습니다.\n메시지: ${msg}`);
  goHome();
}

function adjustBalance() {
  const id = document.getElementById('adjust-user').value.trim();
  const amount = parseInt(document.getElementById('adjust-amount').value);
  const users = loadUsers();

  if (!users[id]) {
    alert("해당 사용자가 존재하지 않습니다.");
    return;
  }

  users[id].balance = (users[id].balance || 0) + amount;
  saveUsers(users);
  alert(`${id}의 잔액이 ${amount > 0 ? '+' : ''}${amount} 오이 변경되었습니다.`);
  goHome();
}

function goHome() {
  showHome(currentUser === MASTER_ID);
}

function hideAll() {
  document.querySelectorAll("div[id$='section']").forEach(div => div.style.display = 'none');
}
