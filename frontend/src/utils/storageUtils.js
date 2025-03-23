export const saveEncryptedPrivateKey = async (encryptedPrivateKey, salt, iv) => {
    // const encryptedPrivateKeyBase64 = encryptedPrivateKey;
    // const saltBase64 = salt;
    // const ivBase64 = iv;  // เก็บ IV ในรูป Base64

    return new Promise((resolve, reject) => {
        const request = indexedDB.open("E2EE_Chat_DB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const store = db.createObjectStore("keys", { keyPath: "id" });
            store.createIndex("privateKeyIndex", "id", { unique: true });
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("keys", "readwrite");
            const store = transaction.objectStore("keys");

            store.put({
                id: "privateKey",  // Unique identifier for the data
                encryptedPrivateKey: encryptedPrivateKey,  // Store as Base64 string
                salt: salt,  // Store salt as Base64 string
                iv: iv  // Store IV as Base64 string
            });

            transaction.oncomplete = () => resolve(true);
        };

        request.onerror = (event) => reject(event.target.error);
    });
};


export const getEncryptedPrivateKey = async () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("E2EE_Chat_DB", 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("keys", "readonly");
            const store = transaction.objectStore("keys");
            const getRequest = store.get("privateKey");

            getRequest.onsuccess = () => {
                if (getRequest.result) {
                    const encryptedPrivateKey = getRequest.result.encryptedPrivateKey;
                    const salt = getRequest.result.salt;
                    const iv = getRequest.result.iv;  
                    resolve({ encryptedPrivateKey, salt, iv });
                } else {
                    reject("Private key not found in the database.");
                }
            };

            getRequest.onerror = () => reject(getRequest.error);
        };

        request.onerror = (event) => reject(event.target.error);
    });
};


