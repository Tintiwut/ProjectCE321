import './index.css';

/*-----------------------------------------------------------------------------------------------*/  
// กำหนดตัวแปรสำหรับการใช้งาน
const startIncomeCategoryBtn = document.getElementById('startIncomeCategoryBtn');
const startIncomePriceBtn = document.getElementById('startIncomePriceBtn');
const startIncomeSaveBtn = document.getElementById('startIncomeSaveBtn');
const outputIncomeList = document.getElementById('outputIncomeList');

const startExpenseCategoryBtn = document.getElementById('startExpenseCategoryBtn');
const startExpensePriceBtn = document.getElementById('startExpensePriceBtn');
const startExpenseSaveBtn = document.getElementById('startExpenseSaveBtn');
const outputExpenseList = document.getElementById('outputExpenseList');

const outputTransactionList = document.getElementById('outputTransactionList');
//const totalIncome = document.getElementById('totalIncome');
//const totalExpense = document.getElementById('totalExpense');
const result = document.getElementById('result');
const Ask = document.getElementById('Ask');
const title = document.getElementById('title');

const clearLocalStorageBtn = document.getElementById('clearLocalStorageBtn');

let totalIncomeAmount = 0;
let totalExpenseAmount = 0;
let incomeCategory = '';
let incomePrice = 0;
let expenseCategory = '';
let expensePrice = 0;

/*-------------------------------------------------------------API----------------------------------------------------*/
// ตรวจสอบว่าเบราว์เซอร์รองรับ Web Speech API หรือไม่
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    title.textContent = 'เว็บบันทึกรายรับรายจ่าย';
    document.getElementById('error-message').innerHTML = '';
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // กำหนดฟังก์ชันสำหรับการรับเสียงของรายรับและรายจ่าย
    const recognitionIncomeCategory = new SpeechRecognition();
    const recognitionIncomePrice = new SpeechRecognition();
    const recognitionExpenseCategory = new SpeechRecognition();
    const recognitionExpensePrice = new SpeechRecognition();

    // ตั้งค่าภาษาเป็นภาษาไทย
    recognitionIncomeCategory.lang = 'th-TH';
    recognitionIncomePrice.lang = 'th-TH';
    recognitionExpenseCategory.lang = 'th-TH';
    recognitionExpensePrice.lang = 'th-TH';

    // กำหนดฟังก์ชันเมื่อมีการรับเสียงของประเภทรายรับ
    recognitionIncomeCategory.onresult = function(event) {
        incomeCategory = event.results[0][0].transcript;
        outputIncomeList.innerHTML = `ประเภท: ${incomeCategory}`;
    };

    // กำหนดฟังก์ชันเมื่อมีการรับเสียงของราคารายรับ
    recognitionIncomePrice.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const priceString = transcript.replace(/,/g, '');
        const price = parseFloat(priceString);
        if (!isNaN(price)) {
            incomePrice = price
            outputIncomeList.innerHTML += " | ";
            outputIncomeList.innerHTML += `ราคา: ${price.toLocaleString('th-TH')}`;
            outputIncomeList.innerHTML += `<button id="clearBtn" type="clearBtn" onclick="clearBtnIn()">ลบข้อมูล</button>`;
        }
    };

    // เมื่อคลิกที่ปุ่ม "พูดราคา" รายรับ
    startIncomeCategoryBtn.addEventListener('click', function() {
        recognitionIncomeCategory.start();
    });

    // เมื่อคลิกที่ปุ่ม "พูดราคา" รายรับ
    startIncomePriceBtn.addEventListener('click', function() {
        recognitionIncomePrice.start();
    });

    // เมื่อคลิกที่ปุ่ม "บันทึก" รายรับ
    startIncomeSaveBtn.addEventListener('click', function() {

        // สร้างวันที่และเวลาปัจจุบัน
        const currentDateTime = new Date();
        const dateTimeString = currentDateTime.toLocaleString('th-TH');

        // เพิ่มข้อมูลบันทึกในรายการรายรับ-รายจ่าย
        outputTransactionList.innerHTML += `<p type="in">+ รายรับ ${incomeCategory} ${incomePrice.toFixed(2)} บาท - วันที่และเวลา: ${dateTimeString}</p>`;
        totalIncomeAmount += incomePrice;

        // ล้างข้อมูลที่แสดงในรายรับ
        incomeCategory = '';
        incomePrice = 0;
        outputIncomeList.innerHTML = '';

        // บันทึกข้อมูลลงใน local storage
        saveTransactions();
        updateBalance();

        // คำนวณผลรวมของการลบรายรับกับรายจ่าย
        const balance = totalIncomeAmount - totalExpenseAmount;
        result.textContent = `คงเหลือ: ${balance.toFixed(2)} บาท`;
    });

