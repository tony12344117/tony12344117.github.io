const master = { id: '정후교', pass: '302118' };
let users = JSON.parse(localStorage.getItem('users') || '{}');
let logs = JSON.parse(localStorage.getItem('logs') || '[]');
let current = null;

function save() {
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('logs', JSON.stringify(logs));
}

function register() {
  const name = document.getElementById('authName').value.trim();
  const pass = document.getElementById('authPass').value;
  if (!name || !pass) return alert('이름과 비밀번호를 입력하세요');
  if (users[name]) return alert('이미 존재하는 이름입니다');
  users[name] = { pass, balance: 0, banned: false };
  save();
  alert('계정이 생성되었습니다');
}

function login() {
  const name = document.getElementById('authName').value.trim();
  const pass = document.getElementById('authPass').value;
  if (!users[name] && !(name === master.id && pass === master.pass)) return alert('계정이 없습니다');
  if (name !== master.id && users[name].pass !== pass) return alert('비밀번호가 틀렸습니다');
  if (users[name]?.banned) return alert('이 계정은 정지되었습니다');
  current = name;
  document.getElementById('auth').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('currentUser').innerText = name;
  updateRecipientList();
  updateRanking();
  if (name === master.id) {
    document.getElementById('adminPanel').classList.remove('hidden');
  } else {
    document.getElementById('adminPanel').classList.add('hidden');
  }
  showSection('balance');
}

function logout() {
  current = null;
  document.getElementById('app').classList.add('hidden');
  document.getElementById('auth').classList.remove('hidden');
}

function showSection(id) {
  ['balance', 'send', 'deposit', 'withdraw', 'ranking'].forEach(s => {
    document.getElementById(s).classList.add('hidden');
  });
  document.getElementById(id).classList.remove('hidden');
  if (id === 'balance') {
    document.getElementById('balance').innerText = `🥒 잔액: ${users[current]?.balance ?? 0} 오이`;
  }
}

function updateRecipientList() {
  const sel = document.getElementById('recipientList');
  const adminSel = document.getElementById('adminUserList');
  sel.innerHTML = '';
  adminSel.innerHTML = '';
  Object.keys(users).forEach(name => {
    if (name !== current) sel.innerHTML += `<option>${name}</option>`;
    adminSel.innerHTML += `<option>${name}</option>`;
  });
}

function sendMoney() {
  const to = document.getElementById('recipientList').value;
  const amount = parseInt(document.getElementById('sendAmount').value);
  const msg = document.getElementById('sendMsg').value.trim();
  if (!amount || amount <= 0) return alert('유효한 금액을 입력하세요');
  if (!msg || msg.length > 80) return alert('메시지를 1자 이상 80자 이내로 입력하세요');
  if (users[current].balance < amount) return alert('잔액 부족');
  users[current].balance -= amount;
  users[to].balance += amount;
  logs.push(`${current} → ${to} : ${amount}🥒 | 메시지: ${msg}`);
  save();
  alert('송금 완료');
  document.getElementById('sendAmount').value = '';
  document.getElementById('sendMsg').value = '';
  updateRanking();
  showSection('balance');
}

function adjustBalance() {
  const name = document.getElementById('adminUserList').value;
  const amount = parseInt(document.getElementById('adminAdjust').value);
  if (!amount) return alert('금액 입력');
  users[name].balance += amount;
  logs.push(`🛠️ 마스터가 ${name}의 오이를 ${amount > 0 ? '+' : ''}${amount}🥒 ${amount > 0 ? '추가' : '차감'}`);
  save();
  alert('조정 완료');
  updateRanking();
}

function toggleBan() {
  const name = document.getElementById('adminUserList').value;
  users[name].banned = !users[name].banned;
  logs.push(`🚫 마스터가 ${name} 계정을 ${users[name].banned ? '정지' : '해제'}시킴`);
  save();
  alert(users[name].banned ? '계정 정지 완료' : '계정 정지 해제 완료');
}

function updateRanking() {
  const rankList = document.getElementById('rankList');
  rankList.innerHTML = '';
  const arr = Object.entries(users).sort((a,b) => b[1].balance - a[1].balance);
  arr.forEach(([name, data], i) => {
    rankList.innerHTML += `<li>${i+1}위: ${name} - ${data.balance} 🥒${data.banned ? ' (정지됨)' : ''}</li>`;
  });
  if (current === master.id) {
    document.getElementById('logOutput').textContent = logs.join('\n');
  }
}
