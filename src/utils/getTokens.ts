import * as cheerio from 'cheerio';

export const getTokens = async () => {
    // First request to nsac to get login page and then get hidden input token
    const response = await fetch('http://200.145.153.1/nsac', {
        method: 'GET'
    });
    // Get cookies and split NSAC Session and XSRF Token
    const cookies = response.headers.getSetCookie().map((value) => value.split(';')[0]);

    // PHP Laravel returns a HTML page
    const html = await response.text();

    // Loads it in Cheerio
    const $ = cheerio.load(html);

    // Get the hidden token from login page and returns it with the other cookies.
    const hiddenToken = $('input[name="_token"]').val();
    return [...cookies, hiddenToken];
}