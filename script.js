// ====== 데이터 및 초기값 ======

const MASTER_ID = '정후교';
const MASTER_PW = '302118';

function safeParseJSON(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

let users = safeParseJSON(localStorage.getItem('users'), null);
if(!Array.isArray(users) || users.length === 0) {
  users = [
    { id: MASTER_ID, pw: MASTER_PW, balance: 1000, transactions: [] }
  ];
  saveUsers();
}

let currentUser = null;

function saveUsers() {
  try {
    localStorage.setItem('users', JSON.stringify(users));
  } catch (e) {
    alert('로컬 저장 공간에 문제가 발생했습니다.');
    console.error(e);
  }
}

function login(id, pw) {
  if (!id || !pw) return false;
  const user = users.find(u => u.id === id && u.pw === pw);
  if(user) {
    currentUser = user;
    try {
      localStorage.setItem('currentUserId', id);
    } catch (e) {
      alert('로컬 저장소 접근 오류');
      console.error(e);
    }
    return true;
  }
  return false;
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUserId');
  location.reload();
}

function tryAutoLogin() {
  const savedId = localStorage.getItem('currentUserId');
  if(savedId) {
    const user = users.find(u => u.id === savedId);
    if(user) {
      currentUser = user;
      return true;
    }
  }
  return false;
}

// ====== UI Elements ======

const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');

const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const logoutBtn = document.getElementById('logout-btn');

const btnBalance = document.getElementById('btn-balance');
const btnTransfer = document.getElementById('btn-transfer');
const btnDeposit = document.getElementById('btn-deposit');
const btnWithdraw = document.getElementById('btn-withdraw');

// ====== 상태 플래그 ======

let isTransferProcessing = false;

// ====== UI 렌더링 함수 ======

function clearMainContent() {
  mainContent.innerHTML = '';
}

function renderWelcome() {
  mainContent.innerHTML = `
    <h2>환영합니다! 오이 거래소 입니다.</h2>
    <p>왼쪽 ☰ 버튼을 눌러 사용 가능한 기능을 선택하세요.</p>
  `;
}

function renderBalance() {
  clearMainContent();
  const p = document.createElement('p');
  p.textContent = `${currentUser.balance} 오이`;
  const h2 = document.createElement('h2');
  h2.textContent = '현재 잔액';
  mainContent.appendChild(h2);
  mainContent.appendChild(p);
}

function renderDeposit() {
  clearMainContent();
  const h2 = document.createElement('h2');
  h2.textContent = '입금 안내';
  const p = document.createElement('p');
  p.textContent = '학교에서 사업시간에 정후교 한테 찾아와서 말하세요.';
  mainContent.appendChild(h2);
  mainContent.appendChild(p);
}

function renderWithdraw() {
  clearMainContent();
  const h2 = document.createElement('h2');
  h2.textContent = '출금 안내';
  const p = document.createElement('p');
  p.textContent = '학교에 와서 정후교한테 말하세요.';
  mainContent.appendChild(h2);
  mainContent.appendChild(p);
}

function renderTransfer() {
  clearMainContent();

  // 사용자 목록 (현재 로그인 유저 제외)
  const others = users.filter(u => u.id !== currentUser.id);

  const h2 = document.createElement('h2');
  h2.textContent = '송금하기';

  if (others.length === 0) {
    const p = document.createElement('p');
    p.textContent = '가입된 다른 사용자가 없습니다.';
    mainContent.appendChild(h2);
    mainContent.appendChild(p);
    return;
  }

  const formDiv = document.createElement('div');
  formDiv.className = 'form-group';

  const labelRecipient = document.createElement('label');
  labelRecipient.htmlFor = 'transfer-recipient';
  labelRecipient.textContent = '받는 사람:';
  formDiv.appendChild(labelRecipient);

  const selectRecipient = document.createElement('select');
  selectRecipient.id = 'transfer-recipient';
  others.forEach(u => {
    const option = document.createElement('option');
    option.value = u.id;
    option.textContent = u.id;
    selectRecipient.appendChild(option);
  });
  formDiv.appendChild(selectRecipient);

  const formDiv2 = document.createElement('div');
  formDiv2.className = 'form-group';

  const labelAmount = document.createElement('label');
  labelAmount.htmlFor = 'transfer-amount';
  labelAmount.textContent = '금액:';
  formDiv2.appendChild(labelAmount);

  const inputAmount = document.createElement('input');
  inputAmount.type = 'number';
  inputAmount.id = 'transfer-amount';
  inputAmount.min = '1';
  inputAmount.placeholder = '송금할 금액 입력';
  formDiv2.appendChild(inputAmount);

  const btnSend = document.createElement('button');
  btnSend.className = 'action-btn';
  btnSend.id = 'transfer-btn';
  btnSend.textContent = '송금';

  mainContent.appendChild(h2);
  mainContent.appendChild(formDiv);
  mainContent.appendChild(formDiv2);
  mainContent.appendChild(btnSend);

  // 송금 버튼 이벤트 - 중복 클릭 방지 및 엄격 체크
  btnSend.addEventListener('click', () => {
    if (isTransferProcessing) return;
    isTransferProcessing = true;

    const recipientId = selectRecipient.value;
    const amountStr = inputAmount.value.trim();
    const amount = Number(amountStr);

    if (!recipientId) {
      alert('받는 사람을 선택하세요.');
      isTransferProcessing = false;
      return;
    }
    if (!amountStr || isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
      alert('송금할 금액을 올바른 자연수로 입력하세요.');
      isTransferProcessing = false;
      return;
    }
    if (amount > currentUser.balance) {
      alert('잔액이 부족합니다.');
      isTransferProcessing = false;
      return;
    }

    const recipient = users.find(u => u.id === recipientId);
    if (!recipient) {
      alert('받는 사람을 찾을 수 없습니다.');
      isTransferProcessing = false;
      return;
    }

    // 송금 처리
    try {
      currentUser.balance -= amount;
      recipient.balance += amount;

      const now = new Date().toLocaleString();

      currentUser.transactions.push({ type: '송금', amount: -amount, to: recipientId, date: now });
      recipient.transactions.push({ type: '송금받음', amount: amount, from: currentUser.id, date: now });

      saveUsers();

      alert(`${recipientId}님께 ${amount} 오이를 송금했습니다.`);

      renderBalance();

    } catch (e) {
      alert('송금 처리 중 오류가 발생했습니다.');
      console.error(e);
    } finally {
      isTransferProcessing = false;
    }
  });
}

// ====== 이벤트 바인딩 ======

menuToggle.addEventListener('click', () => {
  if(sidebar.classList.contains('hidden')) {
    sidebar.classList.remove('hidden');
  } else {
    sidebar.classList.add('hidden');
  }
});

logoutBtn.addEventListener('click', () => {
  if(confirm('로그아웃 하시겠습니까?')) {
    logout();
  }
});

btnBalance.addEventListener('click', renderBalance);
btnTransfer.addEventListener('click', renderTransfer);
btnDeposit.addEventListener('click', renderDeposit);
btnWithdraw.addEventListener('click', renderWithdraw);

loginBtn.addEventListener('click', () => {
  const id = document.getElementById('login-id').value.trim();
  const pw = document.getElementById('login-pw').value;

  if (login(id, pw)) {
    loginError.style.display = 'none';
    loginScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    sidebar.classList.add('hidden');
    renderWelcome();
  } else {
    loginError.style.display = 'block';
  }
});

// DOM 완전 로드 후 실행 보장
window.addEventListener('DOMContentLoaded', () => {
  if (tryAutoLogin()) {
    loginScreen.style.display = 'none';
    appScreen.style.display = 'flex';
    sidebar.classList.add('hidden');
    renderWelcome();
  } else {
    loginScreen.style.display = 'block';
    appScreen.style.display = 'none';
  }
});


