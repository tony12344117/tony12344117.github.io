// script.js

// 로컬 스토리지 키
const STORAGE_KEY = 'users';
const CURRENT_KEY = 'currentUser';

// 마스터 계정 ID
const MASTER_ID = '정후교';

// ====== 데이터 로드 & 초기화 ======
let users = JSON.parse(localStorage.getItem(STORAGE_KEY));
if (!users) {
  users = {
    '정후교': { password: '302118', balance: 1000 }
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

let currentUser = localStorage.getItem(CURRENT_KEY);

// ====== 저장 함수 ======
function saveUsers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// ====== 인증 & 화면 전환 ======
window.onload = () => {
  if (currentUser && users[currentUser]) {
    showHome();
  }
};

// ====== 계정 생성 ======
document.getElementById('btn-register').onclick = () => {
  const id = document.getElementById('reg-id').value.trim();
  const pw = document.getElementById('reg-pw').value;
  const msg = document.getElementById('register-msg');
  msg.innerText = '';

  if (!id || !pw) {
    msg.innerText = '모든 항목을 입력하세요.';
    return;
  }
  if (users[id]) {
    msg.innerText = '이미 존재하는 아이디입니다.';
    return;
  }
  users[id] = { password: pw, balance: 0 };
  saveUsers();
  msg.innerText = '계정이 생성되었습니다. 아래에서 로그인하세요.';
};

// ====== 로그인 ======
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

// ====== 홈 화면 표시 ======
function showHome() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('home-section').style.display = 'block';
  renderWelcome();
}

// ====== 사이드바 렌더링 ======
function renderWelcome() {
  updateContent('<h2>환영합니다 여기는 오이 거래소 입니다</h2>');
  renderSidebar();
}

function renderSidebar() {
  const sb = document.getElementById('sidebar');
  sb.innerHTML = '';
  // 일반 메뉴
  sb.insertAdjacentHTML('beforeend', '<button onclick="showBalance()">현재 잔액</button>');
  sb.insertAdjacentHTML('beforeend', '<button onclick="showTransfer()">송금</button>');
  sb.insertAdjacentHTML('beforeend', '<button onclick="showDeposit()">입금</button>');
  sb.insertAdjacentHTML('beforeend', '<button onclick="showWithdraw()">출금</button>');

  // 마스터 전용 메뉴
  if (currentUser === MASTER_ID) {
    sb.insertAdjacentHTML('beforeend', '<hr/>');
    sb.insertAdjacentHTML('beforeend', '<button onclick="showAdminAdjust()">관리자: 오이 조정</button>');
  }
}

// ====== 공통 유틸 ======
function updateContent(html) {
  document.getElementById('content').innerHTML = html;
}
document.getElementById('메뉴 토글').온클릭 = () => {
 document.getElementById('사이드바').classList.toggle('숨겨진');
}

// ====== 일반 기능 ======
기능. 쇼밸런스() {
 constval = users[currentUser]balance;
 updateContent('<h2>현재 잔액: ${bal} 오이</h2>);
}

기능. 쇼트랜스퍼() {
 const others = Object.keys(사용자).필터(u => u!== currentUser);
 const opts = others.length
 ? others.map(u => '<option value="${u}">${u}<option>).join('')
 : '<option disabled>가입된 사용자가 없습니다.</옵션>;
  업데이트 내용(`
 <h2>송금하기</h2>
 <선택 ID="수신자">${옵션}</select><br/>
 <입력 유형="number" id="금액" 자리 표시자="금액 입력" /><br/>
 <버튼 클릭="돈 보내기()">송금</버튼>
 `);
}

기능. 송금() {
 const to = document.getElementById('수신자').가치;
 constamt = parseInt(document.getElementById('금액').가치, 10);
 만약 (!to || is NaN(amt) || amt <= 0) { alert ('유효한 정보를 입력하세요.'; 반환; }
 만약 (users[currentUser].balance < amt) { alert('잔액이 부족합니다'); 반환; }
 users[currentUser].balance -= amt;
 사용자[to].잔액 += amt;
 사용자 저장();
 alert(`${to}님께 ${amt} 오이를 송금했습니다.`);
 showBalance();
}

기능. 보증금 표시() {
 updateContent('<h2>학교에서 사업시간에 정후교한테 문의하세요.</h2>';
}

function showWithdraw() {
  updateContent('<h2>학교에 와서 정후교한테 문의하세요.</h2>');
}

// ====== 관리자 기능 ======
기능. showAdminAdjust() {
 const list = Object.keys(사용자)
 .filter(u => u!== MASTER_ID)
 .map(u => '<옵션 값="${u}">${u}</option>).join('');
  업데이트 내용(`
    <h2>관리자: 오이 조정</h2>
    <select id="admin-user">${list}</select><br/>
    <input type="number" id="admin-amount" placeholder="증감할 금액 입력" /><br/>
    <button onclick="adminAdjust(true)">추가</button>
    <button onclick="adminAdjust(false)">차감</button>
 `);
}

기능. 관리 조정(추가) {
 const userId = document.getElementById('admin-user') 값;
 constamt = parseInt(document.getElementById('admin-금액').가치, 10);
 만약 (!userId || isNaN(amt) || amt <= 0) {
 alert('유효한 사용자 및 금액을 입력하세요.');
 반환;
  }
 사용자[userId].잔액 += (isAdd ? amt : -amt);
 사용자 저장();
 alert('${사용자Id}님의 잔액이 ${isAdd ? '+' : '-'}${amt} 오이 변경되었습니다.`);
 showAdminAdjust();
}
