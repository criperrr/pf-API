const fs = require('fs');


/**
 * @typedef {import("express").Request} Request
 * @typedef {import("express).Response} Response
 */

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 */


export const login = async (req, res) => {

}

export const checkLogin = async (req, res) => {

}

async function login(email, pass, token) {
    let userAuth = {};

    if (token && fs.existsSync(path.join(usersHome, userId, 'auths', 'auth.json'))) {
        const auths = path.join(usersHome, userId, 'auths', 'auth.json');
        console.log("auths found:")
        console.log(auths)
        console.log("Importing...");
        const authsContent = await fs.promises.readFile(auths, 'utf-8');
        userAuth = await JSON.parse(authsContent);
        const cookieString = userAuth.userAuthString;
        const responseTest = await fetch("http://200.145.153.1/nsac/home", {
            "credentials": "include",
            "headers": {
                "Cookie": cookieString
            },
            "method": "GET",
            "redirect": "manual"
        }); // test if server let me log in with these cookies

        console.log(responseTest);

        if (responseTest.status == 200) {
            return cookieString;
        } else {
            console.log("Error while login in. Reponse status: " + responseTest.status)
        }

    }

    if (!email || !pass) return false;

    const cookies = await getTokens()

    let xsrf = cookies[0];
    let nsaconline = cookies[1];
    let cookiesString = `${xsrf}; ${nsaconline}`;
    // console.log(cookiesString)
    const hiddenToken = cookies[2];
    const emailEncoded = encodeURIComponent(email);
    const passEncoded = encodeURIComponent(pass);
    // console.log(email, pass)
    const authString = `_token=${hiddenToken}&email=${emailEncoded}&password=${passEncoded}`

    // console.log(authString);

    const responseLogin = await fetch("http://200.145.153.1/nsac/login", {
        "credentials": "include",
        "headers": {
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": "http://200.145.153.1/nsac/",
            "Cookie": cookiesString
        },
        "body": authString,
        "method": "POST",
        "redirect": "manual"
    });

    const newCookies = responseLogin.headers.getSetCookie();
    xsrf = newCookies[0].split(';')[0];
    nsaconline = newCookies[1].split(';')[0];
    const newCookiesString = `${xsrf}; ${nsaconline}`;


    const responseTest = await fetch("http://200.145.153.1/nsac/home", {
        "credentials": "include",
        "headers": {
            "Cookie": newCookiesString
        },
        "method": "GET",
        "redirect": "manual"
    }); // test if server let me log in

    if (responseLogin.status == 302 && responseTest.status == 200) {
        return newCookiesString;
    } else return false;
}