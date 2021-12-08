const blackList = require("./blacklist");


const passwordValidator = require('password-validator');

let schema = new passwordValidator();
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
schemaForBlackList.is().not().oneOf(blackList); // Blacklist these values
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
        {
            console.log("YOUR PASSWORD IN BLACKLIST");
            return {bool: false, error: ["YOUR PASSWORD IN BLACKLIST"]}

        }

    } else
    {
        console.log("THE EMAIL CONTAINS PART OF THE PASSWORD");
        return {bool: false, error: ["THE EMAIL CONTAINS PART OF THE PASSWORD"]}

    }

    return false;

}
module.exports = validate;
