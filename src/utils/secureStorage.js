import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_STORAGE_KEY || "default-secret-key";

const SecureStorage = {
    setItem: (key, value) => {
        try {
            const jsonValue = JSON.stringify(value);
            const encrypted = CryptoJS.AES.encrypt(jsonValue, SECRET_KEY).toString();
            localStorage.setItem(key, encrypted);
        } catch (error) {
            console.error("Error saving to secure storage", error);
        }
    },

    getItem: (key, defaultValue) => {
        try {
            const encrypted = localStorage.getItem(key);
            if (!encrypted) return defaultValue;

            const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);

            if (!decrypted) return defaultValue;

            return JSON.parse(decrypted);
        } catch (error) {
            console.error("Error reading from secure storage", error);
            return defaultValue;
        }
    },

    removeItem: (key) => {
        localStorage.removeItem(key);
    }
};

export default SecureStorage;