/*-------------------------------------------------------------------------จ่าย---------------------------------------------------------------*/
    // กำหนดฟังก์ชันเมื่อมีการรับเสียงของประเภทรายจ่าย
    recognitionExpenseCategory.onresult = function(event) {
        expenseCategory = event.results[0][0].transcript;
        outputExpenseList.innerHTML = `ประเภท: ${expenseCategory}`;
    };

    // กำหนดฟังก์ชันเมื่อมีการรับเสียงของราคารายจ่าย
    recognitionExpensePrice.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        const priceString = transcript.replace(/,/g, '');
        const price = parseFloat(priceString);
        if (!isNaN(price)) {
            expensePrice = price;
            outputExpenseList.innerHTML += " | ";
            outputExpenseList.innerHTML += `ราคา: ${transcript}`;
            outputExpenseList.innerHTML += `<button id="clearBtn" type="clearBtn" onclick="clearBtnEx()">ลบข้อมูล</button>`;
        }
    };

    // เมื่อคลิกที่ปุ่ม "พูดประเภท" รายจ่าย
    startExpenseCategoryBtn.addEventListener('click', function() {
        recognitionExpenseCategory.start();
    });

    // เมื่อคลิกที่ปุ่ม "พูดราคา" รายจ่าย
    startExpensePriceBtn.addEventListener('click', function() {
        recognitionExpensePrice.start();
    });

    // เมื่อคลิกที่ปุ่ม "บันทึก" รายจ่าย
    startExpenseSaveBtn.addEventListener('click', function() {
        // สร้างวันที่และเวลาปัจจุบัน
        const currentDateTime = new Date();
        const dateTimeString = currentDateTime.toLocaleString('th-TH');

        // เพิ่มข้อมูลบันทึกในรายการรายรับ-รายจ่าย
        outputTransactionList.innerHTML += `<p type="ex">- รายจ่าย ${expenseCategory} ${expensePrice.toFixed(2)} บาท - วันที่และเวลา: ${dateTimeString}</p>`;
        totalExpenseAmount += expensePrice;
        // ล้างข้อมูลที่แสดงในรายจ่าย
        expenseCategory = '';
        expensePrice = 0;
        outputExpenseList.innerHTML = '';

        // บันทึกข้อมูลลงใน local storage
        saveTransactions();

        // คำนวณผลรวมของการลบรายรับกับรายจ่าย
        updateBalance()
    });

     // เมื่อหน้าเว็บโหลดเสร็จ
    window.addEventListener('load', function() {
    loadTransactions();
    updateBalance();
    });

    /*----------------------------------------------------------------*/
    function loadTransactions() {
        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
            const parsedTransactions = JSON.parse(savedTransactions);
            if (parsedTransactions) {
                totalIncomeAmount = parsedTransactions.totalIncome;
                totalExpenseAmount = parsedTransactions.totalExpense;
                outputTransactionList.innerHTML = parsedTransactions.transactionList;
    
                // เพิ่มปุ่มลบ JSON ในแต่ละบรรทัด
                const transactionItems = outputTransactionList.querySelectorAll('p');
                transactionItems.forEach(item => {
                    if (!item.querySelector('button') == 1) {
                        const deleteButton = document.createElement('button');
                        deleteButton.classList.add("delete-btn");
                        deleteButton.textContent = 'ลบข้อมูล';
                        deleteButton.addEventListener('click', function() {
                            // ลบรายการที่มีปุ่มลบถูกคลิก
                            item.remove();
                            // ปรับปรุงข้อมูลใน local storage
                            saveTransactions();  

                            updateBalance();
        
                            // อัปเดตค่า totalIncomeAmount และ totalExpenseAmount
                            totalIncomeAmount = calculateTotalIncome();
                            totalExpenseAmount = calculateTotalExpense();                 
                            });
                        item.appendChild(deleteButton);
                    }
                });
            }
        }
    }
    
    
    /*----------------------------------------------------------------*/
    function updateBalance() {
        // คำนวณรายรับและรายจ่ายใหม่
        const totalIncomeAmount = calculateTotalIncome();
        const totalExpenseAmount = calculateTotalExpense();
    
        // คำนวณค่าคงเหลือใหม่
        const balance = totalIncomeAmount - totalExpenseAmount;
        result.textContent = `คงเหลือ: ${balance.toFixed(2)} บาท`;
    }
    
    function saveTransactions() {
        // บันทึกรายการธุรกรรมลงใน Local Storage
        const transactions = {
            totalIncome: totalIncomeAmount,
            totalExpense: totalExpenseAmount,
            transactionList: outputTransactionList.innerHTML
        };
    
        localStorage.setItem('transactions', JSON.stringify(transactions));
    
        // อัปเดตค่าคงเหลือ
        //updateBalance();
    }
    
    function calculateTotalIncome() {
        let totalIncome = 0;
        const transactionItems = outputTransactionList.querySelectorAll('p');
        transactionItems.forEach(item => {
            const incomeText = item.textContent;
            if (incomeText.startsWith('+')) { // ใช้ startsWith('+') แทน includes('+') เพื่อความแม่นยำ
                const incomeValue = parseFloat(incomeText.split(' ')[3]); // เปลี่ยนจาก index 2 เป็น 3 เนื่องจากการ split แล้ว
                if (!isNaN(incomeValue)) {
                    totalIncome += incomeValue;
                }
            }
        });
        return totalIncome;
    }
    
    function calculateTotalExpense() {
        let totalExpense = 0;
        const transactionItems = outputTransactionList.querySelectorAll('p');
        transactionItems.forEach(item => {
            const expenseText = item.textContent;
            if (expenseText.startsWith('-')) { // ใช้ startsWith('-') แทน includes('-') เพื่อความแม่นยำ
                const expenseValue = parseFloat(expenseText.split(' ')[3]); // เปลี่ยนจาก index 2 เป็น 3 เนื่องจากการ split แล้ว
                if (!isNaN(expenseValue)) {
                    totalExpense += expenseValue;
                }
            }
        });
        return totalExpense;
    }
    
    
