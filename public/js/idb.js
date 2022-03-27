const indexedDB = 
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB 

// create variable to hold db connection
let db;
// establish a connection to IndexedDB database called 'budget-tracker' and set it to version 1
const request = indexedDB.open('budget-tracker', 1);


// DO WE NEED IT FOR DEPOSITS????
// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function (event) {
  // save a reference to the database 
  const db = event.target.result;
  // create an object store (table) called `new_deposit`, set it to have an auto incrementing primary key of sorts 
  db.createObjectStore('new_deposit', { autoIncrement: true });
};

//DO WE NEED IT FOR WITHDRAWAL?????
// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
// request.onupgradeneeded = function (event) {
//   // save a reference to the database 
//   const db = event.target.result;
//   // create an object store (table) called `new_withdrawal`, set it to have an auto incrementing primary key of sorts 
//   db.createObjectStore('new_withdrawal', { autoIncrement: true });
// };

//event listener created when the connex to db is open
// upon a successful 
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  // check if app is online, if yes run uploadDeposit() function to send all local db data to api
  if (navigator.onLine) {
    // we haven't created this yet, but we will soon, so let's comment it out for now
    uploadDeposit();
  }
};


// This function will be executed if we attempt to submit a new deposit and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions 
  const transaction = db.transaction(['new_deposit'], 'readwrite');

  // access the object store for `new_deposit`
  const depositObjectStore = transaction.objectStore('new_deposit');

  // add record to your store with add method
  depositObjectStore.add(record);
}


//DO WE NEED EVENT LISTENER FOR WITHDRAWAL AND DEPOSIT????
// upon a successful 
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  // check if app is online, if yes run uploadWithdra() function to send all local db data to api
  if (navigator.onLine) {
    // we haven't created this yet, but we will soon, so let's comment it out for now
    uploadWithdrawal();
  }
};

// return error code/message
request.onerror = event =>{
  console.log(event.target.errorCode)
}

// This function will be executed if we attempt to submit a new deposit and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions 
  const transaction = db.transaction(['new_withdrawal'], 'readwrite');

  // access the object store for `new_deposit`
  const withdrawalObjectStore = transaction.objectStore('new_withdrawal');

  // add record to your store with add method
  withdrawalObjectStore.add(record);
}


//function that will handle collecting all of the data from the new_deposit object store in IndexedDB 
//and POST it to the server

function uploadDeposit() {
  // open a transaction on your db
  const transaction = db.transaction(['new_deposit'], 'readwrite');

  // access your object store
  const depositObjectStore = transaction.objectStore('new_deposit');

  // get all records from store and set to a variable
  const getAll = depositObjectStore.getAll();


  // upon a successful .getAll() execution, run this function
  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          return response.json()
        })
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(['new_deposit'], 'readwrite');
          // access the new_deposit object store
          const depositObjectStore = transaction.objectStore('new_deposit');
          // clear all items in your store
          depositObjectStore.clear();

          alert('All saved deposits has been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
}

//function that will handle collecting all of the data from the new_withdrawal object store in IndexedDB 
//and POST it to the server


function uploadWithdrawal() {
  // open a transaction on your db
  const transaction = db.transaction(['new_withdrawal'], 'readwrite');

  // access your object store
  const withdrawalObjectStore = transaction.objectStore('new_withdrawal');

  // get all records from store and set to a variable
  //const getAll = withdrawalObjectStore.getAll();
}

//the .getAll() method is an asynchronous function that we have to attach a
//an event handler to in order to retrieve the data. 
// upon a successful .getAll() execution, run this function
function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll()


  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch('/api/WIthdrawal', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(['new_withdrawal'], 'readwrite');
          // access the new_withdrawal object store
          const withdrawalObjectStore = transaction.objectStore('new_withdrawal');
          // clear all items in your store
          withdrawalObjectStore.clear();

          alert('All saved pizza has been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  };

}

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};


request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};


// listen for app coming back online
window.addEventListener('online', uploadWithdrawal);
window.addEventListener('online', uploadDeposit);