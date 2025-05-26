// ==== 상수 & 초기화 ====
const master = { id: '정후교', pass: '302118' };
let users = JSON.parse(localStorage.getItem('users') || '{}');
let logs  = JSON.parse(localStorage.getItem('logs')  || '[]');
let current = null;

function saveAll() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('logs', JSON.stringify(logs));
}

// ==== 인증 ====
function register() {
  const name = authName.value.trim();
  const pw   = authPass.value;
  if (!name || !pw) return alert('이름과 비밀번호 입력');
  if (users[name]) return alert('이미 존재하는 계정');
  users[name] = { pass: pw, balance: 0, banned: false };
  saveAll();
  alert('가입 완료');
}

function login() {
  const name = authName.value.trim();
  const pw   = authPass.value;
  if (!(users[name] || name===master.id)) return alert('계정 없음');
  if (name!==master.id && users[name].pass!==pw) return alert('비번 틀림');
  if (users[name]?.banned) return alert('정지된 계정');
  current = name;
  auth.classList.add('hidden');
  app.classList.remove('hidden');
  currentUser.innerText = name;
  if (name===master.id) adminControls.classList.remove('hidden');
  else adminControls.classList.add('hidden');
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
    .forEach(s=> document.getElementById(s).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  if (id==='balance') {
    balance.innerText = `🥒 잔액: ${users[current]?.balance||0} 오이`;
  }
}

// ==== 데이터 채우기 ====
function populateLists() {
  recipient.innerHTML='';
  adminUser.innerHTML='';
  banUser.innerHTML='';
  Object.keys(users).forEach(u=> {
    if (u!==current) recipient.innerHTML  += `<option>${u}</option>`;
    adminUser.innerHTML += `<option>${u}</option>`;
    if (u!==master.id) banUser.innerHTML += `<option>${u}</option>`;
  });
}

// ==== 송금 ====
function sendMoney() {
  const to     = recipient.value;
  const amount = parseInt(sendAmt.value);
  const msg    = sendMsg.value.trim();
  if (!amount||amount<=0)    return alert('금액 확인');
  if (!msg||msg.length>80)   return alert('메시지 확인');
  if (users[current].balance<amount) return alert('잔액 부족');
  users[current].balance -= amount;
  users[to].balance        += amount;
  logs.push(`${current}→${to}:${amount}🥒 msg:${msg}`);
  saveAll();
  alert('송금 완료');
  showSection('balance');
  updateRanking();
  updateLogs();
}

// ==== 관리자 ====
function adjustBalance() {
  const u = adminUser.value;
  const a = parseInt(adjustAmt.value);
  if (!a) return alert('금액 입력');
  users[u].balance += a;
  logs.push(`🛠 ${u}잔액${a>0?'+':''}${a}`);
  saveAll(); alert('조정 완료');
  updateRanking();
}

function toggleBan() {
  const u = banUser.value;
  users[u].banned = !users[u].banned;
  logs.push(`🚫 ${u} ${users[u].banned?'정지':'해제'}`);
  saveAll(); alert(users[u].banned?'정지됨':'해제됨');
}

function updateRanking() {
  rankList.innerHTML='';
  Object.entries(users)
    .sort((a,b)=>b[1].balance - a[1].balance)
    .forEach(([u,d],i)=> {
      rankList.innerHTML += `<li>${i+1}. ${u}: ${d.balance}🥒 ${d.banned?'(정지)':''}</li>`;
    });
}

function updateLogs() {
  logOutput.textContent = logs.join('\n');
}

// ==== 초기화 ====
auth.classList.remove('hidden');
app.classList.add('hidden');
