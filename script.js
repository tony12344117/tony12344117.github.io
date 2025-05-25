// script.js
사용자에게 = JSON.parse(localStorage.getItem("사용자") || {};
currentUser = localStorage.getItem("currentUser")을 허용합니다;

// 페이지 로드 시
window.onload = () => {
 만약 (현재 사용자 & 사용자 [현재 사용자]) {
 showHome();
  }
}

// 계정 만들기
document.getElementById("btn-register").온클릭 = () => {
 const id = document.getElementById("reg-id").value.trim();
 const pw = document.getElementById("reg-pw") 값;
 const msg = document.getElementById("register-msg");
 msg.innerText = "";
  
 만약 (!id || !pw) {
 msg.innerText = "모든 항목을 입력하세요.";
 반환;
  }
  한다면 (사용자[ID]) {
 msg.innerText = "이미 존재하는 아이디입니다.";
 반환;
  }
  // 계정 생성
 사용자 [id] = {비밀번호: pw, 잔액: 0 };
 로컬 스토리지.setItem("사용자", JSON.stringify(사용자));
 msg.innerText = "계정이 생성되었습니다. 아래에서 로그인하세요.";
}

// 로그인
document.getElementById("btn-login").온클릭 = () => {
 const id = document.getElementById("login-id").value.trim();
 const pw = document.getElementById("login-pw") 값;
 const msg = document.getElementById("login-msg");
 msg.innerText = "";
  
 만약 (사용자[아이디] & 사용자[아이디].비밀번호 === pw) {
 현재 사용자 = ID;
 로컬 스토리지.setItem("currentUser", currentUser);
 showHome();
  } 또 다른 {
 msg.innerText = "아이디 또는 비밀번호가 잘못되었습니다.";
  }
}

// 홈 화면으로 전환
function showHome() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("home-section").style.display = "block";
  updateContent("<h2>좌측 메뉴를 선택하세요.</h2>");
}

// 컨텐츠 갱신
function updateContent(html) {
  document.getElementById("content").innerHTML = html;
}

// 사이드바 토글
document.getElementById("menu-toggle").onclick = () => {
  document.getElementById("sidebar").classList.toggle("hidden");
};

// 현재 잔액 보기
function showBalance() {
  const balance = users[currentUser].balance;
  updateContent(`<h2>현재 잔액: ${balance} 오이</h2>`);
}

// 송금 화면
function showTransfer() {
  const others = Object.keys(users).filter(u => u !== currentUser);
 옵션 = "";
 만약 (others.길이 === 0) {
 옵션 = '<옵션 비활성화>가입된 사용자가 없습니다.</옵션>;
  } 또 다른 {
 옵션 = others.map(u => '<option value="${u}">${u}<option>).join(");
  }
  업데이트 내용(`
 <h2>송금하기</h2>
 <선택 ID="recipient">${옵션들}</select><br/>
 <입력 유형="number" id="금액" 자리 표시자="금액 입력" /><br/>
 <버튼 클릭="돈 보내기()">송금</버튼>
 `);
}

// 송금 처리
기능. 송금() {
 const to = document.getElementById("수신자") 값;
 const 금액 = parseInt(document.getElementById("금액") 값, 10);
 만약 (!to ||가 NaN(금액) || 금액 <= 0) {인 경우
 alert("유효한 정보를 입력하세요.");
 반환;
  }
 if (users[currentUser].balance < 금액) {
 alert("잔액이 부족합니다.");
 반환;
  }
 사용자[현재 사용자] 잔액 -= 금액;
 사용자[to].잔액 += 금액;
 로컬 스토리지.setItem("사용자", JSON.stringify(사용자));
 alert(`${to}님께 ${amount} 오이를 송금했습니다.`);
 showBalance();
}

// 입금 안내
기능. 보증금 표시() {
 updateContent("<h2>학교에서 사업시간에 정후교한테 찾아와서 말하세요.</h2>);
}

// 출금 안내
기능. 쇼인드로우() {
 updateContent("<h2>학교에 와서 정후교한테 말하세요.</h2>);
}
