const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const { appendFile } = require('fs');

const run = (command) => {
    const child = exec(command);
    return new Promise((res,rej) => {
        child.on('close', (code) => code ? rej(code) : res(code))
    })
}

router.all("/", (req, res) => {
    // maybe move this to /login?
    // this will redirect the user to begin authorization with discord.
    if(!req.session.authenticated) return res.redirect("/auth");

    res.render("admin/main.pug", {
        req,
        res,
        discord: req.session.discord
    })
})

module.exports = {
    route: "/admin",
    router: router,
}
