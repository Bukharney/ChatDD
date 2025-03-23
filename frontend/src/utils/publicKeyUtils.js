export const savePublicKey = async (publicKey) => {
    // Convert from CryptoKey to ArrayBuffer
    const exportedKey = await window.crypto.subtle.exportKey("spki", publicKey);

    // Convert from ArrayBuffer to Base64
    const exportedKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKey)));

    return new Promise((resolve, reject) => {
        const request = indexedDB.open("E2EE_Chat_DB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore("keys", { keyPath: "id" });
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction("keys", "readwrite");
            const store = transaction.objectStore("keys");
            store.put({ id: "publicKey", key: exportedKeyBase64 });
            resolve(true);
        };

        request.onerror = (event) => reject(event.target.error);
    });
};


export const getPublicKey = async () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("E2EE_Chat_DB", 1);

        request.onsuccess = async (event) => {
            const db = event.target.result;
            const transaction = db.transaction("keys", "readonly");
            const store = transaction.objectStore("keys");
            const getRequest = store.get("publicKey");

            getRequest.onsuccess = async () => {
                const exportedKeyBase64 = getRequest.result.key;
                
                // Convert from Base64 to ArrayBuffer
                const exportedKey = new Uint8Array(atob(exportedKeyBase64).split("").map(c => c.charCodeAt(0)));

                // Convert from ArrayBuffer to CryptoKey
                const publicKey = await window.crypto.subtle.importKey(
                    "spki", 
                    exportedKey, 
                    { name: "RSA-OAEP", hash: "SHA-256" }, 
                    false, 
                    ["encrypt"]
                );
                resolve(publicKey);
            };

            getRequest.onerror = () => reject(getRequest.error);
        };

        request.onerror = (event) => reject(event.target.error);
    });
};
