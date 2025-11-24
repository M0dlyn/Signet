// Persist Private Key in localStorage to survive refreshes
const STORAGE_KEY = 'signet_private_key';

export const setPrivateKey = (key) => {
    if (key) {
        localStorage.setItem(STORAGE_KEY, key);
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
};

export const getPrivateKey = () => {
    return localStorage.getItem(STORAGE_KEY);
};
