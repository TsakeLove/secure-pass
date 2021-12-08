const crypto = require('crypto');
const KMS = require('./aws');
const algorithm = 'aes-256-gcm';


async function encrypt(text) {
    let password = crypto.randomBytes(16).toString("hex");
    let iv = crypto.randomBytes(32);
    let cipher = crypto.createCipheriv(algorithm, password, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex');
    let tag = cipher.getAuthTag();
    const phone = `${encrypted}/${tag.toString("hex")}`
    iv =  iv.toString("hex");
    password =  await KMS.encryptAWS(password);
    iv = await KMS.encryptAWS(iv);
    return {
        phone,
        iv,
        phonePassword: password,

    }
}
async function decrypt(encrypted, ivKMS, passKMS) {
    let iv = await KMS.decryptAWS(ivKMS);
    iv = Buffer.from(iv,"hex");
    passKMS = await KMS.decryptAWS(passKMS);
    let tag = encrypted.split('/')[1];
    tag = Buffer.from(tag,"hex");
    const content = encrypted.split('/')[0];
    let decipher = crypto.createDecipheriv(algorithm, passKMS, iv)
    decipher.setAuthTag(tag);
    let dec = decipher.update(content, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;
