// — 마스터 정보
const masterId   = "정후교";
const masterPw   = "302118";
let currentUser  = null;
let isMaster     = false;

// — LocalStorage 유틸
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "{}");
}
function saveUsers(u) {
  localStorage.setItem("users", JSON.stringify(u));
}

// — 화면 전환
function showSignup(){
  qs("#login-screen").classList.add("hidden");
  qs("#signup-screen").classList.remove("hidden");
}
function showLogin(){
  qs("#signup-screen").classList.add("hidden");
  qs("#login-screen").classList.remove("hidden");
}
function toggleSidebar(){
  qs("#menu").classList.toggle("hidden");
}

// — 회원가입 (초기 0 오이)
function signup(){
  const id = qs("#signup-id").value.trim();
  const pw = qs("#signup-pw").value;
  let users = getUsers();
  if(!id||!pw) return alert("아이디와 비밀번호 입력!");
  if(users[id]||id===masterId) return alert("이미 존재하는 아이디!");
  users[id] = { pw, balance:0 };
  saveUsers(users);
  alert("🎉 가입 성공! 초기 오이 0 입니다.");
  showLogin();
}

// — 로그인
function login(){
  const id = qs("#login-id").value.trim();
  const pw = qs("#login-pw").value;
  const users = getUsers();
  if(id===masterId&&pw===masterPw){
    isMaster=true; currentUser=id;
  } else if(users[id]&&users[id].pw===pw){
    isMaster=false; currentUser=id;
  } else {
    return alert("❌ 로그인 실패");
  }
  qs("#login-screen, #signup-screen").forEach(el=>el.classList.add("hidden"));
  qs("#home-screen").classList.remove("hidden");
  qs("#welcome-text").innerText=`🥳 ${currentUser}님 환영합니다!`;
  showTab("balance");
}

// — 로그아웃
function logout(){
  currentUser=null; isMaster=false;
  location.reload();
}

// — 탭 전환 & 렌더
function showTab(tab){
  const users = getUsers();
  let html="";
  if(tab==="balance"){
    html=`<h2>💰 내 잔액</h2><p>${users[currentUser]?.balance||0} 오이</p>`;
  }
  if(tab==="transfer"){
    html=`<h2>💸 송금</h2>
      <select id="recipient">${
        Object.keys(users).filter(u=>u!==currentUser)
          .map(u=>`<option value="${u}">${u}</option>`).join("")
      }</select>
      <input type="number" id="amount" placeholder="금액" />
      <button class="btn" onclick="sendMoney()">▶️ 보내기</button>`;
  }
  if(tab==="members"){
    html=`<h2>👥 회원 목록</h2><ul>${
      Object.entries(users).map(([u,d])=>
        `<li>${u}${isMaster?` - ${d.balance} 오이`:``}</li>`
      ).join("")
    }</ul>`;
    if(isMaster){
      html+=`
        <h3>🔧 잔액 조작</h3>
        <input id="edit-id" placeholder="대상 아이디" />
        <input id="edit-amount" type="number" placeholder="+/- 오이" />
        <button class="btn" onclick="editBalance()">수정</button>
        <h3>❌ 계정 삭제</h3>
        <input id="del-id" placeholder="삭제할 아이디" />
        <button class="btn logout" onclick="deleteUser()">삭제</button>`;
    }
  }
  if(tab==="ranking"){
    const ranked = Object.entries(users).sort((a,b)=>b[1].balance-a[1].balance);
    html=`<h2>🏆 순위</h2><ol>${
      ranked.map(([u,d])=>`<li>${u} - ${d.balance} 오이</li>`).join("")
    }</ol>`;
  }
  qs("#tab-content").innerHTML=html;
}

// — 송금
function sendMoney(){
  const to = qs("#recipient").value;
  const amt = parseInt(qs("#amount").value,10);
  const users = getUsers();
  if(!users[to]||!amt||amt<=0) return alert("❗️ 유효하지 않은 입력");
  if(users[currentUser].balance<amt) return alert("잔액 부족");
  users[currentUser].balance-=amt;
  users[to].balance+=amt;
  saveUsers(users);
  alert(`✅ ${to}님께 ${amt} 오이 송금 완료`);
  showTab("balance");
}

// — 계정 삭제
function deleteUser(){
  const id=qs("#del-id").value.trim();
  let users=getUsers();
  if(!id||!users[id]||id===masterId) return alert("삭제 불가");
  delete users[id];
  saveUsers(users);
  alert(`${id} 계정 삭제됨`);
  showTab("members");
}

// — 잔액 조작
function editBalance(){
  const id=qs("#edit-id").value.trim();
  const delta=parseInt(qs("#edit-amount").value,10);
  let users=getUsers();
  if(!users[id]||isNaN(delta)) return alert("❗️ 유효하지 않은 입력");
  users[id].balance = Math.max(0,(users[id].balance||0)+delta);
  saveUsers(users);
  alert(`✅ ${id}님의 잔액이 ${delta>=0?"+":""}${delta} 오이 변경됨`);
  showTab("members");
}

// — 마스터 초기 삽입
(function initMaster(){
  let users=getUsers();
  if(!users[masterId]){
    users[masterId]={ pw:masterPw, balance:0 };
    saveUsers(users);
  }
})();

// — 간단 qs 헬퍼
function qs(sel){ return sel.split(",").map(s=>document.querySelector(s.trim())); }
