const crypto = require("crypto");
const encryptionType = "aes-256-cbc";
const encryptionEncoding = "base64";
const bufferEncryption = "utf-8";

let cryptData = {
  decrypt: (base64String, AesKey, AesIV) => {
    try {
      const buff = Buffer.from(base64String, encryptionEncoding);
      const key = Buffer.from(AesKey, bufferEncryption);
      const iv = Buffer.from(AesIV, bufferEncryption);
      const decipher = crypto.createDecipheriv(encryptionType, key, iv);
      const deciphered = decipher.update(buff) + decipher.final();
      return JSON.parse(deciphered);
    } catch (err) {
      return null;
    }
  },
};

module.exports = cryptData;
