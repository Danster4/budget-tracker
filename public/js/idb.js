let db;

const request = indexedDB.open("budget-tracker", 1);

function saveRecord(t){
  db.transaction(["new_transaction"],"readwrite")
  .objectStore("new_transaction")
  .add(t)
};
  
function uploadTransactions(){
  const t = db.transaction(["new_transaction"],"readwrite")
  .objectStore("new_transaction")
  .getAll();
  
  t.onsuccess = function(){
    t.result.length > 0 && fetch("/api/transaction/bulk", 
    { method: "POST", body: JSON.stringify(t.result), headers: { Accept:"application/json, text/plain, */*","Content-Type":"application/json"}})
    .then(t => {
      if(t.message) 
      throw new Error(t);
      
      db.transaction(["new_transaction"],"readwrite")
        .objectStore("new_transaction")
        .clear(),alert("All saved transactions has been submitted!")})
        .catch(t => { console.log(t) })
  } 
}; 

request.onerror = function(t){
  console.log(t.target.errorCode) 
},

request.onupgradeneeded = function(t){
  t.target.result.createObjectStore("new_transaction",{autoIncrement:!0})
},

request.onsuccess = function(t){ 
  db = t.target.result,
  navigator.onLine && uploadTransactions()
},
    

window.addEventListener("online", uploadTransactions);
