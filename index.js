const path = require('path');

require('coffeescript').register();
require('dotenv').config();
const express = require('express');
const filehound = require('filehound');
const colors = require('colors/safe');

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
    details = "done",
    color = colors.green,
    startTime = Date.now(),
    error = false,
) => {
    const stream = error ? console.error : console.log;

    const rout = routePath.padEnd(longestRoute);
    const tim = `${Date.now() - startTime}ms`.padStart(7) // "99999ms" before overflowing

    stream(color(`${rout} | ${tim} | ${details}`))
}

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

app.all('*', (req, res) => {
    res
    .status(404)
    .render('404.pug', {
        req,
        res,
    })
})

app.listen(80)
