let db;
const request = indexedDB.open('budget-tracker', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
}


request.onsuccess = function (event) {
    // save ref to db in global variable
    db = event.target.result;

    // check if app is online, if true run uploadTransactions() to send all local db data to api
    if (navigator.onLine) {
        uploadTransactions();
    }
};

// This function will be executed if there is no internet connection
function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    // add record to your store with add method.
    transactionObjectStore.add(record);
};

// this function will be executed when internet connection returns
function uploadTransactions() {
    // open a transaction on local db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access local object store
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // get all records from stroe and set to variable
    const getAllTransactions = transactionObjectStore.getAll();

    // upon a successful .getAll() execution run:
    getAllTransactions.onsuccess = function() {
        // if there was data in indexedDB's store, send it to api server
        if (getAllTransactions.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAllTrans.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 
                    'Content-Type': 'application/json'
                }
            })
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }

                    // open one or more trans
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    // access the new_transaction object store
                    const transactionObjectStore = transaction.objectStore('new_transaction');
                    // clear all trans in store
                    transactionObjectStore.clear();

                    alert('All saved transactions has been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
};

// listen for app coming back online
window.addEventListener('online', uploadTransactions);