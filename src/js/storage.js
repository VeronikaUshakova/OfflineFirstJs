let message = "Browser doesn't support";

function checkLocalStorage() {
  try {
    if (!("localStorage" in window &&
         window["localStorage"] !== null)) {
      throw new Error(`${message} localStorage!`);
    } else {
      return true;
    }
  } catch (err) {
    console.log(err.message);
    return false;
  }
}

function checkSessionStorage() {
  try {
    if (!("sessionStorage" in window &&
         window["sessionStorage"] !== null)) {
      throw new Error(`${message} sessionStorage!`);
    } else {
      return true;
    }
  } catch (err) {
    console.log(err.message);
    return false;
  }
}

function checkIndexDB() {
  try {
    if (!("indexedDB" in window &&
         window["indexedDB"] !== null)) {
      throw new Error(`${message} indexedDB!`);
    } else {
      return true;
    }
  } catch (err) {
    console.log(err.message);
    return false;
  }
}

function saveStorage(key, value, storageType, callback) {
  let check = false;
  let message = "";
  if (storageType === localStorage) {
    check = checkLocalStorage();
    message = "localStorage";
  } else {
    check = checkSessionStorage();
    message = "sessionStorage";
  }
  if (check) {
    storageType.setItem(key, JSON.stringify(value));
    console.log(`saves object to ${message}`);
    if (typeof callback === "function") {
      callback();
    }
  }
}

function saveDB(key, value, storageType, callback, db) {
  if (typeof callback === "function" && checkIndexDB()) {
    if (db === undefined) {
      db = indexedDB.open("Storage", 1);
    }
    let database;
    db.onupgradeneeded = (event) => {
      database = db.result;
      database.createObjectStore("elements");
    };
    db.onsuccess = (event) => {
      database = db.result;
      let transaction = database
        .transaction(["elements"], "readwrite");
      let elements = transaction.objectStore("elements");
      let request = elements.add(value, key);
      request.onsuccess = function () {
        callback();
      };
      request.onerror = (event) => {
        event.preventDefault();
        let requestPUT = elements.put(value, key);
        requestPUT.onsuccess = () => {
          callback();
        };
        requestPUT.onerror = () => {
          console.log("Ошибка", requestPUT.error);
        };
      };
    };
    db.onerror = (event) => {
      console.log("error opening database");
    };
  } else {
    throw new Error("callback is required");
  }
  return db;
}

function getStorage(key, storageType, callback) {
  let check = false;
  let message = "";
  if (storageType === localStorage) {
    check = checkLocalStorage();
    message = "localStorage";
  } else {
    check = checkSessionStorage();
    message = "sessionStorage";
  }
  if (check) {
    let value = storageType.getItem(key);
    let consoleMessage;
    if (value) {
      consoleMessage = `returns ${value}`;
      consoleMessage += ` (${typeof JSON.parse(value)})`;
      consoleMessage += ` from ${message}`;
    } else {
      value = undefined;
      consoleMessage = undefined;
    }
    console.log(consoleMessage);
    if (typeof callback === "function") {
      callback(value);
      return value;
    }
  }
}

function getDB(key, storageType, callback, db) {
  if (typeof callback === "function" && checkIndexDB()) {
    if (db === undefined) {
      db = indexedDB.open("Storage", 1);
    }
    let database;
    db.onupgradeneeded = (event) => {
      database = db.result;
      database.createObjectStore("elements");
    };
    db.onsuccess = (event) => {
      database = db.result;
      let transaction = database
        .transaction(["elements"], "readonly");
      let elements = transaction.objectStore("elements");
      let request = elements.get(key);
      request.onsuccess = () => {
        let value = request.result;
        let consoleMessage = `returns ${value}`;
        consoleMessage += ` (${typeof value})`;
        consoleMessage += " from IndexedDB";
        console.log(consoleMessage);
        callback(value);
      };
      request.onerror = (event) => {
        console.log("Ошибка", request.error);
      };
    };
    db.onerror = (event) => {
      console.log("error opening database");
    };
  } else {
    throw new Error("callback is required");
  }
  return db;
}

function getAllStorage(storageType, callback) {
  let check = false;
  let message = "";
  if (storageType === localStorage) {
    check = checkLocalStorage();
    message = "localStorage";
  } else {
    check = checkSessionStorage();
    message = "sessionStorage";
  }
  if (check) {
    let result = {};
    for (let i = 0; i < storageType.length; i++) {
      result[storageType.key(i)] = JSON.parse(
        storageType.getItem(storageType.key(i))
      );
    }
    if (typeof callback === "function") {
      callback(value);
    }
  }
}

function getAllDB(storageType, callback, db) {
  if (typeof callback === "function" && checkIndexDB()) {
    if (db === undefined) {
      db = indexedDB.open("Storage", 1);
    }
    let database;
    db.onupgradeneeded = (event) => {
      database = db.result;
      database.createObjectStore("elements");
    };
    db.onsuccess = (event) => {
      database = db.result;
      let consoleMessage;
      let transaction = database
        .transaction(["elements"], "readonly");
      let elements = transaction.objectStore("elements");
      let request = elements.getAll();
      let requestKey = elements.getAllKeys();
      let valueKey;
      let value;
      let result = {};
      requestKey.onsuccess = () => {
        valueKey = requestKey.result;
        let request = elements.getAll();
        request.onsuccess = () => {
          value = request.result;
          for (let i = 0; i < value.length; i++) {
            result[valueKey[i]] = value[i];
          }
          if (valueKey && value) {
            callback(value);
          }
        };
        request.onerror = (event) => {
          console.log("Ошибка", request.error);
        };
      };
      requestKey.onerror = (event) => {
        console.log("Ошибка", request.error);
      };
    };
    db.onerror = (event) => {
      console.log("error opening database");
    };
  } else {
    throw new Error("callback is required");
  }
  return db;
}

let Storage = {
  LOCAL_STORAGE: localStorage,
  SESSION_STORAGE: sessionStorage,
  INDEXED_DB: indexedDB,
  _IDB_CONNECTION: undefined,

  save(key, value, storageType, callback) {
    if (arguments.length === 2) {
      storageType = this.LOCAL_STORAGE;
    } else if (arguments.length < 2) {
      throw new Error("Oh, sorry. Error!");
    }

    if (
      storageType === this.LOCAL_STORAGE ||
      storageType === this.SESSION_STORAGE
    ) {
      saveStorage(key, value, storageType, callback);
    } else if (storageType === this.INDEXED_DB) {
      this.INDEXED_DB = saveDB(
        key,
        value,
        storageType,
        callback,
        this._IDB_CONNECTION
      );
    }
  },

  get(key, storageType, callback) {
    if (arguments.length === 1) {
      storageType = this.LOCAL_STORAGE;
    } else if (arguments.length < 1) {
      throw new Error("Oh, sorry. Error!");
    }

    if (
      storageType === this.LOCAL_STORAGE ||
      storageType === this.SESSION_STORAGE
    ) {
      return getStorage(key, storageType, callback);
    } else if (storageType === this.INDEXED_DB) {
      this.INDEXED_DB = getDB(key, storageType,
        callback, this.INDEXED_DB);
    }
  },

  async getAll(storageType, callback) {
    if (arguments.length === 0) {
      storageType = this.LOCAL_STORAGE;
    }
    if (
      storageType === this.LOCAL_STORAGE ||
      storageType === this.SESSION_STORAGE
    ) {
      getAllStorage(storageType, callback);
    } else if (storageType === this.INDEXED_DB) {
      this.INDEXED_DB = getAllDB(storageType, 
        callback, this.INDEXED_DB);
    }
  },
};
