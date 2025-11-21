// Simple in-memory store for the Private Key
// This is lost on page refresh, satisfying "private key in memory" requirement.

let privateKey = null;

export const setPrivateKey = (key) => {
    privateKey = key;
};

export const getPrivateKey = () => {
    return privateKey;
};
