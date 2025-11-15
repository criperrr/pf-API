import * as cheerio from "cheerio";

interface Tokens {
    xsrf: string;
    nsaconline: string;
    hiddenToken: string;
}

export async function getTokens(): Promise<Tokens> {
    const response = await fetch("http://200.145.153.1/nsac", {
        method: "GET",
    });

    const cookies = response.headers
        .getSetCookie()
        .map((value) => value.split(";")[0]) as string[];

    if (cookies.length < 2 || !cookies[0] || !cookies[1]) {
        throw new Error(
            "Tokens de sessão (xsrf ou nsaconline) não encontrados na resposta."
        );
    }

    const html = await response.text();

    const $ = cheerio.load(html);

    const hiddenToken = $('input[name="_token"]').val() as string | undefined; // Se retornar um undefined é pq o site do NSAC explodiu e mudou rota ou sla explodiu mesmo

    if (!hiddenToken) {
        throw new Error(
            "Token hidden (_token) não encontrado no HTML da página."
        );
    }

    const xsrf = cookies[0];
    const nsaconline = cookies[1];
    return {
        xsrf,
        nsaconline,
        hiddenToken,
    };
}

export async function login(
    email: string,
    password: string
): Promise<string | boolean> {
    const cookies = await getTokens();

    let xsrf = cookies.xsrf;
    let nsaconline = cookies.nsaconline;
    let cookiesString = `${xsrf}; ${nsaconline}`;

    const hiddenToken = cookies.hiddenToken;
    const emailEncoded = encodeURIComponent(email);
    const passEncoded = encodeURIComponent(password);
    const authString = `_token=${hiddenToken}&email=${emailEncoded}&password=${passEncoded}`;

    const responseLogin = await fetch("http://200.145.153.1/nsac/login", {
        credentials: "include",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Referer: "http://200.145.153.1/nsac/",
            Cookie: cookiesString,
        },
        body: `${authString}&remember=on`,
        method: "POST",
        redirect: "manual",
    });
    const newCookies = responseLogin.headers.getSetCookie();

    xsrf = newCookies[0]?.split(";")[0] as string;
    nsaconline = newCookies[1]?.split(";")[0] as string;
    const rememberCookie = newCookies[2]?.split(";")[0] as string;
    const newCookiesString = `${xsrf}; ${nsaconline}; ${rememberCookie}`;

    const responseTest = await fetch("http://200.145.153.1/nsac/home", {
        credentials: "include",
        headers: {
            Cookie: newCookiesString,
        },
        method: "GET",
        redirect: "manual",
    }); // test if server let me log in

    if (responseLogin.status == 302 && responseTest.status == 200) {
        return newCookiesString;
    } else return false;
}
