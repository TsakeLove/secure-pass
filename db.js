const {Pool, Client} = require("pg");
const credentials = require("./credentials").PostgreSQL;
const client = new Client({
    user: credentials.user,
    host: credentials.host,
    database: credentials.database,
    password: credentials.password,
    port: credentials.port
});
client.connect();

async function insertUser(email, password, phone, iv, phonePassword) {
    const query = `INSERT INTO users (email, password, phone, iv, phonePassword)
                                    VALUES ($1,$2,$3,$4,$5)
                   ON CONFLICT (email) 
                   DO NOTHING;`
    const values = [email, password, phone, iv, phonePassword];
    return client.query(query,values);
}

async function findUser(email)
{
    const query = `SELECT * from users where email = $1`;
    return client.query(query,[email]);
}

module.exports.insert = insertUser
module.exports.find = findUser
