const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

const run = (command) => {
    const child = exec(command);
    return new Promise((res,rej) => {
        child.on('close', (code) => code ? rej(code) : res(code))
    })
}

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

module.exports = {
    route: "/admin",
    router: router,
}
