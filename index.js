require('dotenv').config();

// TODO: moves this to an env manager module
global.DEBUG = process.env.DEBUG == "true";
global.REDIRECT_URI = process.env.REDIRECT_URI || false;
global.REDIRECT_URI_CALLBACK = process.env.REDIRECT_URI_CALLBACK || false;
global.CLIENT_ID = process.env.CLIENT_ID || false;
global.CLIENT_SECRET = process.env.CLIENT_SECRET || false;
global.ADMINS = process.env.ADMINS || '';
global.TMDB_KEY = process.env.TMDB_KEY || '';

global.LANGUAGES = ['.js', '.coffee']
global.uptime = Date.now();

require('coffeescript').register();
const path = require('path');
const express = require('express');
const filehound = require('filehound');
const colors = require('colors/safe');
const session = require('express-session');
const { StatusCodes } = require('http-status-codes');

const discordAuth = require('./middleware/discordAuth').default;
const log = require('./util/log');
require('./util/global');

global.sessionMemoryStore = new session.MemoryStore();
global.sessionMiddleware = session({
    secret: Array(32).fill("").map(() => `${(Math.floor(36 * Math.random())).toString(36)}`).join(""),
    cookie: { maxAge: 60 * 60 * 1000 },
    saveUninitialized: false,
    resave: true,
    store: sessionMemoryStore,
})

global.app = express();

app.set('view engine','pug');
app.use(express.static('public', {
    etag: false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // a week seems alright
}));

app.use((req, res, next) => {
    if(DEBUG) {
        console.log(`${new Date()} ${req.ip}`);
    }
    next()
})

// We need this here so it's applied to all routes, even the discord middleware.
app.use(sessionMiddleware);
app.use(discordAuth);

const routes = filehound.create()
    .path("./routes")
    .ext(LANGUAGES)
    .depth(0)
    .findSync();

const totalTime = Date.now();

for(const routePath of routes) {
    const startTime = Date.now();

    try {
        const route = require(path.resolve(routePath));

        if(typeof route != "object" || route == null) throw `no valid output, got ${typeof route}`;
        if(!route.route) throw `no route provided`;
        if(!route.router) throw `no router provided`;

        app.use(route.route, route.router);

        log(routePath, "loaded", colors.green, startTime);
    } catch (err) {
        log(routePath, `${err}`, colors.red, startTime);
    }
}

log("TOTAL", "", colors.bgGreen, totalTime)

app.all('*', (req, res) => {
    renderError(req, res, StatusCodes.NOT_FOUND, "No idea how you got here")
})

app.listen(80)

app.uptime = Date.now()
