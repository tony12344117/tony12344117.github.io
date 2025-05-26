document.addEventListener('DOMContentLoaded', () => {
  // ===== 상수 & 초기 설정 =====
  const STORAGE_KEY = 'users';
  const CURRENT_KEY = 'currentUser';
  const MASTER_ID = '정후교';
  const MASTER_PW = '302118';
  const MASTER_INIT_BALANCE = 1000;

  // ===== 유틸 함수 =====
  const getUsers = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  const saveUsers = u => localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  const setCurrent = u => localStorage.setItem(CURRENT_KEY, u);
  const clearCurrent = () => localStorage.removeItem(CURRENT_KEY);

  // ===== 초기 데이터 세팅 =====
  let users = getUsers();
  if (!users[MASTER_ID]) {
    users[MASTER_ID] = {
      password: MASTER_PW,
      balance: MASTER_INIT_BALANCE,
      suspended: false,
      transactions: []
    };
    saveUsers(users);
  }
  let currentUser = localStorage.getItem(CURRENT_KEY);

  // ===== DOM 요소 =====
  const authC = document.getElementById('auth-container');
  const app = document.getElementById('app');
  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');
  const btnReg = document.getElementById('btn-register');
  const btnLog = document.getElementById('btn-login');
  const btnLogout = document.getElementById('btn-logout');
  const btnMenu = document.getElementById('menu-toggle');

  // ===== 인증 & 가입 =====
  btnReg.addEventListener('click', () => {
    const id = document.getElementById('reg-username').value.trim();
    const pw = document.getElementById('reg-password').value;
    if (!id || !pw) return alert('🚫 모든 칸을 입력하세요.');
    users = getUsers();
    if (users[id]) return alert('🚫 이미 존재하는 아이디입니다.');
    users[id] = { password: pw, balance: 0, suspended: false, transactions: [] };
    saveUsers(users);
    alert('✅ 계정이 생성되었습니다.');
  });

  btnLog.addEventListener('click', () => {
    const id = document.getElementById('login-username').value.trim();
    const pw = document.getElementById('login-password').value;
    users = getUsers();
    if (!users[id] || users[id].password !== pw)
      return alert('🚫 아이디 또는 비밀번호가 틀렸습니다.');
    if (users[id].suspended) return alert('⛔ 이 계정은 정지되었습니다.');
    currentUser = id;
    setCurrent(id);
    initApp();
  });

  // ===== 앱 초기화 =====
  btnLogout.addEventListener('click', () => {
    clearCurrent();
    location.reload();
  });

  btnMenu.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
  });

  function initApp() {
    authC.classList.add('hidden');
    app.classList.remove('hidden');
    renderSidebar();
    showBalance();
  }

  // 자동 로그인 체크
  if (currentUser && getUsers()[currentUser] && !getUsers()[currentUser].suspended) {
    initApp();
  }

  // ===== 사이드바 =====
  function renderSidebar() {
    sidebar.innerHTML = '';
    const items = [
      { label: '💰 현재잔액', action: showBalance },
      { label: '✉️ 송금', action: showTransfer },
      { label: '💳 입금', action: showDeposit },
      { label: '🏧 출금', action: showWithdraw }
    ];
    items.forEach(it => {
      const b = document.createElement('button');
      b.innerText = it.label;
      b.addEventListener('click', it.action);
      sidebar.appendChild(b);
    });
    if (currentUser === MASTER_ID) {
      sidebar.appendChild(document.createElement('hr'));
      const mb = document.createElement('button');
      mb.innerText = '🛠 마스터 메뉴';
      mb.addEventListener('click', showMasterPanel);
      sidebar.appendChild(mb);
    }
    const lo = document.createElement('button');
    lo.innerText = '🚪 로그아웃';
    lo.addEventListener('click', btnLogout.click.bind(btnLogout));
    sidebar.appendChild(lo);
  }

  // ===== 일반 기능 =====
  function showBalance() {
    users = getUsers();
    content.innerHTML = `<h2>${currentUser}님의 잔액: ${users[currentUser].balance} 오이🍞</h2>`;
  }

  function showTransfer() {
    users = getUsers();
    let opts = Object.keys(users)
      .filter(u => u !== currentUser)
      .map(u => `<option value="${u}">${u}</option>`)
      .join('') || `<option disabled>사용자 없음</option>`;
    content.innerHTML = `
      <h3>✉️ 송금</h3>
      <select id="recipient">${opts}</select><br/>
      <input id="amount" type="number" placeholder="금액"/><br/>
      <textarea id="message" rows="2" maxlength="80"
        placeholder="메시지 (80자 이내)"></textarea><br/>
      <button id="btn-transfer">송금하기</button>
    `;
    document.getElementById('btn-transfer')
      .addEventListener('click', doTransfer);
  }

  function doTransfer() {
    const to = document.getElementById('recipient').value;
    const amt = parseInt(document.getElementById('amount').value, 10);
    const msg = document.getElementById('message').value.trim();
    if (!to || isNaN(amt) || amt <= 0)
      return alert('🚫 금액을 정확히 입력하세요.');
    if (msg.length > 80)
      return alert('🚫 메시지는 최대 80자까지 가능합니다.');
    users = getUsers();
    if (users[currentUser].balance < amt)
      return alert('🚫 잔액이 부족합니다.');
    const now = new Date().toLocaleString();
    users[currentUser].balance -= amt;
    users[to].balance += amt;
    const rec = { from: currentUser, to, amount: amt, message: msg, date: now };
    users[currentUser].transactions.push(rec);
    users[to].transactions.push(rec);
    saveUsers(users);
    alert(`✅ ${to}님께 ${amt} 오이🍞 송금 완료`);
    showBalance();
  }

  function showDeposit() {
    content.innerHTML = `
      <h3>💳 입금 안내</h3>
      <p>학교에서 사업시간에 정후교에게 문의하세요.</p>`;
  }

  function showWithdraw() {
    content.innerHTML = `
      <h3>🏧 출금 안내</h3>
      <p>학교에 와서 정후교에게 문의하세요.</p>`;
  }

  // ===== 마스터 기능 =====
  function showMasterPanel() {
    if (currentUser !== MASTER_ID)
      return alert('🚫 접근 권한이 없습니다.');
    users = getUsers();
    let opts = Object.keys(users)
      .filter(u => u !== MASTER_ID)
      .map(u => `<option value="${u}">${u}</option>`)
      .join('') || `<option disabled>사용자 없음</option>`;
    content.innerHTML = `
      <h3>🛠 마스터 메뉴</h3>
      <select id="targetUser">${opts}</select><br/>
      <input id="changeAmount" type="number" placeholder="금액"/><br/>
      <button id="btn-add">+ 추가</button>
      <button id="btn-sub">- 차감</button><br/><br/>
      <button id="btn-suspend">🚫 정지</button>
      <button id="btn-unsuspend">✅ 해제</button><br/><br/>
      <button id="btn-view">💰 잔액 조회</button>
      <button id="btn-history">📜 거래내역</button>
      <div id="admin-result" style="margin-top:15px; white-space: pre-wrap;"></div>
    `;
    document.getElementById('btn-add')
      .addEventListener('click', () => adminAdjust(true));
    document.getElementById('btn-sub')
      .addEventListener('click', () => adminAdjust(false));
    document.getElementById('btn-suspend')
      .addEventListener('click', suspendUser);
    document.getElementById('btn-unsuspend')
      .addEventListener('click', unsuspendUser);
    document.getElementById('btn-view')
      .addEventListener('click', adminViewBalance);
    document.getElementById('btn-history')
      .addEventListener('click', adminViewHistory);
  }

  function adminAdjust(isAdd) {
    const target = document.getElementById('targetUser').value;
    const amt = parseInt(document.getElementById('changeAmount').value, 10);
    users = getUsers();
    if (!target || isNaN(amt) || amt <= 0)
      return alert('🚫 금액을 정확히 입력하세요.');
    users[target].balance += isAdd ? amt : -amt;
    saveUsers(users);
    alert(`✅ ${target}님의 잔액이 ${isAdd?'+' : '-'}${amt} 변경되었습니다.`);
    showMasterPanel();
  }

  function suspendUser() {
    const target = document.getElementById('targetUser').value;
    users = getUsers();
    users[target].suspended = true;
    saveUsers(users);
    alert(`🚫 ${target} 계정이 정지되었습니다.`);
    showMasterPanel();
  }

  function unsuspendUser() {
    const target = document.getElementById('targetUser').value;
    users = getUsers();
    users[target].suspended = false;
    saveUsers(users);
    alert(`✅ ${target} 계정의 정지가 해제되었습니다.`);
    showMasterPanel();
  }

  function adminViewBalance() {
    const target = document.getElementById('targetUser').value;
    users = getUsers();
    document.getElementById('admin-result').innerText =
      `${target}님의 잔액: ${users[target].balance} 오이🍞`;
  }

  function adminViewHistory() {
    const target = document.getElementById('targetUser').value;
    users = getUsers();
    const tx = users[target].transactions || [];
    if (!tx.length) {
      document.getElementById('admin-result').innerText = '거래내역이 없습니다.';
      return;
    }
    const lines = tx.map(t =>
      `[${t.date}] ${t.from}→${t.to} ${t.amount} 오이🍞\n  "${t.message}"`
    ).join('\n\n');
    document.getElementById('admin-result').innerText = lines;
  }
});
