// Utility to handle Web Crypto API operations

export const generateKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-PSS",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["sign", "verify"]
    );
    return keyPair;
};

export const exportPublicKey = async (key) => {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported));
    const exportedAsBase64 = window.btoa(exportedAsString);
    return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PUBLIC KEY-----`;
};

export const exportPrivateKey = async (key) => {
    const exported = await window.crypto.subtle.exportKey("pkcs8", key);
    const exportedAsString = String.fromCharCode.apply(null, new Uint8Array(exported));
    const exportedAsBase64 = window.btoa(exportedAsString);
    return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`;
};

export const importPrivateKey = async (pem) => {
    // fetch the part of the PEM string between header and footer
    const pemHeader = "-----BEGIN PRIVATE KEY-----";
    const pemFooter = "-----END PRIVATE KEY-----";
    const pemContents = pem.substring(pem.indexOf(pemHeader) + pemHeader.length, pem.indexOf(pemFooter));
    // base64 decode the string to get the binary data
    const binaryDerString = window.atob(pemContents);
    // convert from a binary string to an ArrayBuffer
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    return await window.crypto.subtle.importKey(
        "pkcs8",
        binaryDer.buffer,
        {
            name: "RSA-PSS",
            hash: "SHA-256",
        },
        true,
        ["sign"]
    );
};

export const signData = async (privateKey, data) => {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    const signature = await window.crypto.subtle.sign(
        {
            name: "RSA-PSS",
            saltLength: 32,
        },
        privateKey,
        encodedData
    );
    return signature;
};

export const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};
