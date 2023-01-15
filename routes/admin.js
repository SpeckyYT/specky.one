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

module.exports = {
    route: "/admin",
    router: router,
}
