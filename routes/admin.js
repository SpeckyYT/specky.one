const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const { appendFile } = require('fs');
let fetch = import("node-fetch");
fetch.then(f => fetch = f);

const admins = [
    "334361254435225602",
];

const run = (command) => {
    const child = exec(command);
    return new Promise((res,rej) => {
        child.on('close', (code) => code ? rej(code) : res(code))
    })
}

router.use(sessionMiddleware)

/*
router.use((req, res, next) => {
    const allowed = req.query.code == process.env.ADMIN_PASSCODE;

    if(allowed){
        next()
    } else {
        res.status(403).json({ authorized: false }) // 😂🤣😂🤣
    }
})

router.all('/update', async (req, res) => {
    try {
        await run('git reset --hard')
        await run('git fetch --all')
        await run('git pull origin')
        await run('npm i')
        res.json({ success: true });
    }catch(err){
        res.status(500).json({ success: false, error: `${err}` });
    }
})

router.all('/reboot', (req, res) => {
    process.exit(0)
})
*/

router.get('/login', (req, res) => {

})

router.post('/login', (req, res) => {
    fetch.default('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${req.headers.DISCORD_TOKEN_TYPE} ${req.headers.DISCORD_TOKEN}`,
        },
    })
    .then(val => {
        if(val.ok) return val.json();
        throw ''
    })
    .then(val => {
        res.session.authenticated = true
        res.session.tokenData = {
            type: req.headers.DISCORD_TOKEN_TYPE,
            token: req.headers.DISCORD_TOKEN,
        }
        res.session.discordData = val
        res.json(req.session)
    })
    .catch(() => res.status(401).send({ authorized: false }))
})

router.all("/", (req, res) => {
    if(!req.session.authenticated) return res.redirect("/login");

    res.render("admin/main.pug", {
        req,
        res,
    })
})

module.exports = {
    route: "/admin",
    router: router,
}
