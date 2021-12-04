var express = require('express'),
    argon2i = require('argon2-ffi').argon2i,
    crypto = require('crypto'),
    bodyParser = require('body-parser');

var app = express();
var jsonParser = bodyParser.json();

let blackList = ["Qwerty123",
    "123456",
    "123456789",
    "1234567890",
    "Password123",
    "passw0rd",
    "pAssword",
    "password"];


let myDB = [];


var passwordValidator = require('password-validator');

// Create a schema
let schema = new passwordValidator();

// Add properties to it
schema
    .is().min(10)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .is().symbols()
    .has().uppercase(2)                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(2)                                // Must have at least 2 digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(blackList); // Blacklist these values

let schemaForBlackList = new passwordValidator();
console.log(crypto.randomBytes(32).toString('hex'));
schemaForBlackList.is().not().oneOf(blackList); // Blacklist these values
// Validate against a password string
console.log(schema.validate('validPASS123'));
// => true
console.log(schema.validate('invalidPASS'));
// => false

// Get a full list of rules which failed
console.log(schema.validate('joke', {list: true}));

function validateIndependentCase(password) {
    for (let i = 0; i < blackList.length; i++) {
        if (password.toLowerCase() === blackList[i].toLowerCase()) {
            console.log("BLACKLIST!!!");
            return false;
        }
    }
    return true;
}

function validateEquelEmail(email, password) {
    const emailContains = ['.', '-', '_'];
    console.log(email);
    let from = email.search('@');
    let emailText = email.substring(email[0], from);
    if (password.toLowerCase().includes(emailText.toLowerCase())) {
        return false;
    }


    for (let i = 0; i < emailContains.length; i++) {
        if (emailText.includes(emailContains[i])) {
            let fromFirst = emailText.indexOf(emailContains[i]);
            let toFirst = emailText.length;
            let firstPart = emailText.substring(email[0], fromFirst).replace((/[^a-zA-Z]+/g), '');
            let secondPart = emailText.substring(fromFirst, toFirst).replace((/[^a-zA-Z]+/g), '');
            if (password.toLowerCase().includes(firstPart.toLowerCase())) {
                return false;
            }
            if (password.toLowerCase().includes(secondPart.toLowerCase())) {
                return false;
            }

        }
    }
    return true;
}

function validateConsecutiveSymbols(password)
{
     let regex = new RegExp(/\*.{3,}/g);
     console.log(Boolean(password.match(regex)))
     return Boolean(password.match(regex));

}


function validate(email, password) {
    if (validateConsecutiveSymbols(password)) {


        if (validateEquelEmail(email, password)) {
            if (validateIndependentCase(password)) {
                if (schema.validate(password)) {
                    return {bool: true}
                } else {
                    let errors = schema.validate(password, {list: true});
                    let errorsMessage = [];
                    for (let i = 0; i < errors.length; i++) {
                        errorsMessage.push(`You need to add ${errors[i]} to the password`)
                    }
                    return {
                        bool: false, error: errorsMessage
                    }
                    console.log(schema.validate(password, {list: true}));
                }


            } else
                return {bool: false, error: "YOUR PASSWORD IN BLACKLIST"}
            console.log("YOUR PASSWORD IN BLACKLIST");
        } else
            return {bool: false, error: "THE EMAIL CONTAINS PART OF THE PASSWORD"}
        console.log("THE EMAIL CONTAINS PART OF THE PASSWORD");
    }
    else return {bool: false, error: "CONSECUTIVE SYMBOLS"}
    return false;

}

app.post('/signup', jsonParser, function (req, res) {
    if (!req.body) returnres.sendStatus(400);
    // validateEquelEmail(req.body.username, req.body.password);
    // if (schema.validate(req.body.password)) {
    //      if (validateIndependentCase(req.body.password))
    let isPassValid = validate(req.body.username, req.body.password);
    // console.log(consecutiveSymbols(req.body.password));
    if (isPassValid.bool) {
        console.log("HI");
        crypto.randomBytes(32, function (err, salt) {
            if (err) throwerr;
            let username = '';
            let password = '';
            // argon2i.hash(req.body.password, salt).then(hash => {
            //     console.log(hash); res.sendStatus(201);
            //     username = hash;
            // });
            argon2i.hash(req.body.username, salt).then(hash => {
                console.log(hash);
                res.sendStatus(201);
                myDB.push({
                    username: req.body.username,
                    password: hash
                })
            });
        });
    }


        // else res.send('Password in black list');
    // }
    else {
        console.log(schema.validate(req.body.password, {list: true}));
        res.send(isPassValid.error);
    }
});
app.post('/signin', jsonParser, function (req, res) {
    if (!req.body) returnres.sendStatus(400);
    console.log(JSON.stringify(req.body));
    console.log(myDB);
    let pass = myDB.find(user => user.username === req.body.username).password;
    console.log(pass)
    argon2i.verify(pass, new Buffer(req.body.password)).then(correct => console.log(correct ? 'Correct password!' : 'Incorrect password'));
});

console.log(crypto.randomBytes(32).toString());

app.listen(3000, function () {
    console.log("Listening on port 3000...");
});
