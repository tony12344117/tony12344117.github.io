// ====== 키 & 상수 ======
const STORAGE_KEY = 'users';
const CURRENT_KEY = 'currentUser';
const MASTER_ID = '정후교';
const MASTER_PW = '302118';
const MASTER_START_BALANCE = 1000;

// ====== 데이터 로드 & 초기화 ======
let users = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (!users || typeof users !== 'object') {
  users = {};
  // 마스터는 처음에 1000오이, 신규 계정은 0오이
  users[MASTER_ID] = { password: MASTER_PW, balance: MASTER_START_BALANCE };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}
let currentUser = localStorage.getItem(CURRENT_KEY);

// ====== 유틸 함수 ======
function saveUsers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}
function clearCurrentUser() {
  localStorage.removeItem(CURRENT_KEY);
}

// ====== 초기 실행 ======
window.onload = () => {
  if (currentUser && users[currentUser]) showHome();
};

// ====== 인증 핸들러 ======
document.getElementById('btn-register').onclick = () => {
  const id = document.getElementById('reg-id').value.trim();
  const pw = document.getElementById('reg-pw').value;
  const msg = document.getElementById('register-msg');
  msg.innerText = '';
  if (!id || !pw) {
    msg.innerText = '모든 항목을 입력하세요.'; return;
  }
  if (users[id]) {
    msg.innerText = '이미 존재하는 아이디입니다.'; return;
  }
  // 신규 계정은 무조건 0 오이
  users[id] = { password: pw, balance: 0 };
  saveUsers();
  msg.innerText = '계정이 생성되었습니다. 아래에서 로그인하세요.';
};

document.getElementById('btn-login').onclick = () => {
  const id = document.getElementById('login-id').value.trim();
  const pw = document.getElementById('login-pw').value;
  const msg = document.getElementById('login-msg');
  msg.innerText = '';
  if (users[id] && users[id].password === pw) {
    currentUser = id;
    localStorage.setItem(CURRENT_KEY, currentUser);
    showHome();
  } else {
    msg.innerText = '아이디 또는 비밀번호가 잘못되었습니다.';
  }
};

document.getElementById('btn-reset').onclick = () => {
  if (!confirm('정말 초기화하시겠습니까?')) return;
  localStorage.removeItem(STORAGE_KEY);
  clearCurrentUser();
  alert('초기화되었습니다. 페이지를 새로고침합니다.');
  location.reload();
};

// ====== 메인 화면 전환 ======
function showHome() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('home-section').classList.remove('hidden');
  renderWelcome();
}

// ====== 사이드바 & 콘텐츠 렌더 ======
function renderWelcome() {
  updateContent('<h2>환영합니다 여기는 오이 거래소 입니다</h2>');
  renderSidebar();
}

function renderSidebar() {
  const sb = document.getElementById('sidebar');
  sb.innerHTML = '';

  // 공통 메뉴
  const menuMap = {
    '현재 잔액': showBalance,
    '송금': showTransfer,
    '입금': showDeposit,
    '출금': showWithdraw
  };
  for (let label in menuMap) {
    const btn = document.createElement('button');
    btn.innerText = label;
    btn.onclick = menuMap[label];
    sb.appendChild(btn);
  }

  // 관리자 전용: 오이 조정 + 유저 잔액 보기
  if (currentUser === MASTER_ID) {
    sb.appendChild(document.createElement('hr'));

    const adjBtn = document.createElement('button');
    adjBtn.innerText = '관리자: 오이 조정';
    adjBtn.onclick = showAdminAdjust;
    sb.appendChild(adjBtn);

    const viewBtn = document.createElement('button');
    viewBtn.innerText = '관리자: 유저 잔액 조회';
    viewBtn.onclick = showAdminView;
    sb.appendChild(viewBtn);
  }

  // 사이드바 토글
  document.getElementById('menu-toggle').onclick = () => {
    sb.classList.toggle('hidden');
  };
}

function updateContent(html) {
  document.getElementById('main-content').innerHTML = html;
}

// ====== 기본 기능 ======
function showBalance() {
  updateContent(`<h2>현재 잔액: ${users[currentUser].balance} 오이</h2>`);
}

function showTransfer() {
  const opts = Object.keys(users)
    .filter(u => u !== currentUser)
    .map(u => `<option value="${u}">${u}</option>`).join('') ||
    `<option disabled>가입된 사용자가 없습니다.</option>`;
  updateContent(`
    <h2>송금하기</h2>
    <select id="recipient">${opts}</select><br/>
    <input type="number" id="amount" placeholder="금액 입력" /><br/>
    <button onclick="sendMoney()">송금</button>
  `);
}

function sendMoney() {
  const to = document.getElementById('recipient').value;
  const amt = parseInt(document.getElementById('amount').value,10);
  if (!to || isNaN(amt) || amt<=0) { alert('유효한 정보를 입력하세요.'); return; }
  if (users[currentUser].balance < amt)    { alert('잔액이 부족합니다.');  return; }
  users[currentUser].balance -= amt;
  users[to].balance += amt;
  saveUsers();
  alert(`${to}님께 ${amt} 오이를 송금했습니다.`);
  showBalance();
}

function showDeposit() {
  updateContent('<h2>학교에서 사업시간에 정후교한테 문의하세요.</h2>');
}

function showWithdraw() {
  updateContent('<h2>학교에 와서 정후교한테 문의하세요.</h2>');
}

// ====== 관리자: 오이 조정 ======
function showAdminAdjust() {
  // *내 계정도 포함* → filter 제거
  const opts = Object.keys(users)
    .map(u => `<option value="${u}">${u}</option>`).join('') ||
    `<option disabled>가입된 사용자가 없습니다.</option>`;
  updateContent(`
    <h2>관리자: 오이 조정</h2>
    <select id="admin-user">${opts}</select><br/>
    <input type="number" id="admin-amount" placeholder="증감할 금액 입력" /><br/>
    <button onclick="adminAdjust(true)">추가</button>
    <button onclick="adminAdjust(false)">차감</button>
  `);
}

function adminAdjust(isAdd) {
  const userId = document.getElementById('admin-user').value;
  const amt = parseInt(document.getElementById('admin-amount').value,10);
  if (!userId || isNaN(amt)||amt<=0) {
    alert('유효한 사용자 및 금액을 입력하세요.'); return;
  }
  users[userId].balance += isAdd?amt:-amt;
  saveUsers();
  alert(`${userId}님의 잔액이 ${isAdd?'+':'-'}${amt} 오이 변경되었습니다.`);
  showAdminAdjust();
}

// ====== 관리자: 유저 잔액 조회 ======
function showAdminView() {
  const opts = Object.keys(users)
    .map(u => `<option value="${u}">${u}</option>`).join('') ||
    `<option disabled>가입된 사용자가 없습니다.</option>`;
  updateContent(`
    <h2>관리자: 유저 잔액 조회</h2>
    <select id="view-user">${opts}</select><br/>
    <button onclick="adminViewBalance()">조회</button>
    <div id="view-result" style="margin-top:15px;"></div>
  `);
}

function adminViewBalance() {
  const userId = document.getElementById('view-user').value;
  if (!userId) { alert('사용자를 선택하세요.'); return; }
  const bal = users[userId].balance;
  document.getElementById('view-result').innerHTML =
    `<p>${userId}님의 현재 잔액: ${bal} 오이</p>`;
}
