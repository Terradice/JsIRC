const crypto = require('crypto');

let cryp = {};

cryp.encrypt = function (KEY, normalText) {
    const cipher = crypto.createCipher('aes-192-cbc', KEY);
    var encrypted = cipher.update(normalText, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

cryp.decrypt = function (KEY, encryptedText) {
    const decipher = crypto.createDecipher('aes-192-cbc', KEY);
    var decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};

module.exports = cryp;