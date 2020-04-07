// MoneyTransfer class: theme for all money transfers in appliaction
class MoneyTransfer {
    constructor(recipent, accountNum, price, currency, invoiceNum, dateTransfer) {
        this.recipent = recipent;
        this.accountNum = accountNum;
        this.price = price;
        this.currency = currency;
        this.invoiceNum = invoiceNum;
        this.dateTransfer = dateTransfer;
    }

}

// UI class: Handle UI tasks
class UI {

    static getValues() {
        const values = {
        inputRecipent: document.querySelector('#recipent').value,
        inputAccountNum: document.querySelector('#account-number').value,
        inputPrice: document.querySelector('#price').value,
        currency: document.querySelector('#currency').value,
        inputInvoiceNum: document.querySelector('#invoice-number').value,
        inputTransferDate: document.querySelector('#transfer-date').value,
        }

        return values;
    }
    static displayTransfers() {
        // Get transfer from local storage
        const transfers = Storage.getMoneyTransfers();
        // Display in UI 
        transfers.forEach((transfer) => UI.addTransfer(transfer));


    }

    static addTransfer(transferObj) {
        // Get container for transfers from DOM 
        const transfersContainer = document.querySelector('.transfer-list');

        // Create transfer
        const transfer = document.createElement('div');
        transfer.classList.add('transfer-money',`currency-${transferObj.currency}`);

        // Display ID for transfer in UI 
        transfer.setAttribute('id',`${transferObj.ID}`)

        transfer.innerHTML = `<li class="transfer-el">${transferObj.recipent}</li>
        <li class="transfer-el">${transferObj.accountNum}</li>
        <li class="transfer-el">${transferObj.price} ${transferObj.currency}</li>
        <li class="transfer-el">${transferObj.invoiceNum}</li>
        <li class="transfer-el">${transferObj.dateTransfer}</li>
        <li class="transfer-el">
            <input type="checkbox" name="check-transfer" id="check-transfer">
            <label for="check-transfer">Done | </label>
            <a class="btn-delete" href="#">X</a>
        </li>`;

        transfersContainer.appendChild(transfer);

    }

    static deleteTransfer(btn) {
        if(btn.classList.contains('btn-delete')) {

            btn.parentElement.parentElement.remove();
            UI.showMessage('Transfer has been deleted!','message-remove');
        }
    }

    static showMessage(message,className) {
        // Get DOM objects
        const containerDOM = document.querySelector('#container-msg-form');
        const form = document.querySelector('#form-transfer');

        // Create message container with CSS classes
        const messageDiv = document.createElement('div');
        messageDiv.classList.add(`msg`, `${className}`);

        // Create text node message
        const text = document.createTextNode(`${message}`);

        // Append textNode to message
        messageDiv.appendChild(text);

        // Add message into DOM
        const messageDOM = containerDOM.insertBefore(messageDiv, form);
        setTimeout(() => messageDOM.style.opacity = 1, .3);

        // Remove message after 1,5 second
        const removeMessage = () => setTimeout(() => messageDOM.remove(), 1200);
        removeMessage();

    }

    static formatPrice(inputPrice) {
        const price = Math.abs(inputPrice); 
        const twoDecimal = price.toFixed(2);  // input 241234 output 2412.34
        const splitNums = twoDecimal.split('.'); // Array ['241234', '00'];
        let int = splitNums[0];

        if (int.length > 3) {
            int = int.substr(0,int.length - 3) + ' ' + int.substr(int.length - 3, 3); // Output 241,234
        }

        const decimal = splitNums[1];
        const formatNum = int + '.' + decimal;
        
        return formatNum;

    }

    static updateInvoices() {
        //Get DOM info about invoices
        const unpaidIv = document.querySelector('.container-info');
        // Get amount of unpaid invoices 
        const amount = Budget.amountInvoices();
        // Update info about invoices
        if(amount === 0) {
            unpaidIv.innerHTML=`<h2><span style="color: #06a52c">Great!</span> All your invoices <span style="color: #06a52c">was paid</span></h2>`;
        } else if (amount === 1) {
            unpaidIv.innerHTML = `<h2>You have <span style="color: #BC2120">${amount} unpaid</span> invoice</h2>`;
        } else {
            unpaidIv.innerHTML = `<h2>You have <span style="color: #BC2120">${amount} unpaid</span> invoices</h2>`;
        }
        
    }

