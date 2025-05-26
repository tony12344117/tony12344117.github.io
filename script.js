// ==== 상수 & 초기화 ====
const master = { id: '정후교', pass: '302118' };
let users   = JSON.parse(localStorage.getItem('users') || '{}');
let logs    = JSON.parse(localStorage.getItem('logs')  || '[]');
let current = null;

function saveAll() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('logs', JSON.stringify(logs));
}

// ==== 인증 ====
function register() {
  const name = authName.value.trim();
  const pw   = authPass.value;
  if (!name || !pw) return alert('이름과 비밀번호를 입력하세요.');
  if (users[name]) return alert('이미 존재하는 계정입니다.');
  users[name] = { pass: pw, balance: 0, banned: false };
  saveAll();
  alert('가입이 완료되었습니다.');
}

function login() {
  const name = authName.value.trim();
  const pw   = authPass.value;
  if (!(users[name] || name === master.id))           return alert('계정이 없습니다.');
  if (name !== master.id && users[name].pass !== pw)  return alert('비밀번호가 틀렸습니다.');
  if (users[name]?.banned)                            return alert('정지된 계정입니다.');
  current = name;
  auth.classList.add('hidden');
  app.classList.remove('hidden');
  currentUser.innerText = name;
  if (name === master.id) adminControls.classList.remove('hidden');
  populateLists();
  showSection('balance');
  updateRanking();
  updateLogs();
}

function logout() {
  current = null;
  app.classList.add('hidden');
  auth.classList.remove('hidden');
}

// ==== 화면 전환 ====
function showSection(id) {
  ['balance','send','deposit','withdraw','ranking','adjust','history','ban']
    .forEach(sec => document.getElementById(sec).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  if (id === 'balance') {
    balance.innerText = `🥒 잔액: ${users[current]?.balance || 0} 오이`;
  }
}

// ==== 목록 채우기 ====
function populateLists() {
  recipient.innerHTML = '';
  adminUser.innerHTML = '';
  banUser.innerHTML   = '';
  Object.keys(users).forEach(u => {
    if (u !== current) recipient.innerHTML  += `<option>${u}</option>`;
    adminUser.innerHTML += `<option>${u}</option>`;
    if (u !== master.id) banUser.innerHTML += `<option>${u}</option>`;
  });
}

// ==== 송금 ====
function sendMoney() {
  const to     = recipient.value;
  const amt    = parseInt(sendAmt.value, 10);
  const msg    = sendMsg.value.trim();
  if (!amt || amt <= 0)                return alert('올바른 금액을 입력하세요.');
  if (!msg || msg.length > 80)         return alert('메시지는 1~80자 사이여야 합니다.');
  if (users[current].balance < amt)    return alert('잔액이 부족합니다.');
  users[current].balance -= amt;
  users[to].balance         += amt;
  logs.push(`${current}→${to}:${amt}🥒 msg:${msg}`);
  saveAll();
  alert('송금이 완료되었습니다.');
  showSection('balance');
  updateRanking();
  updateLogs();
}

// ==== 관리자 기능 ====
function adjustBalance(isAdd) {
  const u   = adminUser.value;
  const amt = parseInt(adjustAmt.value, 10);
  if (!u)             return alert('사용자를 선택하세요.');
  if (!amt || amt===0) return alert('금액을 입력하세요.');
  users[u].balance += isAdd ? amt : -amt;
  logs.push(`🛠 마스터 ${isAdd? '추가':'차감'} ${u}: ${isAdd?'+':''}${amt}🥒`);
  saveAll();
  alert('잔액 조정이 완료되었습니다.');
  updateRanking();
}

function toggleBan() {
  const u = banUser.value;
  users[u].banned = !users[u].banned;
  logs.push(`🚫 마스터 ${u} 계정 ${users[u].banned? '정지':'해제'}`);
  saveAll();
  alert(users[u].banned ? '계정이 정지되었습니다.' : '계정 정지가 해제되었습니다.');
}

// ==== 순위 & 로그 ====
function updateRanking() {
  rankList.innerHTML = '';
  Object.entries(users)
    .sort((a,b)=> b[1].balance - a[1].balance)
    .forEach(([u,d],i) => {
      rankList.innerHTML += `<li>${i+1}. ${u}: ${d.balance}🥒 ${d.banned? '(정지)':''}</li>`;
    });
}

function updateLogs() {
  logOutput.textContent = logs.join('\n');
}

// ==== 초기화 ====
auth.classList.remove('hidden');
app.classList.add('hidden');