/*-------------------------------------------------------button-------------------------------------------------*/    

    clearLocalStorageBtn.addEventListener('click', function() {
        localStorage.removeItem('transactions');
        loadTransactions(); // โหลดข้อมูลใหม่หลังจากล้างข้อมูล
    });

    // สร้างฟังก์ชันสำหรับการลบข้อมูลที่ถูกพูด
    function clearBtnIn() {
        incomeCategory = '';
        incomePrice = 0;
        outputIncomeList.innerHTML = '';
        updateBalance();
    };

    function clearBtnEx() {        
        expenseCategory = '';
        expensePrice = 0;
        outputExpenseList.innerHTML = '';
        updateBalance();
    };

    Ask.addEventListener('click', function() {
        window.alert('************วิธีการใช้งาน************' + `\n กดปุ่มรายการ 1 ครั้ง : พูดสิ่งที่อยากบันทึก \n กดปุ่มราคา 1 ครั้ง : พูดราคาที่ต้องการบันทึก` + 
        `\n กดปุ่มบันทึก : เพื่อบันทึกข้อมูล\n กดปุ่มลบรายการ : เพื่อแก้ไขสิ่งที่จะบันทึก \n กดปุ่มล้างข้อมูล : เพื่อล้างข้อมูลที่บันทึกไว้` +
        '\n Note : MobilePhone อาจใช้เวลานานในการใช้งาน API โปรดรอเมื่อกดปุ่ม');
    });

} else {
    // แสดงข้อความแจ้งเตือนเมื่อเบราว์เซอร์ไม่รองรับ Web Speech API
    alert('เบราว์เซอร์ของคุณไม่รองรับ Web Speech API');
    title.textContent = 'เบราว์เซอร์ของคุณไม่รองรับ Web Speech API';
    document.getElementById('error-message').innerHTML = 'เบราว์เซอร์ของคุณไม่รองรับ Web Speech API';
}
