const express = require('express');
const filehound = require('filehound');
const path = require('path');
const colors = require('colors/safe');
const log = require('../util/log');

const APIFolder = path.join(__dirname, "api");

const routes = filehound.create()
    .path(APIFolder)
    .ext(LANGUAGES)
    .depth(Infinity)
    .findSync()
    .map(f => path.relative(APIFolder, f).split(path.sep));

function recursive(routes, depth = 0) {
    const deepRoutes = {}
    const currentRoute = express.Router()

    for(const route of routes.sort()) { // the sort is REALLY important
        if(route.length - depth == 1) {
            const startTime = Date.now();
            try {
                const currentFile = require(path.join(APIFolder, route.join(path.sep)));
                if(currentFile instanceof Function) { // apparently routes are functions
                    currentRoute.use(currentFile)
                    log(path.join("routes", "api", route.join(path.sep)), "loaded", colors.cyan, startTime)
                } else {
                    throw "API didn't return a valid Router"
                }
            } catch (err) {
                log(route.join(path.sep), `${err}`, colors.red, startTime, true);
            }
        } else if(route.length - depth > 1) { // just for safety to ignore shit
            deepRoutes[route[depth]] ??= []
            deepRoutes[route[depth]].push(route)
        }
    }

    for(const deepRoute of Object.entries(deepRoutes)) {
        const routePath = deepRoute[0];
        const routesPath = deepRoute[1];

        const recursionRoute = recursive(routesPath, depth + 1);
        currentRoute.use(`/${routePath}`, recursionRoute); // this should be impossible to fail
    }

    return currentRoute
}

const allAPIRoutes = recursive(routes);

module.exports = {
    route: "/api",
    router: allAPIRoutes,
}
