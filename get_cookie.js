require("dotenv").config();
const username = process.env.UN;
const password = process.env.PW;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const request = require("request");

/*
 * Getting Cookie
 */
request.post(
    {
        headers: { "content-type": "application/x-www-form-urlencoded" },
        url: "https://app.savethislife.com/login",
        body: "action=login&username=" + username + "&password=" + password,
    },
    function (err, res) {
        console.log(res.headers);
    }
);
