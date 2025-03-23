// Function to open a connection to IndexedDB
const openIndexedDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ChatDD", 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore("privateKeys", { keyPath: "id" });
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = () => reject(request.error);
    });
};


// Function to store the encrypted private key in IndexedDB
export const saveEncryptedPrivateKey = async (encryptedPrivateKey, salt) => {
    const db = await openIndexedDB();
    const tx = db.transaction("privateKeys", "readwrite");
    const store = tx.objectStore("privateKeys");

    // Convert the encrypted private key and salt to Base64
    const base64EncryptedKey = btoa(String.fromCharCode(...encryptedPrivateKey));
    const base64Salt = btoa(String.fromCharCode(...salt));

    store.put({ id: "privateKey", encryptedPrivateKey: base64EncryptedKey, salt: base64Salt });

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

// Function to retrieve the encrypted private key from IndexedDB
export const getEncryptedPrivateKey = async (password) => {
    const db = await openIndexedDB();
    const tx = db.transaction("privateKeys", "readonly");
    const store = tx.objectStore("privateKeys");

    return new Promise((resolve, reject) => {
        const request = store.get("privateKey");

        request.onsuccess = async (event) => {
            const data = event.target.result;
            if (!data) {
                reject("No private key found in IndexedDB");
                return;
            }

            // Convert the Base64 data back to Uint8Array
            const encryptedPrivateKey = new Uint8Array(atob(data.encryptedPrivateKey).split("").map(c => c.charCodeAt(0)));
            const salt = new Uint8Array(atob(data.salt).split("").map(c => c.charCodeAt(0)));

            // Return the data without decrypting it
            resolve({ encryptedPrivateKey, salt });
        };

        request.onerror = () => reject(request.error);
    });
};