    static updateTotalPayment() {
        // Get UI Containers
        const containerEUR = document.querySelector('.payments-EUR h2');
        const containerPLN = document.querySelector('.payments-PLN h2');
        // Get object with total unpaid prices
        const totals = Budget.calcTotalPrices();

        // Format outputs prices
        const outputEUR = UI.formatPrice(totals['EUR']);
        const outputPLN = UI.formatPrice(totals['PLN']);

        // Update UI 
        containerEUR.innerHTML = `Total payments in <span class="highlight">€</span>: ${outputEUR}`
        containerPLN.innerHTML = `Total payments in <span class="highlight">PLN</span>: ${outputPLN}`
        
      }

    static transferDone(checkbox) {
        // Get transfer from UI
        const checkingTransfer = checkbox.parentElement.parentElement;
        // checking if checkbox is selected, if it is set class for done transfers 
        if(checkbox.checked === true) {
            checkingTransfer.classList.add('transfer-done')
        } else {
            checkingTransfer.classList.remove('transfer-done');

        }

    }

    static getCheckBoxes () {
        const checkBoxes = document.querySelectorAll('#check-transfer');
        const checkBoxesArr = Array.from(checkBoxes);
        return checkBoxesArr;

    }

    static clearForm() {
        // Get inputs
        const inputs = document.querySelectorAll('#form-transfer > div > input');
        // Crate array of inputs
        const inputsArr = Array.from(inputs);
        // Set them value = empty string
        inputsArr.forEach(input => {input.value = '';})

    }

}



// Validation class: contains functions that check the correct values ​​for the inputs
class Validation {

    static emptyInput(inputsObj) {
        // convert object inputs values into array
        const inputsArr = Object.keys(inputsObj).map(function (key) {
            return inputsObj[key];
        });
        // Check if any of inputs is empty
        const emptyValue = inputsArr.includes('');
        
        return emptyValue;
    }

    static accountNum(accountNum) {
        // Account number must have a minimum of 15 digits
        if (+accountNum.length < 15) {
            return false 
        } else {
            return true;
        }
    }

    static transferDate (date) {
        const transferDate = date;

        const regExp = /^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/gi; // format date dd/mm/yyyy
        

        return regExp.test(transferDate);
    }


}

//  Local Storage class :
class Storage {
    static getMoneyTransfers() {

        let moneyTransfers;
        // If local storage hasn't any item
        if(localStorage.getItem('moneyTransfers') === null) {
            // create empty array
            moneyTransfers = [];
        } else {
            // if has, get this array and parse by JSON method
            moneyTransfers = JSON.parse(localStorage.getItem('moneyTransfers'));
        }
        // return this array
        return moneyTransfers;

    }

    static addMoneyTransfer(transferObj) {
        // Get money transfer array
        const moneyTransfers = Storage.getMoneyTransfers();
        // Create ID for transfer
        transferObj.ID = moneyTransfers.length + 1;
        // Push there our money transfer
        moneyTransfers.push(transferObj);
        // Set them into local storage (it must be object JSON)
        localStorage.setItem('moneyTransfers', JSON.stringify(moneyTransfers));

    }

    static removeTransfer(id) {
        // Get all local storage transfers
        const moneyTransfers = Storage.getMoneyTransfers();

        moneyTransfers.forEach((transfer, index) => {
            // if local storage transfer ID is equal to UI element ID 
            if(transfer.ID === +id) {
                // splice and return this array without element
                moneyTransfers.splice(index,1);

                return moneyTransfers;
            }
        })
        // Update local storage
        localStorage.setItem('moneyTransfers', JSON.stringify(moneyTransfers));


    }
}

// Class Budget: contains information about payments
class Budget {
    
