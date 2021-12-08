const express = require("express");
const validate = require("./validator");
const crypt = require("./crypt");
const app = express();
const jsonParser = express.json();
const argon2 = require("argon2");
const db = require("./db");



app.use(express.static(__dirname + "/public"));

app.post('/signup', jsonParser, async function (req, res) {
    if (!req.body) return res.sendStatus(400);
    let isPassValid = validate(req.body.userEmail, req.body.userPassword);
    if (isPassValid.bool) {
        let keys = await crypt.encrypt(req.body.phone);
        argon2.hash(req.body.userPassword).then(hash => {
            db.insert(req.body.userEmail, hash, keys.phone, keys.iv, keys.phonePassword).then((e) => {
                    if (e.oid === 0 && e.rowCount === 0) {
                        res.sendStatus(400);
                        console.log("ALREADY EXIST");
                    } else
                        res.sendStatus(200);
                }
            )
        })
    } else {
        res.send(isPassValid.error);
    }
});
app.post('/signin', jsonParser, async function (req, res) {
    if (!req.body) return res.sendStatus(400);
    let user = {};

    db.find(req.body.username).then((result) => {
        try {
            user.phone = result.rows[0].phone;
            user.password = result.rows[0].password;
            user.iv = result.rows[0].iv;
            user.phonePassword = result.rows[0].phonepassword
        } catch {
            return res.sendStatus(400);
        }
        if (user.phone) {
            argon2.verify(user.password, new Buffer(req.body.password)).then(correct => {
                crypt.decrypt(user.phone, user.iv, user.phonePassword).then(e=>{
                    console.log(correct ? 'Correct password!' : 'Incorrect password')
                    correct ? res.send({userPhone: e}) : res.sendStatus(400);
                })


            });

        } else {
            return res.sendStatus(400);
        }
    })
});


app.listen(3000, function () {
    console.log("Listening on port 3000...");
});
