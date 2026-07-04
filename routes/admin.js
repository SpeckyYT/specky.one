const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const os = require('os');

const prettyMs = require('pretty-ms');
const prettyBytes = require('pretty-bytes');
const osu = require('node-os-utils');

const run = (command) => {
    const child = exec(command);
    return new Promise((res,rej) => {
        child.on('close', (code) => code ? rej(code) : res(code))
    })
}

router.all("/", (req, res) => {
    res.render("admin/main.pug", {
        req,
        res,
        discord: req.session.discord,
        powerLevel: req.discord.powerLevel(),

        require,
        process,
        app,

        // modules
        prettyBytes,
        prettyMs,
        osu,
        os,
    })
})

router.use((req, res, next) => {
    if(req.discord.powerLevel() >= 2) {
        return next()
    } else {
        return renderError(
            req,
            res,
            401,
            "Requires discord login / level 2",
        )
    }
});

router.all("/log", (req, res) => {
    res.render("admin/log.pug", {
        req,
        res,
    })
})

module.exports = {
    route: "/admin",
    router: router,
}
