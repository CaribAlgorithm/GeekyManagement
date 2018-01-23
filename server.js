require('dotenv').config();
const Koa = require('koa');
const Logger = require('koa-logger');
const Myrouter = require('./Routes/testRoute');
const Body = require('koa-body');
const crypto = require('crypto');
const router = Myrouter.routes();
const app = new Koa();

console.log(process.env.KEY);
app.use(Logger());
app.use(Body());
app.use(router);

app.listen(3000);