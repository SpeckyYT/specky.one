const path = require('path');

require('coffeescript').register();
require('dotenv').config();
const express = require('express');
const filehound = require('filehound');
const colors = require('colors/safe');
const session = require('express-session');
const discordAuth = require('./middleware/discordAuth').default;

global.sessionMemoryStore = new session.MemoryStore();
global.sessionMiddleware = session({
    secret: Array(32).fill("").map(() => `${(Math.floor(36 * Math.random())).toString(36)}`).join(""),
    cookie: { maxAge: 15 * 60 * 1000 },
    saveUninitialized: false,
    resave: true,
    store: sessionMemoryStore,
})

const match = {
    '/': 'index.pug',
    '/summertime': 'memes/summertime.pug',
    '/sort': 'other/visort.pug',
    '/sugo': 'games/sugo.pug',
}

const app = express();

app.set('view engine','pug');
app.use(express.static('public', {
    etag: false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // a week seems alright
}));

// We need this here so it's applied to all routes, even the discord middleware.
app.use(sessionMiddleware);
app.use(discordAuth);

for(const [key,file] of Object.entries(match)){
    app.get(key, (req, res) => {
        res.render(file, {
            req,
            res,
        })
    })
}

const routes = filehound.create()
    .path("./routes")
    .ext([".coffee",".js"])
    .depth(0)
    .findSync();

const longestRoute = routes.map(v => v.length).reduce((p, c) => p > c ? p : c);

const log = (
    routePath = "",
    details = "",
    color = colors.green,
    startTime = Date.now(),
    error = false,
) => {
    const stream = error ? console.error : console.log;

    const array = [
        routePath.padEnd(longestRoute),
        `${Date.now() - startTime}ms`.padStart(7) // "99999ms" before overflowing
    ]

    if (details) array.push(details)

    stream(color(array.join(" | ")))
}

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
    res
    .status(404)
    .render('404.pug', {
        req,
        res,
    })
})

app.listen(80)
