const {KMS} = require("aws-sdk");
const credentials = require("./credentials").AWS;

const kms = new KMS({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    region: credentials.region
});

async function encrypt(source) {
    const params = {
        KeyId: credentials.KeyId,
        Plaintext: source,
    };
    const { CiphertextBlob } = await kms.encrypt(params).promise();
    return CiphertextBlob.toString('base64');
}

async function decrypt(source) {
    const params = {
        CiphertextBlob: Buffer.from(source, 'base64'),
    };
    const { Plaintext } = await kms.decrypt(params).promise();
    return Plaintext.toString();
}

module.exports.encryptAWS = encrypt;
module.exports.decryptAWS = decrypt;