    static calcTotalPrices() {
        // Get all payments from UI 
        const payments = document.querySelectorAll('.transfer-money');
        const paymentsArr = Array.from(payments);

        // Return arrays with string prices when transfer is unpaid
        const strPricesEUR = paymentsArr
        .filter(payment => {
            if(!payment.classList.contains('transfer-done') && payment.classList.contains('currency-€')) {
                return true;
            }
        })
        .map(payment => payment.children[2].innerHTML);

        const strPricesPLN = paymentsArr
        .filter(payment => {
            if(!payment.classList.contains('transfer-done') && payment.classList.contains('currency-PLN')) {
                return true;
            }
        })
        .map(payment => payment.children[2].innerHTML);

        // Convert strings prices into numbers
        const convertStrtoNum = (arrPrice) => {
            const arrWithNums = arrPrice.map(price => price.replace(' ','').replace('.00','').replace('€','').replace('PLN',''))
            .map(price => Number(price));
            return arrWithNums;
        };
        // Sum all payments 
        const calcPayment = (arr) => {
            const totalPayment = arr.reduce((totalPrice, price) => totalPrice + price,0);
            return totalPayment;
        }
        // Converted arrays 
        const pricesEUR = convertStrtoNum(strPricesEUR);
        const pricesPLN = convertStrtoNum(strPricesPLN);
        // Calcuclated payments
        const totalPriceEUR = calcPayment(pricesEUR);
        const totalPricePLN = calcPayment(pricesPLN);

        const totalPrices = {
            EUR: totalPriceEUR,
            PLN: totalPricePLN,
        }

        return totalPrices;
    }
    

    static amountInvoices() {
        // Number of unpaid invoices
        let unpaidInv = 0;
        // Get all invoices
        const payments = document.querySelectorAll('.transfer-money');
        const paymentsArr = [...payments];

        // Filter unpaid invoices
       const undoneTransers = paymentsArr
        .filter(payment => !payment.classList.contains('transfer-done'));

        // Calc them 
        undoneTransers.forEach(() => unpaidInv++);

        return unpaidInv;
        
        
    }

}



// Event: add money transfer to list of transfers
const form = document.querySelector('#form-transfer');

form.addEventListener('submit', function(e) {
    // cancel default behavior for form
    e.preventDefault();

    // Get inputs values
    const inputObj = UI.getValues();

    // Check if user has put valid values into inputs
    if(Validation.emptyInput(inputObj) == true) {
        UI.showMessage('You can not leave empty fields !', 'message-alert')
    } else if (Validation.accountNum(inputObj.inputAccountNum) === false) {
        UI.showMessage('Your account number must have a minimum of 15 digits', 'message-alert');
    } else if(!Validation.transferDate(inputObj.inputTransferDate)) {
        UI.showMessage('Invalid date format!', 'message-alert');
    }
     else {
        // Format inputs 
        const formatPrice = UI.formatPrice(inputObj.inputPrice);
        // Create money transfer
        const moneyTransfer = new MoneyTransfer(inputObj.inputRecipent, inputObj.inputAccountNum, formatPrice, inputObj.currency, inputObj.inputInvoiceNum, inputObj.inputTransferDate)

         // Add transfer to local storage
         Storage.addMoneyTransfer(moneyTransfer);
        
        // Add transfer to UI list
        UI.addTransfer(moneyTransfer);

        // Update info about payments
        UI.updateTotalPayment();

        // Update unpaid invoices
        UI.updateInvoices();

        // Show message after successful added transfer
        UI.showMessage('Your transfer is successful added','message-success')

        // Clear all inputs
        UI.clearForm();
    }

})

// Event: content load 
document.addEventListener('DOMContentLoaded', () => {
    UI.displayTransfers();
    UI.updateInvoices();
    UI.updateTotalPayment();
});

// Event: delete item, checking checkboxes
document.querySelector('.transfer-list').addEventListener('click',(e) => {
    
    // Check if user has clicked checkbox
    if(e.target.type === 'checkbox') {
        // Mark transfer done
        UI.transferDone(e.target);
    }

    // Delete transfer from UI
    UI.deleteTransfer(e.target);

    // Delete transfer from local storage if user clicked button delete
    if(e.toElement.className === 'btn-delete') {
        // ID transfer
        const ID = e.target.parentElement.parentElement.id;
        // Remove element from local storage by ID 
        Storage.removeTransfer(ID);
    }

    // Update info about how much money you need to pay all payments
    UI.updateTotalPayment();

    // Update info about amount unpaid invoices
    UI.updateInvoices();
    

});