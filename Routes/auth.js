const Router = require('koa-router');
const nonce = require('nonce')();
const crypto = require('crypto');
const querystring = require('querystring');
const auth = new Router();
const rp = require('request-promise');


auth.get('/', async ctx => {
    const shop = ctx.query.shop; //abstracts the query parameter to identify the shop domain to traget

    if (shop) {
        const state = nonce();
        const redirectUri = process.env.FORWARD + '/shopify/callback';
        const installUrl = 'https://' + shop + '/admin/oauth/authorize?client_id=' + process.env.KEY + '&scope=' + process.env.SCOPES + '&state=' + state + '&redirect_uri=' + redirectUri;

        ctx.cookies.set('state', state);
        ctx.redirect(installUrl);
    } else {
        ctx.status = 400;
        ctx.message = 'Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request';

    }
});
auth.get('/callback', async ctx => {
    const {
        shop,
        hmac,
        code,
        state
    } = ctx.query;
    const stateCookie = ctx.cookies.get('state');

    if (state !== stateCookie) {
        ctx.status = 403;
        ctx.message = 'Request origin cannot be verified.';
        return;
    }

    if (shop && hmac && code) {
        let log = ctx.query;
        const map = Object.assign({}, ctx.query);
        delete map['signature'];
        delete map['hmac'];
        const message = querystring.stringify(map);
        const generatedHash = crypto.createHmac('sha256', process.env.SECRET_KEY)
            .update(message)
            .digest('hex');

        if (generatedHash !== hmac) {
            ctx.status = 400;
            ctx.message = 'HMAC validation failed.';
            return;
        }
        const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
        const accessTokenPayload = {
            client_id: process.env.KEY,
            client_secret: process.env.SECRET_KEY,
            code
        };
        let option = {
            method: 'POST',
            url: accessTokenRequestUrl,
            body: accessTokenPayload,
            json: true
        }

        const {
            access_token,
            scope
        } = await rp(option);
        if (access_token) {
            ctx.status = 200;
            ctx.message = "Access token has been saved";
        }

    } else {
        ctx.status = 400;
        ctx.message = 'Required parameters missing.';
    }
});
module.exports = auth;