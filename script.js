let balance = 1000; // 시작 금액 (1000 오이)
let transactionHistory = [];

function updateBalance() {
    document.getElementById('balance-amount').innerText = `${balance} 오이`;
}

function showTransferForm() {
    document.getElementById('transfer-form').style.display = 'block';
    document.getElementById('deposit-form').style.display = 'none';
    document.getElementById('loan-form').style.display = 'none';
}

function showDepositForm() {
    document.getElementById('deposit-form').style.display = 'block';
    document.getElementById('transfer-form').style.display = 'none';
    document.getElementById('loan-form').style.display = 'none';
}

function showLoanForm() {
    document.getElementById('loan-form').style.display = 'block';
    document.getElementById('transfer-form').style.display = 'none';
    document.getElementById('deposit-form').style.display = 'none';
}

function closeForm(formId) {
    document.getElementById(formId).style.display = 'none';
}

function transferMoney() {
    const transferId = document.getElementById('transfer-id').value;
    const amount = parseInt(document.getElementById('transfer-amount').value);
    
    if (amount > 0 && amount <= balance) {
        balance -= amount;
        transactionHistory.push({ type: '송금', amount: amount, to: transferId });
        alert(`성공적으로 송금되었습니다! 상대방 ID: ${transferId}, 금액: ${amount} 오이`);
        updateBalance();
    } else {
        alert('잔액이 부족하거나 잘못된 금액입니다.');
    }
    closeForm('transfer-form');
}

function depositMoney() {
    const amount = parseInt(document.getElementById('deposit-amount').value);
    
    if (amount > 0) {
        balance += amount;
        transactionHistory.push({ type: '입금', amount: amount });
        alert(`성공적으로 입금되었습니다! 금액: ${amount} 오이`);
        updateBalance();
    } else {
        alert('잘못된 금액입니다.');
    }
    closeForm('deposit-form');
}

function loanMoney() {
    const amount = parseInt(document.getElementById('loan-amount').value);
    
    if (amount > 0) {
        balance += amount;
        transactionHistory.push({ type: '대출', amount: amount });
        alert(`성공적으로 대출되었습니다! 금액: ${amount} 오이`);
        updateBalance();
    } else {
        alert('잘못된 금액입니다.');
    }
    closeForm('loan-form');
}

updateBalance();
