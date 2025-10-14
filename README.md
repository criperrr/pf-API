# NSAC Online Scrapping API with Cheerio Lib
NSAC Online is a website where students can check their grades in any year.
Unfortunaly, NSAC does not use any API, beeing a monolithic application made in PHP Laravel.
So, we decided to design a REST API for this website, then we can use it for many applications, as Discord bots or other websites made in frameworks.


## Functions
We design some routes to facilitate the use of API.
1. The login route
- ```GET /api/vX/login``` - Check if your login is still valid
- ```POST /api/vX/login``` - Login in NSAC and saves your cookie data. It has a body structure like this:
```json
{
    "email": ${YourEmail},
    "password": ${YourPassword},
    "token": "${YourToken}?"
}
```
and it returns:
```json
{
    "status": "ok/failed/failed_but_ok",
    "token": "${token}",  
}
```
the token is used to authenticate in our API. 
It can be null in request body because if you dont have a valid login saved in host server, the login request can send a null token and then the API will return token. If token in request is null or not, the API will return your token.
